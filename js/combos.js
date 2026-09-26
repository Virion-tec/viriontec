(function () {
  const data = VTStore.load();
  const grid = document.getElementById("allCombosGrid");
  const search = document.getElementById("comboSearch");
  const noResults = document.getElementById("comboNoResults");
  let activeFilter = "all";
  document.getElementById("year").textContent = new Date().getFullYear();
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

  function linkFor(combo) {
    const url = new URL("combo.html", location.href);
    url.searchParams.set("id", combo.id);
    url.searchParams.set("combo", JSON.stringify(combo));
    return url.href;
  }

  function render() {
    const term = search.value.trim().toLocaleLowerCase("es");
    const combos = data.combos.filter(c => c.publico !== false && (activeFilter === "all" || c.color === activeFilter) && `${c.nombre} ${c.descripcion} ${(c.incluye || []).join(" ")}`.toLocaleLowerCase("es").includes(term));
    grid.innerHTML = combos.map(c => {
      const link = linkFor(c);
      return `<article class="combo-card ${esc(c.color)}"><div class="combo-media">${VTMedia.element(c.img,c.nombre)}${c.activo === false ? '<span class="unavailable-ribbon">No disponible actualmente</span>' : ""}</div>
        <div class="combo-body"><span class="combo-area-label">${({green:"Tecnología y Seguridad",pink:"Diseño y Redes",blue:"Orden y Crecimiento"})[c.color] || "Combo Virion Tec"}</span><h2>${esc(c.nombre)}</h2><p>${esc(c.descripcion)}</p><strong class="combo-price">${esc(c.precio)}</strong>
        <h3 class="includes-title">Este paquete incluye</h3><ul class="combo-includes">${(c.incluye || []).map(x => `<li><span>+</span>${esc(x)}</li>`).join("") || "<li><span>+</span>Consulta los detalles con nuestro equipo.</li>"}</ul>
        <details class="combo-requirements"><summary>Ver más · Requisitos</summary><ul>${(c.requisitos || []).map(x => `<li>${esc(x)}</li>`).join("") || "<li>Consulta los requisitos por WhatsApp.</li>"}</ul></details>
        <div class="combo-actions"><a class="btn btn-dark" href="${esc(link)}">Ver combo</a><button class="btn btn-share" data-share="${esc(link)}">↗ Compartir</button></div>
        ${c.activo === false ? '<button class="btn btn-primary" disabled>No disponible</button>' : `<a class="btn btn-primary" href="https://wa.me/${encodeURIComponent(data.contacto.whatsapp)}?text=${encodeURIComponent(`¡Hola, Virion Tec! 👋 Me interesa el combo ${c.nombre}. ¿Me comparten más detalles y disponibilidad? 😊`)}" target="_blank" rel="noopener">Quiero este combo</a>`}</div></article>`;
    }).join("");
    noResults.classList.toggle("hidden", combos.length > 0);
    grid.querySelectorAll("[data-share]").forEach(btn => btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(btn.dataset.share); message("¡Enlace copiado! Ya puedes compartir este combo 😊"); }
      catch { prompt("Copia el enlace del combo:", btn.dataset.share); }
    }));
  }

  search.addEventListener("input", render);
  document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active"); activeFilter = btn.dataset.filter; render();
  }));
  function message(text) {
    let el = document.getElementById("comboToast");
    if (!el) { el = document.createElement("div"); el.id = "comboToast"; el.className = "site-toast"; document.body.append(el); }
    el.textContent = text; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2400);
  }
  const toggle = document.getElementById("themeToggle");
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("vt_theme", dark ? "dark" : "light");
    document.querySelectorAll(".brand img").forEach(img => {
      const src = img.dataset.lightSrc || img.getAttribute("src");
      img.dataset.lightSrc = src.replace(/-b(?=\.png$)/, "");
      img.src = dark ? img.dataset.lightSrc : img.dataset.lightSrc.replace(/\.png$/, "-b.png");
    });
  }
  setTheme(localStorage.getItem("vt_theme") === "dark");
  toggle.addEventListener("click", () => setTheme(document.documentElement.dataset.theme !== "dark"));
  render();
})();
