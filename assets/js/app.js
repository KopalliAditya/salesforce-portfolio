(function () {
  const { PROFILE, STATS, AREAS, ACTIVITY } = window.PORTFOLIO;
  let STATS_DATA = null; // loaded from assets/data/stats.json
  const view = document.getElementById("view");
  const nav = document.getElementById("nav");
  const mobileNav = document.getElementById("mobile-nav");

  // --- static rail wiring ---
  document.getElementById("rail-role").textContent = PROFILE.role + ", " + PROFILE.org;
  document.getElementById("rail-bio").textContent = PROFILE.tagline;
  document.getElementById("gh-link").href = PROFILE.githubUrl;
  document.getElementById("gen-date").textContent = "Updated " + new Date().toISOString().slice(0, 10);

  // --- theme ---
  const themeWord = document.getElementById("theme-word");
  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    themeWord.textContent = t;
  };
  applyTheme(localStorage.getItem("ak-theme") || "dark");
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    localStorage.setItem("ak-theme", next);
    applyTheme(next);
  });

  // --- helpers ---
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const code = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");

  function statusClass(st) {
    const s = st.toLowerCase();
    if (/(demo)/.test(s)) return "st-demo";
    if (/(document|approved|external)/.test(s)) return "st-note";
    return "st-live";
  }

  // index items with slugs
  AREAS.forEach((a) => a.items.forEach((it) => (it._slug = slug(it.title))));
  const findItem = (areaId, s) => {
    const a = AREAS.find((x) => x.id === areaId);
    return a ? a.items.find((it) => it._slug === s) : null;
  };

  // --- nav build ---
  function buildNav() {
    nav.innerHTML = "";
    mobileNav.innerHTML = "";
    AREAS.forEach((a) => {
      const b = document.createElement("button");
      b.className = "nav-item";
      b.dataset.id = a.id;
      const count = a.items.length ? `<span class="nav-count">${a.items.length}</span>` : "";
      b.innerHTML = `<span>${esc(a.label)}</span>${count}`;
      b.addEventListener("click", () => go("#/" + a.id));
      nav.appendChild(b);

      const m = document.createElement("button");
      m.dataset.id = a.id;
      m.textContent = a.label;
      m.addEventListener("click", () => go("#/" + a.id));
      mobileNav.appendChild(m);
    });
  }

  function markNav(areaId) {
    document.querySelectorAll(".nav-item, .mobile-bar button").forEach((el) =>
      el.classList.toggle("active", el.dataset.id === areaId)
    );
  }

  // --- rendering ---
  function render(html, areaId) {
    view.innerHTML = `<div class="view-anim">${html}</div>`;
    markNav(areaId);
    window.scrollTo(0, 0);
  }

  // tenure "1 yr 5 mo" from an ISO start date
  function tenure(startISO) {
    const s = new Date(startISO), n = new Date();
    let mo = (n.getFullYear() - s.getFullYear()) * 12 + (n.getMonth() - s.getMonth());
    if (n.getDate() < s.getDate()) mo--;
    const y = Math.floor(mo / 12), m = mo % 12;
    return (y ? `${y} yr ` : "") + `${m} mo`;
  }

  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function heatmapHTML(calendar) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - 363);
    start.setDate(start.getDate() - start.getDay()); // back to Sunday
    const weeks = []; const cur = new Date(start); let windowTotal = 0;
    while (cur <= today) {
      const wk = [];
      for (let i = 0; i < 7; i++) {
        const future = cur > today;
        const ds = ymd(cur);
        const c = future ? 0 : (calendar[ds] || 0);
        if (!future) windowTotal += c;
        wk.push({ ds, c, future });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(wk);
    }
    const lvl = (c) => (c === 0 ? 0 : c <= 2 ? 1 : c <= 4 ? 2 : c <= 7 ? 3 : 4);
    const months = weeks
      .map((wk, i) => {
        const m = new Date(wk[0].ds + "T00:00:00").getMonth();
        const prev = i ? new Date(weeks[i - 1][0].ds + "T00:00:00").getMonth() : -1;
        return `<span>${m !== prev && !wk[0].future ? MON[m] : ""}</span>`;
      }).join("");
    const grid = weeks
      .map((wk) => `<div class="heat-col">${wk
        .map((d) => `<i class="hc lv${lvl(d.c)}${d.future ? " fut" : ""}"${d.future ? "" : ` title="${d.c} commit${d.c === 1 ? "" : "s"} · ${d.ds}"`}></i>`)
        .join("")}</div>`).join("");
    return { html: `<div class="heat-months">${months}</div><div class="heat-grid">${grid}</div>`, windowTotal };
  }

  function gusGraphHTML(monthly) {
    const keys = Object.keys(monthly).sort().slice(-18);
    const max = Math.max(1, ...keys.map((k) => monthly[k]));
    const bars = keys
      .map((k) => {
        const [y, m] = k.split("-");
        const tick = m === "01" ? y : (+m % 2 ? "" : MON[+m - 1][0]);
        return `<div class="bar" title="${k}: ${monthly[k]} created">
          <span style="height:${Math.round((monthly[k] / max) * 100)}%"></span>
          <em>${tick}</em></div>`;
      }).join("");
    return `<div class="bars">${bars}</div>`;
  }

  function renderOverview() {
    const d = STATS_DATA;
    const gus = d && d.gus && d.gus.available ? d.gus : null;

    const metricDefs = d
      ? [
          { value: String(d.commits.total), label: "Commits", note: Object.entries(d.commits.bySource).filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join(" · ") },
          { value: tenure(d.tenureStart), label: "At Salesforce", note: `since ${new Date(d.tenureStart).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` },
          { value: gus ? String(gus.total) : "173", label: "GUS work items", note: gus ? `${gus.bugs} bugs · ${gus.stories} stories` : "" },
          { value: gus ? String(gus.closed) : "143", label: "Delivered", note: "closed / fixed" },
        ]
      : STATS;

    const metrics = metricDefs
      .map((s) => `<div class="metric"><div class="metric-val">${esc(s.value)}</div><div class="metric-lab">${esc(s.label)}</div><div class="metric-note">${esc(s.note)}</div></div>`)
      .join("");

    // commits heatmap
    let heat = "";
    if (d && d.commits.calendar) {
      const h = heatmapHTML(d.commits.calendar);
      const prNote = d.prs && d.prs.note ? `<span class="hint">${esc(d.prs.note)}</span>` : "";
      heat = `<section class="panel">
        <div class="panel-head"><p class="block-label">Commits</p><p class="panel-aside">${h.windowTotal} in the last year</p></div>
        <p class="block-sub">Salesforce work across git.soma, core, and GitHub. ${prNote}</p>
        <div class="heat">${h.html}</div>
        <div class="heat-legend"><span>less</span><i class="hc lv0"></i><i class="hc lv1"></i><i class="hc lv2"></i><i class="hc lv3"></i><i class="hc lv4"></i><span>more</span></div>
      </section>`;
    }

    // gus graph
    let gusGraph = "";
    if (gus && gus.monthly) {
      gusGraph = `<section class="panel">
        <div class="panel-head"><p class="block-label">Work items opened</p><p class="panel-aside">${gus.total} total</p></div>
        <p class="block-sub">GUS work items by month created.</p>
        ${gusGraphHTML(gus.monthly)}
      </section>`;
    }

    const areas = AREAS.filter((a) => a.items.length)
      .map((a) => `<button class="area-row" data-go="#/${a.id}">
          <span class="ar-name">${esc(a.label)}</span>
          <span class="ar-count">${a.items.length} ${a.items.length === 1 ? "entry" : "entries"}</span>
          <span class="ar-desc">${esc(a.blurb)}</span>
        </button>`).join("");

    const stamp = d && d.generated ? `Figures refreshed ${new Date(d.generated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.` : "";

    render(
      `<p class="lede">I build the plumbing and the intelligence behind <em>Health Cloud</em> — MuleSoft pipelines that move clinical data, the scoring that reads it, and the agents that act on it.</p>

       <div class="metrics">${metrics}</div>
       ${heat}
       ${gusGraph}

       <p class="block-label">Where the work lives</p>
       <p class="block-sub">${AREAS.filter((a) => a.items.length).length} areas, ${AREAS.reduce((n, a) => n + a.items.length, 0)} documented pieces. Open one to read its design, test plan, and setup. ${stamp}</p>
       <div class="areas-index">${areas}</div>`,
      "overview"
    );

    view.querySelectorAll("[data-go]").forEach((el) =>
      el.addEventListener("click", () => go(el.dataset.go))
    );
  }

  function renderArea(area) {
    const entries = area.items
      .map(
        (it) => `<button class="entry" data-slug="${it._slug}">
          <div class="entry-head">
            <span class="entry-title">${esc(it.title)}</span>
            <span class="status ${statusClass(it.status)}">${esc(it.status)}</span>
          </div>
          <p class="entry-sum">${esc(it.summary)}</p>
          <div class="entry-tags">${it.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </button>`
      ).join("");

    render(
      `<header class="sec-head">
         <h2 class="sec-title">${esc(area.label)}</h2>
         <p class="sec-blurb">${esc(area.blurb)}</p>
       </header>
       <div class="ledger">${entries}</div>`,
      area.id
    );

    view.querySelectorAll(".entry").forEach((el) =>
      el.addEventListener("click", () => go(`#/${area.id}/${el.dataset.slug}`))
    );
  }

  function section(label, idx, items) {
    if (!items || !items.length) return "";
    return `<section class="d-sec">
      <h3><span class="d-sec-idx">${idx}</span>${esc(label)}</h3>
      <ul class="d-list">${items.map((x) => `<li>${code(x)}</li>`).join("")}</ul>
    </section>`;
  }

  function renderDetail(area, it) {
    const refs = it.links && it.links.length
      ? `<section class="d-sec"><h3><span class="d-sec-idx">04</span>References</h3>
         <div class="refs">${it.links
           .map((l) => `<a class="ref" href="${esc(l.url)}"${l.url === "#" ? "" : ' target="_blank" rel="noopener"'}>${esc(l.label)}</a>`)
           .join("")}</div></section>`
      : "";

    const i = area.items.indexOf(it);
    const prev = area.items[i - 1];
    const next = area.items[i + 1];
    const pager =
      prev || next
        ? `<nav class="detail-nav">
            ${prev ? `<button data-go="#/${area.id}/${prev._slug}"><span class="dn-k">Previous</span><span class="dn-t">${esc(prev.title)}</span></button>` : "<span></span>"}
            ${next ? `<button class="dn-next" data-go="#/${area.id}/${next._slug}"><span class="dn-k">Next</span><span class="dn-t">${esc(next.title)}</span></button>` : ""}
          </nav>`
        : "";

    render(
      `<button class="detail-back" data-go="#/${area.id}"><span class="ba">&larr;</span>${esc(area.label)}</button>
       <h2 class="detail-title">${esc(it.title)}</h2>
       <div class="detail-meta">
         <span class="status ${statusClass(it.status)}">${esc(it.status)}</span>
         <span class="m-tags">${it.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</span>
       </div>
       <p class="detail-lead">${esc(it.summary)}</p>
       ${section("Low-level design", "01", it.lld)}
       ${section("Test plan", "02", it.testPlan)}
       ${section("Setting it up", "03", it.setup)}
       ${refs}
       ${pager}`,
      area.id
    );

    view.querySelectorAll("[data-go]").forEach((el) =>
      el.addEventListener("click", () => go(el.dataset.go))
    );
  }

  // --- routing ---
  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const [areaId, itemSlug] = parts;

    if (!areaId || areaId === "overview") return renderOverview();
    const area = AREAS.find((a) => a.id === areaId);
    if (!area) return renderOverview();
    if (itemSlug) {
      const it = findItem(areaId, itemSlug);
      if (it) return renderDetail(area, it);
    }
    renderArea(area);
  }

  buildNav();
  window.addEventListener("hashchange", route);
  route(); // render immediately with fallbacks
  fetch("assets/data/stats.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => { if (data) { STATS_DATA = data; if (!location.hash || /#\/?(overview)?$/.test(location.hash)) route(); } })
    .catch(() => {});
})();
