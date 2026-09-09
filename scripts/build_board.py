#!/usr/bin/env python3
"""Build the cached public Synergy task board from GitHub."""
from __future__ import annotations

import base64
import datetime as dt
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import yaml

TASK_REPO = os.environ.get("TASK_REPO", "kvnloo/synergy-tasks")
TOKEN = os.environ.get("GITHUB_TOKEN")
API = "https://api.github.com"
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "board.json"
FIELD_LABELS = {
    "brief": "Synergy brief|Brief id",
    "type": "Task type",
    "jurisdiction": "Jurisdiction",
    "intended_user": "Intended user",
    "hypothesis": "Solution hypothesis",
}
STATE_ORDER = {"claimable": 0, "claimed": 1, "needs-review": 2, "blocked": 3, "triage": 4}
PRIORITY_ORDER = {"P1": 0, "P2": 1, "P3": 2, None: 3}
CLAIM_RE = re.compile(r"<!--\s*synergy-claim\s+({.*?})\s*-->")
RECEIPT_RE = re.compile(r"```yaml\s*\n# verified-oss-loop receipt\s*\n(.*?)```", re.S)
FIXES_RE = re.compile(r"\bFixes\s+#(\d+)\b", re.I)


def now_utc() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def iso(value: dt.datetime) -> str:
    return value.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def api(path: str) -> object:
    request = urllib.request.Request(API + path)
    request.add_header("Accept", "application/vnd.github+json")
    request.add_header("X-GitHub-Api-Version", "2022-11-28")
    request.add_header("User-Agent", "synergy-board-builder")
    if TOKEN:
        request.add_header("Authorization", f"Bearer {TOKEN}")
    with urllib.request.urlopen(request, timeout=25) as response:
        return json.load(response)


def paged(path: str, pages: int = 5) -> list[dict]:
    results: list[dict] = []
    separator = "&" if "?" in path else "?"
    for page in range(1, pages + 1):
        batch = api(f"{path}{separator}per_page=100&page={page}")
        if not isinstance(batch, list):
            raise ValueError(f"Expected a list from {path}")
        results.extend(batch)
        if len(batch) < 100:
            break
    return results


def field(body: str, label: str) -> str | None:
    alternatives = "|".join(re.escape(item) for item in label.split("|"))
    match = re.search(rf"^### (?:{alternatives})\s*\n+(.+?)(?=\n### |\Z)", body or "", re.M | re.S)
    if not match:
        return None
    value = match.group(1).strip()
    return None if value in {"", "_No response_"} else value

def labels(item: dict | None) -> set[str]:
    if not item:
        return set()
    return {label["name"] for label in item.get("labels", [])}


def roadmap_data() -> tuple[dict, str | None]:
    encoded = api(f"/repos/{TASK_REPO}/contents/ROADMAP.yaml")
    content = base64.b64decode(encoded["content"]).decode("utf-8")
    roadmap = yaml.safe_load(content) or {}
    commits = api(f"/repos/{TASK_REPO}/commits?path=ROADMAP.yaml&per_page=1")
    revision = commits[0]["sha"] if commits else None
    return roadmap, revision


def roadmap_priorities(roadmap: dict) -> dict[int, str]:
    result = {}
    for item in roadmap.get("items", []):
        try:
            number = int(item.get("issue"))
        except (TypeError, ValueError):
            continue
        priority = item.get("priority")
        if priority in {"P1", "P2", "P3"}:
            result[number] = priority
    return result


def latest_claim(number: int) -> dict:
    latest: dict = {}
    for comment in paged(f"/repos/{TASK_REPO}/issues/{number}/comments", pages=1):
        for match in CLAIM_RE.finditer(comment.get("body") or ""):
            try:
                marker = json.loads(match.group(1))
            except json.JSONDecodeError:
                continue
            marker["_comment"] = comment
            latest = marker
    return latest


def parse_wall_seconds(body: str) -> float:
    match = RECEIPT_RE.search(body or "")
    if not match:
        return 0.0
    try:
        receipt = yaml.safe_load(match.group(1)) or {}
        return max(0.0, float(receipt.get("resource_usage", {}).get("wall_seconds") or 0))
    except (TypeError, ValueError, yaml.YAMLError):
        return 0.0


