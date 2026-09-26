/* Virion Tec — Lógica de la página pública */

(function () {
  const DATA = VTStore.load();
  let cart = VTStore.getCart().filter(id => DATA.combos.some(c => c.id === id && c.activo !== false && c.publico !== false));
  VTStore.saveCart(cart);
  const checkedItems = {}; // { "tecnologia|Cámaras...": true }

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- Utilidades ---------------- */
  function waLink(numero, mensaje) {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  }

  function setupContactLinks() {
    const wa = DATA.contacto.whatsapp;
    const saludo = "Hola Virion Tec, quisiera más información sobre sus servicios.";
    document.getElementById("floatingWhatsapp").href = waLink(wa, saludo);
    document.getElementById("footerWhatsapp").href = waLink(wa, saludo);
    document.getElementById("footerCorreo").href = "mailto:" + DATA.contacto.correo;
    document.getElementById("footerCorreo").textContent = DATA.contacto.correo;
    document.getElementById("footerZona").textContent = "Atención: " + DATA.contacto.zona + ".";
    const social = { facebook: "https://www.facebook.com/profile.php?id=61594412833550&locale=es_LA", instagram: "https://www.instagram.com/virion.technology23/?hl=es", tiktok: "https://www.tiktok.com/@viriontec23" };
    document.querySelectorAll(".social-row a").forEach(a => { const key = a.dataset.social; if (social[key]) a.href = social[key]; });
    const equipo = document.getElementById("equipoImagen");
    if (equipo && DATA.contenido?.imagenEquipo) VTMedia.mount(equipo, DATA.contenido.imagenEquipo, "Equipo Virion Tec");
  }

  function setupTheme() {
    const toggle = document.getElementById("themeToggle");
    const logos = [".brand img", ".footer-brand img", ".hero-cubes img", ".pilar-card img", ".area-detail-heading img"];
    const apply = (dark) => {
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      localStorage.setItem("vt_theme", dark ? "dark" : "light");
      toggle.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      logos.forEach((selector) => document.querySelectorAll(selector).forEach(img => VTMedia.applyLogoTheme(img, dark)));
    };
    apply(localStorage.getItem("vt_theme") === "dark");
    toggle.addEventListener("click", () => apply(document.documentElement.dataset.theme !== "dark"));
  }

  /* ---------------- Menú móvil ---------------- */
  document.getElementById("navToggle").addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("mobile-open");
  });
  document.querySelectorAll("#navLinks a").forEach(link => link.addEventListener("click", () => document.getElementById("navLinks").classList.remove("mobile-open")));

  /* ================================================================
     COMBOS (tienda + carrito)
     ================================================================ */
  function renderCombos() {
    const grid = document.getElementById("combosGrid");
    grid.innerHTML = "";
    DATA.combos.filter(combo => combo.publico !== false).slice(0, 3).forEach((combo) => {
      const card = document.createElement("div");
      card.className = "combo-card " + combo.color;
      const comboUrl = new URL("combo.html", location.href);
      comboUrl.searchParams.set("id", combo.id);
      comboUrl.searchParams.set("combo", JSON.stringify(combo));
      const shareUrl = comboUrl.href;
      card.innerHTML = `
        <div class="combo-media">${VTMedia.element(combo.img, combo.nombre)}${combo.activo === false ? '<span class="unavailable-ribbon">No disponible actualmente</span>' : ''}</div>
        <div class="combo-body">
          <h3>${combo.nombre}</h3>
          <p>${combo.descripcion}</p>
          <ul class="combo-includes">${(combo.incluye || []).map(item => `<li><span>+</span>${item}</li>`).join("")}</ul>
          <span class="combo-price">${combo.precio}</span>
          <details class="combo-requirements"><summary>Ver más · Requisitos</summary><ul>${(combo.requisitos || []).map(item => `<li>${item}</li>`).join("") || "<li>Consulta los requisitos por WhatsApp.</li>"}</ul></details>
          <div class="combo-actions"><a class="btn btn-outline" href="${comboUrl.pathname.split("/").pop()}${comboUrl.search}">Ver combo</a><button class="btn btn-share" data-share="${shareUrl}" aria-label="Compartir ${combo.nombre}">↗ Compartir</button></div>
          ${combo.activo === false ? '<button class="btn btn-primary" disabled>No disponible</button>' : `<button class="btn btn-primary btn-add" data-id="${combo.id}">Agregar al carrito</button>`}
        </div>`;
      grid.appendChild(card);
    });
    grid.querySelectorAll(".btn-add").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(btn.dataset.id));
    });
    document.querySelectorAll(".btn-share").forEach(btn => btn.addEventListener("click", async () => {
      const link = btn.dataset.share;
      try { await navigator.clipboard.writeText(link); showMessage("¡Enlace del combo copiado! Ya puedes compartirlo 😊"); }
      catch { window.prompt("Copia el enlace del combo:", link); }
    }));
  }

  function showMessage(message) {
    let toast = document.getElementById("siteToast");
    if (!toast) { toast = document.createElement("div"); toast.id = "siteToast"; toast.className = "site-toast"; document.body.appendChild(toast); }
    toast.textContent = message; toast.classList.add("show");
    clearTimeout(showMessage.timer); showMessage.timer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  document.getElementById("comboPrev").addEventListener("click", () => document.getElementById("combosGrid").scrollBy({left:-340,behavior:"smooth"}));
  document.getElementById("comboNext").addEventListener("click", () => document.getElementById("combosGrid").scrollBy({left:340,behavior:"smooth"}));

  function addToCart(id) {
    const target = DATA.combos.find(c => c.id === id);
    if (!target || target.activo === false || target.publico === false) return;
    if (cart.includes(id)) return;
    cart.push(id);
    VTStore.saveCart(cart);
    renderCart();
    openCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((c) => c !== id);
    VTStore.saveCart(cart);
    renderCart();
  }

  function renderCart() {
    const itemsEl = document.getElementById("cartItems");
    const countEl = document.getElementById("cartCount");
    countEl.textContent = cart.length;
    countEl.classList.toggle("hidden", cart.length === 0);

    if (cart.length === 0) {
      itemsEl.innerHTML = `<div class="cart-empty">Aún no agregaste ningún combo.<br>Explora nuestros combos y arma tu cotización.</div>`;
      return;
    }
    itemsEl.innerHTML = "";
    cart.forEach((id) => {
      const combo = DATA.combos.find((c) => c.id === id);
      if (!combo || combo.activo === false || combo.publico === false) return;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        ${VTMedia.element(combo.img, combo.nombre)}
        <div class="cart-item-info">
          <h4>${combo.nombre}</h4>
          <small>${combo.precio}</small><br>
          <button data-id="${combo.id}" aria-label="Quitar ${combo.nombre}">🗑️ Quitar</button>
        </div>`;
      itemsEl.appendChild(row);
    });
    itemsEl.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
    });
  }

  function openCart() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("overlay").classList.add("open");
  }
  function closeCart() {
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("overlay").classList.remove("open");
  }
  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("overlay").addEventListener("click", () => {
    closeCart();
    closeAllModals();
  });

  document.getElementById("cartWhatsappBtn").addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Agrega al menos un combo para poder cotizar.");
      return;
    }
    const nombres = cart.map((id) => DATA.combos.find((c) => c.id === id)?.nombre).filter(Boolean);
    const mensaje = `¡Hola, Virion Tec! 👋\nVi sus combos en la web y quisiera una cotización, por favor.\n\n📦 Combos de interés:\n- ${nombres.join("\n- ")}\n\n¿Me pueden compartir qué incluye cada uno, precio final y disponibilidad? 😊\nGracias.`;
    window.open(waLink(DATA.contacto.whatsapp, mensaje), "_blank");
  });

  /* ================================================================
     CATÁLOGO INTERACTIVO
     ================================================================ */
  function renderCatalogo() {
    const grid = document.getElementById("catalogGrid");
    grid.innerHTML = "";
    Object.entries(DATA.catalogo).forEach(([key, cat]) => {
      const col = document.createElement("div");
      col.className = "catalog-col " + cat.color;
      col.innerHTML = `
        <h3><span class="dot ${cat.color}"></span>${cat.titulo}</h3>
        <p class="cat-frase">${cat.frase}</p>
        ${cat.items.map((item) => `
          <label class="check-item">
            <input type="checkbox" data-cat="${key}" value="${item}">
            <span>${item}</span>
          </label>`).join("")}
      `;
      grid.appendChild(col);
    });
    grid.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const key = cb.dataset.cat + "|" + cb.value;
        checkedItems[key] = cb.checked;
      });
    });
  }

  document.getElementById("catalogWhatsBtn").addEventListener("click", () => {
    const seleccion = Object.entries(checkedItems).filter(([, v]) => v).map(([k]) => k.split("|")[1]);
    if (seleccion.length === 0) {
      alert("Selecciona al menos un servicio del catálogo.");
      return;
    }
    const mensaje = `Hola Virion Tec, visité su web y quiero cotizar estos servicios:\n- ${seleccion.join("\n- ")}`;
    window.open(waLink(DATA.contacto.whatsapp, mensaje), "_blank");
  });

  /* ================================================================
     PILARES
     ================================================================ */
  function renderPilares() {
    const grid = document.getElementById("pilaresGrid");
    grid.innerHTML = "";
    Object.entries(DATA.pilares).forEach(([key, p]) => {
      const card = document.createElement("div");
      card.className = "pilar-card " + p.color;
      card.innerHTML = `
        ${VTMedia.element(p.logo, p.titulo)}
        <h3>${p.titulo}</h3>
        <p>${p.resumen}</p>
        <span class="ver-mas">Ver ejemplos →</span>`;
      card.addEventListener("click", () => openPilarModal(key));
      grid.appendChild(card);
    });
  }

  function renderAreaDetails() {
    const grid = document.getElementById("areaDetailGrid");
    grid.innerHTML = "";
    Object.entries(DATA.pilares).forEach(([key, p]) => {
      const cat = DATA.catalogo[key];
      const el = document.createElement("article");
      el.className = `area-detail ${p.color}`;
      el.innerHTML = `<div class="area-detail-heading">${VTMedia.element(p.logo, `Logo ${p.titulo}`)}<div><span>${p.titulo}</span><h3>${cat.frase}</h3></div></div><p>${p.resumen}</p><ul>${cat.items.slice(0,3).map(x => `<li>${x}</li>`).join("")}</ul><div class="area-detail-images">${p.imagenes.slice(0,3).map(src => VTMedia.element(src, `Ejemplo de ${p.titulo}`)).join("")}</div><a class="btn btn-outline" href="area.html?area=${key}">Ver detalle del área</a>`;
      grid.appendChild(el);
    });
  }

  function openPilarModal(key) {
    const p = DATA.pilares[key];
    const cat = DATA.catalogo[key];
    document.getElementById("pilarPill").className = "pill " + p.color;
    document.getElementById("pilarPill").textContent = p.titulo;
    document.getElementById("pilarTitulo").textContent = cat.frase;
    document.getElementById("pilarResumen").textContent = p.resumen;
    document.getElementById("pilarGaleria").innerHTML = p.imagenes.map((src) => VTMedia.element(src, `Referencia ${p.titulo}`)).join("");
    document.getElementById("pilarLista").innerHTML = cat.items.map((i) => `<li>${i}</li>`).join("");
    document.getElementById("pilarCotizarBtn").onclick = () => {
      closeAllModals();
      openWizard();
      setWizardField("area", key);
      goToStep(1);
    };
    openModal("pilarModal");
  }

  /* ================================================================
     MODALES genéricos
     ================================================================ */
  function openModal(id) {
    document.getElementById(id).classList.add("open");
    document.getElementById("overlay").classList.add("open");
  }
  function closeAllModals() {
    document.querySelectorAll(".modal.open").forEach((m) => m.classList.remove("open"));
    document.getElementById("overlay").classList.remove("open");
  }
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeAllModals());
  });

  /* ================================================================
     WIZARD DE COTIZACIÓN (línea de tiempo)
     ================================================================ */
  const wizardState = { tipo: "", distrito: "", area: "", servicios: [], celular: "" };
  let currentStep = 1;
  const totalSteps = 5;

  function fillDistritos() {
    const select = document.getElementById("wizardDistrito");
    select.innerHTML = `<option value="">Selecciona tu distrito</option>` +
      DATA.distritos.map((d) => `<option value="${d}">${d}</option>`).join("");
  }

  function openWizard() {
    currentStep = 1;
    wizardState.tipo = ""; wizardState.distrito = ""; wizardState.area = "";
    wizardState.servicios = []; wizardState.celular = "";
    document.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
    document.getElementById("wizardDistrito").value = "";
    document.getElementById("wizardCelular").value = "";
    document.getElementById("wizardConsent").checked = false;
    document.getElementById("wizardTerms").checked = false;
    document.getElementById("wizardSubServices").innerHTML = "";
    renderWizardStep();
    goToStep(1);
    openModal("wizardModal");
  }
  document.getElementById("openWizardBtn").addEventListener("click", openWizard);

  function setWizardField(field, value) {
    wizardState[field] = value;
    document.querySelectorAll(`.option-card[data-field="${field}"]`).forEach((c) => {
      c.classList.toggle("selected", c.dataset.value === value);
    });
    if (field === "area") renderSubServices(value);
  }

  document.querySelectorAll(".option-card").forEach((card) => {
    card.addEventListener("click", () => setWizardField(card.dataset.field, card.dataset.value));
  });

  function renderSubServices(areaKey) {
    const cat = DATA.catalogo[areaKey];
    const wrap = document.getElementById("wizardSubServices");
    if (!cat) { wrap.innerHTML = ""; return; }
    wrap.innerHTML = `<p style="margin-top:16px;font-weight:600;">¿Qué necesitas exactamente de ${cat.titulo}?</p>` +
      cat.items.map((item) => `
        <label class="check-item" style="border:1px solid var(--line);border-radius:8px;padding:12px 14px;">
          <input type="checkbox" class="wizard-service" value="${item}">
          <span>${item}</span>
        </label>`).join("");
    wrap.querySelectorAll(".wizard-service").forEach((cb) => {
      cb.addEventListener("change", () => {
        wizardState.servicios = Array.from(wrap.querySelectorAll(".wizard-service:checked")).map((c) => c.value);
      });
    });
  }

  document.getElementById("wizardDistrito").addEventListener("change", (e) => {
    wizardState.distrito = e.target.value;
  });
  document.getElementById("wizardCelular").addEventListener("input", (e) => {
    wizardState.celular = e.target.value.replace(/\D/g, "");
  });

  function goToStep(n) {
    currentStep = n;
    renderWizardStep();
  }

  function renderWizardStep() {
    document.querySelectorAll(".wizard-panel").forEach((p) => {
      p.classList.toggle("active", Number(p.dataset.panel) === currentStep);
    });
    document.querySelectorAll(".wizard-step-dot").forEach((d) => {
      const step = Number(d.dataset.step);
      d.classList.toggle("active", step === currentStep);
      d.classList.toggle("done", step < currentStep);
    });
    document.getElementById("wizardBack").style.visibility = currentStep === 1 ? "hidden" : "visible";
    document.getElementById("wizardNext").textContent = currentStep === totalSteps ? "Enviar por WhatsApp" : "Siguiente";

    if (currentStep === totalSteps) renderResumen();
  }

  function renderResumen() {
    const areaTitulo = wizardState.area ? DATA.catalogo[wizardState.area].titulo : "-";
    document.getElementById("wizardResumen").innerHTML = `
      <dt>Tipo</dt><dd>${wizardState.tipo || "-"}</dd>
      <dt>Distrito</dt><dd>${wizardState.distrito || "-"}</dd>
      <dt>Área de interés</dt><dd>${areaTitulo}</dd>
      <dt>Servicios específicos</dt><dd>${wizardState.servicios.length ? wizardState.servicios.join(", ") : "A definir en la llamada"}</dd>
      <dt>Celular</dt><dd>${wizardState.celular || "-"}</dd>
    `;
  }

  function validarPaso(n) {
    if (n === 1 && !wizardState.tipo) { alert("Elige si es para tu negocio o tu vivienda."); return false; }
    if (n === 2 && !wizardState.distrito) { alert("Selecciona tu distrito."); return false; }
    if (n === 3 && !wizardState.area) { alert("Elige el servicio que te interesa."); return false; }
    if (n === 4 && wizardState.celular.length < 9) { alert("Ingresa un número de celular válido (9 dígitos)."); return false; }
    if (n === 4 && !document.getElementById("wizardConsent").checked) { alert("Lee y acepta los términos y la política de privacidad para continuar."); return false; }
    if (n === 4 && !document.getElementById("wizardTerms").checked) { alert("Debes aceptar los términos y condiciones para continuar."); return false; }
    return true;
  }

  document.getElementById("wizardNext").addEventListener("click", () => {
    if (!validarPaso(currentStep)) return;
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    } else {
      enviarWizard();
    }
  });
  document.getElementById("wizardBack").addEventListener("click", () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  function enviarWizard() {
    const areaTitulo = wizardState.area ? DATA.catalogo[wizardState.area].titulo : "-";
    const servicios = wizardState.servicios.length ? wizardState.servicios.join(", ") : "Por definir";
    const mensaje = `¡Hola, Virion Tec! 👋 Quiero solicitar una cotización 😊\n\n🏪 Tipo: ${wizardState.tipo}\n📍 Distrito: ${wizardState.distrito}\n🧩 Área: ${areaTitulo}\n🛠️ Servicios: ${servicios}\n📱 Mi celular: ${wizardState.celular}\n\n¿Me pueden orientar con el precio y los siguientes pasos? ¡Gracias! 🙌`;
    window.open(waLink(DATA.contacto.whatsapp, mensaje), "_blank");
    closeAllModals();
  }

  /* ---------------- Inicio ---------------- */
  setupContactLinks();
  renderCombos();
  renderCart();
  renderCatalogo();
  renderPilares();
  renderAreaDetails();
  setupTheme();
  fillDistritos();
  setupMotion();

  function setupMotion() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroVideo = document.querySelector(".hero-video");
    if (reduceMotion && heroVideo) { heroVideo.pause(); heroVideo.removeAttribute("autoplay"); }
    const revealTargets = document.querySelectorAll(".section-head, .combo-card, .catalog-col, .pilar-card, .area-detail, .nosotros-grid > *, .footer-grid > *");
    if (!reduceMotion && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      }), { threshold: .12 });
      revealTargets.forEach(el => { el.classList.add("reveal"); observer.observe(el); });
    }
    const hero = document.querySelector(".hero-cubes img");
    if (hero && !reduceMotion && matchMedia("(pointer:fine)").matches) {
      document.querySelector(".hero").addEventListener("pointermove", e => {
        const box = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width - .5;
        const y = (e.clientY - box.top) / box.height - .5;
        hero.style.transform = `translate(${x * 12}px, ${y * 10}px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
      });
      document.querySelector(".hero").addEventListener("pointerleave", () => { hero.style.transform = ""; });
    }
  }
})();
