#!/usr/bin/env node

/**
 * Analyze Icon Variants Script
 *
 * This script analyzes the current state of icon variants and provides
 * a detailed report on:
 * - Which icons have which variants
 * - Missing stroke variants (01 and 04)
 * - Stroke-based vs fill-based icons
 * - Recommendations for generating missing variants
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, "..", "packages", "react", "icons");

const VARIANT_NAMES = {
	"01": "Outline",
	"02": "Broken",
	"03": "Bulk",
	"04": "Light",
	"05": "TwoTone",
};

/**
 * Check if SVG is stroke-based
 */
function isStrokeBased(svgContent) {
	const hasStroke = /stroke="[^"]*"/.test(svgContent) || /stroke-width="[^"]*"/.test(svgContent);
	const hasFillNone = /fill="none"/.test(svgContent);
	const hasNoFill = !/fill="(?!none)[^"]*"/.test(svgContent);

	return hasStroke && (hasFillNone || hasNoFill);
}

/**
 * Get stroke width from SVG
 */
function getStrokeWidth(svgContent) {
	const match = svgContent.match(/stroke-width="([^"]+)"/);
	return match ? match[1] : null;
}

/**
 * Analyze all icons
 */
function analyzeIcons() {
	const analysis = {
		totalCategories: 0,
		totalUniqueIcons: 0,
		totalFiles: 0,
		strokeBased: {
			withBothVariants: [],
			withOnlyOutline: [],
			withOnlyLight: [],
			withNeither: [],
		},
		fillBased: [],
		variantDistribution: {
			"01": 0,
			"02": 0,
			"03": 0,
			"04": 0,
			"05": 0,
		},
		byCategory: {},
	};

	const categories = fs.readdirSync(ICONS_DIR).filter((dir) => {
		const fullPath = path.join(ICONS_DIR, dir);
		return fs.statSync(fullPath).isDirectory();
	});

	analysis.totalCategories = categories.length;

	for (const category of categories) {
		const categoryDir = path.join(ICONS_DIR, category);
		const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith(".svg"));

		analysis.totalFiles += files.length;

		// Group by base name
		const iconGroups = {};
		for (const file of files) {
			const match = file.match(/^(.+)-(\d{2})\.svg$/);
			if (match) {
				const [, baseName, variant] = match;
				if (!iconGroups[baseName]) {
					iconGroups[baseName] = {
						baseName,
						category,
						variants: {},
						isStrokeBased: null,
					};
				}
				iconGroups[baseName].variants[variant] = file;
				analysis.variantDistribution[variant]++;
			}
		}

		analysis.totalUniqueIcons += Object.keys(iconGroups).length;
		analysis.byCategory[category] = {
			totalIcons: Object.keys(iconGroups).length,
			strokeBased: 0,
			fillBased: 0,
			canGenerateLight: 0,
			canGenerateOutline: 0,
		};

		// Analyze each icon
		for (const [baseName, iconData] of Object.entries(iconGroups)) {
			// Check if stroke-based by reading one of the files
			const sampleVariant = Object.keys(iconData.variants)[0];
			const sampleFile = path.join(categoryDir, iconData.variants[sampleVariant]);
			const svgContent = fs.readFileSync(sampleFile, "utf-8");
			const strokeBased = isStrokeBased(svgContent);
			const strokeWidth = getStrokeWidth(svgContent);

			iconData.isStrokeBased = strokeBased;
			iconData.strokeWidth = strokeWidth;

			if (strokeBased) {
				analysis.byCategory[category].strokeBased++;

				const has01 = iconData.variants["01"] !== undefined;
				const has04 = iconData.variants["04"] !== undefined;

				if (has01 && has04) {
					analysis.strokeBased.withBothVariants.push(iconData);
				} else if (has01 && !has04) {
					analysis.strokeBased.withOnlyOutline.push(iconData);
					analysis.byCategory[category].canGenerateLight++;
				} else if (!has01 && has04) {
					analysis.strokeBased.withOnlyLight.push(iconData);
					analysis.byCategory[category].canGenerateOutline++;
				} else {
					analysis.strokeBased.withNeither.push(iconData);
				}
			} else {
				analysis.byCategory[category].fillBased++;
				analysis.fillBased.push(iconData);
			}
		}
	}

	return analysis;
}

/**
 * Print analysis report
 */
