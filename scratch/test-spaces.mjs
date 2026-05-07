import { spawn } from "node:child_process";

const command = "echo";
const args = ["hello world", "second arg"];
const isWin = process.platform === "win32";

console.log(`Testing cmd /c with spaces`);

const child = isWin
	? spawn(process.env.ComSpec || "cmd.exe", ["/c", command, ...args], {
			stdio: "inherit",
			shell: false,
		})
	: spawn(command, args, { stdio: "inherit", shell: false });

child.on("exit", (code) => {
	console.log(`Exited with code ${code}`);
});
