/* Persistencia local de respaldo + sincronización con la API PostgreSQL. */
const VTStore = (function () {
  const KEY = "viriontec_data";
  const CART_KEY = "viriontec_cart";
  let remoteEnabled = false;

  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return deepClone(DEFAULT_DATA);
      const parsed = JSON.parse(raw);
      const merged = Object.assign(deepClone(DEFAULT_DATA), parsed);
      if (Array.isArray(parsed.combos)) merged.combos = parsed.combos.map(saved => Object.assign(deepClone(DEFAULT_DATA.combos.find(c => c.id === saved.id) || {}), saved));
      merged.contenido = Object.assign(deepClone(DEFAULT_DATA.contenido), parsed.contenido || {});
      return merged;
    } catch (error) { console.error("No se pudo leer la copia local.", error); return deepClone(DEFAULT_DATA); }
  }
  async function init() {
    try {
      const status = await fetch("/api/status", { credentials: "same-origin", cache: "no-store" });
      remoteEnabled = status.ok && (await status.json()).database === true;
      if (!remoteEnabled) return false;
      const response = await fetch("/api/data", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo leer PostgreSQL.");
      const data = await response.json();
      if (data && typeof data === "object") localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (error) { remoteEnabled = false; console.warn("API PostgreSQL no disponible; se usa la copia local.", error); return false; }
  }
  async function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    if (!remoteEnabled) return { persistent: false };
    const response = await fetch("/api/admin/data", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error(response.status === 401 ? "La sesión venció. Vuelve a iniciar sesión." : "No se pudieron guardar los cambios en PostgreSQL.");
    return { persistent: true };
  }
  async function reset() { const data = deepClone(DEFAULT_DATA); await save(data); return data; }
  async function login(user, pass) {
    if (!remoteEnabled) return null;
    const response = await fetch("/api/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user, pass }) });
    if (!response.ok) return false;
    return true;
  }
  async function checkSession() {
    if (!remoteEnabled) return false;
    const response = await fetch("/api/session", { credentials: "same-origin", cache: "no-store" });
    return response.ok && (await response.json()).authenticated === true;
  }
  async function logout() { if (remoteEnabled) await fetch("/api/logout", { method: "POST", credentials: "same-origin" }); }
  async function updateCredentials(user, pass) {
    if (!remoteEnabled) return false;
    const response = await fetch("/api/admin/credentials", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user, pass }) });
    if (!response.ok) throw new Error("No se pudieron actualizar las credenciales del servidor.");
    return true;
  }
  function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; } }
  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  return { load, save, reset, init, login, checkSession, logout, updateCredentials, getCart, saveCart, isRemote: () => remoteEnabled };
})();
