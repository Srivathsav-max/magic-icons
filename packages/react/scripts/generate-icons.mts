import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions
interface VariantConfig {
	id: string;
	name: string;
	suffix: string;
	description: string;
	defaultStrokeWidth: number;
	supportsStrokeWidth: boolean;
	fillType: "fill" | "stroke" | "mixed";
	order?: number;
	recommended?: boolean;
}

interface CategoryConfig {
	id?: string;
	label: string;
	description?: string;
	keywords: string[];
	order?: number;
}

interface Schema {
	iconDirectory: string;
	variants: VariantConfig[];
	categories: Record<string, CategoryConfig>;
	defaultSettings: {
		size: number;
		color: string;
		strokeWidth: number;
		viewBox?: string;
	};
	metadata?: {
		version?: string;
		author?: string;
	};
}

interface IconData {
	name: string;
	originalName: string;
	baseName: string;
	path: string;
	variant: string;
	category: string;
	supportsStrokeWidth: boolean;
	defaultStrokeWidth: number;
	fillType: string;
}

interface VariantInfo {
	componentName: string;
	svgPath: string;
	componentPath: string;
	supportsStrokeWidth: boolean;
	defaultStrokeWidth: number;
	fillType: string;
}

interface IconsByName {
	baseName: string;
	originalName: string;
	category: string;
	variants: Record<string, VariantInfo>;
}

const SCHEMA_PATH = path.join(__dirname, "..", "icon-schema.json");
const SRC_DIR = path.join(__dirname, "..", "src");
const ICONS_DIR = path.join(SRC_DIR, "components", "icons");
const METADATA_DIR = path.join(__dirname, "..", "metadata", "icons");
const ICONS_SOURCE_DIR = path.join(__dirname, "..", "icons");

// Load schema
const schema: Schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));

// Create metadata directory if it doesn't exist
if (!fs.existsSync(METADATA_DIR)) {
	fs.mkdirSync(METADATA_DIR, { recursive: true });
}

