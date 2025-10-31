import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const ICONS_DIR = "./packages/react/icons";
const VALID_VARIANTS = ["outline", "broken", "bulk", "light", "two-tone"];

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

function hasValidVariantSuffix(filename) {
	const name = filename.replace(".svg", "").toLowerCase();

	for (const variant of VALID_VARIANTS) {
		if (name.endsWith(`-${variant}`)) {
			return true;
		}
	}

	return false;
}

function cleanupInvalidFiles() {
	console.log("🔍 Scanning for invalid variant files...\n");

	const allSvgFiles = getAllSvgFiles(ICONS_DIR);
	const invalidFiles = [];

	for (const file of allSvgFiles) {
		const filename = file.split(/[\\/]/).pop();

		if (!hasValidVariantSuffix(filename)) {
			invalidFiles.push(file);
		}
	}

	if (invalidFiles.length === 0) {
		console.log("✅ No invalid files found!");
		return;
	}

	console.log(`Found ${invalidFiles.length} invalid files:\n`);

	for (const file of invalidFiles) {
		console.log(`  ❌ ${file}`);

		try {
			unlinkSync(file);
			console.log(`     Deleted: ${file}`);
		} catch (error) {
			console.log(`     Error deleting: ${error.message}`);
		}

		// Delete corresponding JSON file
		const jsonFile = file.replace(".svg", ".json");
		try {
			unlinkSync(jsonFile);
			console.log(`     Deleted: ${jsonFile}`);
		} catch (error) {
			// JSON file might not exist, that's okay
		}
	}

	console.log(`\n✅ Cleanup complete! Removed ${invalidFiles.length} invalid files.`);
}

cleanupInvalidFiles();
