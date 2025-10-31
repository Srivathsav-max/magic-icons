import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "icons");
const METADATA_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "metadata", "icons");

// GET: List all icons with their metadata
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const category = searchParams.get("category");

		// Read all metadata files
		const metadataFiles = fs.readdirSync(METADATA_DIR).filter((file) => file.endsWith(".json"));

		const icons = metadataFiles.map((file) => {
			const filePath = path.join(METADATA_DIR, file);
			const content = fs.readFileSync(filePath, "utf-8");
			return JSON.parse(content);
		});

		// Filter by category if provided
		const filteredIcons = category ? icons.filter((icon) => icon.category === category) : icons;

		return NextResponse.json({
			success: true,
			icons: filteredIcons,
			total: filteredIcons.length,
		});
	} catch (error) {
		console.error("Error fetching icons:", error);
		return NextResponse.json({ success: false, error: "Failed to fetch icons" }, { status: 500 });
	}
}

// POST: Create new icon or upload SVG
export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const iconId = formData.get("iconId") as string;
		const category = formData.get("category") as string;
		const variant = formData.get("variant") as string;
		const svgFile = formData.get("svgFile") as File;

		if (!iconId || !category || !variant || !svgFile) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Create category directory if it doesn't exist
		const categoryDir = path.join(ICONS_BASE_DIR, category);
		if (!fs.existsSync(categoryDir)) {
			fs.mkdirSync(categoryDir, { recursive: true });
		}

		// Save SVG file
		const svgContent = await svgFile.text();
		const fileName = `${iconId}-${variant}.svg`;
		const svgPath = path.join(categoryDir, fileName);
		fs.writeFileSync(svgPath, svgContent);

		// Create icon metadata JSON file
		const iconMetadataFileName = `${iconId}-${variant}.json`;
		const iconMetadataPath = path.join(categoryDir, iconMetadataFileName);
		
		const iconMetadata = {
			"$schema": "../icon.schema.json",
			variant: variant,
			contributors: ["Admin"],
			tags: [iconId],
			categories: [category],
			aliases: [],
			deprecated: false,
		};
		
		fs.writeFileSync(iconMetadataPath, JSON.stringify(iconMetadata, null, "\t"));

		return NextResponse.json({
			success: true,
			message: "Icon uploaded successfully",
			path: svgPath,
			iconId: iconId,
		});
	} catch (error) {
		console.error("Error uploading icon:", error);
		return NextResponse.json({ success: false, error: "Failed to upload icon" }, { status: 500 });
	}
}
