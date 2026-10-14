(function () {
  const { PROFILE, STATS, AREAS, ACTIVITY } = window.PORTFOLIO;
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
    if (/(document|approved)/.test(s)) return "st-note";
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

  function renderOverview() {
    const metrics = STATS.map(
      (s) => `<div class="metric">
        <div class="metric-val">${esc(s.value)}</div>
        <div class="metric-lab">${esc(s.label)}</div>
        <div class="metric-note">${esc(s.note)}</div>
      </div>`
    ).join("");

    const areas = AREAS.filter((a) => a.items.length)
      .map(
        (a) => `<button class="area-row" data-go="#/${a.id}">
          <span class="ar-name">${esc(a.label)}</span>
          <span class="ar-count">${a.items.length} ${a.items.length === 1 ? "entry" : "entries"}</span>
          <span class="ar-desc">${esc(a.blurb)}</span>
        </button>`
      ).join("");

    const max = Math.max(...ACTIVITY.repos.map((r) => r.commits));
    const act = ACTIVITY.repos
      .map(
        (r) => `<li>
          <span class="act-repo">${esc(r.name)}</span>
          <span class="act-bar"><span style="width:${Math.round((r.commits / max) * 100)}%"></span></span>
          <span class="act-num">${r.commits}</span>
        </li>`
      ).join("");

    render(
      `<p class="lede">I build the plumbing and the intelligence behind <em>Health Cloud</em> — HL7 and MuleSoft pipelines that move clinical data, the scoring that reads it, and the agents that act on it.</p>

       <div class="metrics">${metrics}</div>

       <p class="block-label">Where the work lives</p>
       <p class="block-sub">${AREAS.filter((a) => a.items.length).length} areas, ${AREAS.reduce((n, a) => n + a.items.length, 0)} documented pieces. Open one to read its design, test plan, and setup.</p>
       <div class="areas-index">${areas}</div>

       <section class="activity">
         <p class="block-label">Public code</p>
         <p class="block-sub">${esc(ACTIVITY.note)}</p>
         <ul class="act-list">${act}</ul>
       </section>`,
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
  route();
})();
