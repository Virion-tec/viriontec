 (async function () {
  await VTStore.init();
  const data = VTStore.load();
  const key = new URLSearchParams(location.search).get("area");
  const area = data.pilares[key];
  const cat = data.catalogo[key];
  const root = document.getElementById("areaContent");
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  if (!area || !cat) { root.innerHTML = '<h1>Área no encontrada</h1><a class="btn btn-primary" href="index.html#areas-detalle">Volver a las áreas</a>'; return; }

  document.title = `${area.titulo} | Virion Tec`;
  const areaLogo = VTMedia.element(area.logo, `Logo ${area.titulo}`);
  const gallery = area.imagenes.map((src, i) => VTMedia.element(src, `Referencia ${area.titulo} ${i + 1}`)).join("");
  const areaCombos = data.combos.filter(c => c.color === area.color && c.publico !== false).map(c => `
    <article class="combo-card ${esc(c.color)}"><div class="combo-media">${VTMedia.element(c.img, c.nombre)}${c.activo === false ? '<span class="unavailable-ribbon">No disponible actualmente</span>' : ""}</div>
    <div class="combo-body"><h3>${esc(c.nombre)}</h3><p>${esc(c.descripcion)}</p><ul class="combo-includes">${(c.incluye || []).map(item => `<li><span>+</span>${esc(item)}</li>`).join("")}</ul>
    <a class="btn btn-primary" href="combos.html">Ver combo y requisitos</a></div></article>`).join("");

  root.innerHTML = `<a class="back-link" href="index.html#areas-detalle">← Volver a las áreas</a><div class="area-page ${esc(area.color)}">
    <div class="area-page-hero"><div><span class="pill ${esc(area.color)}">${esc(area.titulo)}</span><h1>${esc(cat.frase)}</h1><p class="lead">${esc(area.resumen)}</p></div><div class="area-logo-media">${areaLogo}</div></div>
    <h2>Servicios para tu negocio</h2><div class="area-service-list">${cat.items.map((item,i)=>`<article><span>${String(i+1).padStart(2,"0")}</span><h3>${esc(item)}</h3><p>Solución práctica, explicada con claridad y pensada para las necesidades de tu MYPE.</p></article>`).join("")}</div>
    <h2>Imágenes referenciales</h2><div class="area-page-gallery">${gallery}</div><h2>Combos de esta área</h2><div class="area-combos-grid">${areaCombos || '<p>Estamos preparando combos para esta área. Escríbenos y te armamos una propuesta.</p>'}</div>
    <a class="btn btn-primary area-quote" href="https://wa.me/${encodeURIComponent(data.contacto.whatsapp)}?text=${encodeURIComponent(`¡Hola, Virion Tec! 👋 Quiero cotizar el área ${area.titulo}. ¿Me pueden orientar sobre opciones y precios? 😊`)}" target="_blank" rel="noopener">Cotizar por WhatsApp</a></div>`;

  const theme = document.getElementById("themeToggle");
  const applyTheme = dark => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("vt_theme", dark ? "dark" : "light");
    document.querySelectorAll(".brand img,.area-page-hero img").forEach(img => VTMedia.applyLogoTheme(img, dark));
  };
  applyTheme(localStorage.getItem("vt_theme") === "dark");
  theme.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme !== "dark"));
})();
