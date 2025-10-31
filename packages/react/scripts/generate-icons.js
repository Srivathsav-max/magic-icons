import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.join(__dirname, "..", "icon-schema.json");
const SRC_DIR = path.join(__dirname, "..", "src");
const ICONS_DIR = path.join(SRC_DIR, "components", "icons");

// Load schema
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));

// Utility to convert filename to component name
function toComponentName(filename, variant) {
	const name = filename.replace(".svg", "");

	// Map numbers to their word equivalents
	const numberMap = {
		2: "Two",
		3: "Three",
		4: "Four",
		5: "Five",
		6: "Six",
		7: "Seven",
		8: "Eight",
		9: "Nine",
	};

	const pascalCase = name
		.split(/[\s-_]+/)
		.map((word, index) => {
			// If the word is just a number at the start, convert it to word form
			if (index === 0 && numberMap[word]) {
				return numberMap[word];
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join("");

	return `${pascalCase}${variant}`;
}

// Convert SVG content to React component
function svgToReactComponent(svgContent, componentName, variantConfig) {
	const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
	if (!svgMatch) {
		throw new Error("Invalid SVG format");
	}

	const svgAttributes = svgContent.match(/<svg([^>]*)>/)[1];
	const innerContent = svgMatch[1].trim();

	const viewBoxMatch = svgAttributes.match(/viewBox="([^"]*)"/);
	const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

	// Convert attributes to React-friendly format
	let reactContent = innerContent
		.replace(/fill-rule/g, "fillRule")
		.replace(/clip-rule/g, "clipRule")
		.replace(/stroke-width/g, "strokeWidth")
		.replace(/stroke-linecap/g, "strokeLinecap")
		.replace(/stroke-linejoin/g, "strokeLinejoin")
		.replace(/stroke-miterlimit/g, "strokeMiterlimit")
		// Remove style attributes as we handle styling via props
		.replace(/\s+style="[^"]*"/g, "");

	// Handle fill and stroke based on variant type
	if (variantConfig.fillType === "stroke") {
		// For stroke-based icons, replace stroke colors but preserve fills
		reactContent = reactContent.replace(/stroke="(?!none)[^"]*"/g, "stroke={color}");
	} else if (variantConfig.fillType === "fill") {
		// For fill-based icons, replace only black fills (preserve white and other colors)
		reactContent = reactContent
			.replace(/fill="black"/g, "fill={color}")
			.replace(/fill="#000000"/g, "fill={color}")
			.replace(/fill="#000"/g, "fill={color}");
	} else {
		// Mixed - replace both black fills and strokes
		reactContent = reactContent
			.replace(/fill="black"/g, "fill={color}")
			.replace(/fill="#000000"/g, "fill={color}")
			.replace(/fill="#000"/g, "fill={color}")
			.replace(/stroke="(?!none)[^"]*"/g, "stroke={color}");
	}

	// Handle stroke width for stroke-based icons
	if (variantConfig.supportsStrokeWidth) {
		reactContent = reactContent.replace(/strokeWidth="[^"]*"/g, "strokeWidth={strokeWidth}");
	}

	const strokeWidthProp = variantConfig.supportsStrokeWidth
		? `  strokeWidth?: number | string;\n`
		: "";

	const strokeWidthDefault = variantConfig.supportsStrokeWidth
		? `, strokeWidth = ${variantConfig.defaultStrokeWidth}`
		: "";

	const strokeWidthAttr = variantConfig.supportsStrokeWidth
		? `        strokeWidth={strokeWidth}\n`
		: "";

	return `import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
${strokeWidthProp}}

const ${componentName} = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = 'currentColor'${strokeWidthDefault}, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="${viewBox}"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
${strokeWidthAttr}        {...props}
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

// Get category from icon name
function getCategoryFromName(name) {
	const lowerName = name.toLowerCase();

	for (const [categoryKey, categoryData] of Object.entries(schema.categories)) {
		if (categoryData.keywords.some((keyword) => lowerName.includes(keyword))) {
			return categoryKey;
		}
	}

	return "misc";
}

// Process all icons
function generateIcons() {
	if (!fs.existsSync(ICONS_DIR)) {
		fs.mkdirSync(ICONS_DIR, { recursive: true });
	}

	const allComponents = [];
	const iconsByVariant = {};

	schema.variants.forEach((variantConfig) => {
		const fullPath = path.join(__dirname, "..", variantConfig.directory);

		if (!fs.existsSync(fullPath)) {
			console.warn(`Directory not found: ${fullPath}`);
			return;
		}

		const variant = variantConfig.name;
		const variantDir = path.join(ICONS_DIR, variant);

		if (!fs.existsSync(variantDir)) {
			fs.mkdirSync(variantDir, { recursive: true });
		}

		iconsByVariant[variant] = [];

		const files = fs.readdirSync(fullPath);

		files.forEach((file) => {
			if (!file.endsWith(".svg")) return;

			const svgPath = path.join(fullPath, file);
			const svgContent = fs.readFileSync(svgPath, "utf-8");

			const componentName = toComponentName(file, variant);
			const componentCode = svgToReactComponent(svgContent, componentName, variantConfig);

			const outputPath = path.join(variantDir, `${componentName}.tsx`);
			fs.writeFileSync(outputPath, componentCode);

			const iconName = file.replace(".svg", "");
			const category = getCategoryFromName(iconName);

			const iconData = {
				name: componentName,
				originalName: iconName,
				path: `./components/icons/${variant}/${componentName}`,
				variant,
				category,
				supportsStrokeWidth: variantConfig.supportsStrokeWidth,
				defaultStrokeWidth: variantConfig.defaultStrokeWidth,
				fillType: variantConfig.fillType,
			};

			allComponents.push(iconData);
			iconsByVariant[variant].push(iconData);

			console.log(`Generated: ${componentName}`);
		});
	});

	// Generate index files for each variant
	schema.variants.forEach((variantConfig) => {
		const variant = variantConfig.name;
		const variantComponents = allComponents.filter((c) => c.variant === variant);

		if (variantComponents.length === 0) return;

		const variantIndexPath = path.join(ICONS_DIR, variant, "index.ts");
		const variantIndexContent = variantComponents
			.map((c) => `export { default as ${c.name} } from './${c.name}';`)
			.join("\n");
		fs.writeFileSync(variantIndexPath, `${variantIndexContent}\n`);
	});

	// Generate main index file
	const indexPath = path.join(ICONS_DIR, "index.ts");
	const exportLines = schema.variants
		.filter((v) => iconsByVariant[v.name] && iconsByVariant[v.name].length > 0)
		.map((v) => `export * from './${v.name}';`);

	const firstComponent = allComponents[0];
	const indexContent = `${exportLines.join("\n")}
export type { IconProps } from './${firstComponent.variant}/${firstComponent.name}';
`;
	fs.writeFileSync(indexPath, indexContent);

	// Generate icon metadata for the showcase
	const metadataPath = path.join(ICONS_DIR, "metadata.json");
	const metadata = {
		icons: allComponents,
		variants: schema.variants,
		categories: schema.categories,
		defaultSettings: schema.defaultSettings,
		stats: {
			total: allComponents.length,
			byVariant: Object.fromEntries(Object.entries(iconsByVariant).map(([k, v]) => [k, v.length])),
			byCategory: allComponents.reduce((acc, icon) => {
				acc[icon.category] = (acc[icon.category] || 0) + 1;
				return acc;
			}, {}),
		},
	};
	fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

	console.log(`\n✓ Generated ${allComponents.length} icon components`);
	console.log(`\nVariants:`);
	Object.entries(iconsByVariant).forEach(([variant, icons]) => {
		console.log(`  - ${variant}: ${icons.length} icons`);
	});
}

// Run the generator
try {
	generateIcons();
} catch (error) {
	console.error("Error generating icons:", error);
	process.exit(1);
}