function printReport(analysis) {
	console.log("\n" + "=".repeat(70));
	console.log("📊 ICON VARIANT ANALYSIS REPORT");
	console.log("=".repeat(70));

	console.log("\n📈 Overall Statistics:");
	console.log(`   Total Categories: ${analysis.totalCategories}`);
	console.log(`   Total Unique Icons: ${analysis.totalUniqueIcons}`);
	console.log(`   Total SVG Files: ${analysis.totalFiles}`);

	console.log("\n🎨 Variant Distribution:");
	for (const [variant, count] of Object.entries(analysis.variantDistribution)) {
		const percentage = ((count / analysis.totalFiles) * 100).toFixed(1);
		console.log(`   ${VARIANT_NAMES[variant]} (${variant}): ${count} (${percentage}%)`);
	}

	console.log("\n🖊️  Stroke-Based Icons:");
	console.log(`   ✓ With both Outline & Light: ${analysis.strokeBased.withBothVariants.length}`);
	console.log(`   ⚠ With only Outline (01): ${analysis.strokeBased.withOnlyOutline.length}`);
	console.log(`   ⚠ With only Light (04): ${analysis.strokeBased.withOnlyLight.length}`);
	console.log(`   ⊘ With neither: ${analysis.strokeBased.withNeither.length}`);

	console.log("\n🎨 Fill-Based Icons:");
	console.log(`   Total: ${analysis.fillBased.length}`);

	console.log("\n💡 Generation Opportunities:");
	const canGenerateLight = analysis.strokeBased.withOnlyOutline.length;
	const canGenerateOutline = analysis.strokeBased.withOnlyLight.length;
	console.log(`   Can generate Light (04) variants: ${canGenerateLight}`);
	console.log(`   Can generate Outline (01) variants: ${canGenerateOutline}`);
	console.log(`   Total variants that can be generated: ${canGenerateLight + canGenerateOutline}`);

	console.log("\n📁 By Category:");
	console.log("   " + "-".repeat(66));
	console.log("   Category              | Icons | Stroke | Fill | Can Gen 01 | Can Gen 04");
	console.log("   " + "-".repeat(66));

	for (const [category, data] of Object.entries(analysis.byCategory)) {
		const categoryName = category.padEnd(20);
		const total = String(data.totalIcons).padStart(5);
		const stroke = String(data.strokeBased).padStart(6);
		const fill = String(data.fillBased).padStart(4);
		const gen01 = String(data.canGenerateOutline).padStart(10);
		const gen04 = String(data.canGenerateLight).padStart(10);

		console.log(`   ${categoryName} | ${total} | ${stroke} | ${fill} | ${gen01} | ${gen04}`);
	}

	if (analysis.strokeBased.withOnlyOutline.length > 0) {
		console.log("\n⚠️  Icons with only Outline (can generate Light):");
		const sample = analysis.strokeBased.withOnlyOutline.slice(0, 10);
		for (const icon of sample) {
			console.log(
				`   • ${icon.category}/${icon.baseName} (stroke-width: ${icon.strokeWidth || "default"})`,
			);
		}
		if (analysis.strokeBased.withOnlyOutline.length > 10) {
			console.log(`   ... and ${analysis.strokeBased.withOnlyOutline.length - 10} more`);
		}
	}

	if (analysis.strokeBased.withOnlyLight.length > 0) {
		console.log("\n⚠️  Icons with only Light (can generate Outline):");
		const sample = analysis.strokeBased.withOnlyLight.slice(0, 10);
		for (const icon of sample) {
			console.log(
				`   • ${icon.category}/${icon.baseName} (stroke-width: ${icon.strokeWidth || "default"})`,
			);
		}
		if (analysis.strokeBased.withOnlyLight.length > 10) {
			console.log(`   ... and ${analysis.strokeBased.withOnlyLight.length - 10} more`);
		}
	}

	console.log("\n💡 Recommendations:");
	if (canGenerateLight + canGenerateOutline > 0) {
		console.log("   Run the following command to generate missing stroke variants:");
		console.log("   $ bun run icons:sync-stroke");
		console.log("");
		console.log("   This will:");
		console.log(`   • Generate ${canGenerateLight} Light (04) variants from Outline (01)`);
		console.log(`   • Generate ${canGenerateOutline} Outline (01) variants from Light (04)`);
		console.log("   • Adjust stroke-width appropriately (2 for Outline, 1.5 for Light)");
	} else {
		console.log("   ✅ All stroke-based icons have both Outline and Light variants!");
	}

	console.log("\n" + "=".repeat(70) + "\n");
}

// Run analysis
const analysis = analyzeIcons();
printReport(analysis);
