import { spawn } from "node:child_process";

const command = "pnpm";
const args = ["--version"];
const isWin = process.platform === "win32";
const cmd = isWin ? "pnpm.cmd" : command;

console.log(`Spawning ${cmd} with shell: false`);

const child = isWin
	? spawn(process.env.ComSpec, ["/c", command, ...args], {
			stdio: "inherit",
			shell: false,
		})
	: spawn(command, args, { stdio: "inherit", shell: false });

child.on("exit", (code) => {
	console.log(`Exited with code ${code}`);
	process.exit(code || 0);
});