// Utility to convert filename to component name
function toComponentName(filename: string, numericSuffix: string): string {
	const name = filename.replace(".svg", "");

	// Map numbers to their word equivalents
	const numberMap: Record<string, string> = {
		"2": "Two",
		"3": "Three",
		"4": "Four",
		"5": "Five",
		"6": "Six",
		"7": "Seven",
		"8": "Eight",
		"9": "Nine",
	};

	const pascalCase = name
		.split(/[\s-_]+/)
		.map((word, index) => {
			if (index === 0 && numberMap[word]) {
				return numberMap[word];
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join("");

	// Return component name with numeric suffix (e.g., ArrowDown01, VideoTwo05)
	return `${pascalCase}${numericSuffix}`;
}

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
		.replace(/stroke-width/g, "strokeWidth")
		.replace(/stroke-linecap/g, "strokeLinecap")
		.replace(/stroke-linejoin/g, "strokeLinejoin")
		.replace(/stroke-miterlimit/g, "strokeMiterlimit")
		.replace(/\s+style="[^"]*"/g, "");

	if (variantConfig.fillType === "stroke") {
		reactContent = reactContent.replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
	} else if (variantConfig.fillType === "fill") {
		reactContent = reactContent
			.replace(/fill="none"/g, 'fill="currentColor"')
			.replace(/fill="black"/g, 'fill="currentColor"')
			.replace(/fill="#000000"/g, 'fill="currentColor"')
			.replace(/fill="#000"/g, 'fill="currentColor"');
	} else {
		reactContent = reactContent
			.replace(/fill="none"/g, 'fill="currentColor"')
			.replace(/fill="black"/g, 'fill="currentColor"')
			.replace(/fill="#000000"/g, 'fill="currentColor"')
			.replace(/fill="#000"/g, 'fill="currentColor"')
			.replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
	}

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

function toIconId(name: string): string {
	return name
		.replace(/([A-Z])/g, "-$1")
		.toLowerCase()
		.replace(/^-/, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function generateTags(name: string, category: string): string[] {
	const tags = new Set<string>();
	const lowerName = name.toLowerCase();
	if (schema.categories[category]) {
		schema.categories[category].keywords.forEach((keyword: string) => {
			if (lowerName.includes(keyword)) {
				tags.add(keyword);
			}
		});
	}

	// Add parts of the name as tags (split by capital letters or hyphens)
	const parts = name
		.replace(/([A-Z])/g, " $1")
		.split(/[\s-_]+/)
		.filter(Boolean);
	parts.forEach((part) => {
		tags.add(part.toLowerCase());
	});

	return Array.from(tags);
}

function createIconMetadata(
	iconName: string,
	variants: Record<string, VariantInfo>,
	category: string,
) {
	const iconId = toIconId(iconName);
	const tags = generateTags(iconName, category);

	const metadata: {
		id: string;
		name: string;
		componentBaseName: string;
		category: string;
		tags: string[];
		aliases: string[];
		description: string;
		variants: Record<string, any>;
		metadata: {
			addedDate: string;
			lastModified: string;
			version: string;
			author: string;
			popularity: number;
			isDeprecated: boolean;
		};
		usage: {
			recommended: string[];
			codeExample: string;
		};
		accessibility: {
			ariaLabel: string;
			title: string;
		};
	} = {
		id: iconId,
		name: iconName,
		componentBaseName: iconName,
		category,
		tags,
		aliases: [],
		description: `${iconName} icon - ${schema.categories[category]?.label || category}`,
		variants: {},
		metadata: {
			addedDate: new Date().toISOString().split("T")[0],
			lastModified: new Date().toISOString().split("T")[0],
			version: schema.metadata?.version || "0.0.2",
			author: schema.metadata?.author || "",
			popularity: 0,
			isDeprecated: false,
		},
		usage: {
			recommended: [],
			codeExample: `import { ${iconName}TwoTone } from 'magic-icons';\n\n<${iconName}TwoTone size={24} color="currentColor" />`,
		},
		accessibility: {
			ariaLabel: iconName
				.replace(/([A-Z])/g, " $1")
				.trim()
				.toLowerCase(),
			title: iconName,
		},
	};

	// Add variant information
	Object.entries(variants).forEach(([variantId, variantData]) => {
		metadata.variants[variantId] = {
			available: true,
			componentName: variantData.componentName,
			svgPath: variantData.svgPath,
			componentPath: variantData.componentPath,
			supportsStrokeWidth: variantData.supportsStrokeWidth,
			defaultStrokeWidth: variantData.defaultStrokeWidth,
			fillType: variantData.fillType,
		};
	});

	return metadata;
}

// Process all icons
function generateIcons(): void {
	if (!fs.existsSync(ICONS_DIR)) {
		fs.mkdirSync(ICONS_DIR, { recursive: true });
	}

	const allComponents: IconData[] = [];
	const iconsByVariant: Record<string, IconData[]> = {};
	const iconsByName: Record<string, IconsByName> = {}; // Track variants by icon base name
	const iconsByCategory: Record<string, string[]> = {}; // Track icons by category

	// Read from new category-based structure
	const iconsBaseDir = path.join(__dirname, "..", schema.iconDirectory);

	if (!fs.existsSync(iconsBaseDir)) {
		console.error(`Icons directory not found: ${iconsBaseDir}`);
		console.log("Please ensure your icons are organized in category folders.");
		return;
	}

	// Get all category directories
	const categoryDirs = fs.readdirSync(iconsBaseDir).filter((dir) => {
		const fullPath = path.join(iconsBaseDir, dir);
		return fs.statSync(fullPath).isDirectory();
	});

	console.log(`Found ${categoryDirs.length} category directories`);

	// Process each category
	categoryDirs.forEach((categoryName) => {
		const categoryPath = path.join(iconsBaseDir, categoryName);
		const files = fs.readdirSync(categoryPath);

		// Filter SVG files
		const svgFiles = files.filter((file) => file.endsWith(".svg"));

		console.log(`\nProcessing category: ${categoryName} (${svgFiles.length} icons)`);

		svgFiles.forEach((file) => {
			const svgPath = path.join(categoryPath, file);
			const svgContent = fs.readFileSync(svgPath, "utf-8");

			// Parse filename to extract icon name and variant
			const fileName = file.replace(".svg", "");
			
			// Numeric suffix mapping
			const numericToVariant: Record<string, string> = {
				"01": "-outline",
				"02": "-broken",
				"03": "-bulk",
				"04": "-light",
				"05": "-two-tone",
			};

			let variantConfig: VariantConfig | undefined;
			let iconNameWithoutVariant = fileName;

			// Check for numeric suffix first (e.g., icon-01, icon-02)
			let numericSuffix = "";
			const numericMatch = fileName.match(/^(.+)-(\d{2})$/);
			if (numericMatch) {
				const [, baseName, suffix] = numericMatch;
				numericSuffix = suffix;
				const variantSuffix = numericToVariant[suffix];

				if (variantSuffix) {
					// Find the variant config by suffix
					for (const variant of schema.variants) {
						if (variant.suffix === variantSuffix) {
							variantConfig = variant;
							iconNameWithoutVariant = baseName;
							break;
						}
					}
				}
			}

			// If no numeric match, try named variant suffix
			if (!variantConfig) {
				for (const variant of schema.variants) {
					if (fileName.endsWith(variant.suffix)) {
						variantConfig = variant;
						iconNameWithoutVariant = fileName.slice(0, -variant.suffix.length);
						break;
					}
				}
			}

			if (!variantConfig) {
				console.warn(`  ⚠ Skipping ${file}: no variant suffix found`);
				return;
			}

			const variant = variantConfig.name;
			const variantId = variantConfig.id;

			// Ensure variant directory exists
			const variantDir = path.join(ICONS_DIR, variant);
			if (!fs.existsSync(variantDir)) {
				fs.mkdirSync(variantDir, { recursive: true });
			}

			// Initialize variant tracking
			if (!iconsByVariant[variant]) {
				iconsByVariant[variant] = [];
			}

			const baseName = toComponentName(iconNameWithoutVariant + ".svg", "");
			const componentName = toComponentName(iconNameWithoutVariant + ".svg", numericSuffix);
			const componentCode = svgToReactComponent(svgContent, componentName, variantConfig);

			const outputPath = path.join(variantDir, `${componentName}.tsx`);
			fs.writeFileSync(outputPath, componentCode);

			const iconData = {
				name: componentName,
				originalName: iconNameWithoutVariant,
				baseName,
				path: `./components/icons/${variant}/${componentName}`,
				variant,
				category: categoryName,
				supportsStrokeWidth: variantConfig.supportsStrokeWidth,
				defaultStrokeWidth: variantConfig.defaultStrokeWidth,
				fillType: variantConfig.fillType,
			};

			allComponents.push(iconData);
			iconsByVariant[variant].push(iconData);

			// Track by base name for metadata generation
			if (!iconsByName[baseName]) {
				iconsByName[baseName] = {
					baseName,
					originalName: iconNameWithoutVariant,
					category: categoryName,
					variants: {} as Record<string, VariantInfo>,
				};
			}
			iconsByName[baseName].variants[variantId] = {
				componentName,
				svgPath: path.relative(path.join(__dirname, ".."), svgPath).replace(/\\/g, "/"),
				componentPath: `./components/icons/${variant}/${componentName}`,
				supportsStrokeWidth: variantConfig.supportsStrokeWidth,
				defaultStrokeWidth: variantConfig.defaultStrokeWidth,
				fillType: variantConfig.fillType,
			};

			// Track by category
			if (!iconsByCategory[categoryName]) {
				iconsByCategory[categoryName] = [];
			}
			if (!iconsByCategory[categoryName].includes(baseName)) {
				iconsByCategory[categoryName].push(baseName);
			}

			console.log(`  ✓ Generated: ${componentName}`);
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

	// Generate individual icon metadata files
	console.log(`\nGenerating individual icon metadata files...`);
	const uniqueIconCount = Object.keys(iconsByName).length;
	let metadataCount = 0;

	Object.entries(iconsByName).forEach(([baseName, iconInfo]) => {
		const iconMetadata = createIconMetadata(baseName, iconInfo.variants, iconInfo.category);

		const iconId = toIconId(baseName);
		const metadataFilePath = path.join(METADATA_DIR, `${iconId}.json`);
		fs.writeFileSync(metadataFilePath, JSON.stringify(iconMetadata, null, 2));
		metadataCount++;
	});

	// Generate category-organized metadata index
	const categoryMetadataPath = path.join(METADATA_DIR, "by-category.json");
	const categoryIndex: Record<
		string,
		{
			label: string;
			description: string;
			count: number;
			icons: string[];
		}
	> = {};
	Object.entries(iconsByCategory).forEach(([category, icons]) => {
		categoryIndex[category] = {
			label: schema.categories[category]?.label || category,
			description: schema.categories[category]?.description || "",
			count: icons.length,
			icons: icons.sort(),
		};
	});
	fs.writeFileSync(categoryMetadataPath, JSON.stringify(categoryIndex, null, 2));

	// Generate aggregate icon metadata for the showcase
	const metadataPath = path.join(ICONS_DIR, "metadata.json");
	const metadata = {
		icons: allComponents,
		variants: schema.variants,
		categories: schema.categories,
		defaultSettings: schema.defaultSettings,
		stats: {
			total: allComponents.length,
			uniqueIcons: uniqueIconCount,
			byVariant: Object.fromEntries(Object.entries(iconsByVariant).map(([k, v]) => [k, v.length])),
			byCategory: Object.fromEntries(
				Object.entries(iconsByCategory).map(([k, v]) => [k, v.length]),
			),
		},
	};
	fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

	console.log(`\n✓ Generated ${allComponents.length} icon components`);
	console.log(`✓ Generated ${metadataCount} individual icon metadata files`);
	console.log(`✓ Generated category index with ${Object.keys(iconsByCategory).length} categories`);
	console.log(`\nVariants:`);
	Object.entries(iconsByVariant).forEach(([variant, icons]) => {
		console.log(`  - ${variant}: ${icons.length} icons`);
	});
	console.log(`\nCategories:`);
	Object.entries(iconsByCategory)
		.sort((a, b) => b[1].length - a[1].length)
		.forEach(([category, icons]) => {
			const label = schema.categories[category]?.label || category;
			console.log(`  - ${label}: ${icons.length} unique icons`);
		});
}

// Run the generator
try {
	generateIcons();
} catch (error) {
	console.error("Error generating icons:", error);
	process.exit(1);
}
