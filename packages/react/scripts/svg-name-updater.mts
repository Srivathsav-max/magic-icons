import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NameMapping {
	oldName: string;
	newName: string;
	category?: string;
}

interface CategoryConfig {
	id: string;
	label: string;
	keywords: string[];
}

// Load schema
const SCHEMA_PATH = path.join(__dirname, "..", "icon-schema.json");
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));

// Convert name to proper format (kebab-case, lowercase)
function normalizeIconName(name: string): string {
	// Remove .svg extension if present
	name = name.replace(/\.svg$/i, "");

	// First, handle special cases with exact matches
	const specialCases: Record<string, string> = {
		"2 User": "two-user",
		"3 User": "three-user",
		"Bag 2": "bag-two",
		"Image 2": "image-two",
		"Voice 2": "voice-two",
		"Filter 3": "filter-three",
		"Arrow - Right": "arrow-right",
		"Arrow - Left": "arrow-left",
		"Arrow - Up": "arrow-up",
		"Arrow - Down": "arrow-down",
		"Arrow - Right 2": "arrow-right-two",
		"Arrow - Right 3": "arrow-right-three",
		"Arrow - Left 2": "arrow-left-two",
		"Arrow - Left 3": "arrow-left-three",
		"Arrow - Up 2": "arrow-up-two",
		"Arrow - Up 3": "arrow-up-three",
		"Arrow - Down 2": "arrow-down-two",
		"Arrow - Down 3": "arrow-down-three",
		"Arrow - Right Circle": "arrow-right-circle",
		"Arrow - Right Square": "arrow-right-square",
		"Arrow - Left Circle": "arrow-left-circle",
		"Arrow - Left Square": "arrow-left-square",
		"Arrow - Up Circle": "arrow-up-circle",
		"Arrow - Up Square": "arrow-up-square",
		"Arrow - Down Circle": "arrow-down-circle",
		"Arrow - Down Square": "arrow-down-square",
	};

	if (specialCases[name]) {
		return specialCases[name];
	}

	// Number mapping for converting digits to words
	const numberMap: Record<string, string> = {
		"2": "two",
		"3": "three",
		"4": "four",
		"5": "five",
		"6": "six",
		"7": "seven",
		"8": "eight",
		"9": "nine",
	};

	// Handle "Number Space Word" pattern (e.g., "2 User" -> "two-user")
	name = name.replace(/^(\d+)\s+/g, (match, num) => {
		return numberMap[num] ? `${numberMap[num]}-` : match;
	});

	// Handle "Word Number" pattern at the end (e.g., "Bag 2" -> "bag-two")
	name = name.replace(/\s+(\d+)$/g, (match, num) => {
		return numberMap[num] ? `-${numberMap[num]}` : match;
	});

	// Handle "Number" anywhere in the name (e.g., "Arrow 2 Up" -> "arrow-two-up")
	name = name.replace(/\s+(\d+)\s+/g, (match, num) => {
		return numberMap[num] ? `-${numberMap[num]}-` : match;
	});

	// Handle "Word - Word" pattern with spaces around dash
	name = name.replace(/\s*-\s*/g, "-");

	// Convert PascalCase/camelCase to kebab-case
	// First, insert hyphens before uppercase letters that follow lowercase letters
	name = name.replace(/([a-z])([A-Z])/g, "$1-$2");

	// Convert to lowercase and split by separators
	name = name
		.toLowerCase()
		.split(/[\s_]+/)
		.filter(Boolean)
		.join("-");

	// Clean up multiple consecutive hyphens
	name = name.replace(/-+/g, "-");

	// Remove leading/trailing hyphens
	name = name.replace(/^-+|-+$/g, "");

	return name;
}

// Get category from icon name
function getCategoryFromName(name: string): string {
	const lowerName = name.toLowerCase();

	for (const [categoryKey, categoryData] of Object.entries(schema.categories)) {
		const category = categoryData as CategoryConfig;
		if (category.keywords.some((keyword) => lowerName.includes(keyword))) {
			return categoryKey;
		}
	}

	return "misc";
}

