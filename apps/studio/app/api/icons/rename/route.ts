import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "icons");
const METADATA_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "metadata", "icons");
const SIMPLE_ICONS_DIR = path.join(process.cwd(), "..", "..", "icons");

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { oldId, newId, category, variant, oldName, newName } = body;

		// Support both multi-variant system and simple variant system
		if (variant && oldName && newName) {
			// Simple variant-based renaming
			return handleSimpleRename(variant, oldName, newName);
		}

		if (!oldId || !newId || !category) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Validate new ID format (kebab-case)
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newId)) {
			return NextResponse.json(
				{ success: false, error: "Icon ID must be in kebab-case format" },
				{ status: 400 },
			);
		}

		const categoryDir = path.join(ICONS_BASE_DIR, category);

		// Check if category directory exists
		if (!fs.existsSync(categoryDir)) {
			return NextResponse.json(
				{ success: false, error: "Category directory not found" },
				{ status: 404 },
			);
		}

		// Get all SVG files for the old icon
		const files = fs.readdirSync(categoryDir);
		const iconFiles = files.filter((file) => file.startsWith(`${oldId}-`) && file.endsWith(".svg"));

		if (iconFiles.length === 0) {
			return NextResponse.json({ success: false, error: "No icon files found" }, { status: 404 });
		}

		// Rename all variant files
		for (const file of iconFiles) {
			const oldPath = path.join(categoryDir, file);
			const newFileName = file.replace(`${oldId}-`, `${newId}-`);
			const newPath = path.join(categoryDir, newFileName);

			fs.renameSync(oldPath, newPath);
		}

		// Rename metadata file
		const oldMetadataPath = path.join(METADATA_DIR, `${oldId}.json`);
		const newMetadataPath = path.join(METADATA_DIR, `${newId}.json`);

		if (fs.existsSync(oldMetadataPath)) {
			const metadataContent = fs.readFileSync(oldMetadataPath, "utf-8");
			const metadata = JSON.parse(metadataContent);

			// Update metadata with new ID
			metadata.id = newId;

			// Update variant SVG paths
			if (metadata.variants) {
				for (const variant of Object.keys(metadata.variants)) {
					if (metadata.variants[variant].svgPath) {
						metadata.variants[variant].svgPath = metadata.variants[variant].svgPath.replace(
							`${oldId}-`,
							`${newId}-`,
						);
					}
				}
			}

			fs.writeFileSync(newMetadataPath, JSON.stringify(metadata, null, "\t"));
			fs.unlinkSync(oldMetadataPath);
		}

		return NextResponse.json({
			success: true,
			message: "Icon renamed successfully",
			newId,
		});
	} catch (error) {
		console.error("Error renaming icon:", error);
		return NextResponse.json({ success: false, error: "Failed to rename icon" }, { status: 500 });
	}
}

// Handle simple variant-based renaming (for single variant icons)
function handleSimpleRename(variant: string, oldName: string, newName: string) {
	try {
		console.log(`[Rename] Renaming icon: ${oldName} → ${newName} (variant: ${variant})`);

		// Validate new name format (kebab-case)
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newName)) {
			return NextResponse.json(
				{ success: false, error: "Icon name must be in kebab-case format" },
				{ status: 400 },
			);
		}

		const variantDir = path.join(SIMPLE_ICONS_DIR, variant);
		console.log(`[Rename] Variant directory: ${variantDir}`);

		// Check if variant directory exists
		if (!fs.existsSync(variantDir)) {
			console.error(`[Rename] Variant directory not found: ${variantDir}`);
			return NextResponse.json(
				{ success: false, error: "Variant directory not found" },
				{ status: 404 },
			);
		}

		// Rename SVG file
		const oldSvgPath = path.join(variantDir, `${oldName}.svg`);
		const newSvgPath = path.join(variantDir, `${newName}.svg`);

		if (!fs.existsSync(oldSvgPath)) {
			console.error(`[Rename] SVG file not found: ${oldSvgPath}`);
			return NextResponse.json({ success: false, error: "SVG file not found" }, { status: 404 });
		}

		if (fs.existsSync(newSvgPath)) {
			console.error(`[Rename] Target SVG already exists: ${newSvgPath}`);
			return NextResponse.json(
				{ success: false, error: "An icon with the new name already exists" },
				{ status: 409 },
			);
		}

		fs.renameSync(oldSvgPath, newSvgPath);
		console.log(`[Rename] ✓ Renamed SVG: ${oldName}.svg → ${newName}.svg`);

		// Rename metadata file
		const oldMetadataPath = path.join(variantDir, `${oldName}.json`);
		const newMetadataPath = path.join(variantDir, `${newName}.json`);

		if (fs.existsSync(oldMetadataPath)) {
			const metadataContent = fs.readFileSync(oldMetadataPath, "utf-8");
			const metadata = JSON.parse(metadataContent);

			// Update metadata with new name
			metadata.name = newName;

			// Update tags that reference the old name
			if (metadata.tags && Array.isArray(metadata.tags)) {
				metadata.tags = metadata.tags.map((tag: string) => (tag === oldName ? newName : tag));
			}

			// Update description if it contains the old name
			if (metadata.description?.includes(oldName)) {
				metadata.description = metadata.description.replace(oldName, newName);
			}

			fs.writeFileSync(newMetadataPath, JSON.stringify(metadata, null, 2));
			fs.unlinkSync(oldMetadataPath);
			console.log(`[Rename] ✓ Renamed metadata: ${oldName}.json → ${newName}.json`);
		}

		console.log(`[Rename] ✅ Successfully renamed icon: ${oldName} → ${newName}`);
		return NextResponse.json({
			success: true,
			message: "Icon renamed successfully",
			newName,
		});
	} catch (error) {
		console.error("[Rename] Error renaming icon:", error);
		return NextResponse.json({ success: false, error: "Failed to rename icon" }, { status: 500 });
	}
}
