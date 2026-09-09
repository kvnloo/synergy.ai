const STATE_LABELS = {
  claimable: "Claimable",
  claimed: "In progress",
  "needs-review": "Awaiting review",
  blocked: "Blocked",
  triage: "In triage"
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function relativeTime(value) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  if (absolute < 60) return seconds > 0 ? "in under a minute" : "just now";
  const units = absolute < 3600 ? [60, "minute"] : absolute < 86400 ? [3600, "hour"] : [86400, "day"];
  const amount = Math.max(1, Math.round(absolute / units[0]));
  return seconds > 0 ? `in ${amount} ${units[1]}${amount === 1 ? "" : "s"}` : `${amount} ${units[1]}${amount === 1 ? "" : "s"} ago`;
}

function actionLink(task, text = "Claim on GitHub ↗") {
  const link = element("a", "board-action", text);
  link.href = task.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.title = "Paste the claim block from the issue template";
  return link;
}

export function setupBoard({ articles, companion, buildTaskMarkdown }) {
  const stats = document.querySelector("#board-stats");
  const grid = document.querySelector("#board-grid");
  const offline = document.querySelector("#board-offline");
  const updated = document.querySelector("#board-updated");
  const pairingCode = document.querySelector("#worker-pairing-code");
  const pairButton = document.querySelector("#pair-worker");
  const workerStatus = document.querySelector("#worker-status");
  const identityLine = document.querySelector("#worker-identity");
  if (!stats || !grid) return { getBoard: () => null, refresh: async () => {} };

  let board = null;
  let identity = null;
  let refreshTimer = null;

  async function loadIdentity() {
    if (!companion.getToken()) {
      identity = null;
      identityLine.hidden = true;
      return;
    }
    try {
      identity = await companion.request("/v1/loop/identity");
      const ready = identity.harnesses.filter((harness) => harness.installed).map((harness) => harness.label);
      identityLine.textContent = `Paired · GitHub: ${identity.login || "not signed in"}${ready.length ? ` · ${ready.join(", ")} ready` : " · no agent harness detected"}`;
      identityLine.hidden = false;
      workerStatus.textContent = identity.authenticated ? "Local worker ready. Claims run only after you press a task action." : "Pairing succeeded. Run gh auth login before claiming.";
    } catch (error) {
      identity = null;
      identityLine.hidden = true;
      workerStatus.textContent = `Worker identity unavailable: ${error.message}`;
    }
  }

  async function waitForJob(jobId, output, cancel) {
    output.hidden = false;
    cancel.hidden = false;
    while (true) {
      const job = await companion.request(`/v1/jobs/${encodeURIComponent(jobId)}`);
      output.textContent = job.output || `${job.status}…`;
      if (!["pending", "running"].includes(job.status)) {
        cancel.hidden = true;
        if (job.status !== "completed") throw new Error(job.output || `Job ${job.status}.`);
        return job.result || {};
      }
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
  }

  function addWorkerActions(card, task) {
    const actions = element("div", "board-card-actions");
    const output = element("pre", "board-job");
    output.hidden = true;
    const cancel = element("button", "board-cancel", "Cancel");
    cancel.type = "button";
    cancel.hidden = true;
    let currentJob = null;
    cancel.addEventListener("click", async () => {
      if (!currentJob) return;
      await companion.request(`/v1/jobs/${encodeURIComponent(currentJob)}/cancel`, { method: "POST" });
      cancel.disabled = true;
    });

    const installed = identity?.harnesses?.filter((harness) => harness.installed) || [];
    const claimHarnesses = [...installed, { id: "manual", label: "Manual" }];
    if (!companion.getToken() || !identity?.authenticated) {
      actions.append(actionLink(task));
    } else if (task.state === "claimable") {
      const select = element("select", "board-harness");
      select.setAttribute("aria-label", `Agent harness for ${task.title}`);
      claimHarnesses.forEach((harness) => select.add(new Option(harness.label, harness.id)));
      const button = element("button", "board-action", "Claim (72 h)");
      button.type = "button";
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          const job = await companion.request("/v1/loop/claim", { method: "POST", body: JSON.stringify({ issue: task.number, scope: (task.hypothesis || task.title).slice(0, 200), harness: select.value, hours: 72 }) });
          currentJob = job.id;
          await waitForJob(job.id, output, cancel);
          workerStatus.textContent = `Claim submitted for task #${task.number}. The queue will refresh after GitHub accepts it.`;
          await loadBoard();
        } catch (error) {
          workerStatus.textContent = `Claim failed: ${error.message}`;
        } finally {
          button.disabled = false;
        }
      });
      actions.append(select, button);
    } else if (task.state === "claimed" && task.claimant === identity.login) {
      const harness = installed.find((item) => item.id === task.harness) || installed[0];
      const button = element("button", "board-action", `Run with ${harness.label}`);
      button.type = "button";
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          const job = await companion.request("/v1/loop/run", { method: "POST", body: JSON.stringify({ issue: task.number, harness: harness.id, task_markdown: buildTaskMarkdown(task), max_minutes: 45 }) });
          currentJob = job.id;
          const result = await waitForJob(job.id, output, cancel);
          workerStatus.textContent = result.pr_url ? `Pull request opened: ${result.pr_url}` : (result.note || "Worker run completed.");
          await loadBoard();
        } catch (error) {
          workerStatus.textContent = `Run failed: ${error.message}`;
        } finally {
          button.disabled = false;
        }
      });
      actions.append(button);
    } else if (task.state === "needs-review" && task.pr_url && installed.length) {
      const select = element("select", "board-harness");
      select.setAttribute("aria-label", `Review harness for ${task.title}`);
      installed.forEach((harness) => select.add(new Option(harness.label, harness.id)));
      const button = element("button", "board-action", "Verify independently");
      button.type = "button";
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          const prMatch = task.pr_url.match(/\/pull\/(\d+)/);
          if (!prMatch) throw new Error("Pull request number missing from board data.");
          const job = await companion.request("/v1/loop/verify", {
            method: "POST",
            body: JSON.stringify({ pr: Number(prMatch[1]), harness: select.value })
          });
          currentJob = job.id;
          const result = await waitForJob(job.id, output, cancel);
          workerStatus.textContent = result.verdict
            ? `Review posted: ${result.verdict}`
            : "Independent review completed.";
          await loadBoard();
        } catch (error) {
          workerStatus.textContent = `Verify failed: ${error.message}`;
        } finally {
          button.disabled = false;
        }
      });
      actions.append(select, button, actionLink({ url: task.pr_url }, "Open pull request ↗"));
    } else if (task.pr_url) {
      actions.append(actionLink({ url: task.pr_url }, "Open pull request ↗"));
    } else {
      actions.append(actionLink(task, "Open task ↗"));
    }
    card.append(actions, output, cancel);
  }

  function renderCard(task) {
    const card = element("article", "board-card");
    const meta = element("div", "board-card-meta");
    meta.append(element("span", `board-state is-${task.state}`, STATE_LABELS[task.state] || task.state));
    if (task.priority) meta.append(element("span", "board-priority", task.priority));
    if (task.type) meta.append(element("span", "board-type", task.type));
    const title = element("h3");
    const titleLink = element("a", "", task.title);
    titleLink.href = task.url;
    titleLink.target = "_blank";
    titleLink.rel = "noreferrer";
    title.append(titleLink);
    card.append(meta, title);
    if (task.hypothesis) card.append(element("p", "board-hypothesis", task.hypothesis));
    const context = element("div", "board-context");
    if (task.brief && articles.some((article) => article.id === task.brief)) {
      const chip = element("button", "board-brief article-link", task.brief);
      chip.type = "button";
      chip.dataset.article = task.brief;
      context.append(chip);
    }
    if (task.jurisdiction) context.append(element("span", "", task.jurisdiction));
    if (task.claimant) context.append(element("span", "", `Claimed by ${task.claimant}${task.expires_at ? ` · expires ${relativeTime(task.expires_at)}` : ""}`));
    card.append(context);
    addWorkerActions(card, task);
    return card;
  }

  function render(data) {
    board = data;
    offline.hidden = true;
    stats.hidden = false;
    const values = [
      [data.counts.claimable, "Claimable"], [data.counts.claimed, "In progress"],
      [data.counts.needs_review, "Awaiting review"], [data.counts.merged_30d, "Merged · 30d"],
      [data.counts.agent_hours_30d, "Agent-hours · 30d"]
    ];
    stats.replaceChildren(...values.map(([value, label]) => {
      const item = element("div", "board-stat");
      item.append(element("strong", "", String(value)), element("span", "", label));
      return item;
    }));
    grid.replaceChildren();
    if (data.tasks.length === 0) grid.append(element("p", "board-empty", "Every task is claimed or under review. Propose one from any brief."));
    else data.tasks.forEach((task) => grid.append(renderCard(task)));
    if (data.recent?.length) {
      const recent = element("section", "board-recent");
      recent.append(element("h3", "", "Recent loop activity"));
      const list = element("ul");
      data.recent.slice(0, 5).forEach((event) => {
        const item = element("li");
        const link = element("a", "", `${event.actor} · ${event.kind} · ${event.title}`);
        link.href = event.url;
        link.target = "_blank";
        link.rel = "noreferrer";
        item.append(link, document.createTextNode(` · ${relativeTime(event.at)}`));
        list.append(item);
      });
      recent.append(list);
      grid.append(recent);
    }
    updated.textContent = `Updated ${relativeTime(data.generated_at)} · refreshes every minute`;
  }

  async function loadBoard() {
    if (document.visibilityState !== "visible") return;
    try {
      const response = await fetch("data/board.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Board returned ${response.status}.`);
      const data = await response.json();
      if (data.schema !== "synergy-board/v1") throw new Error("Unsupported board data.");
      if (data.error) throw new Error(data.error);
      render(data);
    } catch {
      stats.hidden = true;
      grid.replaceChildren();
      updated.textContent = "";
      offline.hidden = false;
    }
  }

  pairButton?.addEventListener("click", async () => {
    await companion.pair(pairingCode.value.trim(), workerStatus);
    pairingCode.value = "";
    await loadIdentity();
    if (board) render(board);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadBoard();
  });
  loadIdentity().then(loadBoard);
  refreshTimer = window.setInterval(loadBoard, 60000);
  window.addEventListener("pagehide", () => window.clearInterval(refreshTimer), { once: true });
  return { getBoard: () => board, refresh: loadBoard };
}
