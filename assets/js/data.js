/*
 * Portfolio content.
 * Each area has { id, label, icon, blurb, items[] }.
 * Each item has { title, status, summary, tags[], lld[], testPlan[], setup[], links[] }.
 * Stats and W-numbers are pulled from GUS (ADM_Work__c, org `gus`) and GitHub.
 */

const PROFILE = {
  name: "Aditya Kopalli",
  role: "Member of Technical Staff",
  org: "Salesforce",
  handle: "KopalliAditya (GitHub) · akopalli (internal)",
  githubUrl: "https://github.com/KopalliAditya",
  tagline:
    "Health Cloud, integration & applied-AI engineering — HL7/MuleSoft referral pipelines, predictive CSR scoring, intelligent appointments, and Agentforce.",
};

/* Verified from GUS: 173 total work items (89 bugs, 84 user stories), 143 closed/fixed. */
const STATS = [
  { label: "GUS work items", value: "173", note: "89 bugs · 84 user stories", source: "GUS" },
  { label: "Delivered", value: "143", note: "closed / fixed", source: "GUS" },
  { label: "Scratch / demo orgs", value: "30+", note: "spun up for POCs", source: "sf CLI" },
  { label: "Patents", value: "1", note: "PCAS — approved 2026-08-17", source: "Legal" },
];

