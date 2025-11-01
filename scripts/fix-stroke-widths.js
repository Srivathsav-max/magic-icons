#!/usr/bin/env node

/**
 * Fix Stroke Widths Script
 * 
 * This script fixes stroke-width values in existing icon files:
 * - Outline (01): Ensures stroke-width="2"
 * - Light (04): Ensures stroke-width="1.5"
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, "..", "packages", "react", "icons");

const STROKE_VARIANTS = {
	"01": { name: "outline", strokeWidth: "2" },
	"04": { name: "light", strokeWidth: "1.5" },
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
 * Get current stroke-width
 */
function getCurrentStrokeWidth(svgContent) {
	const match = svgContent.match(/stroke-width="([^"]+)"/);
	return match ? match[1] : null;
}

/**
 * Update stroke-width in SVG content
 */
function updateStrokeWidth(svgContent, newStrokeWidth) {
	if (/stroke-width="[^"]*"/.test(svgContent)) {
		return svgContent.replace(/stroke-width="[^"]*"/g, `stroke-width="${newStrokeWidth}"`);
	}
	return svgContent;
}

/**
 * Fix stroke-width for a specific file
 */
function fixStrokeWidth(filePath, variant) {
	const svgContent = fs.readFileSync(filePath, 'utf-8');
	
	if (!isStrokeBased(svgContent)) {
		return { skipped: true, reason: 'not stroke-based' };
	}
	
	const currentStrokeWidth = getCurrentStrokeWidth(svgContent);
	const targetStrokeWidth = STROKE_VARIANTS[variant].strokeWidth;
	
	if (currentStrokeWidth === targetStrokeWidth) {
		return { skipped: true, reason: 'already correct' };
	}
	
	const newSvgContent = updateStrokeWidth(svgContent, targetStrokeWidth);
	fs.writeFileSync(filePath, newSvgContent);
	
	return {
		fixed: true,
		oldStrokeWidth: currentStrokeWidth,
		newStrokeWidth: targetStrokeWidth,
	};
}

/**
 * Main function
 */
function main() {
	console.log('🔧 Fixing stroke-width values in existing icons...\n');
	
	const stats = {
		total: 0,
		fixed: 0,
		skipped: 0,
		errors: 0,
		byVariant: {
			'01': { fixed: 0, skipped: 0 },
			'04': { fixed: 0, skipped: 0 },
		},
	};
	
	const categories = fs.readdirSync(ICONS_DIR).filter((dir) => {
		const fullPath = path.join(ICONS_DIR, dir);
		return fs.statSync(fullPath).isDirectory();
	});
	
	console.log(`Found ${categories.length} categories\n`);
	
	for (const category of categories) {
		const categoryDir = path.join(ICONS_DIR, category);
		const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith('.svg'));
		
		let categoryFixed = 0;
		
		for (const file of files) {
			const match = file.match(/^(.+)-(\d{2})\.svg$/);
			if (!match) continue;
			
			const [, baseName, variant] = match;
			
			// Only process 01 and 04 variants
			if (variant !== '01' && variant !== '04') continue;
			
			stats.total++;
			const filePath = path.join(categoryDir, file);
			
			try {
				const result = fixStrokeWidth(filePath, variant);
				
				if (result.fixed) {
					if (categoryFixed === 0) {
						console.log(`\n📁 ${category}:`);
					}
					console.log(`   ✓ Fixed: ${file} (${result.oldStrokeWidth} → ${result.newStrokeWidth})`);
					stats.fixed++;
					stats.byVariant[variant].fixed++;
					categoryFixed++;
				} else if (result.skipped) {
					stats.skipped++;
					stats.byVariant[variant].skipped++;
				}
			} catch (error) {
				console.error(`   ✗ Error fixing ${file}:`, error.message);
				stats.errors++;
			}
		}
	}
	
	// Print summary
	console.log('\n' + '='.repeat(60));
	console.log('📊 Summary');
	console.log('='.repeat(60));
	console.log(`Total stroke-based icons checked: ${stats.total}`);
	console.log(`✓ Fixed: ${stats.fixed}`);
	console.log(`⊘ Skipped (already correct): ${stats.skipped}`);
	console.log(`✗ Errors: ${stats.errors}`);
	
	console.log('\n📊 By Variant:');
	console.log(`   Outline (01): ${stats.byVariant['01'].fixed} fixed, ${stats.byVariant['01'].skipped} already correct`);
	console.log(`   Light (04): ${stats.byVariant['04'].fixed} fixed, ${stats.byVariant['04'].skipped} already correct`);
	
	if (stats.fixed > 0) {
		console.log('\n💡 Next Steps:');
		console.log('   Run: bun run build:icons');
		console.log('   This will regenerate React components with correct stroke-widths');
	}
	
	console.log('\n✅ Done!\n');
}

// Run the script
main();
