"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@magic-icons/ui";
import { useState } from "react";
import { IconList } from "@/components/icon-list";
import { IconUpload } from "@/components/icon-upload";
import { MetadataCreator } from "@/components/metadata-creator";
import { MetadataEditor } from "@/components/metadata-editor";
import { BulkUploadManager } from "@/components/bulk-upload-manager";

export default function Home() {
	const [selectedIconId, setSelectedIconId] = useState<string | undefined>();
	const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [activeTab, setActiveTab] = useState<"upload" | "bulk" | "edit">("upload");
	const [showMetadataForm, setShowMetadataForm] = useState(false);
	const [uploadedIconId, setUploadedIconId] = useState<string | undefined>();
	const [building, setBuilding] = useState(false);
	const [buildMessage, setBuildMessage] = useState("");

	const handleRefresh = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	const handleUploadSuccess = (iconId?: string) => {
		setUploadedIconId(iconId);
		setShowMetadataForm(true);
		handleRefresh();
	};

	const handleMetadataSuccess = () => {
		setShowMetadataForm(false);
		setUploadedIconId(undefined);
		handleRefresh();
	};

	const handleBuild = async () => {
		setBuilding(true);
		setBuildMessage("Building icons...");

		try {
			const response = await fetch("/api/build", { method: "POST" });
			const data = await response.json();

			if (data.success) {
				setBuildMessage("✅ Icons built successfully!");
			} else {
				setBuildMessage(`❌ Build failed: ${data.error}`);
			}
		} catch (error) {
			setBuildMessage("❌ Failed to build icons");
			console.error(error);
		} finally {
			setBuilding(false);
			setTimeout(() => setBuildMessage(""), 5000);
		}
	};

	return (
		<div className="min-h-screen bg-background font-sans">
			<header className="border-b border-border bg-card">
				<div className="mx-auto max-w-7xl px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold">Magic Icons Studio</h1>
							<p className="mt-2 text-muted-foreground">
								Manage SVG icons and metadata for your icon library
							</p>
						</div>
						<div className="flex flex-col items-end gap-2">
							<Button
								type="button"
								onClick={handleBuild}
								disabled={building}
								size="lg"
							>
								{building ? "Building..." : "🔨 Build Icons"}
							</Button>
							{buildMessage && (
								<p className="text-sm font-medium">{buildMessage}</p>
							)}
						</div>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-8">
				{/* Tab Navigation */}
				<Card className="mb-6">
					<CardContent className="pt-6">
						<div className="flex gap-2">
							<Button
								type="button"
								variant={activeTab === "upload" ? "default" : "outline"}
								onClick={() => setActiveTab("upload")}
							>
								Upload
							</Button>
							<Button
								type="button"
								variant={activeTab === "bulk" ? "default" : "outline"}
								onClick={() => setActiveTab("bulk")}
							>
								Bulk Upload
							</Button>
							<Button
								type="button"
								variant={activeTab === "edit" ? "default" : "outline"}
								onClick={() => setActiveTab("edit")}
							>
								Edit
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Upload Tab */}
				{activeTab === "upload" && (
					<div className="grid gap-6 lg:grid-cols-2">
						<IconUpload onUploadSuccess={handleUploadSuccess} />
						{showMetadataForm && (
							<MetadataCreator iconId={uploadedIconId} onCreateSuccess={handleMetadataSuccess} />
						)}
					</div>
				)}

				{/* Bulk Upload Tab */}
				{activeTab === "bulk" && <BulkUploadManager onComplete={handleRefresh} />}

				{/* Edit Tab */}
				{activeTab === "edit" && (
					<div className="grid gap-6 lg:grid-cols-3">
						<div>
							<IconList
								onSelectIcon={(id, category) => {
									setSelectedIconId(id);
									setSelectedCategory(category);
								}}
								refreshTrigger={refreshTrigger}
							/>
						</div>
						<div className="lg:col-span-2 space-y-6">
							<MetadataEditor iconId={selectedIconId} onSaveSuccess={handleRefresh} />
						</div>
					</div>
				)}

				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Quick Guide</CardTitle>
						<CardDescription>Learn how to use the studio</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 text-sm">
							<div>
								<strong className="text-foreground">Upload Icon:</strong>
								<span className="text-muted-foreground">
									{" "}
									Upload SVG files for your icons. Choose the category and variant type.
								</span>
							</div>
							<div>
								<strong className="text-foreground">Create Metadata:</strong>
								<span className="text-muted-foreground">
									{" "}
									Create metadata entries for new icons with all necessary information.
								</span>
							</div>
							<div>
								<strong className="text-foreground">Edit Metadata:</strong>
								<span className="text-muted-foreground">
									{" "}
									Select an icon from the list to edit its metadata, tags, and properties.
								</span>
							</div>
							<div>
								<strong className="text-foreground">Icon ID Format:</strong>
								<span className="text-muted-foreground">
									{" "}
									Use kebab-case (e.g., arrow-up, user-profile).
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