const AREAS = [
  /* ───────────────────────── OVERVIEW ───────────────────────── */
  {
    id: "overview",
    label: "Overview",
    icon: "◆",
    blurb:
      "A living record of the Salesforce work I've shipped and prototyped, organized by domain. Each item has a low-level design, a test plan, and the setup needed to reproduce it. Top product areas by work-item volume: Patient Access (53), Intelligent Appointment Management (9), HC HL7 Adapter, and trust/sustaining across HC Rebels & R2D2.",
    items: [],
  },

  /* ───────────────────────── SCORING ───────────────────────── */
  {
    id: "scoring",
    label: "Scoring",
    icon: "▲",
    blurb:
      "Predictive scoring for Patient Access — a generic CSR scoring framework and the Data-Cloud closed loop that turns raw clinical-request data into a referral/acuity score written back on the record.",
    items: [
      {
        title: "Generic CSR scoring framework (design spike)",
        status: "Fixed",
        summary:
          "Designed a CSR scoring framework decoupled from Referral Management, so predictive scoring can run on any Clinical Service Request — not just referrals.",
        tags: ["Patient Access", "Framework", "Design"],
        lld: [
          "Spiked a scoring framework that is independent of Referral Management, operating directly on the ClinicalServiceRequest entity.",
          "Design enhancements folded in from the follow-on review so the framework generalizes across CSR use cases.",
          "BDT input fields refactored to include only the attributes the scoring model actually needs.",
        ],
        testPlan: [
          "Validate the framework scores a CSR that is not tied to a referral.",
          "Confirm the trimmed BDT input set still produces the expected score.",
        ],
        setup: ["Install the scoring framework/template; confirm install-time validations pass."],
        links: [],
      },
      {
        title: "Patient Access Scoring — Data Kit, DMO setup & install validations",
        status: "Fixed",
        summary:
          "Built the Data Cloud setup (data kit + DMO) for Patient Access Scoring and added install-time validations plus a cleaner setup UX.",
        tags: ["Data Cloud", "DMO", "Install"],
        lld: [
          "Authored the Data Kit / DMO setup that lands the clinical data in Data Cloud for scoring.",
          "Added install-time validations so a misconfigured install fails fast with a clear reason instead of silently producing no scores.",
          "Reviewed and improved the setup UX to reduce manual steps.",
        ],
        testPlan: [
          "Run a clean install and confirm validations pass and the DMO is populated.",
          "Negative: break a prerequisite and confirm the install-time validation surfaces it.",
        ],
        setup: ["Install the data kit; confirm DMO mapping; run the setup flow end to end."],
        links: [],
      },
      {
        title: "CSR Predictive Scoring — end-to-end closed loop",
        status: "Proven",
        summary:
          "The full loop demonstrated: CSV → CRM → Data Cloud DMO → model → ReferralScore written back on the record.",
        tags: ["Data Cloud", "E2E", "Apex"],
        lld: [
          "Stages: source CSV → CRM object → Data Cloud DMO → scoring model → ReferralScore back on the CRM record.",
          "Critical constraint: the copy-join key must be identical across all three layers — CSV `id` = DMO `Id__c` = CRM `SourceSystemIdentifier`.",
          "The CRM record Id copies verbatim into DMO `ssot__Id__c`, which makes the score write-back addressable.",
          "CSR unification in Data Cloud (VOC spike) is what lets the request records resolve into a single scored profile.",
        ],
        testPlan: [
          "Verify the join key matches byte-for-byte across CSV, DMO, and CRM before scoring.",
          "Drive seed/scoring via anonymous Apex, keeping each run under ~31 KB (anon-Apex cap).",
          "Assert a ReferralScore lands back on every seeded record; count in vs. count out.",
        ],
        setup: [
          "Orgs: `csr-scoring-org` / `csr-scoring-live` (orgfarm) with CSR seed data.",
          "Enable CSR unification in Data Cloud.",
        ],
        links: [],
      },
      {
        title: "Query Data Cloud DMOs from the sf CLI (/ssot + core token)",
        status: "Working",
        summary:
          "Read/query DMOs directly from the sf CLI using the /ssot Connect API with a core bearer token — bypassing the off-core token exchange that fails with invalid_scope.",
        tags: ["Data Cloud", "Connect API", "Auth"],
        lld: [
          "Use `/ssot` with a core bearer token; the off-core a360 token-exchange returns `invalid_scope`.",
          "`POST /ssot/queryv2` with a SQL body returns HTTP 201 with the result set.",
          "CRM Id copies verbatim into DMO `ssot__Id__c` — the same identity thread the scoring loop depends on.",
        ],
        testPlan: [
          "Confirm a SQL query against a known DMO returns HTTP 201 and the expected rows.",
          "Negative: confirm the off-core token path still fails with invalid_scope.",
        ],
        setup: ["Obtain a core bearer token; POST SQL to `/ssot/queryv2`; inspect the 201."],
        links: [],
      },
      {
        title: "PCAS — Provenance-Constrained Action Substitution (patent)",
        status: "Approved for filing",
        summary:
          "Invention disclosure for provenance-constrained action substitution. Approved 2026-08-17 (Li + Kopalli) after reversing an earlier 102/103 rejection by narrowing the claim to substitution.",
        tags: ["Patent", "Applied AI", "Provenance"],
        lld: [
          "Core idea: constrain which actions an agent may substitute based on the provenance of the data/decision driving them.",
          "The approved framing narrowed the claim specifically to action *substitution*, clearing the prior-art (102/103) objections.",
        ],
        testPlan: ["N/A — invention disclosure; validated by prior-art novelty review on the narrowed claim."],
        setup: ["Disclosure approved 2026-08-17. Inventors: Li, Kopalli."],
        links: [],
      },
    ],
  },

  /* ───────────────────────── MULESOFT ───────────────────────── */
  {
    id: "mulesoft",
    label: "MuleSoft",
    icon: "⬡",
    blurb:
      "The EHR HL7 Referral Connector — a MuleSoft listener that turns inbound HL7 ORM orders into Health Cloud Clinical Service Requests. The connector, its auth, de-dup, packaging, and the long tail of platform quirks it took to get a listener to RUNNING.",
    items: [
      {
        title: "HL7 Referral Listener (ORM) — create CSR + Patient",
        status: "Fixed",
        summary:
          "The core connector: an inbound HL7 ORM listener that creates a ClinicalServiceRequest (and Patient) in Health Cloud. Validated across endpoints and packaged for deploy.",
        tags: ["HL7", "ORM", "CloudHub", "CSR"],
        lld: [
          "Listener ingests HL7 ORM messages and creates CSR + Patient records in the org.",
          "Three inbound channels proven: raw curl, a mock-EMR sender, and the HAPI TestPanel sender.",
          "Clean working app `hl7-orm-demo` is wizard-created on purpose — the wizard writes the client secret in a way the CLI blocks.",
        ],
        testPlan: [
          "Send the same ORM message over all three channels; assert one CSR + Patient per message.",
          "Validate HL7 endpoint testing against the live listener before enablement.",
          "Do not run `application:modify` against the working connector — it strips config.",
        ],
        setup: ["App `hl7-orm-demo`, CloudHub (shard -4), org 239. Keep the wizard-generated secret untouched."],
        links: [],
      },
      {
        title: "ORM de-duplication (RF blocker)",
        status: "Fixed",
        summary:
          "Stopped the listener from accepting duplicate placer order numbers and mutating existing CSR records — a per-MRN lock plus a correct upsert external-id.",
        tags: ["Concurrency", "Dedup", "DataWeave"],
        lld: [
          "Per-MRN serialization via a Semaphore keyed on the patient MRN.",
          "The lock key MUST be a materialized Java String (`output application/java`). As a DataWeave stream cursor it produced a unique toString() per request, so the semaphore never serialized anything.",
          "Create→upsert only de-dups concurrent inserts when the external-id field is `unique=true`. ORM PA/CSR still duplicated under load; only SA (unique) de-duped.",
        ],
        testPlan: [
          "Fire N concurrent identical orders for one MRN; assert exactly one record created.",
          "Log the lock key and confirm it's a stable String across requests, not a per-request cursor identity.",
          "Verify external-id uniqueness on the target field before relying on upsert dedup.",
        ],
        setup: ["Blanket OK to auto-publish TEST iterations for this work; prod patch still needs approval."],
        links: [],
      },
      {
        title: "SourceChannel mapping & HL7 OAuth authentication",
        status: "Fixed",
        summary:
          "Fixed the missing SourceChannel mapping on inbound HL7 (a PUT that never executed) and moved the listener auth to OAuth, with the login flow documented.",
        tags: ["OAuth", "SourceChannel", "Idempotency"],
        lld: [
          "Inbound HL7 → SourceChannel mapping was missing because a PUT call never executed; fixed so the channel is set on the created record.",
          "SourceChannel write needs API v67+, but SOAP `login()` was removed at v65+ — so a basic connection can't do it. Switched to an OAuth connection provider.",
          "Even with a valid token the CSR stays invisible unless the Run-As user holds the `HealthCloudPlatformPsl` (object permsets alone are insufficient).",
          "Idempotency + Source System ID + SourceChannel + payload all tested together as one write path.",
        ],
        testPlan: [
          "Confirm SourceChannel is populated on the created CSR (the PUT now runs).",
          "Confirm the write fails on a basic connection (version floor) and succeeds on OAuth.",
          "With object permsets only, confirm CSR is invisible; add the HC PSL / SysAdmin Run-As and confirm it appears.",
        ],
        setup: [
          "OAuth connected app for the integration user; Run-As user holds HealthCloudPlatformPsl.",
        ],
        links: [],
      },
      {
        title: "Wizard secret handling & groupId hardcoding",
        status: "Fixed",
        summary:
          "Two packaging bugs: the wizard secret prefix mismatch that caused 400 invalid_client, and a custom.json that hardcoded the Exchange groupId instead of a token.",
        tags: ["Secrets", "MuleSoft Direct", "Packaging"],
        lld: [
          "The MuleSoft Direct wizard writes `lob.clientCred.clientSecret` UN-prefixed; config must read it WITHOUT `secure::` or the token POST sends an empty secret → HTTP 400 invalid_client. (Fixed in 1.1.21.)",
          "The CLI `--secureProperty` path is the opposite — there the key DOES need the `secure::` prefix.",
          "custom.json hardcoded the Exchange groupId instead of using `${ASSETGROUPID}`, breaking portability across orgs.",
          "Also simplified the ORM listener wizard to username + password only to cut setup friction.",
        ],
        testPlan: [
          "Wizard path: confirm the token POST carries a non-empty secret and returns a token (not 400).",
          "CLI path: confirm the prefixed key resolves and the listener boots without crash-looping.",
          "Confirm custom.json resolves `${ASSETGROUPID}` and deploys to a second org unchanged.",
        ],
        setup: ["Match the prefix convention to the deploy path; pass `-Dglobal.anypoint.groupId=<orgId>` on mvn deploy."],
        links: [],
      },
      {
        title: "E2E validation, docs & enablement guide",
        status: "Fixed",
        summary:
          "End-to-end validation of the connector plus the documentation and enablement guide that let others stand it up.",
        tags: ["E2E", "Docs", "Enablement"],
        lld: [
          "Ran full E2E validation of the MuleSoft HL7 Referral Connector against a live org.",
          "Authored the connector documentation and an E2E testing + enablement guide.",
        ],
        testPlan: ["Follow the enablement guide from a clean org and confirm an order flows to a CSR."],
        setup: ["See the enablement guide; HAPI TestPanel under Java 8 for the EMR simulator."],
        links: [],
      },
      {
        title: "Mule runtime, module & tooling field notes",
        status: "Documented",
        summary:
          "Hard-won platform gotchas captured so they're never rediscovered — Mule 4.9.18 property syntax, the scripting module classloader, and the HAPI TestPanel Java/HTTP requirements.",
        tags: ["Mule 4.9", "Groovy", "HAPI"],
        lld: [
          "Mule 4.9.18: `${key:default}` colon-default is completely broken — the whole `key:default` is treated as the property name. Use `${key}` + a config.yaml default.",
          "mule-scripting-module ships Groovy test-scope only in an isolated plugin classloader; graft `groovy` + `groovy-jsr223` via `additionalPluginDependencies`, and compute values in DataWeave (Groovy sees vars as cursors).",
          "HAPI TestPanel crashes on Java 17 (JAXB removed) — launch under Java 8 (temurin-8.jdk). Its HTTP sender needs a charset'd content-type and a TLS socket factory to reach CloudHub.",
        ],
        testPlan: [
          "After a property-placeholder change on 4.9.18, assert the resolved value is not the literal `key:default`.",
          "Launch HAPI under Java 8 and send ORM over HTTPS; confirm the listener accepts it.",
        ],
        setup: ["Java 8 at `/Library/Java/JavaVirtualMachines/temurin-8.jdk`; grafted Groovy deps for scripting."],
        links: [],
      },
    ],
  },

  /* ───────────────────────── AGENTFORCE ───────────────────────── */
  {
    id: "agentforce",
    label: "Agentforce",
    icon: "✦",
    blurb:
      "Agentforce agents and action templates — a Member action template for the Payer Contact Center, a Health Cloud domain-expert agent, and metadata-based agent deployment.",
    items: [
      {
        title: "Member Coverage action template (Payer Contact Center)",
        status: "Fixed",
        summary:
          "Contributed to the Member agent action template — the Member Coverage template — used in the Payer Contact Center (PCC) Agentforce experience.",
        tags: ["Agentforce", "PCC", "Action template"],
        lld: [
          "Added the Member Coverage action to the Member agent's template so the agent can look up a member's coverage during a contact-center conversation.",
          "Delivered as part of the Payer Contact Center (PCC) agent action template set.",
        ],
        testPlan: [
          "Invoke the Member Coverage action in the PCC Member agent and confirm it returns the member's coverage.",
          "Confirm the action is wired into the template and selectable in the agent builder.",
        ],
        setup: ["Payer Contact Center enabled org with the Member agent and its action templates."],
        links: [],
      },
      {
        title: "Health Cloud skills & HC Domain Expert agent (EngOS)",
        status: "External contribution",
        summary:
          "Built Health Cloud skills and a Health Cloud Domain Expert agent, contributed to the internal EngOS repository (outside the Health Cloud codebase).",
        tags: ["Agentforce", "EngOS", "Skills", "External repo"],
        lld: [
          "Authored a set of Health Cloud skills and packaged them into a domain-expert agent.",
          "The agent answers HC data-model, flow, and platform questions grounded in the skills.",
          "Shipped as a contribution to the shared EngOS repo, not a Health Cloud team repo.",
        ],
        testPlan: ["Pose representative HC questions; confirm the agent routes to the right skill and answers correctly."],
        setup: ["Register skills with the agent; deploy via EngOS tooling."],
        links: [],
      },
      {
        title: "Deploy an Agentforce agent as metadata",
        status: "Working",
        summary:
          "When `sf agent create` hits the org-toggle access gate, deploy the agent as a metadata bundle instead.",
        tags: ["Agentforce", "Metadata", "Deploy"],
        lld: [
          "Deploy order: GenAiFunction → GenAiPlugin → GenAiPlannerBundle → Bot.",
          "This sidesteps the org toggle that blocks `sf agent create`, since metadata deploy doesn't go through that gate.",
        ],
        testPlan: [
          "Deploy each metadata type in dependency order; confirm the Bot resolves its planner, plugin, and functions.",
          "Smoke-test the agent responds in the org.",
        ],
        setup: ["Author the four metadata types; deploy in order via sf CLI."],
        links: [],
      },
    ],
  },

  /* ───────────────── IAM — Intelligent Appointment Management ───────────────── */
  {
    id: "iam",
    label: "IAM",
    icon: "⬢",
    blurb:
      "Intelligent Appointment Management (Health Cloud) — provider search, appointment scheduling flows, recurring-appointment handling, and the accessibility hardening across the scheduling UI.",
    items: [
      {
        title: "Provider Search — facility-level 'Accepting New Patients'",
        status: "Fixed",
        summary:
          "Documented and validated the Data Processing Engine (DPE) behavior for facility-level 'Accepting New Patients' status in Provider Search.",
        tags: ["Provider Search", "DPE", "Docs"],
        lld: [
          "Clarified how the DPE computes/propagates the facility-level Accepting New Patients status that Provider Search surfaces.",
          "Documented the behavior so downstream consumers rely on the correct field semantics.",
        ],
        testPlan: ["Flip facility status and confirm Provider Search reflects it after the DPE run."],
        setup: ["IAM-enabled org with Provider Search and the DPE configured."],
        links: [{ label: "W-23894540 · Provider Search DPE behavior", url: "#" }],
      },
      {
        title: "Appointment cancellation message handler",
        status: "Fixed",
        summary:
          "Spiked and designed the message-type handler for appointment cancellation in the IAM scheduling pipeline.",
        tags: ["Scheduling", "Message handler", "Spike"],
        lld: [
          "Designed a handler for the appointment-cancellation message type so cancellations flow through the same scheduling pipeline.",
        ],
        testPlan: ["Send a cancellation message; confirm the appointment transitions to cancelled."],
        setup: ["IAM scheduling pipeline configured for inbound message handling."],
        links: [{ label: "W-20013055 · cancellation handler spike", url: "#" }],
      },
      {
        title: "Recurring appointments & geolocation clean rules",
        status: "Fixed",
        summary:
          "Fixed modifying a recurring appointment being mis-treated as a multi-step booking, and evaluated clean rules for geolocation updates.",
        tags: ["Recurring", "Clean Rules", "Geolocation"],
        lld: [
          "Modifying a recurring appointment was incorrectly routed through the Multi-Step scheduling path; corrected so recurrence edits stay on the recurring path.",
          "Design spike evaluated clean rules for geolocation updates feeding appointment/provider location.",
        ],
        testPlan: [
          "Edit a recurring appointment and confirm it is NOT treated as multi-step.",
          "Trigger a geolocation update and confirm the clean rule applies as designed.",
        ],
        setup: ["IAM org with recurring appointments enabled."],
        links: [
          { label: "W-19122397 · recurring vs multi-step", url: "#" },
          { label: "W-21600552 · geolocation clean rules spike", url: "#" },
        ],
      },
      {
        title: "Scheduling UI accessibility hardening",
        status: "Fixed",
        summary:
          "A batch of 258-era accessibility fixes across the IAM scheduling UI — heading hierarchy, radio-group naming, focus order, and modal focus management.",
        tags: ["Accessibility", "WCAG", "UI"],
        lld: [
          "Fixed radio-group name association (Frequency & Repeats).",
          "Established a clear heading hierarchy for the Scheduling Appointment screen.",
          "Corrected focus order within the scheduling modal and the background-page change on MultiStepScheduling selection.",
        ],
        testPlan: [
          "Screen-reader pass over the scheduling flow; confirm radio groups announce names and headings nest correctly.",
          "Keyboard-only pass; confirm focus stays trapped and ordered within the modal.",
        ],
        setup: ["IAM scheduling UI; run Sa11y / accessibility ftests over the components."],
        links: [
          { label: "W-18556888 · heading hierarchy", url: "#" },
          { label: "W-18556933 · radio group naming", url: "#" },
          { label: "W-19002620 · modal focus order", url: "#" },
        ],
      },
    ],
  },

  /* ───────────────────────── POCs ───────────────────────── */
  {
    id: "pocs",
    label: "POCs",
    icon: "✧",
    blurb:
      "Exploratory builds that answered a 'can we even do this?' before any of it became roadmap work. Each one got put in front of the team to prove the idea held.",
    items: [
      {
        title: "Referral scoring, demonstrated end to end",
        status: "POC — proven",
        summary:
          "The open question was whether an acuity score could travel from raw clinical data all the way back onto the record, live. It can — shown as one unbroken run.",
        tags: ["Scoring", "Data Cloud", "Live demo"],
        lld: [
          "Ran the whole chain in a single sitting: seed clinical data → Data Cloud DMO → model → ReferralScore back on the Clinical Service Request.",
          "What the demo really proved was that the identity thread holds end to end — the same key survives every hop, so the score lands on the right record and nothing is silently dropped.",
        ],
        testPlan: [
          "Seed a known cohort, run the chain live, and read the score back off the record in the same session.",
          "Reconcile count-in against count-out at every layer.",
        ],
        setup: ["Orgs csr-scoring-org / csr-scoring-live with CSR seed data."],
        links: [],
      },
      {
        title: "An EHR talking to Health Cloud over HL7",
        status: "POC — working",
        summary:
          "Could a real EMR drop an order and have it become a Clinical Service Request with nobody touching the UI? Three independent senders said yes.",
        tags: ["MuleSoft", "HL7", "Integration"],
        lld: [
          "Drove the CloudHub listener from raw curl, a mock EMR, and HAPI TestPanel — three transports, one code path.",
          "Each inbound order created a CSR and Patient with the source channel correctly set.",
        ],
        testPlan: [
          "Send the same order from all three senders and confirm identical records.",
          "Replay a duplicate and confirm the first record is not mutated.",
        ],
        setup: ["App hl7-orm-demo on CloudHub; HAPI TestPanel under Java 8 as the EMR stand-in."],
        links: [],
      },
      {
        title: "ClaudeForce",
        status: "POC — demo",
        summary:
          "Live Health Cloud data rendered as generated UI inside Claude — a real patient tile in Claude Desktop and the playground — with a zero-credential local backend so it runs with nothing to provision.",
        tags: ["GenUI", "MCP", "Claude"],
        lld: [
          "Built the c/hcPatientSummary widget plus an MCP server (port 8790) that feeds it live org data — a real contact and their open care-gap tasks, rendered straight into the Claude surface.",
          "Added a claudeCli auth mode so the playground generates UI by shelling out to the local Claude CLI instead of a hosted model — zero credentials to demo.",
        ],
        testPlan: [
          "Launch the MCP server and confirm the patient tile renders with current data in both Claude Desktop and the playground.",
          "With no API keys configured, type a prompt and confirm UI still generates via the local CLI.",
        ],
        setup: ["Org hxlDemoOrg; MCP server on port 8790; local claude CLI with the claudeCli mode."],
        links: [],
      },
      {
        title: "Coworker agent running Provider Search",
        status: "POC — demo",
        summary:
          "A Health Cloud coworker agent that performs provider search on the user's behalf — proving an Agentforce coworker can drive the Provider Search flow end to end, not just a person clicking through the UI.",
        tags: ["Agentforce", "Coworker", "Provider Search"],
        lld: [
          "Wired an Agentforce coworker agent to the Provider Search capability so a natural-language request returns matching providers.",
          "The agent handles the search flow itself rather than a user navigating the screens.",
        ],
        testPlan: [
          "Ask the coworker agent to find providers matching a set of criteria and confirm it returns the expected results.",
        ],
        setup: ["Health Cloud org with Provider Search configured and the coworker agent enabled."],
        links: [],
      },
    ],
  },
];

/* Honest activity snapshot. Salesforce PRs live on internal GHE (not public);
 * these are the public github.com repos and their commit counts. */
const ACTIVITY = {
  note:
    "Day-to-day Salesforce engineering lives in internal GitHub (git.soma) and isn't public. Below are my public github.com projects.",
  repos: [
    { name: "CompetitiveProgramming", commits: 131 },
    { name: "FitAI", commits: 20 },
    { name: "Stock-Suggestion", commits: 8 },
    { name: "User-Personalized-NewsHub", commits: 7 },
  ],
};

/* Expose to app.js */
window.PORTFOLIO = { PROFILE, STATS, AREAS, ACTIVITY };
