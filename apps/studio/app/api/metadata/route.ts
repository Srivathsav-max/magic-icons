import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const METADATA_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "metadata", "icons");
const ICONS_BASE_DIR = path.join(process.cwd(), "..", "..", "packages", "react", "icons");

// GET: Get metadata for a specific icon
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const iconId = searchParams.get("iconId");

		if (!iconId) {
			return NextResponse.json({ success: false, error: "Icon ID is required" }, { status: 400 });
		}

		const metadataPath = path.join(METADATA_DIR, `${iconId}.json`);

		if (!fs.existsSync(metadataPath)) {
			return NextResponse.json({ success: false, error: "Metadata not found" }, { status: 404 });
		}

		const content = fs.readFileSync(metadataPath, "utf-8");
		const metadata = JSON.parse(content);

		return NextResponse.json({
			success: true,
			metadata,
		});
	} catch (error) {
		console.error("Error fetching metadata:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch metadata" },
			{ status: 500 },
		);
	}
}

// POST: Create or update metadata
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { iconId, metadata } = body;

		if (!iconId || !metadata) {
			return NextResponse.json(
				{ success: false, error: "Icon ID and metadata are required" },
				{ status: 400 },
			);
		}

		// Ensure metadata directory exists
		if (!fs.existsSync(METADATA_DIR)) {
			fs.mkdirSync(METADATA_DIR, { recursive: true });
		}

		// Update lastModified date
		metadata.metadata = {
			...metadata.metadata,
			lastModified: new Date().toISOString().split("T")[0],
		};

		const metadataPath = path.join(METADATA_DIR, `${iconId}.json`);
		fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, "\t"));

		return NextResponse.json({
			success: true,
			message: "Metadata saved successfully",
			metadata,
		});
	} catch (error) {
		console.error("Error saving metadata:", error);
		return NextResponse.json({ success: false, error: "Failed to save metadata" }, { status: 500 });
	}
}

// PUT: Update existing metadata
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { iconId, updates } = body;

		if (!iconId || !updates) {
			return NextResponse.json(
				{ success: false, error: "Icon ID and updates are required" },
				{ status: 400 },
			);
		}

		const metadataPath = path.join(METADATA_DIR, `${iconId}.json`);

		if (!fs.existsSync(metadataPath)) {
			return NextResponse.json({ success: false, error: "Metadata not found" }, { status: 404 });
		}

		const content = fs.readFileSync(metadataPath, "utf-8");
		const metadata = JSON.parse(content);

		const updatedMetadata = {
			...metadata,
			...updates,
			metadata: {
				...metadata.metadata,
				...updates.metadata,
				lastModified: new Date().toISOString().split("T")[0],
			},
		};

		fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, "\t"));
		if (updatedMetadata.category && updatedMetadata.variants) {
			const categoryDir = path.join(ICONS_BASE_DIR, updatedMetadata.category);

			if (fs.existsSync(categoryDir)) {
				for (const [variantKey] of Object.entries(updatedMetadata.variants)) {
					const variantFileName = `${iconId}-${variantKey}.json`;
					const variantFilePath = path.join(categoryDir, variantFileName);

					if (fs.existsSync(variantFilePath)) {
						const iconMetadata = {
							$schema: "../icon.schema.json",
							variant: variantKey,
							contributors: [updatedMetadata.metadata?.author || "Admin"],
							tags: updatedMetadata.tags || [],
							categories: [updatedMetadata.category],
							aliases: updatedMetadata.aliases || [],
							deprecated: updatedMetadata.metadata?.isDeprecated || false,
						};

						fs.writeFileSync(variantFilePath, JSON.stringify(iconMetadata, null, "\t"));
					}
				}
			}
		}

		return NextResponse.json({
			success: true,
			message: "Metadata updated successfully",
			metadata: updatedMetadata,
		});
	} catch (error) {
		console.error("Error updating metadata:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update metadata" },
			{ status: 500 },
		);
	}
}

// DELETE: Delete metadata
export async function DELETE(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const iconId = searchParams.get("iconId");

		if (!iconId) {
			return NextResponse.json({ success: false, error: "Icon ID is required" }, { status: 400 });
		}

		const metadataPath = path.join(METADATA_DIR, `${iconId}.json`);

		if (!fs.existsSync(metadataPath)) {
			return NextResponse.json({ success: false, error: "Metadata not found" }, { status: 404 });
		}

		fs.unlinkSync(metadataPath);

		return NextResponse.json({
			success: true,
			message: "Metadata deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting metadata:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete metadata" },
			{ status: 500 },
		);
	}
}
