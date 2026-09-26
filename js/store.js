/* Virion Tec — Capa de almacenamiento
   Guarda y lee la "base de datos" del sitio en localStorage,
   para que lo que edites en el Panel Administrador se refleje en la web pública. */

const VTStore = (function () {
  const KEY = "viriontec_data";
  const CART_KEY = "viriontec_cart";

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return deepClone(DEFAULT_DATA);
      const parsed = JSON.parse(raw);
      // Mezcla superficial por si en el futuro se agregan nuevas llaves por defecto
      const merged = Object.assign(deepClone(DEFAULT_DATA), parsed);
      if (Array.isArray(parsed.combos)) {
        merged.combos = parsed.combos.map(saved => {
          const defaults = DEFAULT_DATA.combos.find(combo => combo.id === saved.id) || {};
          return Object.assign(deepClone(defaults), saved);
        });
      }
      merged.contenido = Object.assign(deepClone(DEFAULT_DATA.contenido), parsed.contenido || {});
      return merged;
    } catch (e) {
      console.error("No se pudo leer los datos guardados, se usan los valores por defecto.", e);
      return deepClone(DEFAULT_DATA);
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function reset() {
    localStorage.removeItem(KEY);
    return deepClone(DEFAULT_DATA);
  }

  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  return { load, save, reset, getCart, saveCart };
})();
