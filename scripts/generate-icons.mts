import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions
interface VariantConfig {
	id: string;
	name: string;
	description: string;
	defaultStrokeWidth: number;
	supportsStrokeWidth: boolean;
	fillType: "fill" | "stroke" | "mixed";
}

interface IconMetadata {
	$schema: string;
	name: string;
	category: string;
	tags: string[];
	description?: string;
	variant: string;
	strokeWidth: number;
	aliases?: string[];
	deprecated: boolean;
	deprecationReason?: string;
}

interface IconData {
	name: string;
	componentName: string;
	category: string;
	svgPath: string;
	metadata: IconMetadata;
}

// Paths
const ROOT_DIR = path.join(__dirname, "..");
const ICONS_SOURCE_DIR = path.join(ROOT_DIR, "icons", "lines");
const REACT_PACKAGE_DIR = path.join(ROOT_DIR, "packages", "react");
const ICONS_OUTPUT_DIR = path.join(REACT_PACKAGE_DIR, "icons");
const VARIANT_CONFIG_PATH = path.join(ICONS_SOURCE_DIR, "variant.json");

// Load variant configuration
let variantConfig: VariantConfig;
try {
	variantConfig = JSON.parse(fs.readFileSync(VARIANT_CONFIG_PATH, "utf-8"));
	console.log(`✓ Loaded variant configuration: ${variantConfig.name}`);
} catch (error) {
	console.error("❌ Failed to load variant configuration:", error);
	process.exit(1);
}

// Number to word mapping for icon names starting with numbers
const numberToWord: Record<string, string> = {
	"0": "zero",
	"1": "one",
	"2": "two",
	"3": "three",
	"4": "four",
	"5": "five",
	"6": "six",
	"7": "seven",
	"8": "eight",
	"9": "nine",
};

// Sanitize icon name to be a valid JavaScript identifier
function sanitizeIconName(name: string): string {
	// Convert all numbers to words
	return name.replace(/\d/g, (digit) => numberToWord[digit] || digit);
}

// Utility to convert kebab-case to PascalCase
function toPascalCase(str: string): string {
	// First sanitize the name
	const sanitized = sanitizeIconName(str);
	return sanitized
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("");
}

