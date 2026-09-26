/* Normaliza enlaces compartidos para mostrarlos en <img> o como diseño incrustado. */
const VTMedia = (function () {
  function escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }

  function resolve(value) {
    const raw = String(value || "").trim();
    if (!raw) return { kind: "image", url: "" };
    let parsed;
    try { parsed = new URL(raw, location.href); } catch { return { kind: "image", url: raw }; }
    const host = parsed.hostname.toLowerCase();
    if (host === "drive.google.com" || host === "docs.google.com") {
      const id = parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || parsed.searchParams.get("id");
      if (id) return { kind: "image", url: `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600` };
    }
    if (host === "canva.com" || host.endsWith(".canva.com")) {
      const design = parsed.pathname.match(/\/design\/([^/]+)/)?.[1];
      if (design) return { kind: "embed", url: `https://www.canva.com/design/${encodeURIComponent(design)}/view?embed` };
    }
    return { kind: "image", url: raw };
  }

  function element(value, alt, className = "") {
    const media = resolve(value);
    if (media.kind === "embed") return `<iframe class="media-embed ${escape(className)}" src="${escape(media.url)}" title="${escape(alt)}" loading="lazy" allowfullscreen></iframe>`;
    return `<img class="${escape(className)}" src="${escape(media.url)}" alt="${escape(alt)}" loading="lazy">`;
  }

  function mount(container, value, alt, className = "") {
    if (!container) return;
    container.innerHTML = element(value, alt, className);
  }

  function applyLogoTheme(img, dark) {
    if (!img) return;
    const original = img.dataset.lightSrc || img.getAttribute("src") || "";
    let path = original;
    try { path = new URL(original, location.href).pathname; } catch {}
    if (!/\/assets\/logos\/(?:logo-viriontec|cubo-(?:tecnologia|diseno|orden))(?:-b)?\.png$/i.test(path)) return;
    img.dataset.lightSrc = original.replace(/-b(?=\.png(?:[?#]|$))/, "");
    img.src = dark ? img.dataset.lightSrc : img.dataset.lightSrc.replace(/\.png(?=([?#]|$))/, "-b.png");
  }

  return { resolve, element, mount, applyLogoTheme };
})();
