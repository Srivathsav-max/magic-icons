import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const CATEGORY_SCHEMA_PATH = path.join(process.cwd(), "..", "..", "packages", "react", "category-schema.json");

export async function GET() {
	try {
		const content = fs.readFileSync(CATEGORY_SCHEMA_PATH, "utf-8");
		const schema = JSON.parse(content);

		return NextResponse.json({ 
			success: true, 
			categories: schema.categories 
		});
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}
