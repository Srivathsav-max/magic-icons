import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CategoryConfig {
	keywords: string[];
}

interface VariantConfig {
	id: string;
	name: string;
	suffix: string;
	directory?: string; // Old directory path
}

interface Schema {
	iconDirectory: string;
	variants: VariantConfig[];
	categories: Record<string, CategoryConfig>;
}

// Load schema
const SCHEMA_PATH = path.join(__dirname, "..", "icon-schema.json");
const schema: Schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));

// Get category from icon name
function getCategoryFromName(name: string): string {
	const lowerName = name.toLowerCase();

	for (const [categoryKey, categoryData] of Object.entries(schema.categories)) {
		if (categoryData.keywords.some((keyword: string) => lowerName.includes(keyword))) {
			return categoryKey;
		}
	}

	return "misc";
}

// Generate tags from icon name
function generateTags(name: string, category: string): string[] {
	const tags = new Set<string>();
	const lowerName = name.toLowerCase();

	// Add category keywords as tags
	if (schema.categories[category]) {
		schema.categories[category].keywords.forEach((keyword: string) => {
			if (lowerName.includes(keyword)) {
				tags.add(keyword);
			}
		});
	}

	// Add parts of the name as tags
	const parts = name.split(/[\s-_]+/).filter(Boolean);
	parts.forEach((part) => {
		tags.add(part.toLowerCase());
	});

	return Array.from(tags);
}

// Get related categories for an icon
function getRelatedCategories(name: string, primaryCategory: string): string[] {
	const lowerName = name.toLowerCase();
	const categories = new Set<string>([primaryCategory]);

	// Check all categories for keyword matches
	Object.entries(schema.categories).forEach(([categoryKey, categoryData]) => {
		if (categoryData.keywords.some((keyword: string) => lowerName.includes(keyword))) {
			categories.add(categoryKey);
		}
	});

	return Array.from(categories);
}

// Create icon schema object
function createIconSchema(
	iconName: string,
	category: string,
	tags: string[],
	variantId: string,
): object {
	const categories = getRelatedCategories(iconName, category);

	return {
		$schema: "../icon.schema.json",
		variant: variantId,
		contributors: ["Jaya Raj Srivathsav Adari"],
		tags: tags.length > 0 ? tags : [iconName.toLowerCase()],
		categories,
		aliases: [],
		deprecated: false,
	};
}

// Migrate icons
function migrateIcons(dryRun = true) {
	console.log("=".repeat(60));
	console.log("Migrating Icons to Category-Based Structure");
	console.log("=".repeat(60));

	if (dryRun) {
		console.log("\n⚠ DRY RUN MODE - No changes will be made");
		console.log("Add --apply flag to apply changes\n");
	}

	const iconsBaseDir = path.join(__dirname, "..", schema.iconDirectory);
	let totalMigrated = 0;
	let totalSkipped = 0;

	// Old variant directories (hardcoded for migration)
	const oldVariants = [
		{ id: "outline", name: "Outline", suffix: "-outline", directory: "icons/Regular/Outline" },
		{ id: "bulk", name: "Bulk", suffix: "-bulk", directory: "icons/Regular/Bulk" },
		{ id: "broken", name: "Broken", suffix: "-broken", directory: "icons/Regular/Broken" },
		{ id: "light", name: "Light", suffix: "-light", directory: "icons/Regular/Light" },
		{ id: "two-tone", name: "TwoTone", suffix: "-two-tone", directory: "icons/Regular/Two-tone" },
	];

	oldVariants.forEach((variantConfig) => {
		if (!variantConfig.directory) return;

		const oldPath = path.join(__dirname, "..", variantConfig.directory);

		if (!fs.existsSync(oldPath)) {
			console.warn(`\n⚠ Directory not found: ${oldPath}`);
			return;
		}

		console.log(`\n${"=".repeat(60)}`);
		console.log(`Processing: ${variantConfig.name}`);
		console.log("=".repeat(60));

		const files = fs.readdirSync(oldPath);
		const svgFiles = files.filter((file) => file.endsWith(".svg"));

		console.log(`Found ${svgFiles.length} SVG files`);

		svgFiles.forEach((file) => {
			const iconName = file.replace(".svg", "");
			const category = getCategoryFromName(iconName);

			// Create category directory
			const categoryDir = path.join(iconsBaseDir, category);

			// New filename with variant suffix
			const newFileName = `${iconName}${variantConfig.suffix}.svg`;
			const newFilePath = path.join(categoryDir, newFileName);

			// Check if already exists
			if (fs.existsSync(newFilePath)) {
				console.log(`  ⊘ Skipped: ${newFileName} (already exists)`);
				totalSkipped++;
				return;
			}

			console.log(`  ${iconName} → ${category}/${newFileName}`);

			if (!dryRun) {
				// Create category directory if it doesn't exist
				if (!fs.existsSync(categoryDir)) {
					fs.mkdirSync(categoryDir, { recursive: true });
				}

				// Copy SVG file
				const oldFilePath = path.join(oldPath, file);
				fs.copyFileSync(oldFilePath, newFilePath);

				// Generate and save icon schema
				const tags = generateTags(iconName, category);
				const iconSchema = createIconSchema(iconName, category, tags, variantConfig.id);
				const schemaPath = path.join(categoryDir, `${iconName}${variantConfig.suffix}.json`);
				fs.writeFileSync(schemaPath, JSON.stringify(iconSchema, null, 2));
			}

			totalMigrated++;
		});
	});

	console.log("\n" + "=".repeat(60));
	console.log("Migration Summary");
	console.log("=".repeat(60));
	console.log(`✓ Migrated: ${totalMigrated} icons`);
	console.log(`⊘ Skipped: ${totalSkipped} icons (already exist)`);

	if (dryRun) {
		console.log("\n⚠ DRY RUN COMPLETED - Run with --apply to make changes");
	} else {
		console.log("\n✓ MIGRATION COMPLETED");
		console.log("\nNext steps:");
		console.log("1. Run: bun run build:icons");
		console.log("2. Review the generated components");
		console.log("3. Consider removing old Regular/ folders after verification");
	}
	console.log("=".repeat(60));
}

// Run the migration
try {
	const args = process.argv.slice(2);
	const dryRun = !args.includes("--apply");
	migrateIcons(dryRun);
} catch (error) {
	console.error("Error during migration:", error);
	process.exit(1);
}
