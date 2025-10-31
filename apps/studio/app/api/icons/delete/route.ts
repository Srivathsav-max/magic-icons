import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "icons");
const METADATA_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "metadata", "icons");

export async function DELETE(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const iconId = searchParams.get("iconId");
		const category = searchParams.get("category");

		if (!iconId || !category) {
			return NextResponse.json(
				{ success: false, error: "Icon ID and category are required" },
				{ status: 400 }
			);
		}

		const categoryDir = path.join(ICONS_BASE_DIR, category);
		
		// Check if category directory exists
		if (!fs.existsSync(categoryDir)) {
			return NextResponse.json(
				{ success: false, error: "Category directory not found" },
				{ status: 404 }
			);
		}

		// Get all files for this icon (all variants)
		const files = fs.readdirSync(categoryDir);
		const iconFiles = files.filter((file) => 
			file.startsWith(`${iconId}-`) && (file.endsWith(".svg") || file.endsWith(".json"))
		);

		if (iconFiles.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No icon files found" },
				{ status: 404 }
			);
		}

		// Delete all variant files (SVG and JSON)
		for (const file of iconFiles) {
			const filePath = path.join(categoryDir, file);
			fs.unlinkSync(filePath);
		}

		// Delete metadata file
		const metadataPath = path.join(METADATA_DIR, `${iconId}.json`);
		if (fs.existsSync(metadataPath)) {
			fs.unlinkSync(metadataPath);
		}

		return NextResponse.json({
			success: true,
			message: "Icon deleted successfully",
			deletedFiles: iconFiles.length,
		});
	} catch (error) {
		console.error("Error deleting icon:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete icon" },
			{ status: 500 }
		);
	}
}
