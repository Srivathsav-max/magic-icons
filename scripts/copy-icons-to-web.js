import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = join(__dirname, "..", "packages", "react", "src", "components", "icons");
const targetDir = join(__dirname, "..", "apps", "web", "components", "icons");

console.log("📦 Copying icons to web app...");

// Ensure target directory exists
if (!existsSync(targetDir)) {
	mkdirSync(targetDir, { recursive: true });
}

// Copy the entire icons directory
try {
	cpSync(sourceDir, targetDir, { recursive: true });
	console.log("✓ Icons copied successfully to apps/web/components/icons");
} catch (error) {
	console.error("✗ Error copying icons:", error);
	process.exit(1);
}