def build() -> dict:
    generated = now_utc()
    since = (generated - dt.timedelta(days=30)).date().isoformat()
    issues = [item for item in paged(f"/repos/{TASK_REPO}/issues?state=open&labels=task") if "pull_request" not in item]
    open_prs = paged(f"/repos/{TASK_REPO}/pulls?state=open")
    query = urllib.parse.quote(f"repo:{TASK_REPO} is:pr is:merged merged:>={since}")
    merged = api(f"/search/issues?q={query}&per_page=100").get("items", [])
    roadmap, revision = roadmap_data()
    priorities = roadmap_priorities(roadmap)

    prs_by_issue: dict[int, dict] = {}
    for pr in open_prs:
        for number in FIXES_RE.findall(pr.get("body") or ""):
            prs_by_issue[int(number)] = pr

    tasks = []
    recent = []
    for issue in issues:
        number = issue["number"]
        issue_labels = labels(issue)
        pr = prs_by_issue.get(number)
        pr_labels = labels(pr) if pr else set()
        if pr and "needs-review" in pr_labels:
            state = "needs-review"
        elif "claimed" in issue_labels:
            state = "claimed"
        elif "blocked" in issue_labels:
            state = "blocked"
        elif "claimable" in issue_labels:
            state = "claimable"
        else:
            state = "triage"
        claim = latest_claim(number) if state == "claimed" else {}
        task_type = field(issue.get("body") or "", FIELD_LABELS["type"])
        if task_type is None:
            task_type = next((name.removeprefix("type:") for name in issue_labels if name.startswith("type:")), None)
        task = {
            "number": number,
            "title": issue["title"],
            "url": issue["html_url"],
            "state": state,
            "priority": priorities.get(number),
            "type": task_type,
            "brief": field(issue.get("body") or "", FIELD_LABELS["brief"]),
            "jurisdiction": field(issue.get("body") or "", FIELD_LABELS["jurisdiction"]),
            "intended_user": field(issue.get("body") or "", FIELD_LABELS["intended_user"]),
            "hypothesis": (field(issue.get("body") or "", FIELD_LABELS["hypothesis"]) or "")[:600],
            "claimant": claim.get("claimant"),
            "expires_at": claim.get("expires_at"),
            "harness": claim.get("harness"),
            "pr_url": pr.get("html_url") if pr else None,
            "updated_at": issue["updated_at"],
        }
        tasks.append(task)
        if claim:
            comment = claim.get("_comment", {})
            recent.append({"kind": "claimed", "at": claim.get("claimed_at") or comment.get("created_at"), "actor": claim.get("claimant") or comment.get("user", {}).get("login", "unknown"), "title": issue["title"], "url": comment.get("html_url") or issue["html_url"]})

    tasks.sort(key=lambda task: (STATE_ORDER[task["state"]], PRIORITY_ORDER[task["priority"]], -dt.datetime.fromisoformat(task["updated_at"].replace("Z", "+00:00")).timestamp()))
    contributors_map: dict[str, dict] = {}
    for pr in merged:
        login = (pr.get("user") or {}).get("login")
        if not login:
            continue
        entry = contributors_map.setdefault(login, {"login": login, "merged_30d": 0, "agent_hours_30d": 0.0})
        entry["merged_30d"] += 1
        entry["agent_hours_30d"] = round(entry["agent_hours_30d"] + parse_wall_seconds(pr.get("body") or "") / 3600, 2)
        recent.append({"kind": "merged", "at": pr.get("closed_at") or pr.get("updated_at"), "actor": login, "title": pr["title"], "url": pr["html_url"]})

    # Bot / activity comments on open task issues (claimed/released/expired/receipt/approved)
    activity_re = re.compile(
        r"(Claim accepted until|Released\.|Claim expired|Receipt complete for|Receipt incomplete|"
        r"APPROVE_EXACT_HEAD|verified-oss-loop review)",
        re.I,
    )
    kind_map = (
        ("Claim accepted", "claimed"),
        ("Released", "released"),
        ("Claim expired", "expired"),
        ("Receipt complete", "receipt"),
        ("Receipt incomplete", "receipt"),
        ("APPROVE_EXACT_HEAD", "approved"),
        ("verified-oss-loop review", "approved"),
    )
    for issue in issues[:40]:
        for comment in paged(f"/repos/{TASK_REPO}/issues/{issue['number']}/comments", pages=1)[-5:]:
            body = comment.get("body") or ""
            if not activity_re.search(body):
                continue
            kind = next((mapped for needle, mapped in kind_map if needle.lower() in body.lower()), "claimed")
            recent.append({
                "kind": kind,
                "at": comment.get("created_at"),
                "actor": (comment.get("user") or {}).get("login", "unknown"),
                "title": issue["title"],
                "url": comment.get("html_url") or issue["html_url"],
            })

    recent = [item for item in recent if item.get("at")]
    recent.sort(key=lambda item: item["at"], reverse=True)
    wall_seconds = sum(parse_wall_seconds(item.get("body") or "") for item in merged)
    counts = {
        "claimable": sum(task["state"] == "claimable" for task in tasks),
        "claimed": sum(task["state"] == "claimed" for task in tasks),
        "needs_review": sum(task["state"] == "needs-review" for task in tasks),
        "merged_30d": len(merged),
        "contributors_30d": len(contributors_map),
        "agent_hours_30d": round(wall_seconds / 3600, 1),
    }
    contributors = sorted(contributors_map.values(), key=lambda item: (-item["merged_30d"], item["login"]))
    return {
        "schema": "synergy-board/v1",
        "generated_at": iso(generated),
        "source": f"https://github.com/{TASK_REPO}",
        "roadmap_revision": revision,
        "counts": counts,
        "tasks": tasks[:60],
        "recent": recent[:20],
        "contributors": contributors[:30],
        "error": None,
    }

def empty_board(error: Exception) -> dict:
    return {"schema": "synergy-board/v1", "generated_at": iso(now_utc()), "source": f"https://github.com/{TASK_REPO}", "roadmap_revision": None, "counts": {"claimable": 0, "claimed": 0, "needs_review": 0, "merged_30d": 0, "contributors_30d": 0, "agent_hours_30d": 0.0}, "tasks": [], "recent": [], "contributors": [], "error": str(error)[:300]}


def main() -> None:
    try:
        board = build()
    except Exception as error:
        board = empty_board(error)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(board, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
