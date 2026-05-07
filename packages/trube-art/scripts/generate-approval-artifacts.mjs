import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const packageJson = JSON.parse(
	fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
);

function ensureDir(dirPath) {
	fs.mkdirSync(dirPath, { recursive: true });
}

function pickSurfaceName(layer) {
	if (!layer?.surface) {
		return "unknown";
	}

	return typeof layer.surface === "string" ? layer.surface : layer.surface.name;
}

function renderSnapshotSection(scoreArtifact) {
	const layerSummary = scoreArtifact.layers
		.map((layer) => `${layer.role}:${layer.surface}@${layer.opacity}`)
		.join(", ");

	return [
		`## ${scoreArtifact.label}`,
		"",
		`- Name: \`${scoreArtifact.name}\``,
		`- Review: \`${scoreArtifact.review.state}\``,
		`- Approved for: ${scoreArtifact.review.approvedFor}`,
		`- Experience: \`${scoreArtifact.experience}\``,
		`- Temperament: ${scoreArtifact.lineage.temperament}`,
		`- Placement: focal \`${scoreArtifact.placement.focalZone}\`, safe overlay \`${scoreArtifact.placement.safeOverlayZone}\`, text \`${scoreArtifact.placement.textDensity}\``,
		`- Canonical role: ${scoreArtifact.canonicalRole ?? "None"}`,
		`- Layer stack: ${layerSummary}`,
		`- Ornament: \`${scoreArtifact.extras.ornament.name}\` density ${scoreArtifact.extras.ornament.density} opacity ${scoreArtifact.extras.ornament.opacity}`,
		`- Motif: \`${scoreArtifact.extras.motif.name}\` style ${scoreArtifact.extras.motif.style} density ${scoreArtifact.extras.motif.density}`,
		`- Restraint: ${scoreArtifact.placement.avoidUse}`,
		"",
	].join("\n");
}

async function main() {
	const sourceCoreDir = path.join(packageRoot, "src", "core");
	const tempDir = path.join(packageRoot, ".approval-cache");
	ensureDir(tempDir);

	for (const fileName of fs.readdirSync(sourceCoreDir)) {
		if (!fileName.endsWith(".ts")) {
			continue;
		}

		const sourcePath = path.join(sourceCoreDir, fileName);
		const source = fs.readFileSync(sourcePath, "utf8");
		const transpiled = ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2020,
			},
			fileName: sourcePath,
		});

		fs.writeFileSync(
			path.join(tempDir, fileName.replace(/\.ts$/, ".js")),
			transpiled.outputText,
			"utf8",
		);
	}

	const {
		TRUBE_SCORE_NAMES,
		getCanonicalScores,
		getProductionReadyScores,
		getScoreExtras,
		getScorePreset,
		getScoresByReviewState,
	} = await import(pathToFileURL(path.join(tempDir, "scores.js")).href);

	function mapScoreToArtifact(scoreName) {
		const score = getScorePreset(scoreName);
		const extras = getScoreExtras(scoreName);
		const canonical = getCanonicalScores().find(
			(item) => item.name === scoreName,
		);

		return {
			name: score.name,
			label: score.label,
			description: score.description,
			experience: score.experience,
			review: score.review,
			lineage: score.lineage,
			placement: score.placement,
			canonicalRole: canonical?.role ?? null,
			canonicalRationale: canonical?.rationale ?? null,
			background: score.stage.background ?? null,
			layers: score.stage.layers.map((layer) => ({
				id: layer.id ?? null,
				role: layer.role ?? "body",
				quality: layer.quality ?? "auto",
				opacity: layer.opacity ?? 1,
				surface: pickSurfaceName(layer),
			})),
			extras: {
				ornament: {
					name: extras.ornament.name,
					density: extras.ornament.density,
					opacity: extras.ornament.opacity,
					seed: extras.ornament.seed,
				},
				motif: {
					name: extras.motif.name,
					density: extras.motif.density,
					opacity: extras.motif.opacity,
					seed: extras.motif.seed,
					style: extras.motif.style,
				},
			},
		};
	}

	const artifactsDir = path.join(packageRoot, "artifacts");
	ensureDir(artifactsDir);

	const scores = TRUBE_SCORE_NAMES.map(mapScoreToArtifact);
	const approved = getProductionReadyScores().map((score) => score.name);
	const inReview = getScoresByReviewState("in-review").map(
		(score) => score.name,
	);
	const experimental = getScoresByReviewState("experimental").map(
		(score) => score.name,
	);
	const canonical = getCanonicalScores();

	const manifest = {
		package: packageJson.name,
		version: packageJson.version,
		generatedAt: new Date().toISOString(),
		exportVersion: 1,
		approvals: {
			approved,
			inReview,
			experimental,
		},
		canonical,
		scores,
	};

	fs.writeFileSync(
		path.join(artifactsDir, "approval-manifest.json"),
		`${JSON.stringify(manifest, null, 2)}\n`,
		"utf8",
	);

	const snapshotLines = [
		"# Trube-Art Approval Snapshot",
		"",
		`- Package: \`${packageJson.name}\``,
		`- Version: \`${packageJson.version}\``,
		`- Generated: ${manifest.generatedAt}`,
		`- Approved count: ${approved.length}`,
		`- In review count: ${inReview.length}`,
		`- Experimental count: ${experimental.length}`,
		"",
		"## Canonical Gurudevi Standard",
		"",
		...canonical.map(
			(item) => `- \`${item.name}\`: ${item.role} - ${item.rationale}`,
		),
		"",
		"## Approved Scores",
		"",
		...scores
			.filter((score) => score.review.state === "approved")
			.map(renderSnapshotSection),
		"## In Review Scores",
		"",
		...scores
			.filter((score) => score.review.state === "in-review")
			.map(renderSnapshotSection),
		"## Experimental Scores",
		"",
		...scores
			.filter((score) => score.review.state === "experimental")
			.map(renderSnapshotSection),
	];

	fs.writeFileSync(
		path.join(artifactsDir, "approval-snapshots.md"),
		`${snapshotLines.join("\n")}\n`,
		"utf8",
	);

	fs.rmSync(tempDir, { recursive: true, force: true });
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
