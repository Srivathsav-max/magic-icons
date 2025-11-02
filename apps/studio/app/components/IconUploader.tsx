"use client";

import {
	Badge,
	Button,
	Card,
	CardContent,
	Checkbox,
	Input,
	Label,
	Textarea,
} from "@magic-icons/ui";
import { ArrowLeft, Cross, Import } from "magic-icons";
import { useState } from "react";

interface UploadedIcon {
	name: string;
	originalName: string;
	svgPath: string;
	metadataPath: string;
	svgContent?: string;
	originalSvgContent?: string;
}

interface IconMetadata {
	name: string;
	category: string;
	tags: string[];
	description: string;
	variant: string;
	strokeWidth: number;
	aliases: string[];
	deprecated: boolean;
}

export default function IconUploader({
	variant,
	category,
	onBack,
}: {
	variant: string;
	category: string;
	onBack: () => void;
}) {
	const [uploadedIcons, setUploadedIcons] = useState<UploadedIcon[]>([]);
	const [selectedIcon, setSelectedIcon] = useState<UploadedIcon | null>(null);
	const [metadata, setMetadata] = useState<IconMetadata>({
		name: "",
		category,
		tags: [],
		description: "",
		variant,
		strokeWidth: 2,
		aliases: [],
		deprecated: false,
	});
	const [uploading, setUploading] = useState(false);
	const [building, setBuilding] = useState(false);
	const [tagInput, setTagInput] = useState("");
	const [aliasInput, setAliasInput] = useState("");
	const [optimizing, setOptimizing] = useState(false);
	const [showComparison, setShowComparison] = useState(false);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		setUploading(true);
		const formData = new FormData();
		formData.append("variant", variant);
		formData.append("category", category);

		for (const file of Array.from(files)) {
			formData.append("files", file);
		}

		try {
			const res = await fetch("/api/icons/upload", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();

			if (data.success) {
				// Load SVG content for preview
				const iconsWithContent = await Promise.all(
					data.icons.map(async (icon: UploadedIcon) => {
						try {
							const svgRes = await fetch(
								`/api/icons/preview?path=${encodeURIComponent(icon.svgPath)}`,
							);
							const svgContent = await svgRes.text();
							return { ...icon, svgContent };
						} catch {
							return icon;
						}
					}),
				);

				setUploadedIcons(iconsWithContent);
				if (iconsWithContent.length > 0) {
					selectIcon(iconsWithContent[0]);
				}
			}
		} catch (error) {
			console.error("Error uploading icons:", error);
		} finally {
			setUploading(false);
		}
	};

	const selectIcon = async (icon: UploadedIcon) => {
		setSelectedIcon(icon);

		// Load metadata
		try {
			const res = await fetch(`/api/icons/preview?path=${encodeURIComponent(icon.metadataPath)}`);
			const data = await res.json();
			setMetadata(data);
		} catch (error) {
			console.error("Error loading metadata:", error);
		}
	};

	const handleSaveMetadata = async () => {
		if (!selectedIcon) return;

		try {
			const res = await fetch("/api/icons/metadata", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					path: selectedIcon.metadataPath,
					metadata,
				}),
			});

			if (res.ok) {
				alert("Metadata saved successfully!");
			}
		} catch (error) {
			console.error("Error saving metadata:", error);
		}
	};

	const handleOptimizeSvg = async () => {
		if (!selectedIcon) return;

		setOptimizing(true);
		try {
			const res = await fetch("/api/icons/optimizer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ path: selectedIcon.svgPath, variant }),
			});
			const data = await res.json();

			if (data.success) {
				const optimizedSvg = data.svg as string;
				// Store original SVG before optimization
				const originalSvg = selectedIcon.svgContent;
				setSelectedIcon((prev) =>
					prev ? { ...prev, svgContent: optimizedSvg, originalSvgContent: originalSvg } : prev,
				);
				setUploadedIcons((prev) =>
					prev.map((icon) =>
						icon.name === selectedIcon.name
							? { ...icon, svgContent: optimizedSvg, originalSvgContent: originalSvg }
							: icon,
					),
				);
				setShowComparison(true);
				alert("Icon optimized successfully!");
			} else {
				alert(data.error ?? "Failed to optimize icon");
			}
		} catch (error) {
			console.error("Error optimizing icon:", error);
			alert("Failed to optimize icon");
		} finally {
			setOptimizing(false);
		}
	};

	const handleBuild = async () => {
		setBuilding(true);
		try {
			const res = await fetch("/api/build", { method: "POST" });
			const data = await res.json();

			if (data.success) {
				alert("Icons built successfully!");
			} else {
				alert(`Build failed: ${data.error}`);
			}
		} catch (error) {
			console.error("Error building icons:", error);
			alert("Build failed");
		} finally {
			setBuilding(false);
		}
	};

	const addTag = () => {
		if (tagInput && !metadata.tags.includes(tagInput)) {
			setMetadata({ ...metadata, tags: [...metadata.tags, tagInput] });
			setTagInput("");
		}
	};

	const removeTag = (tag: string) => {
		setMetadata({ ...metadata, tags: metadata.tags.filter((t) => t !== tag) });
	};

	const addAlias = () => {
		if (aliasInput && !metadata.aliases.includes(aliasInput)) {
			setMetadata({ ...metadata, aliases: [...metadata.aliases, aliasInput] });
			setAliasInput("");
		}
	};

	const removeAlias = (alias: string) => {
		setMetadata({ ...metadata, aliases: metadata.aliases.filter((a) => a !== alias) });
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-2xl font-bold text-foreground mb-2">Upload Icons</h2>
							<p className="text-muted-foreground">
								Upload SVG files for {variant} variant in {category} category
							</p>
						</div>
						<Button variant="ghost" onClick={onBack} className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Back
						</Button>
					</div>

					{/* Upload Area */}
					<div className="mb-6">
						<label className="block w-full cursor-pointer">
							<Card className="border-2 border-dashed hover:border-primary hover:bg-accent transition-all">
								<CardContent className="p-12 text-center">
									<Import className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
									<p className="text-lg font-medium text-foreground mb-2">
										{uploading ? "Uploading..." : "Click to upload or drag and drop"}
									</p>
									<p className="text-sm text-muted-foreground">
										SVG files only (single or multiple)
									</p>
								</CardContent>
							</Card>
							<input
								type="file"
								accept=".svg"
								multiple
								onChange={handleFileUpload}
								className="hidden"
								disabled={uploading}
							/>
						</label>
					</div>

					{/* Icons Grid and Editor */}
					{uploadedIcons.length > 0 && (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Icons List */}
							<div className="lg:col-span-1 space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-foreground">Uploaded Icons</h3>
									<Badge>{uploadedIcons.length}</Badge>
								</div>
								<div className="space-y-2 max-h-[600px] overflow-y-auto">
									{uploadedIcons.map((icon) => (
										<Card
											key={icon.name}
											className={`cursor-pointer transition-all ${
												selectedIcon?.name === icon.name
													? "border-primary shadow-md"
													: "hover:border-primary/50"
											}`}
											onClick={() => selectIcon(icon)}
										>
											<CardContent className="p-4">
												<div className="flex items-center gap-3">
													<div
														className="w-10 h-10 flex items-center justify-center bg-muted rounded"
														dangerouslySetInnerHTML={{ __html: icon.svgContent || "" }}
													/>
													<div className="flex-1 min-w-0">
														<p className="font-medium text-foreground truncate">{icon.name}</p>
														<p className="text-xs text-muted-foreground truncate">
															{icon.originalName}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>

							{/* Metadata Editor */}
							{selectedIcon && (
								<div className="lg:col-span-2 space-y-6">
									<div className="flex items-center justify-between">
										<h3 className="font-semibold text-foreground">Edit Metadata</h3>
										<div className="flex gap-2">
											<Button variant="outline" onClick={handleOptimizeSvg} disabled={optimizing}>
												{optimizing ? "Optimizing..." : "Optimize SVG"}
											</Button>
											<Button onClick={handleSaveMetadata}>Save Metadata</Button>
										</div>
									</div>

									{/* Before/After Comparison */}
									{showComparison && selectedIcon.originalSvgContent ? (
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<h4 className="text-sm font-semibold text-foreground">
													Optimization Comparison
												</h4>
												<Button variant="ghost" size="sm" onClick={() => setShowComparison(false)}>
													<Cross className="h-4 w-4" />
												</Button>
											</div>
											<div className="grid grid-cols-2 gap-4">
												{/* Before */}
												<div className="space-y-2">
													<div className="flex items-center justify-between">
														<Label className="text-xs font-semibold">Before Optimization</Label>
														<Badge variant="secondary" className="text-xs">
															{selectedIcon.originalSvgContent.length} chars
														</Badge>
													</div>
													<Card>
														<CardContent className="p-6 flex items-center justify-center bg-muted/30">
															<div
																className="w-20 h-20"
																dangerouslySetInnerHTML={{
																	__html: selectedIcon.originalSvgContent,
																}}
															/>
														</CardContent>
													</Card>
													<Textarea
														value={selectedIcon.originalSvgContent}
														readOnly
														className="font-mono text-xs h-48"
													/>
												</div>
												{/* After */}
												<div className="space-y-2">
													<div className="flex items-center justify-between">
														<Label className="text-xs font-semibold">After Optimization</Label>
														<Badge variant="default" className="text-xs">
															{selectedIcon.svgContent?.length || 0} chars
															{selectedIcon.svgContent && (
																<span className="ml-1 text-green-400">
																	(-
																	{Math.round(
																		((selectedIcon.originalSvgContent.length -
																			selectedIcon.svgContent.length) /
																			selectedIcon.originalSvgContent.length) *
																			100,
																	)}
																	%)
																</span>
															)}
														</Badge>
													</div>
													<Card>
														<CardContent className="p-6 flex items-center justify-center bg-muted/30">
															<div
																className="w-20 h-20"
																dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent || "" }}
															/>
														</CardContent>
													</Card>
													<Textarea
														value={selectedIcon.svgContent || ""}
														readOnly
														className="font-mono text-xs h-48"
													/>
												</div>
											</div>
										</div>
									) : (
										<Card>
											<CardContent className="p-8 flex items-center justify-center">
												<div
													className="w-24 h-24"
													dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent || "" }}
												/>
											</CardContent>
										</Card>
									)}

									{/* Metadata Form */}
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="icon-name">Icon Name</Label>
											<Input
												id="icon-name"
												type="text"
												value={metadata.name}
												onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="icon-description">Description</Label>
											<Textarea
												id="icon-description"
												value={metadata.description}
												onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
												rows={3}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="tag-input">Tags</Label>
											<div className="flex gap-2">
												<Input
													id="tag-input"
													type="text"
													value={tagInput}
													onChange={(e) => setTagInput(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															addTag();
														}
													}}
													placeholder="Add tag..."
													className="flex-1"
												/>
												<Button type="button" onClick={addTag} variant="secondary">
													Add
												</Button>
											</div>
											<div className="flex flex-wrap gap-2">
												{metadata.tags.map((tag) => (
													<Badge key={tag} variant="default" className="gap-1">
														{tag}
														<button
															type="button"
															onClick={() => removeTag(tag)}
															className="ml-1 hover:text-destructive"
														>
															<Cross className="h-3 w-3" />
														</button>
													</Badge>
												))}
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="alias-input">Aliases</Label>
											<div className="flex gap-2">
												<Input
													id="alias-input"
													type="text"
													value={aliasInput}
													onChange={(e) => setAliasInput(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															addAlias();
														}
													}}
													placeholder="Add alias..."
													className="flex-1"
												/>
												<Button type="button" onClick={addAlias} variant="secondary">
													Add
												</Button>
											</div>
											<div className="flex flex-wrap gap-2">
												{metadata.aliases.map((alias) => (
													<Badge key={alias} variant="secondary" className="gap-1">
														{alias}
														<button
															type="button"
															onClick={() => removeAlias(alias)}
															className="ml-1 hover:text-destructive"
														>
															<Cross className="h-3 w-3" />
														</button>
													</Badge>
												))}
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="stroke-width">Stroke Width</Label>
											<Input
												id="stroke-width"
												type="number"
												value={metadata.strokeWidth}
												onChange={(e) =>
													setMetadata({ ...metadata, strokeWidth: Number(e.target.value) })
												}
											/>
										</div>

										<div className="flex items-center gap-2">
											<Checkbox
												id="deprecated"
												checked={metadata.deprecated}
												onCheckedChange={(checked) =>
													setMetadata({ ...metadata, deprecated: !!checked })
												}
											/>
											<Label htmlFor="deprecated" className="cursor-pointer">
												Mark as deprecated
											</Label>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Build Button */}
					{uploadedIcons.length > 0 && (
						<div className="mt-8 pt-6 border-t">
							<Button onClick={handleBuild} disabled={building} className="w-full" size="lg">
								{building ? "Building..." : "Build Icons & Generate React Components"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
