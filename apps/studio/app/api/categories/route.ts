import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const CATEGORIES_DIR = path.join(process.cwd(), "..", "..", "categories");

export async function GET() {
	try {
		if (!fs.existsSync(CATEGORIES_DIR)) {
			fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
			return NextResponse.json({ success: true, categories: [] });
		}

		const files = fs.readdirSync(CATEGORIES_DIR).filter((f) => f.endsWith(".json"));
		const categories = files.map((file) => {
			const content = fs.readFileSync(path.join(CATEGORIES_DIR, file), "utf-8");
			const category = JSON.parse(content);
			return {
				...category,
				id: file.replace(".json", ""),
			};
		});

		return NextResponse.json({
			success: true,
			categories,
		});
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch categories" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { id, title, description, icon, weight } = body;

		if (!id || !title) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 },
			);
		}

		if (!fs.existsSync(CATEGORIES_DIR)) {
			fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
		}

		const categoryPath = path.join(CATEGORIES_DIR, `${id}.json`);

		if (fs.existsSync(categoryPath)) {
			return NextResponse.json(
				{ success: false, error: "Category already exists" },
				{ status: 400 },
			);
		}

		const category = {
			$schema: "../category.schema.json",
			icon: icon || id,
			title,
			description: description || "",
			weight: weight || 0,
		};

		fs.writeFileSync(categoryPath, JSON.stringify(category, null, 2));

		return NextResponse.json({
			success: true,
			category: { ...category, id },
		});
	} catch (error) {
		console.error("Error creating category:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to create category" },
			{ status: 500 },
		);
	}
}