// Generate React component from SVG
function svgToReactComponent(
	svgContent: string,
	componentName: string,
	variantConfig: VariantConfig,
): string {
	const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
	if (!svgMatch) {
		throw new Error("Invalid SVG format");
	}

	const svgAttributesMatch = svgContent.match(/<svg([^>]*)>/);
	if (!svgAttributesMatch) {
		throw new Error("Invalid SVG format");
	}

	const svgAttributes = svgAttributesMatch[1];
	const innerContent = svgMatch[1].trim();

	const viewBoxMatch = svgAttributes.match(/viewBox="([^"]*)"/);
	const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

	// Convert attributes to React-friendly format
	let reactContent = innerContent
		.replace(/fill-rule/g, "fillRule")
		.replace(/clip-rule/g, "clipRule")
		.replace(/clip-path/g, "clipPath")
		.replace(/stroke-width/g, "strokeWidth")
		.replace(/stroke-linecap/g, "strokeLinecap")
		.replace(/stroke-linejoin/g, "strokeLinejoin")
		.replace(/stroke-miterlimit/g, "strokeMiterlimit")
		.replace(/stroke-dasharray/g, "strokeDasharray")
		.replace(/stroke-dashoffset/g, "strokeDashoffset")
		.replace(/stroke-opacity/g, "strokeOpacity")
		.replace(/fill-opacity/g, "fillOpacity")
		.replace(/\s+style="[^"]*"/g, "");

	// Handle fill/stroke based on variant type
	if (variantConfig.fillType === "stroke") {
		// Replace existing stroke attributes
		reactContent = reactContent.replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
		// Add stroke="currentColor" to path elements that don't have it
		reactContent = reactContent.replace(
			/<path(?![^>]*stroke=)([^>]*)>/g,
			'<path stroke="currentColor"$1>',
		);
		reactContent = reactContent.replace(
			/<circle(?![^>]*stroke=)([^>]*)>/g,
			'<circle stroke="currentColor"$1>',
		);
		reactContent = reactContent.replace(
			/<rect(?![^>]*stroke=)([^>]*)>/g,
			'<rect stroke="currentColor"$1>',
		);
		reactContent = reactContent.replace(
			/<line(?![^>]*stroke=)([^>]*)>/g,
			'<line stroke="currentColor"$1>',
		);
		reactContent = reactContent.replace(
			/<polyline(?![^>]*stroke=)([^>]*)>/g,
			'<polyline stroke="currentColor"$1>',
		);
		reactContent = reactContent.replace(
			/<polygon(?![^>]*stroke=)([^>]*)>/g,
			'<polygon stroke="currentColor"$1>',
		);
		reactContent = reactContent.replace(
			/<ellipse(?![^>]*stroke=)([^>]*)>/g,
			'<ellipse stroke="currentColor"$1>',
		);
	} else if (variantConfig.fillType === "fill") {
		reactContent = reactContent
			.replace(/fill="none"/g, 'fill="currentColor"')
			.replace(/fill="black"/g, 'fill="currentColor"')
			.replace(/fill="#000000"/g, 'fill="currentColor"')
			.replace(/fill="#000"/g, 'fill="currentColor"');
	} else {
		// mixed
		reactContent = reactContent
			.replace(/fill="none"/g, 'fill="currentColor"')
			.replace(/fill="black"/g, 'fill="currentColor"')
			.replace(/fill="#000000"/g, 'fill="currentColor"')
			.replace(/fill="#000"/g, 'fill="currentColor"')
			.replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
	}

	// Handle stroke width
	if (variantConfig.supportsStrokeWidth) {
		reactContent = reactContent.replace(/strokeWidth="[^"]*"/g, "strokeWidth={strokeWidth}");
	}

	const strokeWidthProp = variantConfig.supportsStrokeWidth
		? "  strokeWidth?: number | string;\n"
		: "";

	const strokeWidthDefault = variantConfig.supportsStrokeWidth
		? `, strokeWidth = ${variantConfig.defaultStrokeWidth}`
		: "";

	const strokeWidthAttr = variantConfig.supportsStrokeWidth
		? "        strokeWidth={strokeWidth}\n"
		: "";

	// Add stroke attributes for line-based variants
	const strokeAttrs =
		variantConfig.fillType === "stroke"
			? '        stroke="currentColor"\n        strokeLinecap="round"\n        strokeLinejoin="round"\n'
			: "";

	return `import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
${strokeWidthProp}}

const ${componentName} = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24${strokeWidthDefault}, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="${viewBox}"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
${strokeAttrs}${strokeWidthAttr}        {...props}
      >
        ${reactContent}
      </svg>
    );
  }
);

${componentName}.displayName = '${componentName}';

export default ${componentName};
`;
}

