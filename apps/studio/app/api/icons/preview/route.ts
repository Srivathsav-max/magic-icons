import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "node:fs";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const filePath = searchParams.get("path");

		if (!filePath) {
			return NextResponse.json(
				{ success: false, error: "File path is required" },
				{ status: 400 }
			);
		}

		if (!fs.existsSync(filePath)) {
			return NextResponse.json(
				{ success: false, error: "File not found" },
				{ status: 404 }
			);
		}

		const content = fs.readFileSync(filePath, "utf-8");

		// Determine content type based on file extension
		const isSvg = filePath.endsWith(".svg");
		const isJson = filePath.endsWith(".json");

		if (isSvg) {
			return new NextResponse(content, {
				headers: { "Content-Type": "image/svg+xml" },
			});
		}

		if (isJson) {
			return NextResponse.json(JSON.parse(content));
		}

		return new NextResponse(content, {
			headers: { "Content-Type": "text/plain" },
		});
	} catch (error) {
		console.error("Error fetching file:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch file" },
			{ status: 500 }
		);
	}
}
