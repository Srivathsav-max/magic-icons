import fs from "node:fs";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
	try {
		const body = await request.json();
		const { path, metadata } = body;

		if (!path || !metadata) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		// Write metadata to file
		fs.writeFileSync(path, JSON.stringify(metadata, null, 2));

		return NextResponse.json({
			success: true,
			message: "Metadata updated successfully",
		});
	} catch (error) {
		console.error("Error updating metadata:", error);
		return NextResponse.json({ success: false, error: "Failed to update metadata" }, { status: 500 });
	}
}
