const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const git = "C:\\Program Files\\Git\\cmd\\git.exe";
const gh = "C:\\Program Files\\GitHub CLI\\gh.exe";
const remoteUrl = "https://github.com/usmansolarbright/solar-code.git";
const logFile = path.join(root, "auth-push-log.txt");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  fs.appendFileSync(logFile, line + "\n");
  console.log(line);
}

function run(cmd, args, opts = {}) {
  log(`$ ${path.basename(cmd)} ${args.join(" ")}`);
  const res = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    timeout: opts.timeout || 120000,
    input: opts.input,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GCM_INTERACTIVE: "Never",
      GIT_AUTHOR_NAME: "usmansolarbright",
      GIT_AUTHOR_EMAIL: "chusman20172017@gmail.com",
      GIT_COMMITTER_NAME: "usmansolarbright",
      GIT_COMMITTER_EMAIL: "chusman20172017@gmail.com",
    },
  });
  const scrub = (s) => String(s || "").replace(/gho_[A-Za-z0-9]+/g, "gho_***").replace(/\/\/[^@\s]+@/g, "//***@");
  if (res.stdout) log(scrub(res.stdout).trim().slice(0, 2500));
  if (res.stderr) log(scrub(res.stderr).trim().slice(0, 2500));
  log(`exit=${res.status}`);
  return res;
}

fs.writeFileSync(logFile, "");
log("Auth as usmansolarbright, then push to solar-code");

// Clear previous gh login if any
run(gh, ["auth", "logout", "--hostname", "github.com", "--yes"], { timeout: 30000 });

log("Starting device login. Complete in browser as usmansolarbright...");
const child = spawn(
  gh,
  [
    "auth",
    "login",
    "--hostname",
    "github.com",
    "--git-protocol",
    "https",
    "--web",
    "--scopes",
    "repo,workflow",
  ],
  { cwd: root, env: process.env }
);

let buffer = "";
child.stdout.on("data", (d) => {
  const t = d.toString();
  buffer += t;
  process.stdout.write(t);
  fs.appendFileSync(logFile, t);
});
child.stderr.on("data", (d) => {
  const t = d.toString();
  buffer += t;
  process.stderr.write(t);
  fs.appendFileSync(logFile, t);
});

child.on("close", (code) => {
  log(`auth login exit=${code}`);
  if (code !== 0) {
    fs.writeFileSync(path.join(root, "push-done.txt"), "FAILED_AUTH");
    process.exit(1);
  }

  const who = run(gh, ["api", "user", "-q", ".login"]);
  const login = (who.stdout || "").trim();
  log(`logged in as: ${login}`);
  if (login !== "usmansolarbright") {
    fs.writeFileSync(path.join(root, "push-done.txt"), `WRONG_ACCOUNT:${login}`);
    log("ERROR: login with usmansolarbright, not " + login);
    process.exit(2);
  }

  run(gh, ["auth", "setup-git"]);
  run(git, ["remote", "remove", "origin"]);
  run(git, ["remote", "add", "origin", remoteUrl]);
  run(git, ["branch", "-M", "main"]);

  // Ensure repo exists (create if missing)
  const view = run(gh, ["repo", "view", "usmansolarbright/solar-code"]);
  if (view.status !== 0) {
    run(gh, [
      "repo",
      "create",
      "usmansolarbright/solar-code",
      "--public",
      "--description",
      "Solar Bright website",
    ]);
  }

  const push = run(git, ["push", "-u", "origin", "main"], { timeout: 300000 });
  if (push.status === 0) {
    fs.writeFileSync(path.join(root, "push-done.txt"), "OK https://github.com/usmansolarbright/solar-code");
    log("SUCCESS https://github.com/usmansolarbright/solar-code");
    process.exit(0);
  }

  // fallback via gh
  const ghPush = run(gh, ["repo", "sync", "--source", "."], { timeout: 300000 });
  const push2 = run(gh, ["auth", "setup-git"]);
  const push3 = run(git, ["push", "-u", "origin", "main"], { timeout: 300000 });
  if (push3.status === 0) {
    fs.writeFileSync(path.join(root, "push-done.txt"), "OK https://github.com/usmansolarbright/solar-code");
    log("SUCCESS https://github.com/usmansolarbright/solar-code");
    process.exit(0);
  }

  fs.writeFileSync(path.join(root, "push-done.txt"), "FAILED_PUSH");
  log("FAILED_PUSH");
  process.exit(1);
});
