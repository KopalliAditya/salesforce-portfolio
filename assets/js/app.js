(function () {
  const { PROFILE, STATS, AREAS } = window.PORTFOLIO;

  const tabsEl = document.getElementById("tabs");
  const viewEl = document.getElementById("view");
  const drawer = document.getElementById("drawer");
  const drawerBody = document.getElementById("drawer-body");
  const overlay = document.getElementById("drawer-overlay");

  // Header wiring
  document.getElementById("gh-link").href = PROFILE.githubUrl;
  document.getElementById("gen-date").textContent = new Date().toISOString().slice(0, 10);

  // ---- Theme ----
  const saved = localStorage.getItem("ak-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem("ak-theme", cur);
  });

  // ---- Tabs ----
  AREAS.forEach((area, i) => {
    const b = document.createElement("button");
    b.className = "tab";
    b.setAttribute("role", "tab");
    b.dataset.id = area.id;
    b.innerHTML = `<span class="tab-icon">${area.icon}</span>${area.label}`;
    b.addEventListener("click", () => selectArea(area.id));
    tabsEl.appendChild(b);
    if (i === 0) b.classList.add("active");
  });

  function selectArea(id) {
    document.querySelectorAll(".tab").forEach((t) =>
      t.classList.toggle("active", t.dataset.id === id)
    );
    const area = AREAS.find((a) => a.id === id);
    render(area);
    history.replaceState(null, "", "#" + id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function render(area) {
    if (area.id === "overview") return renderOverview(area);

    viewEl.innerHTML = `
      <section class="section-head">
        <h2>${esc(area.label)}</h2>
        <p>${esc(area.blurb)}</p>
      </section>
      <div class="card-grid">
        ${area.items.map((it, idx) => cardHtml(it, idx)).join("")}
      </div>`;

    viewEl.querySelectorAll(".card").forEach((c) =>
      c.addEventListener("click", () => openDrawer(area.items[+c.dataset.idx], area.label))
    );
  }

  function renderOverview(area) {
    const counts = AREAS.filter((a) => a.id !== "overview").map(
      (a) => `<li><span class="dot">${a.icon}</span>${esc(a.label)}<b>${a.items.length}</b></li>`
    );
    viewEl.innerHTML = `
      <section class="hero">
        <h2>${esc(PROFILE.name)}</h2>
        <p class="hero-tag">${esc(PROFILE.tagline)}</p>
      </section>
      <div class="stat-row">
        ${STATS.map(
          (s) => `<div class="stat">
            <div class="stat-value">${esc(s.value)}</div>
            <div class="stat-label">${esc(s.label)}</div>
            <div class="stat-note">${esc(s.note)} · <span class="mono">${esc(s.source)}</span></div>
          </div>`
        ).join("")}
      </div>
      <section class="section-head"><h3>Areas of work</h3><p>${esc(area.blurb)}</p></section>
      <ul class="area-list">${counts.join("")}</ul>`;

    viewEl.querySelectorAll(".area-list li").forEach((li, i) => {
      li.style.cursor = "pointer";
      const target = AREAS.filter((a) => a.id !== "overview")[i];
      li.addEventListener("click", () => selectArea(target.id));
    });
  }

  function cardHtml(it, idx) {
    return `<article class="card" data-idx="${idx}" tabindex="0">
      <div class="card-top">
        <span class="status status-${slug(it.status)}">${esc(it.status)}</span>
      </div>
      <h3>${esc(it.title)}</h3>
      <p>${esc(it.summary)}</p>
      <div class="tags">${it.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <span class="card-cue">View LLD · test plan · setup →</span>
    </article>`;
  }

  // ---- Drawer ----
  function openDrawer(it, areaLabel) {
    drawerBody.innerHTML = `
      <div class="drawer-kicker">${esc(areaLabel)} · <span class="status status-${slug(
        it.status
      )}">${esc(it.status)}</span></div>
      <h2>${esc(it.title)}</h2>
      <p class="drawer-summary">${esc(it.summary)}</p>
      <div class="tags">${it.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      ${section("Low-level design", it.lld)}
      ${section("Test plan", it.testPlan)}
      ${section("Setting it up", it.setup)}
      ${linksHtml(it.links)}`;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function section(title, items) {
    if (!items || !items.length) return "";
    return `<section class="drawer-section">
      <h4>${esc(title)}</h4>
      <ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </section>`;
  }

  function linksHtml(links) {
    if (!links || !links.length) return "";
    return `<section class="drawer-section"><h4>References</h4><div class="ref-links">${links
      .map((l) => `<a href="${esc(l.url)}" ${l.url === "#" ? "" : 'target="_blank" rel="noopener"'}>${esc(l.label)}</a>`)
      .join("")}</div></section>`;
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.style.overflow = "";
  }
  document.getElementById("drawer-close").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());

  // ---- helpers ----
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z]+/g, "-");
  }

  // ---- boot ----
  const initial = location.hash.slice(1);
  selectArea(AREAS.some((a) => a.id === initial) ? initial : "overview");
})();
