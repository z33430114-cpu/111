import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dbFile = join(root, ".data", "cs2-relic-hall.db");
const db = new DatabaseSync(dbFile);

function queryCount(tableName) {
  return Number(db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count || 0);
}

db.exec("BEGIN");
try {
  db.prepare("DELETE FROM steam_inventory").run();
  db.prepare("DELETE FROM sessions").run();
  db.prepare("DELETE FROM user_state").run();
  db.prepare("DELETE FROM buff_sessions").run();
  db.prepare("DELETE FROM youpin_sessions").run();
  db.prepare("DELETE FROM users").run();
  db.prepare("DELETE FROM app_settings WHERE key LIKE 'steam_profile:%' OR key LIKE 'user_diy_designs:%'").run();
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}

const result = {
  users: queryCount("users"),
  sessions: queryCount("sessions"),
  steam_inventory: queryCount("steam_inventory"),
  user_state: queryCount("user_state"),
  buff_sessions: queryCount("buff_sessions"),
  youpin_sessions: queryCount("youpin_sessions")
};

console.log(JSON.stringify(result, null, 2));
