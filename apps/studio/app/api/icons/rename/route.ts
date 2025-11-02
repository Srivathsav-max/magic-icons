import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "icons");
const METADATA_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "metadata", "icons");

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { oldId, newId, category } = body;

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
