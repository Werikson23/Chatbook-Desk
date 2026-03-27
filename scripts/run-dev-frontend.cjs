/**
 * Sobe o CRA com PORT/HOST a partir de env/development.ports.json (fonte única com o backend).
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const portsPath = path.join(root, "env", "development.ports.json");

let port = 2303;
try {
  const raw = JSON.parse(fs.readFileSync(portsPath, "utf8"));
  const n = Number(raw.frontend);
  if (Number.isFinite(n)) port = n;
} catch (err) {
  console.warn(
    `[run-dev-frontend] Não leu ${portsPath}: ${err.message}; usando PORT=${port}`
  );
}

const env = {
  ...process.env,
  HOST: "0.0.0.0",
  PORT: String(port),
  CI: "false"
};
const child = spawn("npm", ["start"], {
  cwd: path.join(root, "frontend"),
  env,
  stdio: "inherit",
  shell: true
});

child.on("exit", code => process.exit(code == null ? 1 : code));
