#!/usr/bin/env node

/**
 * Sync Stroke Variants Script
 *
 * This script ensures that Outline (01) and Light (04) variants exist for all icons.
 * The only difference between these variants is the stroke-width:
 * - Outline (01): stroke-width="2" (default)
 * - Light (04): stroke-width="1.5"
 *
 * The script:
 * 1. Scans all icon directories
 * 2. Identifies icons that have only one stroke variant
 * 3. Generates the missing variant by adjusting stroke-width
 * 4. Maintains all other SVG attributes
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, "..", "packages", "react", "icons");

// Stroke width mapping
const STROKE_VARIANTS = {
	"01": { name: "outline", strokeWidth: "2" },
	"04": { name: "light", strokeWidth: "1.5" },
};

/**
 * Parse SVG content and extract stroke-width
 */
function parseSvgStrokeWidth(svgContent) {
	const strokeMatch = svgContent.match(/stroke-width="([^"]+)"/);
	return strokeMatch ? strokeMatch[1] : null;
}

/**
 * Check if SVG is stroke-based (not fill-based)
 */
function isStrokeBased(svgContent) {
	// Check if it has stroke attributes and fill="none" or no fill
	const hasStroke = /stroke="[^"]*"/.test(svgContent) || /stroke-width="[^"]*"/.test(svgContent);
	const hasFillNone = /fill="none"/.test(svgContent);
	const hasNoFill = !/fill="(?!none)[^"]*"/.test(svgContent);

	return hasStroke && (hasFillNone || hasNoFill);
}

/**
 * Update stroke-width in SVG content
 */
function updateStrokeWidth(svgContent, newStrokeWidth) {
	// Replace existing stroke-width
	if (/stroke-width="[^"]*"/.test(svgContent)) {
		return svgContent.replace(/stroke-width="[^"]*"/g, `stroke-width="${newStrokeWidth}"`);
	}

	// Add stroke-width to elements that have stroke but no stroke-width
	return svgContent.replace(
		/<(path|circle|rect|line|polyline|polygon)([^>]*stroke="[^"]*"[^>]*)>/g,
		(match, tag, attrs) => {
			if (!attrs.includes("stroke-width")) {
				return `<${tag}${attrs} stroke-width="${newStrokeWidth}">`;
			}
			return match;
		},
	);
}

/**
 * Get all icon files grouped by base name
 */
function getIconGroups(categoryDir) {
	const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith(".svg"));
	const groups = {};

	for (const file of files) {
		// Extract base name and variant
		const match = file.match(/^(.+)-(\d{2})\.svg$/);
		if (match) {
			const [, baseName, variant] = match;
			if (!groups[baseName]) {
				groups[baseName] = {};
			}
			groups[baseName][variant] = file;
		}
	}

	return groups;
}

/**
 * Generate missing stroke variant
 */
function generateMissingVariant(categoryDir, baseName, sourceVariant, targetVariant) {
	const sourceFile = path.join(categoryDir, `${baseName}-${sourceVariant}.svg`);
	const targetFile = path.join(categoryDir, `${baseName}-${targetVariant}.svg`);

	// Read source SVG
	const svgContent = fs.readFileSync(sourceFile, "utf-8");

	// Check if it's stroke-based
	if (!isStrokeBased(svgContent)) {
		return { skipped: true, reason: "not stroke-based" };
	}

	// Get current stroke width
	const currentStrokeWidth = parseSvgStrokeWidth(svgContent);
	const targetStrokeWidth = STROKE_VARIANTS[targetVariant].strokeWidth;

	// Update stroke width
	const newSvgContent = updateStrokeWidth(svgContent, targetStrokeWidth);

	// Write new file
	fs.writeFileSync(targetFile, newSvgContent);

	return {
		created: true,
		sourceStrokeWidth: currentStrokeWidth,
		targetStrokeWidth: targetStrokeWidth,
	};
}

/**
 * Main function
 */
function main() {
	console.log("🔍 Analyzing icons for missing stroke variants...\n");

	const stats = {
		totalIcons: 0,
		strokeBased: 0,
		generated: 0,
		skipped: 0,
		errors: 0,
		byCategory: {},
	};

	// Get all category directories
	const categories = fs.readdirSync(ICONS_DIR).filter((dir) => {
		const fullPath = path.join(ICONS_DIR, dir);
		return fs.statSync(fullPath).isDirectory();
	});

	console.log(`Found ${categories.length} categories\n`);

	for (const category of categories) {
		const categoryDir = path.join(ICONS_DIR, category);
		const iconGroups = getIconGroups(categoryDir);

		stats.byCategory[category] = {
			total: Object.keys(iconGroups).length,
			generated: 0,
			skipped: 0,
		};

		console.log(`\n📁 Processing category: ${category}`);
		console.log(`   Found ${Object.keys(iconGroups).length} unique icons`);

		for (const [baseName, variants] of Object.entries(iconGroups)) {
			stats.totalIcons++;

			// Check if we have 01 but not 04
			if (variants["01"] && !variants["04"]) {
				try {
					const result = generateMissingVariant(categoryDir, baseName, "01", "04");

					if (result.created) {
						console.log(`   ✓ Generated: ${baseName}-04.svg (stroke: ${result.targetStrokeWidth})`);
						stats.generated++;
						stats.byCategory[category].generated++;
						stats.strokeBased++;
					} else if (result.skipped) {
						stats.skipped++;
						stats.byCategory[category].skipped++;
					}
				} catch (error) {
					console.error(`   ✗ Error generating ${baseName}-04.svg:`, error.message);
					stats.errors++;
				}
			}

			// Check if we have 04 but not 01
			if (variants["04"] && !variants["01"]) {
				try {
					const result = generateMissingVariant(categoryDir, baseName, "04", "01");

					if (result.created) {
						console.log(`   ✓ Generated: ${baseName}-01.svg (stroke: ${result.targetStrokeWidth})`);
						stats.generated++;
						stats.byCategory[category].generated++;
						stats.strokeBased++;
					} else if (result.skipped) {
						stats.skipped++;
						stats.byCategory[category].skipped++;
					}
				} catch (error) {
					console.error(`   ✗ Error generating ${baseName}-01.svg:`, error.message);
					stats.errors++;
				}
			}
		}
	}

	// Print summary
	console.log("\n" + "=".repeat(60));
	console.log("📊 Summary");
	console.log("=".repeat(60));
	console.log(`Total unique icons: ${stats.totalIcons}`);
	console.log(`Stroke-based icons: ${stats.strokeBased}`);
	console.log(`✓ Generated: ${stats.generated}`);
	console.log(`⊘ Skipped (fill-based): ${stats.skipped}`);
	console.log(`✗ Errors: ${stats.errors}`);

	console.log("\n📁 By Category:");
	for (const [category, data] of Object.entries(stats.byCategory)) {
		if (data.generated > 0 || data.skipped > 0) {
			console.log(`   ${category}: ${data.generated} generated, ${data.skipped} skipped`);
		}
	}

	console.log("\n✅ Done!\n");
}

// Run the script
main();
