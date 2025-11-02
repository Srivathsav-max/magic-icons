import fs from "node:fs/promises";
import path from "node:path";
import { optimizeSvgContent } from "../apps/studio/lib/svg-optimizer";

const ICONS_ROOT = path.resolve(process.cwd(), "icons");

type OptimizeStats = {
	total: number;
	optimized: number;
	skipped: number;
	errors: number;
};

async function optimizeFile(filePath: string, variant: string, stats: OptimizeStats) {
	try {
		const original = await fs.readFile(filePath, "utf-8");
		const optimized = optimizeSvgContent(original, variant);

		stats.total += 1;

		// Check if content actually changed (accounting for whitespace differences)
		const originalNormalized = original.trim().replace(/\s+/g, " ");
		const optimizedNormalized = optimized.trim().replace(/\s+/g, " ");

		if (optimizedNormalized === originalNormalized) {
			stats.skipped += 1;
			return;
		}

		await fs.writeFile(filePath, `${optimized.trim()}\n`);
		stats.optimized += 1;
		
		const fileName = path.basename(filePath);
		console.log(`   ✓ Optimized: ${fileName}`);
	} catch (error) {
		stats.errors += 1;
		const fileName = path.basename(filePath);
		const message = (error as Error).message?.split("\n")[0]?.slice(0, 160) ?? "Unknown error";
		console.error(`   ✗ Failed: ${fileName} - ${message}`);
	}
}

async function optimizeVariant(variantDir: string, variant: string) {
	const stats: OptimizeStats = { total: 0, optimized: 0, skipped: 0, errors: 0 };
	const entries = await fs.readdir(variantDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".svg")) continue;
		await optimizeFile(path.join(variantDir, entry.name), variant, stats);
	}

	return stats;
}

async function main() {
	const start = performance.now();

	try {
		const variants = await fs.readdir(ICONS_ROOT, { withFileTypes: true });
		const aggregate: OptimizeStats = { total: 0, optimized: 0, skipped: 0, errors: 0 };

		for (const variantEntry of variants) {
			if (!variantEntry.isDirectory()) continue;

			const variant = variantEntry.name;
			const variantPath = path.join(ICONS_ROOT, variant);

			console.log(`\n🔧 Optimizing variant: ${variant}`);
			const stats = await optimizeVariant(variantPath, variant);

			aggregate.total += stats.total;
			aggregate.optimized += stats.optimized;
			aggregate.skipped += stats.skipped;
			aggregate.errors += stats.errors;

			if (stats.optimized === 0 && stats.errors === 0) {
				console.log(`   ✓ All ${stats.total} SVGs already optimized`);
			} else {
				console.log(
					`   Processed ${stats.total} SVGs • Optimized ${stats.optimized} • Skipped ${stats.skipped}` +
						(stats.errors ? ` • Errors ${stats.errors}` : ""),
				);
			}
		}

		const duration = ((performance.now() - start) / 1000).toFixed(2);

		console.log("\n✅ Optimization complete");
		console.log(
			`   Total SVGs: ${aggregate.total}\n   Optimized: ${aggregate.optimized}\n   Skipped: ${aggregate.skipped}\n   Errors: ${aggregate.errors}`,
		);
		console.log(`   Duration: ${duration}s`);
	} catch (error) {
		console.error("Failed to run optimizer:", (error as Error).message);
		process.exitCode = 1;
	}
}

await main();