// Main generation function
function generateIcons(): void {
	console.log("\n🚀 Starting icon generation...\n");

	// Ensure output directory exists
	if (!fs.existsSync(ICONS_OUTPUT_DIR)) {
		fs.mkdirSync(ICONS_OUTPUT_DIR, { recursive: true });
	}

	// Check if icons source directory exists
	if (!fs.existsSync(ICONS_SOURCE_DIR)) {
		console.error(`❌ Icons directory not found: ${ICONS_SOURCE_DIR}`);
		console.log("Please create the icons/lines directory and add your SVG icons.");
		process.exit(1);
	}

	const allIcons: IconData[] = [];
	const iconsByCategory: Record<string, IconData[]> = {};
	const usedComponentNames = new Set<string>();

	// Read all files in the icons/lines directory
	const files = fs.readdirSync(ICONS_SOURCE_DIR);
	const svgFiles = files.filter((file) => file.endsWith(".svg"));

	console.log(`Found ${svgFiles.length} SVG files in ${ICONS_SOURCE_DIR}\n`);

	for (const svgFile of svgFiles) {
		const iconName = svgFile.replace(".svg", "");
		const svgPath = path.join(ICONS_SOURCE_DIR, svgFile);
		const metadataPath = path.join(ICONS_SOURCE_DIR, `${iconName}.json`);

		// Check if metadata exists
		if (!fs.existsSync(metadataPath)) {
			console.warn(`⚠️  Skipping ${iconName}: No metadata file found`);
			continue;
		}

		// Load metadata
		let metadata: IconMetadata;
		try {
			metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
		} catch (error) {
			console.error(`❌ Failed to parse metadata for ${iconName}:`, error);
			continue;
		}

		// Validate metadata
		if (metadata.name !== iconName) {
			console.warn(
				`⚠️  Metadata name mismatch for ${iconName}: expected "${iconName}", got "${metadata.name}"`,
			);
		}

		// Read SVG content
		const svgContent = fs.readFileSync(svgPath, "utf-8");

		// Generate component name
		const componentName = toPascalCase(iconName);

		// Check for duplicate component names
		if (usedComponentNames.has(componentName)) {
			console.error(
				`❌ Duplicate component name "${componentName}" for icon "${iconName}". Skipping...`,
			);
			console.error(
				`   This usually happens when icon names like "group-1" and "group-one" both exist.`,
			);
			console.error(`   Please rename one of the icons to avoid conflicts.`);
			continue;
		}
		usedComponentNames.add(componentName);

		// Generate React component
		try {
			const componentCode = svgToReactComponent(svgContent, componentName, variantConfig);
			const outputPath = path.join(ICONS_OUTPUT_DIR, `${componentName}.tsx`);
			fs.writeFileSync(outputPath, componentCode);

			const iconData: IconData = {
				name: iconName,
				componentName,
				category: metadata.category,
				svgPath: path.relative(ROOT_DIR, svgPath).replace(/\\/g, "/"),
				metadata,
			};

			allIcons.push(iconData);

			// Group by category
			if (!iconsByCategory[metadata.category]) {
				iconsByCategory[metadata.category] = [];
			}
			iconsByCategory[metadata.category].push(iconData);

			console.log(`  ✓ Generated: ${componentName} (${metadata.category})`);
		} catch (error) {
			console.error(`❌ Failed to generate component for ${iconName}:`, error);
		}
	}

	// Generate index file
	console.log("\n📦 Generating index file...");
	const indexPath = path.join(ICONS_OUTPUT_DIR, "index.ts");
	const exportLines = allIcons
		.map((icon) => `export { default as ${icon.componentName} } from './${icon.componentName}';`)
		.sort();

	const firstIcon = allIcons[0];
	const indexContent = `${exportLines.join("\n")}
${firstIcon ? `\nexport type { IconProps } from './${firstIcon.componentName}';\n` : ""}`;

	fs.writeFileSync(indexPath, indexContent);
	console.log(`✓ Generated index.ts with ${allIcons.length} exports`);

	// Generate metadata file
	console.log("\n📊 Generating metadata...");
	const metadataOutputPath = path.join(ICONS_OUTPUT_DIR, "metadata.json");
	const metadataOutput = {
		variant: variantConfig,
		icons: allIcons.map((icon) => ({
			name: icon.name,
			componentName: icon.componentName,
			category: icon.category,
			tags: icon.metadata.tags,
			description: icon.metadata.description,
			aliases: icon.metadata.aliases || [],
			deprecated: icon.metadata.deprecated,
		})),
		categories: Object.keys(iconsByCategory).sort(),
		stats: {
			total: allIcons.length,
			byCategory: Object.fromEntries(
				Object.entries(iconsByCategory).map(([category, icons]) => [category, icons.length]),
			),
		},
	};

	fs.writeFileSync(metadataOutputPath, JSON.stringify(metadataOutput, null, 2));
	console.log(`✓ Generated metadata.json`);

	// Summary
	console.log("\n✅ Icon generation complete!\n");
	console.log(`📊 Summary:`);
	console.log(`   Total icons: ${allIcons.length}`);
	console.log(`   Categories: ${Object.keys(iconsByCategory).length}`);
	console.log(`\n📁 Output directory: ${ICONS_OUTPUT_DIR}\n`);

	if (Object.keys(iconsByCategory).length > 0) {
		console.log("📂 Icons by category:");
		for (const [category, icons] of Object.entries(iconsByCategory).sort()) {
			console.log(`   - ${category}: ${icons.length} icons`);
		}
		console.log("");
	}
}

// Run the generator
try {
	generateIcons();
} catch (error) {
	console.error("\n❌ Error generating icons:", error);
	process.exit(1);
}
