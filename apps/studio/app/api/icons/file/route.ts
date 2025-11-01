import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "icons");

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const variant = searchParams.get("variant");
		const name = searchParams.get("name");
		const type = searchParams.get("type"); // 'svg' or 'metadata'

		if (!variant || !name || !type) {
			return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
		}

		const fileName = type === "svg" ? `${name}.svg` : `${name}.json`;
		const filePath = path.join(ICONS_BASE_DIR, variant, fileName);

		if (!fs.existsSync(filePath)) {
			return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
		}

		const content = fs.readFileSync(filePath, "utf-8");

		if (type === "metadata") {
			return NextResponse.json({
				success: true,
				content: JSON.parse(content),
			});
		}

		return NextResponse.json({
			success: true,
			content,
		});
	} catch (error) {
		console.error("Error reading file:", error);
		return NextResponse.json({ success: false, error: "Failed to read file" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { variant, name, type, content } = body;

		if (!variant || !name || !type || !content) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		const fileName = type === "svg" ? `${name}.svg` : `${name}.json`;
		const filePath = path.join(ICONS_BASE_DIR, variant, fileName);

		// Ensure directory exists
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		// Write content
		if (type === "metadata") {
			fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
		} else {
			fs.writeFileSync(filePath, content);
		}

		return NextResponse.json({
			success: true,
			message: "File updated successfully",
		});
	} catch (error) {
		console.error("Error updating file:", error);
		return NextResponse.json({ success: false, error: "Failed to update file" }, { status: 500 });
	}
}
