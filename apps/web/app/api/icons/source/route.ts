import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "icons");

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const iconName = searchParams.get("name");
		const variant = searchParams.get("variant") || "lines";

		if (!iconName) {
			return NextResponse.json({ error: "Icon name is required" }, { status: 400 });
		}

		const svgPath = path.join(ICONS_BASE_DIR, variant, `${iconName}.svg`);

		if (!fs.existsSync(svgPath)) {
			return NextResponse.json({ error: "Icon not found" }, { status: 404 });
		}

		const svgContent = fs.readFileSync(svgPath, "utf-8");

		return new NextResponse(svgContent, {
			headers: {
				"Content-Type": "image/svg+xml",
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch (error) {
		console.error("Error reading icon:", error);
		return NextResponse.json({ error: "Failed to read icon" }, { status: 500 });
	}
}