// Scan directory and generate rename mappings
function scanAndGenerateMappings(directory: string): NameMapping[] {
	const mappings: NameMapping[] = [];

	if (!fs.existsSync(directory)) {
		console.warn(`Directory not found: ${directory}`);
		return mappings;
	}

	const files = fs.readdirSync(directory);

	files.forEach((file) => {
		if (!file.endsWith(".svg")) return;

		const oldName = file.replace(".svg", "");
		const newName = normalizeIconName(oldName);
		const category = getCategoryFromName(newName);

		if (oldName !== newName) {
			mappings.push({
				oldName: file,
				newName: `${newName}.svg`,
				category,
			});
		}
	});

	return mappings;
}

// Apply rename operations
function applyRenames(directory: string, mappings: NameMapping[], dryRun = true): void {
	console.log(
		`${dryRun ? "[DRY RUN]" : "[APPLYING]"} Processing ${mappings.length} rename operations...`,
	);

	mappings.forEach((mapping, index) => {
		const oldPath = path.join(directory, mapping.oldName);
		const newPath = path.join(directory, mapping.newName);

		console.log(`${index + 1}. ${mapping.oldName} → ${mapping.newName} [${mapping.category}]`);

		if (!dryRun) {
			try {
				if (fs.existsSync(newPath)) {
					console.warn(`   ⚠ Warning: ${mapping.newName} already exists, skipping...`);
					return;
				}
				fs.renameSync(oldPath, newPath);
				console.log(`   ✓ Renamed successfully`);
			} catch (error) {
				console.error(`   ✗ Error renaming: ${error}`);
			}
		}
	});
}

// Sort SVGs into category folders
function sortIntoCategories(sourceDir: string, dryRun = true): void {
	console.log(`\n${dryRun ? "[DRY RUN]" : "[APPLYING]"} Sorting SVGs into category folders...`);

	if (!fs.existsSync(sourceDir)) {
		console.warn(`Directory not found: ${sourceDir}`);
		return;
	}

	const files = fs.readdirSync(sourceDir);
	const categoryCounts: Record<string, number> = {};

	files.forEach((file) => {
		if (!file.endsWith(".svg")) return;

		const iconName = file.replace(".svg", "");
		const category = getCategoryFromName(iconName);

		categoryCounts[category] = (categoryCounts[category] || 0) + 1;

		const categoryDir = path.join(sourceDir, "..", "by-category", category);
		const sourcePath = path.join(sourceDir, file);
		const destPath = path.join(categoryDir, file);

		console.log(`${file} → ${category}/`);

		if (!dryRun) {
			try {
				if (!fs.existsSync(categoryDir)) {
					fs.mkdirSync(categoryDir, { recursive: true });
				}
				// Copy instead of move to preserve originals
				fs.copyFileSync(sourcePath, destPath);
			} catch (error) {
				console.error(`   ✗ Error copying: ${error}`);
			}
		}
	});

	console.log("\nCategory distribution:");
	Object.entries(categoryCounts)
		.sort((a, b) => b[1] - a[1])
		.forEach(([category, count]) => {
			const label = (schema.categories[category] as CategoryConfig)?.label || category;
			console.log(`  - ${label}: ${count} icons`);
		});
}

// Main function
function main() {
	const args = process.argv.slice(2);
	const command = args[0];
	const dryRun = !args.includes("--apply");

	console.log("=".repeat(60));
	console.log("SVG Name Updater & Organizer");
	console.log("=".repeat(60));

	if (dryRun) {
		console.log("\n⚠ DRY RUN MODE - No changes will be made");
		console.log("Add --apply flag to apply changes\n");
	}

	// Process all variant directories
	schema.variants.forEach((variant: any) => {
		const variantDir = path.join(__dirname, "..", variant.directory);
		console.log(`\n${"=".repeat(60)}`);
		console.log(`Processing: ${variant.name} (${variant.directory})`);
		console.log("=".repeat(60));

		if (command === "rename" || !command) {
			const mappings = scanAndGenerateMappings(variantDir);
			if (mappings.length > 0) {
				applyRenames(variantDir, mappings, dryRun);
			} else {
				console.log("✓ All names are already normalized");
			}
		}

		if (command === "sort" || !command) {
			sortIntoCategories(variantDir, dryRun);
		}
	});

	console.log("\n" + "=".repeat(60));
	if (dryRun) {
		console.log("DRY RUN COMPLETED - Run with --apply to make changes");
	} else {
		console.log("✓ ALL OPERATIONS COMPLETED");
	}
	console.log("=".repeat(60));
}

// Run the script
try {
	main();
} catch (error) {
	console.error("Error:", error);
	process.exit(1);
}
