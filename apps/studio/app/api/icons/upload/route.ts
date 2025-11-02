import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "icons");

// Number to word mapping for icon names starting with numbers
const numberToWord: Record<string, string> = {
	"0": "zero",
	"1": "one",
	"2": "two",
	"3": "three",
	"4": "four",
	"5": "five",
	"6": "six",
	"7": "seven",
	"8": "eight",
	"9": "nine",
};

// Sanitize icon name to be a valid JavaScript identifier
function sanitizeIconName(name: string): string {
	// Convert all numbers to words
	return name.replace(/\d/g, (digit) => numberToWord[digit] || digit);
}

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const variant = formData.get("variant") as string;
		const category = formData.get("category") as string;
		const files = formData.getAll("files") as File[];

		if (!variant || !category || files.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const variantDir = path.join(ICONS_BASE_DIR, variant);

		if (!fs.existsSync(variantDir)) {
			return NextResponse.json({ success: false, error: "Variant does not exist" }, { status: 400 });
		}

		const uploadedIcons = [];

		for (const file of files) {
			const fileName = file.name.replace(/\.svg$/i, "");
			const cleanName = fileName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
			const iconName = sanitizeIconName(cleanName);

			// Read SVG content
			const svgContent = await file.text();

			// Save SVG file (without auto-optimization)
			const svgPath = path.join(variantDir, `${iconName}.svg`);
			fs.writeFileSync(svgPath, svgContent);

			// Create metadata file
			const metadataPath = path.join(variantDir, `${iconName}.json`);
			const metadata = {
				$schema: "../../icon.schema.json",
				name: iconName,
				category: category,
				tags: [iconName, category],
				description: `${iconName} icon`,
				variant: variant,
				strokeWidth: 2,
				aliases: [],
				deprecated: false,
			};

			fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

			uploadedIcons.push({
				name: iconName,
				originalName: fileName,
				svgPath,
				metadataPath,
			});
		}

		return NextResponse.json({
			success: true,
			message: `Uploaded ${uploadedIcons.length} icon(s)`,
			icons: uploadedIcons,
		});
	} catch (error) {
		console.error("Error uploading icons:", error);
		return NextResponse.json({ success: false, error: "Failed to upload icons" }, { status: 500 });
	}
}
