import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ICONS_DIR = path.join(process.cwd(), "..", "..", "icons", "lines");

// GET: List all icons with their metadata
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const category = searchParams.get("category");

		// Read all JSON metadata files from icons/lines (excluding variant.json)
		const files = fs.readdirSync(ICONS_DIR);
		const metadataFiles = files.filter((file) => file.endsWith(".json") && file !== "variant.json");

		const icons = metadataFiles.map((file) => {
			const filePath = path.join(ICONS_DIR, file);
			const svgPath = path.join(ICONS_DIR, file.replace(".json", ".svg"));
			const content = fs.readFileSync(filePath, "utf-8");
			const metadata = JSON.parse(content);

			// Use filename (without extension) as the source of truth for icon name
			const iconName = file.replace(".json", "");

			// Load SVG content if exists
			let svgContent = "";
			if (fs.existsSync(svgPath)) {
				svgContent = fs.readFileSync(svgPath, "utf-8");
			}

			return {
				...metadata,
				name: iconName, // Override with filename to ensure consistency
				id: iconName,
				svgContent,
			};
		});

		// Deduplicate icons by name (shouldn't happen, but safety measure)
		const uniqueIcons = Array.from(
			new Map(icons.map((icon) => [icon.name, icon])).values()
		);

		// Filter by category if provided
		const filteredIcons = category ? uniqueIcons.filter((icon) => icon.category === category) : uniqueIcons;

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

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const iconId = formData.get("iconId") as string;
		const category = formData.get("category") as string;
		const svgFile = formData.get("svgFile") as File;

		if (!iconId || !category || !svgFile) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Ensure icons directory exists
		if (!fs.existsSync(ICONS_DIR)) {
			fs.mkdirSync(ICONS_DIR, { recursive: true });
		}

		// Save SVG file
		const svgContent = await svgFile.text();
		const svgPath = path.join(ICONS_DIR, `${iconId}.svg`);
		fs.writeFileSync(svgPath, svgContent);

		// Create icon metadata JSON file
		const metadataPath = path.join(ICONS_DIR, `${iconId}.json`);
		const iconMetadata = {
			$schema: "../../icon.schema.json",
			name: iconId,
			category: category,
			tags: [iconId, category],
			description: `${iconId} icon`,
			variant: "lines",
			strokeWidth: 2,
			aliases: [],
			deprecated: false,
		};

		fs.writeFileSync(metadataPath, JSON.stringify(iconMetadata, null, 2));

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
