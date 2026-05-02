import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const inputArg = process.argv[2];
const outputArg = process.argv[3];

if (!inputArg || !outputArg) {
	console.error(
		"Usage: node scripts/bridge-schema-zod.mjs <input_schema.json> <output_zod.ts>",
	);
	process.exit(1);
}

const inputPath = path.isAbsolute(inputArg)
	? inputArg
	: path.join(rootDir, inputArg);
const outputPath = path.isAbsolute(outputArg)
	? outputArg
	: path.join(rootDir, outputArg);

function mapType(prop) {
	if (prop.type === "string") {
		if (prop.format === "uuid") return "z.uuid()";
		if (prop.format === "email") return "z.email()";
		if (prop.format === "uri" || prop.format === "url") return "z.url()";
		if (prop.format === "date-time") return "z.iso.datetime()";
		return "z.string()";
	}
	if (prop.type === "boolean") return "z.boolean()";
	if (prop.type === "number" || prop.type === "integer") return "z.number()";
	if (prop.type === "array") {
		const itemType = prop.items ? mapType(prop.items) : "z.any()";
		return `z.array(${itemType})`;
	}
	if (prop.type === "object") {
		// Nested object support (simple)
		if (prop.properties) {
			let obj = "z.object({\n";
			for (const [k, v] of Object.entries(prop.properties)) {
				obj += `      ${k}: ${mapType(v)},\n`;
			}
			obj += "    })";
			return obj;
		}
		return "z.record(z.any())";
	}
	if (Array.isArray(prop.type)) {
		if (prop.type.includes("null")) {
			const actualType = prop.type.filter((t) => t !== "null")[0];
			return `${mapType({ ...prop, type: actualType })}.nullable()`;
		}
	}
	return "z.any()";
}

function generateZod(schema) {
	let output = `/**\n * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY\n * Generated from ${path.basename(inputPath)}\n */\n\nimport { z } from 'zod';\n\n`;

	// 1. Handle Top-level Definitions
	if (schema.definitions || schema.$defs) {
		const defs = schema.definitions || schema.$defs;
		for (const [name, def] of Object.entries(defs)) {
			if (def.type === "object" && def.properties) {
				output += `export const ${name}Schema = z.object({\n`;
				for (const [propName, prop] of Object.entries(def.properties)) {
					let line = `  ${propName}: ${mapType(prop)}`;
					if (!def.required?.includes(propName)) line += ".optional()";
					output += `${line},\n`;
				}
				output += `});\n\n`;
				output += `export type ${name} = z.infer<typeof ${name}Schema>;\n\n`;
			}
		}
	}

	// 2. Handle Root Schema (if it's an object)
	if (schema.type === "object" && schema.properties) {
		const rootName = schema.title?.replace(/\s+/g, "") || "Root";
		output += `export const ${rootName}Schema = z.object({\n`;
		for (const [propName, prop] of Object.entries(schema.properties)) {
			let line = `  ${propName}: ${mapType(prop)}`;
			if (!schema.required?.includes(propName)) line += ".optional()";
			output += `${line},\n`;
		}
		output += `});\n\n`;
		output += `export type ${rootName} = z.infer<typeof ${rootName}Schema>;\n`;
	}

	return output;
}

try {
	console.log(
		`⚡ Bridging Schema: ${path.relative(rootDir, inputPath)} -> ${path.relative(rootDir, outputPath)}`,
	);
	const schema = JSON.parse(fs.readFileSync(inputPath, "utf8"));
	const zodCode = generateZod(schema);

	const outputDir = path.dirname(outputPath);
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

	fs.writeFileSync(outputPath, zodCode);
	console.log("✅ Dynamic Bridge Transmutation Complete.");
} catch (e) {
	console.error(`❌ Bridge Failure: ${e.message}`);
	process.exit(1);
}
