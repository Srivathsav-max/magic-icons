import fs from "node:fs";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
	try {
		const body = await request.json();
		const { path, content } = body;

		if (!path || !content) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		// Write SVG content to file
		fs.writeFileSync(path, content);

		return NextResponse.json({
			success: true,
			message: "SVG updated successfully",
		});
	} catch (error) {
		console.error("Error updating SVG:", error);
		return NextResponse.json({ success: false, error: "Failed to update SVG" }, { status: 500 });
	}
}
