import { execSync } from "child_process";

const REQUIRED_TOOLS = [
	{
		name: "rg",
		command: "rg --version",
		purpose: "Fast text searching (ripgrep)",
		install: "choco install ripgrep OR scoop install ripgrep",
	},
	{
		name: "fd",
		command: "fd --version",
		purpose: "Fast file finding (fd-find)",
		install: "choco install fd OR scoop install fd",
	},
	{
		name: "sd",
		command: "sd --version",
		purpose: "Fast find-and-replace (sd)",
		install: "cargo install sd OR scoop install sd",
	},
	{
		name: "gitleaks",
		command: "gitleaks version",
		purpose: "Secret leakage detection",
		install: "choco install gitleaks OR scoop install gitleaks",
	},
	{
		name: "pnpm",
		command: "pnpm --version",
		purpose: "Fast, disk space efficient package manager",
		install: "npm install -g pnpm",
	},
];

const colors = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	dim: "\x1b[2m",
};

console.log(
	`${colors.bold}${colors.cyan}\n🛡️  Sovereign Tooling Pre-flight Check\n${colors.reset}`,
);

let allPass = true;

for (const tool of REQUIRED_TOOLS) {
	try {
		const version = execSync(tool.command, { stdio: "pipe" })
			.toString()
			.split("\n")[0];
		console.log(
			`${colors.green}✅${colors.reset} ${colors.bold}${tool.name.padEnd(10)}${colors.reset} | ${colors.dim}${version}${colors.reset}`,
		);
	} catch (err) {
		allPass = false;
		console.log(
			`${colors.red}❌${colors.reset} ${colors.bold}${tool.name.padEnd(10)}${colors.reset} | ${colors.yellow}MISSING${colors.reset}`,
		);
		console.log(`   ${colors.blue}└${colors.reset} Purpose: ${tool.purpose}`);
		console.log(
			`   ${colors.blue}└${colors.reset} Install: ${colors.cyan}${tool.install}${colors.reset}`,
		);
	}
}

if (allPass) {
	console.log(
		`${colors.bold}${colors.green}\n✨ All "Shiny Tools" are present and ready for Sovereign operations.\n${colors.reset}`,
	);
} else {
	console.log(
		`${colors.bold}${colors.yellow}\n⚠️  Some tools are missing. Please install them to ensure optimal performance and safety.\n${colors.reset}`,
	);
	process.exit(1);
}
