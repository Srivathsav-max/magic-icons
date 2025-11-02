import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { optimizeSvgContent } from "@/lib/svg-optimizer";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "icons");

function resolveIconPath(filePath: string) {
	const candidate = path.isAbsolute(filePath) ? filePath : path.join(ICONS_BASE_DIR, filePath);
	const resolved = path.resolve(candidate);

	if (!resolved.startsWith(ICONS_BASE_DIR)) {
		throw new Error("Path is outside icons directory");
	}

	return resolved;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const iconPath = body?.path as string | undefined;
		const variant = body?.variant as string | undefined;

		if (!iconPath || !variant) {
			return NextResponse.json(
				{ success: false, error: "Icon path and variant are required" },
				{ status: 400 },
			);
		}

		const resolvedPath = resolveIconPath(iconPath);

		if (!fs.existsSync(resolvedPath)) {
			return NextResponse.json({ success: false, error: "Icon not found" }, { status: 404 });
		}

		const svgContent = fs.readFileSync(resolvedPath, "utf-8");
		const optimizedSvg = optimizeSvgContent(svgContent, variant);

		fs.writeFileSync(resolvedPath, optimizedSvg);

		return NextResponse.json({ success: true, svg: optimizedSvg });
	} catch (error) {
		console.error("Error optimizing icon:", error);
		return NextResponse.json({ success: false, error: "Failed to optimize icon" }, { status: 500 });
	}
}
