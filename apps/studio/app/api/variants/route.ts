import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "icons");

// GET: List all variants
export async function GET() {
	try {
		const variants = [];
		const dirs = fs.readdirSync(ICONS_BASE_DIR);

		for (const dir of dirs) {
			const variantPath = path.join(ICONS_BASE_DIR, dir);
			const variantConfigPath = path.join(variantPath, "variant.json");

			if (fs.statSync(variantPath).isDirectory() && fs.existsSync(variantConfigPath)) {
				const config = JSON.parse(fs.readFileSync(variantConfigPath, "utf-8"));
				variants.push({
					...config,
					path: dir,
				});
			}
		}

		return NextResponse.json({
			success: true,
			variants,
		});
	} catch (error) {
		console.error("Error fetching variants:", error);
		return NextResponse.json({ success: false, error: "Failed to fetch variants" }, { status: 500 });
	}
}

// POST: Create new variant
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { id, name, description, defaultStrokeWidth, supportsStrokeWidth, fillType } = body;

		if (!id || !name) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		const variantDir = path.join(ICONS_BASE_DIR, id);

		if (fs.existsSync(variantDir)) {
			return NextResponse.json({ success: false, error: "Variant already exists" }, { status: 400 });
		}

		fs.mkdirSync(variantDir, { recursive: true });

		const variantConfig = {
			$schema: "../../variant.schema.json",
			id,
			name,
			description: description || "",
			defaultStrokeWidth: defaultStrokeWidth || 2,
			supportsStrokeWidth: supportsStrokeWidth !== false,
			fillType: fillType || "stroke",
		};

		fs.writeFileSync(path.join(variantDir, "variant.json"), JSON.stringify(variantConfig, null, 2));

		return NextResponse.json({
			success: true,
			variant: variantConfig,
		});
	} catch (error) {
		console.error("Error creating variant:", error);
		return NextResponse.json({ success: false, error: "Failed to create variant" }, { status: 500 });
	}
}
