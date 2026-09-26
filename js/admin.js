/* Virion Tec — Panel Administrador */

(async function () {
  await VTStore.init();
  let DATA = VTStore.load();

  const COLORS = [
    { value: "green", label: "Verde (Tecnología)" },
    { value: "pink", label: "Rosa (Diseño)" },
    { value: "blue", label: "Azul (Orden)" }
  ];

  /* ---------------- Login ---------------- */
  function showApp() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminShell").classList.add("active");
    renderCombos();
    renderCatalogo();
    renderAreas();
    renderGeneral();
    renderContacto();
    renderCredentials();
  }

  document.getElementById("loginBtn").addEventListener("click", intentarLogin);
  document.getElementById("loginPass").addEventListener("keydown", (e) => { if (e.key === "Enter") intentarLogin(); });

  async function intentarLogin() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    if (!VTStore.isRemote()) {
      document.getElementById("loginError").textContent = "No hay conexión con PostgreSQL. El acceso admin está deshabilitado hasta corregir el despliegue de Railway.";
      return;
    }
    try {
      const remote = await VTStore.login(user, pass);
      if (remote === true) {
        sessionStorage.setItem("vt_admin_ok", "1");
        showApp();
      } else {
        const status = VTStore.status();
        document.getElementById("loginError").textContent = status.adminConfigured
          ? "Usuario o contraseña incorrectos. Usa las credenciales actuales de Railway/PostgreSQL."
          : "PostgreSQL está conectado, pero falta crear el admin. Configura ADMIN_USER y ADMIN_PASSWORD en Railway.";
      }
    } catch (error) {
      document.getElementById("loginError").textContent = error.message || "No se pudo iniciar sesión.";
    }
  }

  if (VTStore.isRemote()) VTStore.checkSession().then(ok => { if (ok) showApp(); });
  else document.getElementById("loginError").textContent = "El servidor no está conectado a PostgreSQL; los cambios no se sincronizarán entre equipos.";

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await VTStore.logout();
    sessionStorage.removeItem("vt_admin_ok");
    location.reload();
  });

  function renderCredentials() {
    document.getElementById("adminUserInput").value = "";
    document.getElementById("adminPassInput").value = "";
  }
  document.getElementById("saveCredentials").addEventListener("click", async () => {
    const user = document.getElementById("adminUserInput").value.trim();
    const pass = document.getElementById("adminPassInput").value;
    if (!user || pass.length < 8) { toast("Ingresa un usuario y una contraseña de al menos 8 caracteres."); return; }
    if (!VTStore.isRemote()) { toast("Conecta PostgreSQL en Railway antes de cambiar las credenciales."); return; }
    try { await VTStore.updateCredentials(user, pass); renderCredentials(); toast("Credenciales actualizadas en PostgreSQL."); }
    catch (error) { toast(error.message); }
  });

  /* ---------------- Tabs ---------------- */
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".panel-tab").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
  }

  async function saveData(message) {
    try {
      const result = await VTStore.save(DATA);
      toast(result.persistent ? message : `${message} Solo en este navegador: falta conectar PostgreSQL.`);
    } catch (error) { toast(error.message); }
  }

  /* ================================================================
     COMBOS
     ================================================================ */
  function renderCombos() {
    const list = document.getElementById("combosList");
    list.innerHTML = "";
    DATA.combos.forEach((combo, idx) => {
      const row = document.createElement("div");
      row.className = "table-row";
      row.dataset.idx = idx;
      const direct = new URL("combo.html", location.href);
      direct.searchParams.set("id", combo.id);
      direct.searchParams.set("combo", JSON.stringify(combo));
      const directLink = direct.href;
      row.innerHTML = `
        <div class="combo-admin-heading"><strong>Combo ${idx + 1}: ${escapeHtml(combo.nombre)}</strong><span>Enlace directo: <a href="${escapeAttr(directLink)}" target="_blank" rel="noopener">Abrir ficha ↗</a> <button type="button" class="copy-link-btn" data-copy="${escapeAttr(directLink)}">Copiar enlace</button></span></div>
        <div class="row-fields">
          <div><label>Nombre</label><input data-f="nombre" value="${escapeAttr(combo.nombre)}"></div>
          <div><label>Precio a mostrar</label><input data-f="precio" value="${escapeAttr(combo.precio)}"></div>
        </div>
        <div class="row-fields">
          <div><label>Color / área</label>
            <select data-f="color">${COLORS.map((c) => `<option value="${c.value}" ${c.value === combo.color ? "selected" : ""}>${c.label}</option>`).join("")}</select>
          </div>
          <div><label>Imagen · URL directa o enlace compartido de Drive/Canva</label><input data-f="img" value="${escapeAttr(combo.img)}"><small class="field-help">Drive: activa “Cualquier persona con el enlace”. Canva: usa un diseño público que permita incrustarse.</small><div class="admin-image-preview combo-preview media-preview-box" data-preview-alt="${escapeAttr(combo.nombre)}">${VTMedia.element(combo.img, combo.nombre)}</div></div>
        </div>
        <div class="row-fields full">
          <div><label>Descripción del combo</label><textarea data-f="descripcion">${escapeHtml(combo.descripcion)}</textarea></div>
        </div>
        <div class="row-fields">
          <div><label>Qué incluye · un elemento por línea</label><textarea data-f="incluye">${escapeHtml((combo.incluye || []).join("\n"))}</textarea></div>
          <div><label>Requisitos · uno por línea</label><textarea data-f="requisitos">${escapeHtml((combo.requisitos || []).join("\n"))}</textarea></div>
        </div>
        <div class="combo-admin-status"><label><input type="checkbox" data-f="activo" ${combo.activo === false ? "" : "checked"}> Disponible para cotizar</label><label><input type="checkbox" data-f="publico" ${combo.publico === false ? "" : "checked"}> Visible al público</label></div>
        <div class="row-actions">
          <button class="btn btn-danger btn-sm" data-action="delete-combo">Eliminar combo</button>
        </div>`;
      list.appendChild(row);
    });

    list.querySelectorAll("[data-f=img]").forEach(input => input.addEventListener("input", () => VTMedia.mount(input.parentElement.querySelector(".media-preview-box"), input.value, input.parentElement.querySelector(".media-preview-box").dataset.previewAlt)));
    list.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(button.dataset.copy); toast("Enlace copiado. Ya puedes enviarlo."); }
      catch { window.prompt("Copia este enlace del combo:", button.dataset.copy); }
    }));

    list.querySelectorAll("[data-action='delete-combo']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.target.closest(".table-row").dataset.idx);
        DATA.combos.splice(idx, 1);
        renderCombos();
      });
    });
  }

  document.getElementById("addComboBtn").addEventListener("click", () => {
    DATA.combos.push({
      id: "combo-" + Date.now(),
      nombre: "Nuevo combo",
      color: "green",
      precio: "Desde S/ 0",
      descripcion: "Describe aquí qué incluye este combo.",
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85",
      incluye: ["Añade cada elemento en una línea"], requisitos: ["Añade los requisitos en una línea"],
      activo: true, publico: true
    });
    renderCombos();
  });

  document.getElementById("saveCombos").addEventListener("click", async () => {
    const rows = document.querySelectorAll("#combosList .table-row");
    rows.forEach((row, idx) => {
      const combo = DATA.combos[idx];
      combo.nombre = row.querySelector("[data-f=nombre]").value.trim() || "Combo";
      combo.precio = row.querySelector("[data-f=precio]").value.trim();
      combo.color = row.querySelector("[data-f=color]").value;
      combo.img = row.querySelector("[data-f=img]").value.trim();
      combo.descripcion = row.querySelector("[data-f=descripcion]").value.trim();
      combo.incluye = row.querySelector("[data-f=incluye]").value.split("\n").map(v => v.trim()).filter(Boolean);
      combo.requisitos = row.querySelector("[data-f=requisitos]").value.split("\n").map(v => v.trim()).filter(Boolean);
      combo.activo = row.querySelector("[data-f=activo]").checked;
      combo.publico = row.querySelector("[data-f=publico]").checked;
    });
    await saveData("Combos guardados en PostgreSQL.");
    renderCombos();
  });

  /* ================================================================
     CATÁLOGO
     ================================================================ */
  function renderCatalogo() {
    const wrap = document.getElementById("catalogoList");
    wrap.innerHTML = "";
    Object.entries(DATA.catalogo).forEach(([key, cat]) => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.dataset.key = key;
      card.innerHTML = `
        <h3><span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--${cat.color});margin-right:8px;"></span>${cat.titulo}</h3>
        <div class="row-fields full" style="margin-bottom:12px;">
          <div><label>Frase de esta área</label><input data-f="frase" value="${escapeAttr(cat.frase)}"></div>
        </div>
        <label style="font-size:.8rem;font-weight:700;color:var(--muted);">Servicios</label>
        <div class="items-wrap"></div>
        <button class="btn btn-ghost btn-sm" data-action="add-item">+ Agregar servicio</button>
      `;
      wrap.appendChild(card);
      renderItems(card, cat.items);
    });

    wrap.querySelectorAll("[data-action='add-item']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const card = e.target.closest(".admin-card");
        const itemsWrap = card.querySelector(".items-wrap");
        addItemLine(itemsWrap, "");
      });
    });
  }

  function renderItems(card, items) {
    const itemsWrap = card.querySelector(".items-wrap");
    itemsWrap.innerHTML = "";
    items.forEach((item) => addItemLine(itemsWrap, item));
  }

  function addItemLine(wrap, value) {
    const line = document.createElement("div");
    line.className = "item-line";
    line.innerHTML = `<input value="${escapeAttr(value)}"><button type="button" title="Eliminar">✕</button>`;
    line.querySelector("button").addEventListener("click", () => line.remove());
    wrap.appendChild(line);
  }

  document.getElementById("saveCatalogo").addEventListener("click", async () => {
    document.querySelectorAll("#catalogoList .admin-card").forEach((card) => {
      const key = card.dataset.key;
      const cat = DATA.catalogo[key];
      cat.frase = card.querySelector("[data-f=frase]").value.trim();
      cat.items = Array.from(card.querySelectorAll(".item-line input"))
        .map((i) => i.value.trim())
        .filter(Boolean);
    });
    await saveData("Catálogo guardado y publicado.");
  });

  function renderAreas() {
    const wrap = document.getElementById("areasList");
    wrap.innerHTML = "";
    Object.entries(DATA.pilares).forEach(([key, area]) => {
      const card = document.createElement("div");
      card.className = "admin-card area-editor";
      card.dataset.key = key;
      card.innerHTML = `<h3>${escapeHtml(area.titulo)}</h3>
        <div class="row-fields"><div><label>Título del área</label><input data-f="titulo" value="${escapeAttr(area.titulo)}"></div><div><label>Color</label><select data-f="color">${COLORS.map(c => `<option value="${c.value}" ${c.value===area.color?"selected":""}>${c.label}</option>`).join("")}</select></div></div>
        <div class="row-fields full"><div><label>Logo (ruta, URL o enlace de Drive/Canva)</label><input data-f="logo" value="${escapeAttr(area.logo)}"><div class="admin-image-preview media-preview-box" data-preview-alt="Logo ${escapeAttr(area.titulo)}">${VTMedia.element(area.logo, `Logo ${area.titulo}`)}</div></div></div>
        <div class="row-fields full"><div><label>Descripción del área</label><textarea data-f="resumen">${escapeHtml(area.resumen)}</textarea></div></div>
        <label>Imágenes referenciales (URL o enlace compartido, una por línea)</label><small class="field-help">Drive debe permitir acceso a cualquiera con el enlace; Canva debe permitir vista pública/incrustada.</small><textarea data-f="imagenes" class="image-urls">${escapeHtml(area.imagenes.join("\n"))}</textarea><div class="admin-media-gallery">${area.imagenes.map((url,i)=>`<div class="admin-image-preview media-preview-box">${VTMedia.element(url, `Referencia ${area.titulo} ${i+1}`)}</div>`).join("")}</div>
        <small>Edita los enlaces y guarda para actualizar las imágenes de la web.</small>`;
      wrap.appendChild(card);
      const logoInput = card.querySelector('[data-f="logo"]');
      logoInput.addEventListener("input", () => VTMedia.mount(card.querySelector(".media-preview-box"), logoInput.value, `Logo ${area.titulo}`));
      card.querySelector('[data-f="imagenes"]').addEventListener("input", event => {
        const gallery = card.querySelector(".admin-media-gallery");
        gallery.innerHTML = event.target.value.split("\n").map(x=>x.trim()).filter(Boolean).map((url,i)=>`<div class="admin-image-preview media-preview-box">${VTMedia.element(url, `Referencia ${area.titulo} ${i+1}`)}</div>`).join("");
      });
    });
  }

  function renderGeneral() {
    const url = DATA.contenido?.imagenEquipo || "";
    document.getElementById("equipoImageUrl").value = url;
    VTMedia.mount(document.getElementById("equipoImagePreview"), url, "Vista previa del equipo Virion Tec");
    const videoUrl = DATA.contenido?.videoPortada || "";
    document.getElementById("heroVideoUrl").value = videoUrl;
    setVideoPreview(videoUrl);
  }
  function setVideoPreview(url) {
    const video = document.getElementById("heroVideoPreview");
    video.pause();
    video.removeAttribute("src");
    video.innerHTML = "";
    if (url) { video.src = url; video.load(); }
  }
  document.getElementById("heroVideoUrl").addEventListener("input", e => setVideoPreview(e.target.value.trim()));
  document.getElementById("equipoImageUrl").addEventListener("input", e => VTMedia.mount(document.getElementById("equipoImagePreview"), e.target.value, "Vista previa del equipo Virion Tec"));
  document.getElementById("saveGeneral").addEventListener("click", async () => {
    DATA.contenido = DATA.contenido || {};
    DATA.contenido.imagenEquipo = document.getElementById("equipoImageUrl").value.trim();
    DATA.contenido.videoPortada = document.getElementById("heroVideoUrl").value.trim();
    await saveData("Contenido general guardado.");
  });

  document.getElementById("saveAreas").addEventListener("click", async () => {
    document.querySelectorAll("#areasList .area-editor").forEach(card => {
      const area = DATA.pilares[card.dataset.key];
      area.titulo = card.querySelector('[data-f="titulo"]').value.trim();
      area.color = card.querySelector('[data-f="color"]').value;
      area.logo = card.querySelector('[data-f="logo"]').value.trim();
      area.resumen = card.querySelector('[data-f="resumen"]').value.trim();
      area.imagenes = card.querySelector('[data-f="imagenes"]').value.split("\n").map(x => x.trim()).filter(Boolean);
      DATA.catalogo[card.dataset.key].titulo = area.titulo;
      DATA.catalogo[card.dataset.key].color = area.color;
    });
    await saveData("Áreas e imágenes guardadas.");
  });

  /* ================================================================
     CONTACTO Y DISTRITOS
     ================================================================ */
  function renderContacto() {
    document.getElementById("contactoWhatsapp").value = DATA.contacto.whatsapp;
    document.getElementById("contactoCorreo").value = DATA.contacto.correo;
    document.getElementById("contactoZona").value = DATA.contacto.zona;
    document.getElementById("contactoDistritos").value = DATA.distritos.join("\n");
  }

  document.getElementById("saveContacto").addEventListener("click", async () => {
    DATA.contacto.whatsapp = document.getElementById("contactoWhatsapp").value.replace(/\D/g, "");
    DATA.contacto.correo = document.getElementById("contactoCorreo").value.trim();
    DATA.contacto.zona = document.getElementById("contactoZona").value.trim();
    DATA.distritos = document.getElementById("contactoDistritos").value
      .split("\n").map((d) => d.trim()).filter(Boolean);
    await saveData("Contacto y distritos guardados.");
  });

  /* ---------------- Reset ---------------- */
  document.getElementById("resetBtn").addEventListener("click", async () => {
    if (!confirm("¿Seguro que quieres restaurar los combos, catálogo y contacto a los valores originales? Esto no se puede deshacer.")) return;
    try { DATA = await VTStore.reset(); }
    catch (error) { toast(error.message); return; }
    renderCombos();
    renderCatalogo();
    renderAreas();
    renderGeneral();
    renderContacto();
    toast(VTStore.isRemote() ? "Valores restaurados en PostgreSQL." : "Restaurado solo en este navegador; falta conectar PostgreSQL.");
  });

  /* ---------------- Helpers ---------------- */
  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }
  function escapeHtml(str) {
    return String(str).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
})();
