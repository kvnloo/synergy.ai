export const articles = [
  {
    id: "sudan-access",
    topic: "conflict",
    label: "Conflict",
    readTime: "8 min seminar",
    title: "Aid is not a warehouse problem. In Sudan it is a contested route.",
    summary: "Headlines say aid is blocked. The useful question is who can move, who can refuse, and which local teams still reach people when internationals cannot. This brief holds UN, Red Cross, field, and standards voices side by side instead of collapsing them into one line.",
    visual: "conflict",
    visualWord: "ACCESS / POWER",
    reviewed: "2026-09-09",
    slides: [
      {
        kind: "The brief",
        title: "Access is a chain. A single broken link can stop the whole response.",
        body: "Supplies sitting in Port Sudan or across a border do not feed anyone. Food, fuel, staff, permits, road control, communications, and local trust have to line up. When any one of those fails, the shortage you see on camera is often downstream of politics, not a simple logistics shortfall.",
        chain: ["Supplies exist", "Permission is granted", "Routes stay open", "Local teams distribute", "People receive aid"],
        crosscut: {
          agree: "UN operational reporting and ICRC field work both treat movement and protection as the bottleneck, not only tonnage available.",
          tension: "Agency situation language stays high-level and system-wide. Field operators stress concrete corridor control, personal risk, and who still has community trust.",
          open: "Public pages rarely name the exact checkpoint, fee, or commander that closed a road on a given day. That detail lives in local reporting and private security notes."
        },
        seminar: [
          "If tonnage is high but deliveries fail, what failed first: permit, road, or last-mile trust?",
          "Whose map of the chain would you trust more on the ground tomorrow?",
          "What would count as evidence that the chain is healing, not just that a convoy left a warehouse?"
        ],
        sources: [
          { relation: "supports", kind: "guidance", lens: "agency", org: "UN OCHA", title: "UN OCHA: Sudan", url: "https://www.unocha.org/sudan", claim: "Humanitarian operations in Sudan are framed around access constraints and people in need, not inventory alone.", quote: "Humanitarian access remains a decisive factor in whether assistance reaches people in need across Sudan.", quoteKind: "paraphrase", note: "OCHA Sudan hub frames the emergency through access and operational constraints." },
          { relation: "supports", kind: "guidance", lens: "agency", org: "ICRC", title: "ICRC: Sudan", url: "https://www.icrc.org/en/where-we-work/africa/sudan", claim: "Protection and neutral action sit beside delivery. Access is inseparable from how parties treat medical and civilian movement.", quote: "The ICRC works to protect people affected by armed conflict and to support essential services where fighting has broken civilian systems.", quoteKind: "paraphrase", note: "ICRC country framing for conflict-affected civilians and services." },
          { relation: "context", kind: "reporting", lens: "local", org: "MSF", title: "MSF: Sudan conflict response", url: "https://www.msf.org/sudan", claim: "Field medical teams describe interrupted hospitals, unsafe roads, and patients who cannot move when front lines shift.", quote: "When hospitals are cut off or emptied by fighting, the medical chain fails even if supplies exist elsewhere in the country.", quoteKind: "paraphrase", note: "MSF public Sudan conflict response pages emphasize medical access under violence." },
          { relation: "method", kind: "standard", lens: "standard", org: "CHS", title: "Core Humanitarian Standard", url: "https://www.corehumanitarianstandard.org/the-standard", claim: "People affected by crisis are the measure of quality, not the volume an agency shipped.", quote: "Communities and people affected by crisis receive the assistance and the protection they need, delivered in a way that supports their dignity.", quoteKind: "paraphrase", note: "CHS quality and accountability commitments." }
        ]
      },
      {
        kind: "Why it exists",
        title: "When authority splits, roads become leverage.",
        body: "Armed actors can treat permits, corridors, fuel, and communications as tools of control. Local responders then face overlapping checkpoints and personal risk. The empty shelf is often the last visible step of a political and security system.",
        chain: ["Authority fragments", "Access gains political value", "Permits and routes become leverage", "Delivery slows", "Civilian harm compounds"],
        crosscut: {
          agree: "Access guidance and humanitarian principles both say movement can be politicized when parties to a conflict control territory.",
          tension: "Principles language is universal. Operational access notes are about specific gates, escorts, and refusals that change week to week.",
          open: "Public sources under-specify which local authorities can actually clear a convoy in a given locality."
        },
        seminar: [
          "Is the blockage a policy, a checkpoint business, or a security scare?",
          "What would a local transporter say that a capital-based cluster meeting would miss?",
          "If two authorities claim the same road, whose stamp is necessary and whose is theater?"
        ],
        sources: [
          { relation: "supports", kind: "guidance", lens: "agency", org: "UN OCHA", title: "UN OCHA: Humanitarian access", url: "https://www.unocha.org/themes/humanitarian-access", claim: "Access is defined as the ability of humanitarian actors to reach people in need, and of people to access assistance and services.", quote: "Humanitarian access is the ability of humanitarian actors to reach populations in need, and the ability of affected populations to access humanitarian assistance and services.", quoteKind: "paraphrase", note: "OCHA access theme definition used across emergencies." },
          { relation: "qualifies", kind: "principle", lens: "standard", org: "ICRC", title: "ICRC: Fundamental Principles", url: "https://www.icrc.org/en/document/fundamental-principles-red-cross-and-red-crescent", claim: "Neutrality and independence are operating conditions for access, not slogans. Parties test them constantly.", quote: "The Movement may not take sides in hostilities or engage at any time in controversies of a political, racial, religious or ideological nature.", quoteKind: "paraphrase", note: "Neutrality principle text from the Fundamental Principles." },
          { relation: "context", kind: "reporting", lens: "press", org: "UN News", title: "UN reporting on Sudan access and protection", url: "https://news.un.org/en/focus/sudan", claim: "Public UN reporting repeatedly ties civilian harm to blocked movement of aid and health staff.", quote: "UN reporting on Sudan regularly links rising needs to restrictions on humanitarian movement and attacks on civilian infrastructure.", quoteKind: "paraphrase", note: "Composite of UN News Sudan focus framing." }
        ]
      },
      {
        kind: "What has been tried",
        title: "Negotiation, local networks, cash, and cross-border routes fix different links.",
        body: "No single tool repairs the chain. A negotiated corridor can open a road and still leave markets dead. Cash helps when goods exist. Local organizations often keep reaching people after internationals pull back, but shifting delivery without shifting money and decision power just moves the risk onto them.",
        chain: ["Name the failed link", "Choose a matching intervention", "Fund local capacity", "Track access and outcomes", "Adapt when control shifts"],
        crosscut: {
          agree: "Localization guidance and displacement response both say local actors are not optional subcontractors when access is contested.",
          tension: "Operational agencies talk corridors and pipelines. Localization policy talks power, overhead, and who designs the response.",
          open: "Public materials rarely publish failure rates for specific corridor deals or cash programs under active fighting."
        },
        seminar: [
          "Which failed link are you actually funding?",
          "If local teams do the dangerous last mile, who holds the budget and the stop conditions?",
          "What evidence would tell you a corridor deal is real rather than a press release?"
        ],
        sources: [
          { relation: "supports", kind: "guidance", lens: "agency", org: "UNHCR", title: "UNHCR: Sudan emergency", url: "https://www.unhcr.org/emergencies/sudan-emergency", claim: "Displacement response treats protection, shelter, and cross-border movement as one system with Sudan's internal access fight.", quote: "The Sudan emergency is driven by mass displacement inside the country and across borders, with protection and assistance strained by conflict conditions.", quoteKind: "paraphrase", note: "UNHCR emergency framing for Sudan." },
          { relation: "limits", kind: "guidance", lens: "policy", org: "IASC", title: "IASC / Grand Bargain localisation", url: "https://interagencystandingcommittee.org/grand-bargain-official-website/localisation", claim: "Local leadership needs money and decision rights. Subcontracting delivery while keeping strategy central is not localization.", quote: "Localisation requires more direct funding and decision-making power for local and national responders, not only implementing roles under international contracts.", quoteKind: "paraphrase", note: "Grand Bargain localisation direction." },
          { relation: "method", kind: "standard", lens: "standard", org: "Sphere", title: "Sphere Handbook", url: "https://spherestandards.org/handbook-2018/", claim: "Technical standards still demand dignity, communication with affected people, and protection analysis when choosing modalities.", quote: "People's needs and capacities should shape the response, including how assistance is delivered and how protection risks are reduced.", quoteKind: "paraphrase", note: "Sphere people-centered response framing." }
        ]
      },
      {
        kind: "Across borders",
        title: "Copy the function, not the logo on the convoy.",
        body: "A corridor that runs through one ministry will not transfer into a place with three competing authorities. Start with who can authorize movement, who controls fuel and trucks, what sanctions apply, and which local institutions people still trust. Then rebuild the function under local law and risk.",
        chain: ["Define the function", "Map decision authority", "Map legal constraints", "Find a trusted local operator", "Pilot with stop conditions"],
        crosscut: {
          agree: "Governance research and neutral intermediary practice both say institutions and trust decide whether a delivery design survives contact with politics.",
          tension: "World Bank governance framing is structural and slow. ICRC intermediary practice is tactical and conflict-specific.",
          open: "Few public playbooks name the stop conditions that killed a transferred program in another country."
        },
        seminar: [
          "What function are you transferring: fuel, permits, last-mile trust, or all three?",
          "Who can say no on the road, and who only says no in meetings?",
          "What would make you cancel the pilot in week two?"
        ],
        sources: [
          { relation: "method", kind: "research", lens: "research", org: "World Bank", title: "WDR 2017: Governance and the Law", url: "https://www.worldbank.org/en/publication/wdr2017", claim: "Policy fails when it ignores who holds power and how commitment is enforced.", quote: "Governance is about the process of making and implementing policy under the distribution of power in society.", quoteKind: "paraphrase", note: "WDR 2017 core governance framing." },
          { relation: "context", kind: "guidance", lens: "agency", org: "ICRC", title: "ICRC: Neutral intermediary", url: "https://www.icrc.org/en/what-we-do/neutral-intermediary", claim: "A neutral intermediary is a function that can take different operational forms across wars.", quote: "The ICRC can act as a neutral intermediary between parties to a conflict to help resolve humanitarian problems.", quoteKind: "paraphrase", note: "ICRC neutral intermediary role description." },
          { relation: "supports", kind: "guidance", lens: "policy", org: "OCHA", title: "Humanitarian access practical guidance", url: "https://www.unocha.org/themes/humanitarian-access", claim: "Access work is negotiation, law, and logistics together. Exporting a brand without that triad fails.", quote: "Improving access requires coordinated engagement with parties and authorities, grounded in humanitarian principles and international law.", quoteKind: "paraphrase", note: "OCHA access practice framing." }
        ]
      },
      {
        kind: "Better incentives",
        title: "Make cooperation cheaper than obstruction.",
        body: "Appeals to goodwill do not open roads. Deals need monitoring, public evidence, costs for diversion, and benefits for reliable access. Funders can pay for delivery quality and local decision power instead of tonnage theater and contracts won.",
        chain: ["Publish the outcome", "Expose obstruction", "Protect independent monitors", "Reward reliable access", "Move power toward affected communities"],
        crosscut: {
          agree: "Accountability standards and business-and-human-rights baselines both reject vanity metrics that hide harm.",
          tension: "Humanitarian standards center affected people. UNGP language centers corporate responsibility where commercial incentives touch the crisis.",
          open: "Public donor scorecards still rarely show obstruction events next to disbursement totals."
        },
        seminar: [
          "What metric would make obstruction expensive this month?",
          "If local communities rated access quality, what would they score that clusters ignore?",
          "Which funder behavior currently rewards the wrong part of the chain?"
        ],
        sources: [
          { relation: "supports", kind: "standard", lens: "standard", org: "CHS", title: "Core Humanitarian Standard", url: "https://www.corehumanitarianstandard.org/the-standard", claim: "Accountability is owed to people affected by crisis, not only to donors.", quote: "Humanitarian actors are accountable to the people they seek to assist and to those who fund the response.", quoteKind: "paraphrase", note: "CHS accountability commitment." },
          { relation: "principle", kind: "principle", lens: "policy", org: "OHCHR", title: "UN Guiding Principles on Business and Human Rights", url: "https://www.ohchr.org/sites/default/files/documents/publications/guidingprinciplesbusinesshr_en.pdf", claim: "Where commercial actors affect conflict economies, responsibility does not stop at the warehouse gate.", quote: "Business enterprises should respect human rights, which means they should avoid infringing on the human rights of others and should address adverse human rights impacts.", quoteKind: "paraphrase", note: "UNGP foundational principle on corporate respect for human rights." },
          { relation: "context", kind: "guidance", lens: "agency", org: "OCHA", title: "OCHA on humanitarian financing and results", url: "https://www.unocha.org/sudan", claim: "Financing narratives that celebrate appeals raised without access outcomes mislead the public.", quote: "Funding without access does not equal assistance delivered.", quoteKind: "paraphrase", note: "Editorial synthesis of OCHA access-plus-funding logic; verify against current Sudan sitreps." }
        ]
      }
    ]
  },
  {
    id: "heat-health",
    topic: "climate",
    label: "Climate",
    readTime: "8 min seminar",
    title: "Heat kills unevenly. The thermometer is not the map.",
    summary: "The same temperature lands differently on a night-shift worker, an older tenant without power, and a clinic that lost cooling. This brief puts health-agency numbers next to occupational and equity lenses so you can see who is actually in danger.",
    visual: "climate",
    visualWord: "HEAT / CARE",
    reviewed: "2026-09-09",
    slides: [
      {
        kind: "The brief",
        title: "The same temperature produces different harm.",
        body: "Risk is exposure plus body plus building plus work plus whether care is reachable. A citywide high is useful meteorology. It is a poor map of who dies.",
        chain: ["Hazard", "Exposure", "Individual vulnerability", "Access to cooling and care", "Health outcome"],
        crosscut: {
          agree: "WHO heat-health guidance treats physiology and social exposure as joint drivers of harm.",
          tension: "Population mortality figures can hide occupational and housing pockets where risk is concentrated.",
          open: "Local hospital heat-admission data often lags the headline temperature chart."
        },
        seminar: [
          "Who in your city faces this temperature with no cooling and no day off?",
          "What would you measure besides degrees?",
          "If mortality is rising among people over 65, what fails first: housing, power, or outreach?"
        ],
        sources: [
          { relation: "supports", kind: "guidance", lens: "agency", org: "WHO", title: "WHO: Climate change, heat and health", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Heat risk is shaped by age, health, work, and living conditions, not temperature alone.", quote: "Vulnerability to heat is shaped by both physiological factors, such as age and health status, and exposure factors such as occupation and socio-economic conditions.", quoteKind: "verbatim", note: "WHO fact sheet, retrieved 2026-09-09." },
          { relation: "supports", kind: "guidance", lens: "agency", org: "WHO", title: "WHO heat mortality context", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Heat already kills at population scale, with large regional shares in Asia and Europe.", quote: "Between 2000 2019 studies show approximately 489 000 heat-related deaths occur each year, with 45% of these in Asia and 36% in Europe (2) .", quoteKind: "verbatim", note: "WHO fact sheet annual mortality estimate." },
          { relation: "context", kind: "guidance", lens: "clinical", org: "WHO", title: "WHO on heatstroke severity", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Heatstroke is not a soft weather story. It is a high-fatality emergency.", quote: "Heatstroke is a medical emergency with a high-case fatality rate.", quoteKind: "verbatim", note: "WHO fact sheet clinical severity line." }
        ]
      },
      {
        kind: "Why it exists",
        title: "Heat risk follows housing, work, and power.",
        body: "Low tree cover, tin roofs, night heat that never drops, outdoor labor, and blackouts turn a hot day into a medical event. People who cannot leave a hot room or stop work carry the load first.",
        chain: ["Urban heat islands", "Hot housing and night temperatures", "Outdoor and shift work", "Power and water gaps", "Uneven deaths"],
        crosscut: {
          agree: "WHO links rising exposure to climate change and flags older adults as a fast-growing mortality group.",
          tension: "Global averages do not tell a municipal planner which block loses power first.",
          open: "Many cities still lack published heat-equity maps tied to housing quality."
        },
        seminar: [
          "Which workers cannot stop when the heat index spikes?",
          "What does a night without cooling do that a hot afternoon does not?",
          "Where would a blackout turn heat from discomfort into organ failure?"
        ],
        sources: [
          { relation: "supports", kind: "guidance", lens: "agency", org: "WHO", title: "WHO: rising heat exposure", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Exposure is climbing across regions, not only in classic hot zones.", quote: "The number of people exposed to extreme heat is growing exponentially due to climate change in all world regions.", quoteKind: "verbatim", note: "WHO fact sheet exposure line." },
          { relation: "supports", kind: "guidance", lens: "research", org: "WHO", title: "WHO: older-adult heat mortality trend", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Deaths among people over 65 moved sharply upward over two decades of comparison windows.", quote: "Heat-related mortality for people over 65 years of age increased by approximately 85% between 2000 2004 and 2017 2021 (1) .", quoteKind: "verbatim", note: "WHO fact sheet older-adult mortality change." },
          { relation: "context", kind: "guidance", lens: "agency", org: "WHO", title: "WHO: Europe 2022 heat deaths", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Even high-income regions take mass casualties when heat intensity spikes.", quote: "In Europe alone in the summer of 2022, an estimated 61 672 heat-related excess deaths occurred (3) .", quoteKind: "verbatim", note: "WHO fact sheet Europe 2022 estimate." }
        ]
      },
      {
        kind: "What has been tried",
        title: "Heat action plans beat generic summer advice.",
        body: "Cities that cut deaths early use forecasts, targeted outreach to isolated adults, cooling centers, work/rest rules, and hospital surge triggers. Leaflets without outreach lists and power plans do little.",
        chain: ["Forecast triggers", "Find high-risk people", "Cooling and water access", "Worker protections", "Clinic surge rules"],
        crosscut: {
          agree: "Health guidance treats heat as a managed risk with triggers and responsibilities, not a personal virtue test.",
          tension: "Clinic protocols and labor rules often sit in different agencies and fail at the handoff.",
          open: "Published evaluations of which outreach method saves the most lives in informal settlements remain thin."
        },
        seminar: [
          "Who owns the trigger list when the forecast crosses your threshold?",
          "What is the plan for people who will not enter a cooling center?",
          "Which workers are still outside your heat ordinance?"
        ],
        sources: [
          { relation: "method", kind: "guidance", lens: "agency", org: "WHO", title: "WHO heat-health responses", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Responses must address acute medical risk and the conditions that produce exposure.", quote: "Heatstroke is a medical emergency with a high-case fatality rate.", quoteKind: "verbatim", note: "Clinical urgency anchors response design." },
          { relation: "supports", kind: "guidance", lens: "agency", org: "WHO", title: "WHO on extreme heatwave mortality", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Short high-intensity events have killed tens of thousands; plans need surge logic, not only seasonal tips.", quote: "High intensity heatwave events can bring high acute mortality; in 2003, 70 000 people in Europe died as a result of the June August event.", quoteKind: "verbatim", note: "WHO fact sheet on 2003 Europe heatwave." },
          { relation: "context", kind: "guidance", lens: "research", org: "WHO", title: "WHO: Russian Federation 2010 heatwave", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Multi-week events create excess deaths at national scale when systems stay unprepared.", quote: "In 2010, 56 000 excess deaths occurred during a 44 day heatwave in the Russian Federation.", quoteKind: "verbatim", note: "WHO fact sheet 2010 event." }
        ]
      },
      {
        kind: "Across borders",
        title: "Transfer the protection functions, not a temperate-city checklist.",
        body: "A cooling-center model assumes transport, safe public space, and electricity. Many places need shade rules for markets, water at work sites, generator priority for clinics, and night-ventilation fixes for dense housing. Start from functions: lower body heat, cut exposure time, keep care reachable.",
        chain: ["Name protection functions", "Map power and water", "Map work patterns", "Fit local buildings", "Pilot with stop conditions"],
        crosscut: {
          agree: "WHO's vulnerability framing travels: physiology plus occupation plus socio-economic exposure.",
          tension: "Exact interventions diverge hard between a formal European flat and an informal roof without grid power.",
          open: "Cross-border playbooks still under-document failed transfers."
        },
        seminar: [
          "Which function fails first without grid power?",
          "What does outdoor market labor need that a cooling center never supplies?",
          "What local institution already reaches older adults on foot?"
        ],
        sources: [
          { relation: "supports", kind: "guidance", lens: "agency", org: "WHO", title: "WHO vulnerability factors", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Any transfer must keep both body and exposure factors in the design.", quote: "Vulnerability to heat is shaped by both physiological factors, such as age and health status, and exposure factors such as occupation and socio-economic conditions.", quoteKind: "verbatim", note: "WHO fact sheet." },
          { relation: "context", kind: "guidance", lens: "agency", org: "WHO", title: "WHO global exposure growth", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Designs must assume rising exposure everywhere, including places that thought they were temperate.", quote: "The number of people exposed to extreme heat is growing exponentially due to climate change in all world regions.", quoteKind: "verbatim", note: "WHO fact sheet." },
          { relation: "method", kind: "standard", lens: "standard", org: "Sphere", title: "Sphere Handbook shelter and health links", url: "https://spherestandards.org/handbook-2018/", claim: "Shelter, water, and health standards are the practical carriers of heat protection in crisis settings.", quote: "Shelter and settlement responses should support health, dignity, and protection from environmental risks.", quoteKind: "paraphrase", note: "Sphere shelter/health intent applied to heat." }
        ]
      },
      {
        kind: "Better incentives",
        title: "Pay for fewer heat deaths, not more press conferences.",
        body: "If agencies are scored on alerts issued, they will issue alerts. Better public measures: heat deaths and hospital admissions by neighborhood, worker rest compliance, power uptime at clinics, and outreach completed to known isolated adults.",
        chain: ["Publish heat deaths by place", "Audit worker rest rules", "Keep clinic power up", "Finish outreach lists", "Fund shade and housing fixes"],
        crosscut: {
          agree: "The WHO numbers make vanity metrics look small next to excess deaths.",
          tension: "Political incentives still reward visible emergency declarations over quiet housing and labor fixes.",
          open: "Few budgets publish heat outcomes beside heat-program spend."
        },
        seminar: [
          "Which number would embarrass your city into action this month?",
          "Who is paid to finish the outreach list?",
          "What labor rule exists on paper and dies on the worksite?"
        ],
        sources: [
          { relation: "supports", kind: "guidance", lens: "agency", org: "WHO", title: "WHO annual heat deaths", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "The outcome that matters is deaths prevented, at hundreds of thousands per year globally.", quote: "Between 2000 2019 studies show approximately 489 000 heat-related deaths occur each year, with 45% of these in Asia and 36% in Europe (2) .", quoteKind: "verbatim", note: "WHO fact sheet." },
          { relation: "supports", kind: "guidance", lens: "research", org: "WHO", title: "WHO older-adult mortality rise", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "A rising older-adult death curve is a systems failure signal, not bad luck.", quote: "Heat-related mortality for people over 65 years of age increased by approximately 85% between 2000 2004 and 2017 2021 (1) .", quoteKind: "verbatim", note: "WHO fact sheet." },
          { relation: "principle", kind: "guidance", lens: "clinical", org: "WHO", title: "WHO heatstroke line", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", claim: "Clinical severity belongs in public scorecards so heat is not filed under lifestyle advice.", quote: "Heatstroke is a medical emergency with a high-case fatality rate.", quoteKind: "verbatim", note: "WHO fact sheet." }
        ]
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
    reviewed: "2026-09-03",
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
    reviewed: "2026-09-03",
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
    reviewed: "2026-09-03",
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
    reviewed: "2026-09-03",
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
  },
  {
    id: "glp1-willpower",
    topic: "health technology",
    label: "Health",
    readTime: "8 min briefing",
    title: "Willpower is becoming a public system problem, not a private virtue.",
    summary: "GLP-1 and multi-agonist drugs quiet appetite and improve metabolic markers. The harder societal question is how conscious control, attention, and access get designed when food, feeds, and algorithms all compete for the same scarce self.",
    visual: "health",
    visualWord: "CONTROL / CRAVING",
    reviewed: "2026-09-03",
    slides: [
      {
        kind: "The brief",
        title: "Multi-pathway agonists change the set-point. They do not invent free will.",
        body: "Semaglutide is a GLP-1 receptor agonist. Tirzepatide is a dual GIP and GLP-1 agonist. Investigational retatrutide adds glucagon. In large trials these medicines produce large, sustained weight loss and improve cardiometabolic markers, including glycemic control. People also report quieter food drive. That is pharmacology acting on gut-brain circuits, not proof that character improved. The public story often mislabels the ladder: Ozempic is not a dual agonist, and Mounjaro is not a triple.",
        chain: ["Gut-brain signal", "Appetite and intake fall", "Weight and glucose move", "Craving load drops", "Attention budget can be reallocated"],
        sources: [
          { relation: "supports", title: "STEP 1: once-weekly semaglutide in overweight or obesity", url: "https://pubmed.ncbi.nlm.nih.gov/33567185/", note: "NEJM trial: mean weight change -14.9% with 2.4 mg semaglutide vs -2.4% placebo at 68 weeks." },
          { relation: "supports", title: "SURMOUNT-1: tirzepatide once weekly for obesity", url: "https://pubmed.ncbi.nlm.nih.gov/35658024/", note: "NEJM phase 3: dual GIP/GLP-1 agonist; mean weight change to -20.9% at 15 mg vs -3.1% placebo at 72 weeks." },
          { relation: "supports", title: "Retatrutide phase 2 obesity trial", url: "https://pubmed.ncbi.nlm.nih.gov/37366315/", note: "NEJM phase 2: triple GIP/GLP-1/glucagon agonist; up to -24.2% mean weight change at 48 weeks at 12 mg." },
          { relation: "supports", title: "FDA: Zepbound (tirzepatide) approval", url: "https://www.fda.gov/news-events/press-announcements/fda-approves-new-medication-chronic-weight-management", note: "Confirms dual GLP-1 and GIP receptor activation, chronic weight-management indication, and side-effect warnings." }
        ]
      },
      {
        kind: "Why it exists",
        title: "Obesogenic environments made appetite a population-scale failure mode.",
        body: "WHO treats obesity as a chronic, relapsing disease shaped by genetics, neurobiology, markets, and environments, not as a simple calories-in moral story. More than a billion people live with obesity; adult obesity more than doubled since 1990. Ultra-processed food, sedentary design, and attention markets raise the cost of restraint every hour. When self-control is the only tool, the system wins. Drugs that lower the craving load arrived into that mismatch. Separately, AI and ranking systems make attention scarcer, so the remaining conscious control becomes more valuable for work, health, and civic life.",
        chain: ["Environment raises craving load", "Individual willpower saturates", "Metabolic disease compounds", "Drug classes target gut-brain pathways", "Attention scarcity raises the stakes of control"],
        sources: [
          { relation: "supports", title: "WHO: Obesity and overweight", url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight", note: "Defines obesity as chronic disease; 2022 prevalence and environmental drivers." },
          { relation: "context", title: "WHO: GLP-1 therapies Q&A", url: "https://www.who.int/news-room/questions-and-answers/item/obesity-glp-1-therapies", note: "Explains appetite, fullness, glucose effects, and that medicines are not a standalone solution." },
          { relation: "context", title: "Bryan Johnson / Blueprint protocol", url: "https://bryanjohnson.com/", note: "Public longevity protocol framed as an algorithm that reduces reliance on moment-to-moment willpower." }
        ]
      },
      {
        kind: "What has been tried",
        title: "Lifestyle, older drugs, surgery, then single, dual, and triple agonists.",
        body: "Diet and activity remain foundational and still fail many people when the environment is hostile. Older pharmacotherapy offered modest average effects. Bariatric surgery works for selected patients but does not scale like a weekly injection. GLP-1 monotherapy, then dual agonism, then investigational triple agonism escalated average weight loss. WHO now pairs conditional long-term GLP-1 use for adults with obesity with intensive behavioral support. Blueprint-style protocols attack the same problem from the opposite direction: precommitment, meal defaults, sleep rules, and measurement so fewer decisions need raw restraint. Neither path replaces the other.",
        chain: ["Lifestyle defaults", "Older pharmacotherapy", "Metabolic surgery", "Single then multi-agonists", "Behavioral and protocol scaffolds"],
        sources: [
          { relation: "supports", title: "WHO guideline on GLP-1 therapies for adult obesity", url: "https://www.who.int/news/item/01-12-2025-who-issues-global-guideline-on-the-use-of-glp-1-medicines-in-treating-obesity", note: "Conditional recommendations for long-term GLP-1 use plus intensive behavioral interventions; medicines alone will not reverse obesity." },
          { relation: "method", title: "WHO Acceleration plan to stop obesity", url: "https://www.who.int/publications/i/item/9789240075634", note: "Population, prevention, and care pillars beyond any single drug class." },
          { relation: "qualifies", title: "Blueprint protocol information", url: "https://blueprint.bryanjohnson.com/pages/blueprint-protocol", note: "Systems approach to daily health behaviors; useful as a willpower-design reference, not as clinical guidance for incretin drugs." }
        ]
      },
      {
        kind: "Across borders",
        title: "The molecule transfers. Coverage, trust, and counterfeits do not.",
        body: "A dual agonist approved in one market may be unaffordable, unregistered, or diverted in another. WHO warns that demand has fueled falsified and substandard products. Even with manufacturing expansion, GLP-1 therapies may reach fewer than 10% of people who could benefit by 2030 without deliberate access policy. Health systems differ on who can prescribe, who pays, how shortages are rationed, and whether behavioral care exists at all. A performance protocol that assumes private compounding, concierge labs, or unlimited personal coaching will not transfer to a public clinic. Start from the function: lower harmful craving load, protect metabolic health, preserve agency — then rebuild delivery under local law and capacity.",
        chain: ["Name the clinical function", "Map registration and payment", "Secure quality supply", "Attach behavioral care", "Measure equity of reach"],
        sources: [
          { relation: "supports", title: "WHO GLP-1 guideline announcement", url: "https://www.who.int/news/item/01-12-2025-who-issues-global-guideline-on-the-use-of-glp-1-medicines-in-treating-obesity", note: "Access, affordability, system readiness, and <10% reach projection by 2030 without policy action." },
          { relation: "risk", title: "WHO warning on falsified diabetes and weight-loss medicines", url: "https://www.who.int/news/item/20-06-2024-who-issues-warning-on-falsified-medicines-used-for-diabetes-treatment-and-weight-loss", note: "Counterfeit risk under high demand." },
          { relation: "context", title: "WHO Essential Medicines update including GLP-1 for high-risk diabetes", url: "https://www.who.int/news/item/05-09-2025-who-updates-list-of-essential-medicines-to-include-key-cancer--diabetes-treatments", note: "Signals prioritization pressure inside essential-medicine frameworks." }
        ]
      },
      {
        kind: "Better incentives",
        title: "Pay for durable control and fair access, not injection theater.",
        body: "Markets currently reward scarcity hype, aesthetic weight loss, and continuous consumption. Better public measures track durable metabolic health, reduced disability, return of agency, and equitable access — not vials sold. Pair pharmacology with food-environment rules, attention-hygiene defaults, and personal protocols that make good action automatic. As AI raises the return on focused work, conscious control becomes infrastructure. The win condition is people who can direct their attention and appetite without burning the day on resistance. Fail conditions: black-market product harm, care only for the wealthy, and the false claim that a shot replaces sleep, food quality, movement, or judgment.",
        chain: ["Define human outcomes", "Price quality access", "Redesign craving environments", "Support protocol scaffolds", "Keep a human accountable for care"],
        sources: [
          { relation: "principle", title: "WHO: medicines alone will not solve obesity", url: "https://www.who.int/news/item/01-12-2025-who-issues-global-guideline-on-the-use-of-glp-1-medicines-in-treating-obesity", note: "Three-pillar strategy: healthier environments, prevention for high risk, lifelong person-centred care." },
          { relation: "principle", title: "WHO obesity fact sheet on multisector action", url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight", note: "Structural food, marketing, and health-system responses beyond individual willpower." },
          { relation: "context", title: "Blueprint: algorithm over moment-to-moment willpower", url: "https://bryanjohnson.com/", note: "Performance-protocol framing that treats self-control as a designed system." }
        ]
      }
    ]
  }
  ,
  {
    id: "sleep-infrastructure",
    topic: "health",
    label: "Health",
    readTime: "7 min briefing",
    title: "Sleep is public-health infrastructure. Shift work, heat, and light decide who gets it.",
    summary: "Sleep loss is not only personal discipline. Rosters, night heat, and light at the wrong time break recovery for responders and civilians. Treat sleep like water and power: design the system, then coach the person.",
    visual: "climate",
    visualWord: "SLEEP / SHIFT",
    reviewed: "2026-09-09",
    slides: [
      {
        kind: "The brief",
        title: "A population that cannot sleep cannot recover, decide, or stay safe.",
        body: "Short or broken sleep raises error rates, injury, cardiovascular risk, and mental-health load. In crises the people who must stay awake — clinicians, drivers, guards, caregivers — often have the least recovery window. Individual advice fails when the roster, the room, and the light work against sleep.",
        chain: ["Work and heat load rise", "Sleep opportunity shrinks", "Recovery debt builds", "Errors and illness rise", "Community capacity falls"],
        sources: [
          { relation: "supports", kind: "guidance", title: "WHO: mental health of health and care workers", url: "https://www.who.int/publications/i/item/9789240049338", note: "Workload, rest, and support for health workers." },
          { relation: "supports", kind: "guidance", title: "CDC/NIOSH: shift work and sleep", url: "https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod6/01.html", note: "Shift work, circadian disruption, and fatigue risk." }
        ]
      },
      {
        kind: "Why it exists",
        title: "Rosters, heat, and light are designed — so is the sleep loss.",
        body: "Night shifts fight the circadian clock. Hot rooms and power cuts block deep sleep after day duty. Screens and security lighting delay melatonin. Informal overtime and understaffing steal the off-duty window. The result looks like weak willpower; the mechanism is environmental and organizational.",
        chain: ["Circadian night work", "Hot or noisy rest spaces", "Wrong-time light", "Compressed off-duty windows", "Chronic sleep debt"],
        sources: [
          { relation: "supports", kind: "peer-reviewed", title: "Occupational sleep medicine overview (NIOSH)", url: "https://www.cdc.gov/niosh/topics/workschedules/", note: "Work schedules and sleep impairment pathways." },
          { relation: "context", kind: "guidance", title: "WHO heat and health", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health", note: "Heat stress interacts with rest and recovery." }
        ]
      },
      {
        kind: "What has been tried",
        title: "Forward-rotating shifts, dark cool rest, and protected handoffs beat pep talks.",
        body: "Evidence-aligned measures include limiting consecutive nights, clockwise shift rotation, strategic naps where safe, caffeine timing rules, blackout and cooling for day sleep, and supervisor checks for fatigue-critical tasks. Personal hygiene tips help only after the system creates a sleep opportunity.",
        chain: ["Limit consecutive nights", "Rotate shifts forward", "Protect a sleep opportunity", "Cool and darken rest spaces", "Screen fatigue before critical tasks"],
        sources: [
          { relation: "method", kind: "guidance", title: "NIOSH work schedule training", url: "https://www.cdc.gov/niosh/work-hour-training-for-nurses/default.html", note: "Practical controls for long hours and shift work." },
          { relation: "supports", kind: "guidance", title: "WHO guidelines on mental health at work", url: "https://www.who.int/publications/i/item/9789240053052", note: "Organizational interventions over individual-only approaches." }
        ]
      },
      {
        kind: "Across borders",
        title: "Transfer the sleep opportunity, not a Western bedroom checklist.",
        body: "A blackout curtain assumption fails in shared shelters. Cooling assumptions fail without power. Nap rooms need security and gender safety. Start from function: uninterrupted recovery time, darkness or eye cover, lower thermal load, and a culture that does not punish rest. Map who controls rosters, generators, and sleeping spaces before copying a protocol.",
        chain: ["Define recovery function", "Map roster authority", "Map power and shelter", "Fit local safety constraints", "Pilot with stop conditions"],
        sources: [
          { relation: "method", kind: "guidance", title: "Sphere Handbook: shelter and settlement", url: "https://spherestandards.org/handbook-2018/", note: "Dignity, privacy, and environmental standards that affect rest." },
          { relation: "context", kind: "reporting", title: "ICRC: health care in danger — stress on staff", url: "https://www.icrc.org/en/what-we-do/health-care-danger", note: "Operational stress context for responders." }
        ]
      },
      {
        kind: "Better incentives",
        title: "Pay for safe staffing and recovery windows, not heroic continuous duty.",
        body: "If metrics reward hours present, organizations will burn sleep. Better measures: consecutive nights capped, incident rates after nights, self-reported sleep opportunity, and protected off-duty blocks. A field checklist for shift responders: darken and cool the sleep space, fixed wind-down, no non-urgent calls in the first sleep cycle, hydrate and light meal, plan commute safety when drowsy, escalate when errors cluster.",
        chain: ["Cap consecutive nights", "Measure sleep opportunity", "Protect off-duty blocks", "Cool dark rest spaces", "Stop heroic overtime norms"],
        sources: [
          { relation: "principle", kind: "guidance", title: "WHO: decent work and health", url: "https://www.who.int/news-room/fact-sheets/detail/protecting-workers-health", note: "Working-time and health protection framing." },
          { relation: "supports", kind: "guidance", title: "CDC: sleep and sleep disorders", url: "https://www.cdc.gov/sleep/about/index.html", note: "Population sleep health baseline." }
        ]
      }
    ]
  }
  ,
  {
    id: "psychological-first-aid",
    topic: "health",
    label: "Health",
    readTime: "7 min briefing",
    title: "Psychological first aid is a human skill, not a therapy brand.",
    summary: "In the first hours and days after violence, displacement, or disaster, most people need safety, dignity, and clear information more than a diagnosis. Psychological first aid is listen, protect, and link — without forcing people to retell trauma for your paperwork.",
    visual: "health",
    visualWord: "LISTEN / LINK",
    reviewed: "2026-09-09",
    slides: [
      {
        kind: "The brief",
        title: "First contact should reduce harm, not perform expertise.",
        body: "Psychological first aid (PFA) is a humane response for people in acute distress after crisis. It is not psychotherapy, not interrogation, and not a promise that you can fix grief. The core is practical: help someone feel safer, heard, and connected to information and services they choose.",
        chain: ["Crisis hits", "Acute distress rises", "First contact happens", "Safety and dignity hold", "Person chooses next links"],
        sources: [
          { relation: "supports", kind: "guidance", title: "WHO: Psychological first aid — Guide for field workers", url: "https://www.who.int/publications/i/item/9789241548205", note: "Field guide for PFA principles and actions." },
          { relation: "supports", kind: "guidance", title: "WHO: Psychological first aid — Facilitator's manual", url: "https://www.who.int/publications/i/item/9789241548618", note: "Training framing for non-specialists." }
        ]
      },
      {
        kind: "Why it exists",
        title: "Chaos creates secondary harm when helpers rush, pry, or pathologize.",
        body: "After attack, flood, or flight, people face threat, loss, and uncertainty. Well-meant helpers may demand the full story, separate families for process, or label normal reactions as disorder. Rumors replace facts. The gap is trained presence: enough structure to protect, enough restraint to avoid making the event worse.",
        chain: ["Threat and loss", "Helpers arrive unevenly", "Curiosity and process pressure", "Dignity breaks", "Distress compounds"],
        sources: [
          { relation: "context", kind: "guidance", title: "IASC Guidelines on Mental Health and Psychosocial Support in Emergency Settings", url: "https://interagencystandingcommittee.org/iasc-task-force-mental-health-and-psychosocial-support-emergency-settings/iasc-guidelines-mental-health-and-psychosocial-support-emergency-settings-2007", note: "Layered MHPSS supports; PFA as a community-level response." },
          { relation: "supports", kind: "guidance", title: "WHO mhGAP Humanitarian Intervention Guide", url: "https://www.who.int/publications/i/item/9789241548014", note: "Clinical and non-clinical roles in humanitarian mental health." }
        ]
      },
      {
        kind: "What has been tried",
        title: "Look, listen, link — with consent and without forced debriefing.",
        body: "Established PFA practice: look (safety, urgent needs, who is distressed), listen (if they want to talk, stay close, do not push details), link (information, loved ones, services, basic needs). Single-session forced emotional debriefing is not recommended. Train teachers, volunteers, and responders in boundaries as much as in scripts.",
        chain: ["Look for safety needs", "Listen without forcing", "Link to chosen supports", "Protect privacy", "Know your limits"],
        sources: [
          { relation: "supports", kind: "guidance", title: "WHO PFA guide — Look, Listen, Link", url: "https://www.who.int/publications/i/item/9789241548205", note: "Action principles used worldwide in training." },
          { relation: "limits", kind: "guidance", title: "WHO: psychological debriefing not recommended as mandatory single-session", url: "https://www.who.int/publications/i/item/9789241548205", note: "PFA distinguishes supportive contact from forced retelling." }
        ]
      },
      {
        kind: "Across borders",
        title: "Transfer the functions: safety, voice, accurate news, trusted local links.",
        body: "A Western counseling posture can fail where faith leaders, elders, or mutual-aid groups are the trusted first contact. Gender, language, and stigma change who can approach whom. Start from functions — physical safety, confidential listening, trustworthy information, family tracing, basic needs — then map who already holds trust. Do not import a clinic brand; import restraint and consent.",
        chain: ["Name the functions", "Map trusted local actors", "Fit language and gender norms", "Share accurate information", "Refer only with consent"],
        sources: [
          { relation: "method", kind: "guidance", title: "IASC MHPSS guidelines — community supports", url: "https://interagencystandingcommittee.org/iasc-task-force-mental-health-and-psychosocial-support-emergency-settings/iasc-guidelines-mental-health-and-psychosocial-support-emergency-settings-2007", note: "Multi-layered supports grounded in community." },
          { relation: "context", kind: "guidance", title: "Sphere Handbook: protection and mental health references", url: "https://spherestandards.org/handbook-2018/", note: "Dignity and protection principles in humanitarian response." }
        ]
      },
      {
        kind: "Better incentives",
        title: "Reward safe presence and honest limits, not story extraction.",
        body: "If agencies count forms completed or tears witnessed, staff will pry. Better measures: people who got water, family contact, clear next-step information, and the option to decline. Train-do-don't for helpers: do stay calm and useful; do keep confidences; do tell the truth about what you can offer. Don't force talk; don't share photos; don't promise what you cannot deliver; don't replace specialized care when risk is high — link to it.",
        chain: ["Stay calm and practical", "Protect confidentiality", "Offer truthful choices", "Never force the story", "Link up when risk is high"],
        sources: [
          { relation: "principle", kind: "guidance", title: "WHO PFA — helper principles and ethics", url: "https://www.who.int/publications/i/item/9789241548205", note: "Respect, honesty, and boundaries for field helpers." },
          { relation: "supports", kind: "guidance", title: "IASC: do no harm in MHPSS", url: "https://interagencystandingcommittee.org/iasc-task-force-mental-health-and-psychosocial-support-emergency-settings/iasc-guidelines-mental-health-and-psychosocial-support-emergency-settings-2007", note: "Avoid interventions that increase harm or stigma." }
        ]
      }
    ]
  }

];
