import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "icons");

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const iconId = searchParams.get("iconId");
		const variant = searchParams.get("variant") || "outline";
		const category = searchParams.get("category");

		if (!iconId || !category) {
			return NextResponse.json(
				{ success: false, error: "Icon ID and category are required" },
				{ status: 400 }
			);
		}

		// Construct the SVG file path
		const fileName = `${iconId}-${variant}.svg`;
		const svgPath = path.join(ICONS_BASE_DIR, category, fileName);

		if (!fs.existsSync(svgPath)) {
			return NextResponse.json(
				{ success: false, error: "SVG file not found" },
				{ status: 404 }
			);
		}

		const svgContent = fs.readFileSync(svgPath, "utf-8");

		return new NextResponse(svgContent, {
			headers: {
				"Content-Type": "image/svg+xml",
			},
		});
	} catch (error) {
		console.error("Error fetching SVG preview:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch SVG preview" },
			{ status: 500 }
		);
	}
}
