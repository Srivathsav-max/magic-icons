import { existsSync, readdirSync, renameSync, statSync } from "node:fs";
import { join } from "node:path";

const ICONS_DIR = "./packages/react/icons";

// Variant mapping: name → numeric suffix
const VARIANT_TO_NUMBER = {
	outline: "01",
	broken: "02",
	bulk: "03",
	light: "04",
	"two-tone": "05",
};

// Reverse mapping for detection
const NUMBER_TO_VARIANT = {
	"01": "outline",
	"02": "broken",
	"03": "bulk",
	"04": "light",
	"05": "two-tone",
};

function getAllSvgFiles(dir) {
	const files = [];
	const items = readdirSync(dir);

	for (const item of items) {
		const fullPath = join(dir, item);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			files.push(...getAllSvgFiles(fullPath));
		} else if (item.endsWith(".svg")) {
			files.push(fullPath);
		}
	}

	return files;
}

function parseFilename(filename) {
	const name = filename.replace(".svg", "");

	// Check if already has numeric suffix
	const numericMatch = name.match(/^(.+)-(\d{2})$/);
	if (numericMatch) {
		return {
			baseName: numericMatch[1],
			variant: NUMBER_TO_VARIANT[numericMatch[2]],
			isNumeric: true,
		};
	}

	// Check for variant name suffix
	for (const [variantName] of Object.entries(VARIANT_TO_NUMBER)) {
		if (name.endsWith(`-${variantName}`)) {
			return {
				baseName: name.slice(0, -(variantName.length + 1)),
				variant: variantName,
				isNumeric: false,
			};
		}
	}

	return null;
}

function sanitizeBaseName(name) {
	return name
		.replace(/([A-Z])/g, "-$1") // PascalCase to kebab-case
		.toLowerCase()
		.replace(/^-/, "") // Remove leading dash
		.replace(/\s+/g, "-") // Spaces to dashes
		.replace(/_/g, "-") // Underscores to dashes
		.replace(/[^a-z0-9-]/g, "") // Remove invalid characters
		.replace(/-+/g, "-") // Multiple dashes to single dash
		.replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}

function generateNewFilename(baseName, variant) {
	const sanitized = sanitizeBaseName(baseName);
	return `${sanitized}-${VARIANT_TO_NUMBER[variant]}.svg`;
}

function standardizeIcons() {
	console.log("🔍 Scanning for icons to standardize...\n");

	const allSvgFiles = getAllSvgFiles(ICONS_DIR);
	const changes = [];
	const duplicates = new Map(); // Track potential duplicates

	// First pass: analyze all files
	for (const filePath of allSvgFiles) {
		const pathParts = filePath.split(/[\\/]/);
		const filename = pathParts.pop();
		const dir = pathParts.join("\\"); // Use backslash for Windows

		const parsed = parseFilename(filename);
		if (!parsed) {
			console.log(`  ⚠ Skipping ${filename}: no variant detected`);
			continue;
		}

		const newFilename = generateNewFilename(parsed.baseName, parsed.variant);
		const newPath = `${dir}\\${newFilename}`;

		// Check if already standardized
		if (filename === newFilename) {
			continue;
		}

		// Check for potential conflicts
		const key = `${dir}/${newFilename}`;
		if (duplicates.has(key)) {
			console.log(`  ⚠ Duplicate detected: ${newFilename} in ${dir}`);
			duplicates.get(key).push(filePath);
		} else {
			duplicates.set(key, [filePath]);
		}

		changes.push({
			oldPath: filePath,
			newPath,
			oldFilename: filename,
			newFilename,
			baseName: parsed.baseName,
			variant: parsed.variant,
			needsRename: !parsed.isNumeric,
		});
	}

	if (changes.length === 0) {
		console.log("✅ All icons are already standardized!");
		return;
	}

	console.log(`Found ${changes.length} icons to standardize:\n`);

	// Group by category for better output
	const byCategory = {};
	for (const change of changes) {
		const category = change.oldPath.split(/[\\/]/).slice(-2, -1)[0];
		if (!byCategory[category]) {
			byCategory[category] = [];
		}
		byCategory[category].push(change);
	}

	// Display changes
	for (const [category, items] of Object.entries(byCategory)) {
		console.log(`\n📁 ${category}:`);
		for (const change of items) {
			if (change.needsRename) {
				console.log(`  📝 ${change.oldFilename} → ${change.newFilename}`);
			} else {
				console.log(`  ✓ ${change.oldFilename} (already numeric)`);
			}
		}
	}

	// Perform renames
	console.log("\n🔄 Applying changes...\n");
	let renamed = 0;
	let errors = 0;

	for (const change of changes) {
		if (!change.needsRename) continue;

		try {
			// Check if target already exists
			if (existsSync(change.newPath)) {
				console.log(`  ❌ Cannot rename: ${change.newFilename} already exists`);
				errors++;
				continue;
			}

			// Rename SVG file
			renameSync(change.oldPath, change.newPath);

			// Rename corresponding JSON file if it exists
			const oldJsonPath = change.oldPath.replace(".svg", ".json");
			const newJsonPath = change.newPath.replace(".svg", ".json");
			if (existsSync(oldJsonPath)) {
				renameSync(oldJsonPath, newJsonPath);
			}

			console.log(`  ✓ Renamed: ${change.oldFilename} → ${change.newFilename}`);
			renamed++;
		} catch (error) {
			console.log(`  ❌ Error renaming ${change.oldFilename}: ${error.message}`);
			errors++;
		}
	}

	console.log(`\n✅ Standardization complete!`);
	console.log(`   Renamed: ${renamed} files`);
	if (errors > 0) {
		console.log(`   Errors: ${errors} files`);
	}
	console.log(`\n💡 Next steps:`);
	console.log(`   1. Run: cd packages/react && bun run build`);
	console.log(`   2. Verify all icons are generated correctly`);
}

// Run the standardization
try {
	standardizeIcons();
} catch (error) {
	console.error("Error standardizing icons:", error);
	process.exit(1);
}
