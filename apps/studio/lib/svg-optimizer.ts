import type { Config } from "svgo";
import { optimize } from "svgo";
import lucideOptimize from "./lucide/optimize";

type OptimizeVariant = "lines" | "filled" | "outline" | string;

const lucideSvgoConfig: Config = {
	multipass: true,
	js2svg: {
		indent: 2,
		pretty: true,
	},
	plugins: [
		{
			name: "preset-default",
			params: {
				overrides: {
					removeViewBox: false,
					cleanupIds: false,
					convertShapeToPath: {
						convertArcs: true,
					},
				},
			},
		},
		{
			name: "removeAttrs",
			params: {
				attrs: ["class", "data-name", "style"],
			},
		},
		{
			name: "removeDimensions",
		},
		{
			name: "sortAttrs",
		},
		{
			name: "cleanupNumericValues",
			params: {
				floatPrecision: 3,
			},
		},
	],
};

const LINES_ROOT_ATTRIBUTES: Record<string, string> = {
	xmlns: "http://www.w3.org/2000/svg",
	width: "24",
	height: "24",
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "2",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
};

const MAX_FALLBACK_WARNINGS = 5;
let lucideFallbackCount = 0;

function ensureLinesVariantAttributes(svg: string) {
	return svg.replace(/<svg[^>]*>/, () => {
		const attrs = Object.entries(LINES_ROOT_ATTRIBUTES)
			.map(([key, value]) => `${key}="${value}"`)
			.join(" ");

		return `<svg ${attrs}>`;
	});
}

function stripFillAttributes(svg: string) {
	return svg.replace(
		/<(path|circle|rect|ellipse|polygon|polyline|line)([^>]*)>/g,
		(match, tag, attrs: string) => {
			const cleaned = attrs.replace(
				/\s*(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin)="[^"]*"/g,
				"",
			);
			return `<${tag}${cleaned}>`;
		},
	);
}

export function optimizeSvgContent(svg: string, variant: OptimizeVariant) {
	let optimizedSvg: string;

	if (variant === "lines") {
		try {
			optimizedSvg = lucideOptimize(svg).trim();
		} catch (error) {
			lucideFallbackCount += 1;
			if (lucideFallbackCount <= MAX_FALLBACK_WARNINGS) {
				const summary = (error as Error).message?.split("\n")[0]?.slice(0, 160) ?? "unknown error";
				console.warn(
					`Lucide optimizer failed, falling back to SVGO (${lucideFallbackCount}/${MAX_FALLBACK_WARNINGS}): ${summary}`,
				);
				if (lucideFallbackCount === MAX_FALLBACK_WARNINGS) {
					console.warn("Further Lucide optimizer errors will be suppressed.");
				}
			}
			optimizedSvg = optimize(svg, lucideSvgoConfig).data.trim();
		}
	} else {
		optimizedSvg = optimize(svg, lucideSvgoConfig).data.trim();
	}

	if (variant === "lines") {
		optimizedSvg = stripFillAttributes(optimizedSvg);
		optimizedSvg = ensureLinesVariantAttributes(optimizedSvg);
	}

	return optimizedSvg;
}
