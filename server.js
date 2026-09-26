require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const crypto = require("node:crypto");
const path = require("node:path");

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined });
const sessions = new Map();
const isProduction = process.env.NODE_ENV === "production";
const cookieName = "vt_admin_session";
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

function hashPassword(password, salt = crypto.randomBytes(16)) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve({ salt, key })));
}
function timingSafeText(a, b) {
  const left = Buffer.from(String(a)); const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function sessionCookie(req, res, token, maxAge) {
  const secure = isProduction && req.secure;
  res.setHeader("Set-Cookie", `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure ? "; Secure" : ""}`);
}
function requireAdmin(req, res, next) {
  const token = req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const expires = token && sessions.get(token);
  if (!expires || expires < Date.now()) { if (token) sessions.delete(token); return res.status(401).json({ error: "Inicia sesión para guardar cambios." }); }
  next();
}

async function initializeDatabase() {
  await pool.query(`CREATE TABLE IF NOT EXISTS site_content (
    id smallint PRIMARY KEY CHECK (id = 1), content jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_credentials (
    id smallint PRIMARY KEY CHECK (id = 1), username text NOT NULL UNIQUE, password_salt bytea NOT NULL, password_hash bytea NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  const configuredUser = process.env.ADMIN_USER;
  const configuredPass = process.env.ADMIN_PASSWORD;
  if (configuredUser && configuredPass) {
    const account = await pool.query("SELECT 1 FROM admin_credentials WHERE id = 1");
    if (!account.rowCount || process.env.ADMIN_RESET_ON_START === "true") {
      const { salt, key } = await hashPassword(configuredPass);
      await pool.query(`INSERT INTO admin_credentials(id, username, password_salt, password_hash) VALUES(1, $1, $2, $3)
        ON CONFLICT(id) DO UPDATE SET username=EXCLUDED.username, password_salt=EXCLUDED.password_salt, password_hash=EXCLUDED.password_hash, updated_at=now()`, [configuredUser, salt, key]);
      if (account.rowCount) console.log("Credenciales admin restablecidas desde variables de entorno.");
    }
  } else {
    console.warn("Falta ADMIN_USER o ADMIN_PASSWORD: no se puede inicializar la cuenta de administrador.");
  }
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    app.use((req, res, next) => {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      next();
    });
  }
}

app.get("/api/status", async (_req, res) => {
  try {
    const [db, content, admin] = await Promise.all([
      pool.query("SELECT 1"),
      pool.query("SELECT 1 FROM site_content WHERE id = 1"),
      pool.query("SELECT 1 FROM admin_credentials WHERE id = 1")
    ]);
    res.json({ database: db.rowCount === 1, contentConfigured: content.rowCount === 1, adminConfigured: admin.rowCount === 1 });
  } catch (error) {
    console.error("Estado de PostgreSQL no disponible:", error.message);
    res.status(503).json({ database: false, contentConfigured: false, adminConfigured: false });
  }
});
app.get("/api/data", async (_req, res, next) => {
  try {
    const result = await pool.query("SELECT content FROM site_content WHERE id = 1");
    res.json(result.rows[0]?.content || null);
  } catch (error) { next(error); }
});
app.post("/api/login", async (req, res, next) => {
  try {
    const { user, pass } = req.body || {};
    const result = await pool.query("SELECT username, password_salt, password_hash FROM admin_credentials WHERE id = 1");
    const account = result.rows[0];
    if (!account || !timingSafeText(user || "", account.username)) return res.status(401).json({ error: "Credenciales incorrectas." });
    const { key } = await hashPassword(String(pass || ""), account.password_salt);
    if (!crypto.timingSafeEqual(key, account.password_hash)) return res.status(401).json({ error: "Credenciales incorrectas." });
    const token = crypto.randomBytes(32).toString("base64url");
    sessions.set(token, Date.now() + 8 * 60 * 60 * 1000);
    sessionCookie(req, res, token, 8 * 60 * 60);
    res.json({ authenticated: true });
  } catch (error) { next(error); }
});
app.get("/api/session", (req, res) => {
  const token = req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  res.json({ authenticated: Boolean(token && sessions.get(token) > Date.now()) });
});
app.post("/api/logout", (req, res) => {
  const token = req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (token) sessions.delete(token);
  sessionCookie(req, res, "", 0);
  res.json({ authenticated: false });
});
app.put("/api/admin/data", requireAdmin, async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ error: "Formato de contenido inválido." });
    await pool.query(`INSERT INTO site_content(id, content, updated_at) VALUES(1, $1::jsonb, now())
      ON CONFLICT(id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()`, [JSON.stringify(req.body)]);
    res.json({ saved: true });
  } catch (error) { next(error); }
});
app.put("/api/admin/credentials", requireAdmin, async (req, res, next) => {
  try {
    const user = String(req.body?.user || "").trim(); const pass = String(req.body?.pass || "");
    if (!user || pass.length < 8) return res.status(400).json({ error: "Usuario requerido y contraseña de al menos 8 caracteres." });
    const { salt, key } = await hashPassword(pass);
    await pool.query("UPDATE admin_credentials SET username=$1, password_salt=$2, password_hash=$3, updated_at=now() WHERE id=1", [user, salt, key]);
    res.json({ saved: true });
  } catch (error) { next(error); }
});

app.use(express.static(__dirname, { extensions: ["html"] }));
app.use((error, _req, res, _next) => {
  console.error("API error:", error.message);
  res.status(500).json({ error: "Error del servidor. Revisa la conexión de PostgreSQL." });
});

const port = Number(process.env.PORT || 3000);
initializeDatabase().then(() => app.listen(port, () => console.log(`Virion Tec disponible en puerto ${port}`))).catch(error => {
  console.error("No se pudo iniciar PostgreSQL:", error.message);
  process.exit(1);
});
