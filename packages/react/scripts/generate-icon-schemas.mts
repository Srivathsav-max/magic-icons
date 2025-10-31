import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CategoryConfig {
	keywords: string[];
}

interface Schema {
	categories: Record<string, CategoryConfig>;
	variants: Array<{ directory: string; name: string }>;
}

const SCHEMA_PATH = path.join(__dirname, "..", "icon-schema.json");
const schema: Schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));

function getCategoryFromName(name: string): string {
	const lowerName = name.toLowerCase();

	for (const [categoryKey, categoryData] of Object.entries(schema.categories)) {
		if (categoryData.keywords.some((keyword: string) => lowerName.includes(keyword))) {
			return categoryKey;
		}
	}

	return "misc";
}

function generateTags(name: string, category: string): string[] {
	const tags = new Set<string>();
	const lowerName = name.toLowerCase();

	if (schema.categories[category]) {
		schema.categories[category].keywords.forEach((keyword: string) => {
			if (lowerName.includes(keyword)) {
				tags.add(keyword);
			}
		});
	}

	const parts = name.split(/[\s-_]+/).filter(Boolean);
	parts.forEach((part) => {
		tags.add(part.toLowerCase());
	});

	return Array.from(tags);
}

function getRelatedCategories(name: string, primaryCategory: string): string[] {
	const lowerName = name.toLowerCase();
	const categories = new Set<string>([primaryCategory]);
	Object.entries(schema.categories).forEach(([categoryKey, categoryData]) => {
		if (categoryData.keywords.some((keyword: string) => lowerName.includes(keyword))) {
			categories.add(categoryKey);
		}
	});

	return Array.from(categories);
}

function createIconSchema(iconName: string, category: string, tags: string[]): object {
	const categories = getRelatedCategories(iconName, category);

	return {
		$schema: "../icon.schema.json",
		contributors: ["Jaya Raj Srivathsav Adari"],
		tags: tags.length > 0 ? tags : [iconName.toLowerCase()],
		categories,
		aliases: [],
		deprecated: false,
	};
}

function generateIconSchemas() {
	let totalGenerated = 0;
	let totalSkipped = 0;

	console.log("=".repeat(60));
	console.log("Generating Icon Schema Files");
	console.log("=".repeat(60));

	schema.variants.forEach((variantConfig) => {
		const fullPath = path.join(__dirname, "..", variantConfig.directory);

		if (!fs.existsSync(fullPath)) {
			console.warn(`Directory not found: ${fullPath}`);
			return;
		}

		console.log(`\nProcessing: ${variantConfig.name}`);

		const files = fs.readdirSync(fullPath);
		let variantGenerated = 0;

		files.forEach((file) => {
			if (!file.endsWith(".svg")) return;

			const schemaPath = path.join(fullPath, file.replace(".svg", ".json"));

			if (fs.existsSync(schemaPath)) {
				totalSkipped++;
				return;
			}

			const iconName = file.replace(".svg", "");
			const category = getCategoryFromName(iconName);
			const tags = generateTags(iconName, category);

			const iconSchema = createIconSchema(iconName, category, tags);

			fs.writeFileSync(schemaPath, JSON.stringify(iconSchema, null, 2));
			console.log(`  ✓ Generated: ${file.replace(".svg", ".json")}`);

			variantGenerated++;
			totalGenerated++;
		});

		console.log(`  Generated ${variantGenerated} schema files`);
	});

	console.log(`✓ Generated ${totalGenerated} new schema files`);
	console.log(`  Skipped ${totalSkipped} existing files`);
	console.log("=".repeat(60));
}

try {
	generateIconSchemas();
} catch (error) {
	console.error("Error generating icon schemas:", error);
	process.exit(1);
}
