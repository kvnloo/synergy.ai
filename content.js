export const articles = [
  {
    id: "sudan-access",
    topic: "conflict",
    label: "Conflict",
    readTime: "7 min briefing",
    title: "A crisis is also a logistics system. Sudan shows where it breaks.",
    summary: "News tells us that aid is blocked. The harder question is how: which roads close, who controls access, and what local responders need to keep moving.",
    visual: "conflict",
    visualWord: "ACCESS / POWER",
    slides: [
      {
        kind: "The brief",
        title: "Aid access is a chain. One broken link can stop the whole response.",
        body: "Food, medicine, staff, fuel, permissions, roads, communications, and local trust have to work together. Describing the crisis only by how many supplies exist misses whether those supplies can reach people safely.",
        chain: ["Supplies exist", "Permission is granted", "Routes stay open", "Local teams distribute", "People receive aid"],
        sources: [
          { relation: "supports", title: "UN OCHA: Sudan", url: "https://www.unocha.org/sudan", note: "Operational overview and humanitarian access reporting." },
          { relation: "context", title: "ICRC: Sudan", url: "https://www.icrc.org/en/where-we-work/sudan", note: "Protection and operational context from an active humanitarian organization." }
        ]
      },
      {
        kind: "Why it exists",
        title: "Access becomes leverage when authority is fragmented.",
        body: "Armed actors can treat roads, permits, communications, and aid movements as sources of control. Local responders then face overlapping authorities and personal risk. The visible shortage is downstream of a political and security system.",
        chain: ["Authority fragments", "Access gains political value", "Permits and routes become leverage", "Delivery slows", "Civilian harm compounds"],
        sources: [
          { relation: "supports", title: "UN OCHA: Access resources", url: "https://www.unocha.org/humanitarian-access", note: "Defines humanitarian access and recurring constraints." },
          { relation: "qualifies", title: "ICRC: Humanitarian principles", url: "https://www.icrc.org/en/document/fundamental-principles-red-cross-and-red-crescent", note: "Explains why neutral, independent action matters when access is contested." }
        ]
      },
      {
        kind: "What has been tried",
        title: "Negotiation, local networks, cash, and cross-border routes solve different links.",
        body: "No single intervention repairs the chain. Negotiation can open a route but not make markets function. Cash can preserve choice where goods remain available. Local organizations often retain access when international teams cannot, but shifting delivery without shifting power and funding leaves risk with them.",
        chain: ["Name the failed link", "Choose a matching intervention", "Fund local capacity", "Track access and outcomes", "Adapt when control shifts"],
        sources: [
          { relation: "supports", title: "UNHCR: Sudan emergency", url: "https://www.unhcr.org/emergencies/sudan-emergency", note: "Regional displacement response and delivery context." },
          { relation: "limits", title: "IASC: Guidance on localization", url: "https://interagencystandingcommittee.org/grand-bargain-official-website/localisation", note: "Shows that local leadership requires funding and decision power, not subcontracting alone." }
        ]
      },
      {
        kind: "Across borders",
        title: "Transfer the function, not the program name.",
        body: "A corridor negotiated through a centralized ministry will not transfer unchanged to a federal system or an area with competing authorities. Start by mapping who can authorize movement, who controls procurement, what sanctions apply, and which local institutions people trust.",
        chain: ["Define the function", "Map decision authority", "Map legal constraints", "Find a trusted local operator", "Pilot with stop conditions"],
        sources: [
          { relation: "method", title: "World Bank: Governance and the Law", url: "https://www.worldbank.org/en/publication/wdr2017", note: "A framework for understanding how power and institutions change policy outcomes." },
          { relation: "context", title: "ICRC: Neutral intermediary role", url: "https://www.icrc.org/en/what-we-do/neutral-intermediary", note: "A concrete function that takes different operational forms across conflicts." }
        ]
      },
      {
        kind: "Better incentives",
        title: "Make cooperation cheaper than obstruction.",
        body: "Appeals to goodwill are not enough. Agreements need monitoring, public evidence, consequences for diversion, and benefits for reliable access. Funders can reward delivery quality and local decision power instead of volume moved or contracts won.",
        chain: ["Publish the outcome", "Expose obstruction", "Protect independent monitors", "Reward reliable access", "Move power toward affected communities"],
        sources: [
          { relation: "supports", title: "Core Humanitarian Standard", url: "https://www.corehumanitarianstandard.org/the-standard", note: "Commitments for accountable, people-centered humanitarian action." },
          { relation: "principle", title: "UN Guiding Principles on Business and Human Rights", url: "https://www.ohchr.org/sites/default/files/documents/publications/guidingprinciplesbusinesshr_en.pdf", note: "A baseline for responsibility where commercial incentives affect human outcomes." }
        ]
      }
    ]
  },
  {
    id: "heat-health",
    topic: "climate",
    label: "Climate",
    readTime: "6 min",
    title: "Heat is a public-health emergency before it becomes a headline.",
    summary: "Start with exposure, housing, power, and access to care. The temperature alone does not describe who is at risk.",
    visual: "climate",
    visualWord: "HEAT / CARE",
    slides: [
      {
        kind: "The brief",
        title: "The same temperature produces different harm.",
        body: "Risk depends on exposure, age, health, housing, work, power access, and whether care is reachable. A citywide temperature is useful, but it is not a map of vulnerability.",
        chain: ["Hazard", "Exposure", "Individual vulnerability", "Access to cooling and care", "Health outcome"],
        sources: [{ relation: "supports", title: "WHO: Climate change, heat and health", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", note: "Health risks, vulnerable groups, and response measures." }]
      },
      {
        kind: "Why it exists",
        title: "Heat risk follows the shape of housing and work.",
        body: "Low tree cover, heat-retaining construction, unsafe jobs, weak grids, and expensive cooling concentrate exposure. These are policy and market outcomes. Weather reveals them; it does not create them alone.",
        chain: ["Land and labor policy", "Unequal exposure", "Limited cooling", "Delayed care", "Preventable illness"],
        sources: [{ relation: "supports", title: "WHO and WMO: Heat-health warning systems", url: "https://www.who.int/publications/i/item/9789241599692", note: "Links forecasting to public-health action." }]
      },
      {
        kind: "What has been tried",
        title: "Warnings work only when people can act on them.",
        body: "Heat plans combine forecasts, outreach, cooling spaces, worker protections, clinical readiness, and longer-term urban changes. Alerts underperform when they tell people to stay cool but do not change work rules, transport, power access, or the cost of cooling.",
        chain: ["Forecast", "Targeted warning", "Material support", "Clinical readiness", "After-action review"],
        sources: [{ relation: "method", title: "WHO guidance for heat-health action plans", url: "https://www.who.int/publications/i/item/9789289071918", note: "Planning components and institutional responsibilities." }]
      },
      {
        kind: "Across borders",
        title: "Copy the decision triggers, then rebuild the delivery system.",
        body: "A heat threshold, labor rule, and cooling-center plan depend on local climate, building stock, grid reliability, public authority, and informal work. Transfer the trigger-and-response logic, not another city's temperature number or agency chart.",
        chain: ["Calibrate local risk", "Assign legal authority", "Reach formal and informal workers", "Test power constraints", "Measure excess harm"],
        sources: [{ relation: "context", title: "World Bank: Governance and the Law", url: "https://www.worldbank.org/en/publication/wdr2017", note: "Why identical policies produce different results under different institutions." }]
      },
      {
        kind: "Better incentives",
        title: "Price prevention against the cost of avoidable harm.",
        body: "Developers, employers, utilities, and governments respond to different incentives. Building codes, worker protections, service standards, public reporting, and targeted subsidies can make heat safety part of ordinary decisions instead of a charitable extra.",
        chain: ["Name who controls exposure", "Set a minimum duty", "Measure outcomes", "Publish performance", "Fund adaptation where ability to pay is lowest"],
        sources: [{ relation: "principle", title: "UN Guiding Principles on Business and Human Rights", url: "https://www.ohchr.org/sites/default/files/documents/publications/guidingprinciplesbusinesshr_en.pdf", note: "Government and business duties when operations affect human rights." }]
      }
    ]
  },
  {
    id: "human-review",
    topic: "technology",
    label: "Public-interest tech",
    readTime: "8 min",
    title: "AI can shorten the research loop. It cannot own the judgment.",
    summary: "Automate retrieval and comparison, then keep a person responsible for every published claim.",
    visual: "technology",
    visualWord: "HUMAN / REVIEW",
    slides: [
      {
        kind: "The brief",
        title: "A fluent answer is not an evidence chain.",
        body: "AI can find, cluster, translate, and summarize material quickly. A trustworthy brief still needs exact sources, claim-level links, independence checks, and a named reviewer who can reject the output.",
        chain: ["Source snapshot", "Exact passage", "Claim", "Evidence relation", "Human-reviewed projection"],
        sources: [{ relation: "method", title: "Epistemedia", url: "https://github.com/yoheinakajima/epistemedia", note: "The source-to-claim lineage model adapted for this reader." }]
      },
      {
        kind: "Why it fails",
        title: "Models compress uncertainty and repeat shared mistakes.",
        body: "Several summaries may look independent while tracing back to one report. Retrieval can omit contrary evidence. Translation can erase qualifiers. Confidence in the prose is not confidence in the claim.",
        chain: ["One source", "Many rewrites", "Apparent consensus", "Hidden dependence", "Overstated conclusion"],
        sources: [
          { relation: "supports", title: "Epistemedia: Evidence independence", url: "https://github.com/yoheinakajima/epistemedia#repository-invariants", note: "Agent count is not evidence independence." },
          { relation: "risk", title: "ICRC: Data protection in humanitarian action", url: "https://www.icrc.org/en/publication/4305-handbook-data-protection-humanitarian-action-third-edition", note: "Operational and protection risks for data use." }
        ]
      },
      {
        kind: "What has been tried",
        title: "Retrieval, citations, and review help, but each covers a different failure.",
        body: "Retrieval grounds a response in supplied material. Citations let a reader inspect support. Review catches context and safety failures. None proves that sources are independent, current, complete, or applicable to the question.",
        chain: ["Retrieve", "Extract", "Link each claim", "Search for rebuttal", "Approve or revise"],
        sources: [{ relation: "qualifies", title: "Epistemedia architecture", url: "https://github.com/yoheinakajima/epistemedia/blob/main/docs/architecture.md", note: "Separates sources, spans, propositions, assertions, evidence, and evaluations." }]
      },
      {
        kind: "Across borders",
        title: "Data rules and public trust change what a safe tool can do.",
        body: "A workflow using cloud models, personal records, or automated eligibility may be legal in one jurisdiction and dangerous in another. Map data residency, consent, appeal rights, language coverage, procurement rules, and the institution accountable for mistakes.",
        chain: ["Define the decision", "Classify the data", "Map local law", "Give people an appeal", "Keep a manual path"],
        sources: [{ relation: "principle", title: "ICRC data protection handbook", url: "https://www.icrc.org/en/publication/4305-handbook-data-protection-humanitarian-action-third-edition", note: "Humanitarian-specific data protection principles and cases." }]
      },
      {
        kind: "Better incentives",
        title: "Reward corrected claims, not confident output.",
        body: "A research system should preserve contradiction, display uncertainty, and make correction cheap. Teams need credit for finding a disconfirming source or narrowing a claim. Shipping more summaries is the wrong measure.",
        chain: ["Show provenance", "Invite contradiction", "Separate author and reviewer", "Record revisions", "Measure correction quality"],
        sources: [{ relation: "method", title: "Epistemedia governance model", url: "https://github.com/yoheinakajima/epistemedia/blob/main/docs/governance.md", note: "Separates contribution, evaluation, and promotion authority." }]
      }
    ]
  },
  {
    id: "displacement-counts",
    topic: "conflict displacement",
    label: "Displacement",
    readTime: "5 min",
    title: "Displacement totals are the beginning of the question.",
    summary: "Definitions, reporting windows, and missing registrations matter. Read the number with the method that produced it.",
    visual: "displacement",
    visualWord: "COUNT / PEOPLE",
    slides: [
      {
        kind: "The brief",
        title: "A total is a projection of a method.",
        body: "Registration systems, surveys, administrative records, and models see different populations. People may move more than once, avoid registration, or fall outside a legal category. The method determines what the total can support.",
        chain: ["Definition", "Collection method", "Coverage", "Deduplication", "Published estimate"],
        sources: [{ relation: "supports", title: "UNHCR Refugee Data Finder", url: "https://www.unhcr.org/refugee-statistics/", note: "Definitions, methods, and published displacement data." }]
      },
      {
        kind: "Why it exists",
        title: "Legal categories decide who becomes visible to a system.",
        body: "Border crossing, status recognition, documentation, and registration affect which institution is responsible and which rights or services apply. People do not become less displaced when a database cannot classify them.",
        chain: ["Forced movement", "Legal category", "Registration access", "Institutional responsibility", "Service eligibility"],
        sources: [{ relation: "context", title: "OHCHR: Standards on internal displacement", url: "https://www.ohchr.org/en/special-procedures/sr-internally-displaced-persons/international-standards", note: "International framework for people displaced within their own country." }]
      },
      {
        kind: "What has been tried",
        title: "Registration enables aid and can also create risk.",
        body: "Shared registries can reduce duplication and improve referrals. They can also exclude people without documents or expose sensitive locations and identities. Better systems minimize data, allow correction, and keep a route to service when records fail.",
        chain: ["Collect only what is needed", "Explain use", "Protect access", "Allow correction", "Delete on schedule"],
        sources: [{ relation: "risk", title: "ICRC data protection handbook", url: "https://www.icrc.org/en/publication/4305-handbook-data-protection-humanitarian-action-third-edition", note: "Data protection risks and controls in humanitarian operations." }]
      },
      {
        kind: "Across borders",
        title: "Portability depends on law, identity systems, and political trust.",
        body: "A digital credential that works in one country may have no legal standing in another. Centralized identity can speed service where institutions are trusted and increase surveillance risk where they are not. Preserve the service function while changing the data architecture.",
        chain: ["Name the service right", "Map identity law", "Test institutional trust", "Minimize shared data", "Provide an offline appeal"],
        sources: [{ relation: "method", title: "World Bank: Governance and the Law", url: "https://www.worldbank.org/en/publication/wdr2017", note: "Institutional power and legitimacy shape policy implementation." }]
      },
      {
        kind: "Better incentives",
        title: "Fund inclusion and correction, not the size of the database.",
        body: "Programs can optimize for registrations completed because that number is easy to report. Better measures track successful service access, exclusion errors, corrections, safety incidents, and whether affected people can challenge a decision.",
        chain: ["Measure access", "Audit exclusions", "Fund correction", "Penalize unsafe reuse", "Give communities oversight"],
        sources: [{ relation: "principle", title: "Core Humanitarian Standard", url: "https://www.corehumanitarianstandard.org/the-standard", note: "Accountability and participation commitments for aid organizations." }]
      }
    ]
  },
  {
    id: "hospital-network",
    topic: "health conflict",
    label: "Health",
    readTime: "7 min",
    title: "A hospital is a network, not a building.",
    summary: "Staff, fuel, clean water, medicine, referrals, and safe access determine whether care continues during conflict.",
    visual: "health",
    visualWord: "SYSTEM / DOWN",
    slides: [
      {
        kind: "The brief",
        title: "A standing hospital can still be nonfunctional.",
        body: "Care depends on trained staff, supply chains, water, sanitation, power, communications, referral routes, and safety for patients. Building damage is one failure mode in a connected system.",
        chain: ["Staff", "Supplies", "Utilities", "Safe access", "Continuity of care"],
        sources: [{ relation: "supports", title: "WHO: Conflict in Israel and the occupied Palestinian territory", url: "https://www.who.int/emergencies/situations/conflict-in-Israel-and-oPt", note: "Health-system and emergency response reporting." }]
      },
      {
        kind: "Why it exists",
        title: "Conflict turns ordinary dependencies into points of failure.",
        body: "Fuel restrictions stop generators. Insecurity keeps staff and patients away. Broken referrals turn treatable cases into emergencies. Repeated disruption also drives skilled workers out, extending damage beyond a ceasefire.",
        chain: ["Movement restricted", "Inputs fail", "Capacity falls", "Cases become more severe", "Workforce leaves"],
        sources: [{ relation: "supports", title: "Health Care in Danger", url: "https://healthcareindanger.org/", note: "ICRC-led initiative on violence and access affecting health care." }]
      },
      {
        kind: "What has been tried",
        title: "Protected routes, distributed care, reserves, and remote support reduce different risks.",
        body: "Mobile clinics and distributed stock can reduce single points of failure. Deconfliction and protected routes may improve access but depend on parties respecting them. Remote support extends expertise but cannot replace electricity, supplies, or hands-on care.",
        chain: ["Map dependencies", "Remove single points", "Protect movement", "Pre-position essentials", "Practice degraded operation"],
        sources: [{ relation: "qualifies", title: "ICRC: Health Care in Danger", url: "https://www.icrc.org/en/what-we-do/health-care-danger", note: "Measures for protecting health-care delivery in armed conflict." }]
      },
      {
        kind: "Across borders",
        title: "Resilience has to fit the health authority and supply regime.",
        body: "A centralized national service, insurance market, and humanitarian cluster allocate staff and supplies differently. Translate a resilience pattern only after mapping licensing, reimbursement, import rules, referral authority, and who can maintain equipment.",
        chain: ["Define essential care", "Map authority and payment", "Map imports and maintenance", "Design degraded mode", "Run a joint exercise"],
        sources: [{ relation: "context", title: "WHO: Health emergency and disaster risk management", url: "https://www.who.int/activities/implementing-health-emergency-and-disaster-risk-management", note: "Whole-system preparedness approach." }]
      },
      {
        kind: "Better incentives",
        title: "Pay for continuity, not just visible reconstruction.",
        body: "New buildings attract capital and photographs. Maintenance, staff retention, backup power, and local supply capacity are less visible but keep care alive. Funding rules should value uptime, workforce safety, and patient access over assets delivered.",
        chain: ["Define continuity outcome", "Fund operating capacity", "Publish downtime", "Protect staff", "Reward local maintenance"],
        sources: [{ relation: "principle", title: "Core Humanitarian Standard", url: "https://www.corehumanitarianstandard.org/the-standard", note: "Quality and accountability commitments tied to affected people." }]
      }
    ]
  },
  {
    id: "rules-of-war",
    topic: "conflict",
    label: "Humanitarian law",
    readTime: "4 min",
    title: "The rules of war are practical constraints, not background theory.",
    summary: "Distinction, proportionality, and precautions shape what parties may do and what monitors document.",
    visual: "conflict",
    visualWord: "RULES / APPLY",
    slides: [
      {
        kind: "The brief",
        title: "Humanitarian law changes the questions asked before an attack.",
        body: "Parties must distinguish military objectives from civilians and civilian objects, assess expected civilian harm, and take feasible precautions. These are operational duties, not retrospective talking points.",
        chain: ["Identify the target", "Verify military character", "Estimate civilian harm", "Take precautions", "Cancel when the rule requires"],
        sources: [{ relation: "supports", title: "ICRC: Law and policy", url: "https://www.icrc.org/en/law-and-policy", note: "Primary ICRC explanation of international humanitarian law." }]
      },
      {
        kind: "Why violations persist",
        title: "Rules compete with secrecy, asymmetry, and weak enforcement.",
        body: "Information is incomplete, parties dispute facts, and military advantage can dominate civilian protection. Enforcement is uneven. That makes independent documentation and command responsibility more important, not less.",
        chain: ["Operational secrecy", "Unequal power", "Contested facts", "Weak accountability", "Repeated civilian harm"],
        sources: [{ relation: "context", title: "ICRC: Conduct of hostilities", url: "https://www.icrc.org/en/law-and-policy/conduct-hostilities", note: "Rules governing targeting and precautions." }]
      },
      {
        kind: "What has been tried",
        title: "Training, legal advisers, investigations, and monitoring work at different moments.",
        body: "Training and legal review can shape planning before harm occurs. Independent monitoring preserves facts. Investigations and courts address responsibility later. Each fails when it lacks access, independence, authority, or consequences.",
        chain: ["Train", "Advise operations", "Monitor independently", "Investigate", "Enforce"],
        sources: [{ relation: "qualifies", title: "ICRC: National implementation of IHL", url: "https://www.icrc.org/en/law-and-policy/domestic-implementation-ihl", note: "How states translate international duties into domestic systems." }]
      },
      {
        kind: "Across borders",
        title: "The obligation transfers. The enforcement route may not.",
        body: "International duties remain, while military doctrine, court jurisdiction, evidence rules, and command structures differ. Reformers should map where a binding review can occur and who can stop an unlawful decision in that system.",
        chain: ["Fix the obligation", "Map command authority", "Map domestic law", "Find an independent review point", "Protect evidence"],
        sources: [{ relation: "method", title: "ICRC: Domestic implementation", url: "https://www.icrc.org/en/law-and-policy/domestic-implementation-ihl", note: "National measures for implementing international humanitarian law." }]
      },
      {
        kind: "Better incentives",
        title: "Make civilian protection part of command performance.",
        body: "Organizations change when leaders are accountable for outcomes, evidence survives review, and personnel can report risk without retaliation. Civilian harm tracking should affect doctrine, promotion, procurement, and future operating authority.",
        chain: ["Track harm", "Preserve evidence", "Protect internal challenge", "Review command decisions", "Change incentives and doctrine"],
        sources: [{ relation: "principle", title: "ICRC: Command responsibility and IHL", url: "https://www.icrc.org/en/document/ihl-rules-of-war-faq-geneva-conventions", note: "Overview of duties and accountability under the law of armed conflict." }]
      }
    ]
  }
];
