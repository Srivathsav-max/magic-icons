"use client";

import {
	Alert,
	AlertDescription,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Label,
	ScrollArea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from "@magic-icons/ui";
import { useState } from "react";

interface UploadedIcon {
	file: File;
	iconId: string;
	variant: string;
	category: string;
	svgContent: string;
	status: "pending" | "uploading" | "success" | "error";
	error?: string;
	selected: boolean;
}

interface BulkUploadManagerProps {
	onComplete?: () => void;
}

export function BulkUploadManager({ onComplete }: BulkUploadManagerProps) {
	const [icons, setIcons] = useState<UploadedIcon[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [globalCategory, setGlobalCategory] = useState("action");
	const [globalVariant, setGlobalVariant] = useState("outline");

	const categories = [
		"user",
		"communication",
		"navigation",
		"media",
		"file",
		"commerce",
		"action",
		"security",
		"ui",
		"data",
		"time",
		"location",
		"status",
		"work",
		"misc",
	];

	const processSvgContent = (content: string): string => {
		let processed = content.replace(/fill="[^"]*"/g, 'fill="none"');
		processed = processed.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
		if (!processed.includes("fill=")) {
			processed = processed.replace(/<svg/, '<svg fill="none"');
		}
		if (!processed.includes("stroke=")) {
			processed = processed.replace(/<svg/, '<svg stroke="currentColor"');
		}
		return processed;
	};

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith(".svg"));
		await processFiles(droppedFiles);
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);
		await processFiles(selectedFiles);
	};

	// Fetch existing icons from metadata
	const fetchExistingIcons = async (): Promise<Set<string>> => {
		try {
			const response = await fetch("/api/metadata");
			if (response.ok) {
				const data = await response.json();
				return new Set(Object.keys(data));
			}
		} catch (error) {
			console.error("Failed to fetch existing icons:", error);
		}
		return new Set();
	};

	const processFiles = async (files: File[]) => {
		const newIcons: UploadedIcon[] = [];
		const existingIcons = await fetchExistingIcons();

		// Numeric suffix mapping
		const numericToVariant: Record<string, string> = {
			"01": "outline",
			"02": "broken",
			"03": "bulk",
			"04": "light",
			"05": "two-tone",
		};

		// Track icon name usage for duplicate handling
		const iconNameCount = new Map<string, number>();

		for (const file of files) {
			const content = await file.text();
			const processed = processSvgContent(content);

			// Extract icon name from filename (remove .svg)
			let fileName = file.name.replace(".svg", "");

			// Try to detect variant from filename
			const knownVariants = ["outline", "broken", "bulk", "light", "two-tone", "twoTone"];
			let detectedVariant = globalVariant;
			let iconName = fileName;

			// Check for numeric suffix first (e.g., bulb-01, bulb-02)
			const numericMatch = fileName.match(/^(.+)-(\d{2})$/);
			if (numericMatch) {
				const [, baseName, numericSuffix] = numericMatch;
				if (numericToVariant[numericSuffix]) {
					detectedVariant = numericToVariant[numericSuffix];
					iconName = baseName;
				}
			}

			// If no numeric match, check for variant name suffix
			if (!numericMatch) {
				for (const variant of knownVariants) {
					if (fileName.toLowerCase().endsWith(`-${variant.toLowerCase()}`)) {
						detectedVariant = variant === "twoTone" ? "two-tone" : variant;
						iconName = fileName.slice(0, -(variant.length + 1));
						break;
					}
				}
			}

			// Sanitize icon name: remove all numbers and clean up
			iconName = iconName
				.replace(/\d+/g, "") // Remove all numbers
				.replace(/([A-Z])/g, "-$1") // PascalCase to kebab-case
				.toLowerCase()
				.replace(/^-/, "") // Remove leading dash
				.replace(/\s+/g, "-") // Spaces to dashes
				.replace(/_/g, "-") // Underscores to dashes
				.replace(/[^a-z-]/g, "") // Remove invalid characters (only letters and dashes)
				.replace(/-+/g, "-") // Multiple dashes to single dash
				.replace(/^-|-$/g, ""); // Remove leading/trailing dashes

			// Check if this icon already exists
			if (existingIcons.has(iconName)) {
				// Icon exists - find next available variant suffix
				const baseIconName = iconName;
				const count = iconNameCount.get(baseIconName) || 0;
				iconNameCount.set(baseIconName, count + 1);

				// Generate suffix: one, two, three, etc.
				const suffixes = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
				if (count > 0 && count <= suffixes.length) {
					iconName = `${baseIconName}-${suffixes[count - 1]}`;
				}
			} else {
				// Track this as a new icon
				iconNameCount.set(iconName, 1);
			}

			newIcons.push({
				file,
				iconId: iconName,
				variant: detectedVariant,
				category: globalCategory,
				svgContent: processed,
				status: "pending",
				selected: true,
			});
		}

		setIcons((prev) => [...prev, ...newIcons]);
		if (newIcons.length > 0 && selectedIndex === null) {
			setSelectedIndex(icons.length);
		}
	};

	const updateIcon = (index: number, updates: Partial<UploadedIcon>) => {
		setIcons((prev) => prev.map((icon, i) => (i === index ? { ...icon, ...updates } : icon)));
	};

	const removeIcon = (index: number) => {
		setIcons((prev) => prev.filter((_, i) => i !== index));
		if (selectedIndex === index) {
			setSelectedIndex(null);
		} else if (selectedIndex !== null && selectedIndex > index) {
			setSelectedIndex(selectedIndex - 1);
		}
	};

	const toggleSelection = (index: number) => {
		updateIcon(index, { selected: !icons[index].selected });
	};

	const toggleAll = () => {
		const allSelected = icons.every((icon) => icon.selected);
		setIcons((prev) => prev.map((icon) => ({ ...icon, selected: !allSelected })));
	};

	const applyGlobalSettings = () => {
		setIcons((prev) =>
			prev.map((icon) => ({
				...icon,
				category: globalCategory,
				variant: globalVariant,
			})),
		);
	};

	const uploadAll = async () => {
		setUploading(true);

		for (let i = 0; i < icons.length; i++) {
			const icon = icons[i];
			if (icon.status === "success" || !icon.selected) continue;

			updateIcon(i, { status: "uploading" });

			try {
				const svgBlob = new Blob([icon.svgContent], { type: "image/svg+xml" });
				const svgFile = new File([svgBlob], icon.file.name, { type: "image/svg+xml" });

				const formData = new FormData();
				formData.append("iconId", icon.iconId);
				formData.append("category", icon.category);
				formData.append("variant", icon.variant);
				formData.append("svgFile", svgFile);

				const response = await fetch("/api/icons", {
					method: "POST",
					body: formData,
				});

				const data = await response.json();

				if (data.success) {
					updateIcon(i, { status: "success" });
				} else {
					updateIcon(i, { status: "error", error: data.error });
				}
			} catch (error) {
				updateIcon(i, { status: "error", error: "Upload failed" });
			}
		}

		setUploading(false);
		onComplete?.();
	};

	const selectedIcon = selectedIndex !== null ? icons[selectedIndex] : null;
	const successCount = icons.filter((i) => i.status === "success").length;
	const errorCount = icons.filter((i) => i.status === "error").length;
	const pendingCount = icons.filter((i) => i.status === "pending" && i.selected).length;
	const selectedCount = icons.filter((i) => i.selected).length;

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			{/* Left: File Upload & List */}
			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Bulk Upload</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div
							onDrop={handleDrop}
							onDragOver={(e) => {
								e.preventDefault();
								setIsDragging(true);
							}}
							onDragLeave={() => setIsDragging(false)}
							role="button"
							tabIndex={0}
							className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
								isDragging ? "border-primary bg-primary/5" : "border-border"
							}`}
						>
							<div className="flex flex-col items-center gap-2">
								<svg
									className="h-10 w-10 text-muted-foreground"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
								<p className="text-sm font-medium">Drag & drop SVG files</p>
								<Input
									type="file"
									accept=".svg"
									multiple
									onChange={handleFileChange}
									className="mt-2"
								/>
							</div>
						</div>

						{icons.length > 0 && (
							<div className="space-y-3">
								<div className="space-y-2">
									<Label>Apply to All Selected</Label>
									<div className="grid grid-cols-2 gap-2">
										<Select value={globalCategory} onValueChange={setGlobalCategory}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{categories.map((cat) => (
													<SelectItem key={cat} value={cat}>
														{cat}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Select value={globalVariant} onValueChange={setGlobalVariant}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{["outline", "broken", "bulk", "light", "two-tone"].map((v) => (
													<SelectItem key={v} value={v}>
														{v}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<Button
										type="button"
										onClick={applyGlobalSettings}
										variant="outline"
										className="w-full"
										size="sm"
									>
										Apply to Selected
									</Button>
								</div>

								<div className="flex items-center justify-between text-sm">
									<span>
										{selectedCount} of {icons.length} selected
									</span>
									<div className="flex gap-2 text-xs">
										{successCount > 0 && <span className="text-green-600">✓ {successCount}</span>}
										{errorCount > 0 && <span className="text-red-600">✗ {errorCount}</span>}
										{pendingCount > 0 && (
											<span className="text-muted-foreground">○ {pendingCount}</span>
										)}
									</div>
								</div>

								<Button
									onClick={uploadAll}
									disabled={uploading || pendingCount === 0}
									className="w-full"
								>
									{uploading
										? "Uploading..."
										: `Upload ${pendingCount} Icon${pendingCount !== 1 ? "s" : ""}`}
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{icons.length > 0 && (
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Icon List</CardTitle>
								<Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
									{icons.every((i) => i.selected) ? "Deselect All" : "Select All"}
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[400px]">
								<div className="space-y-2">
									{icons.map((icon, index) => (
										<div
											key={index}
											className={`rounded-md border p-3 transition-colors ${
												selectedIndex === index
													? "border-primary bg-primary/5"
													: "border-border hover:bg-accent"
											}`}
										>
											<div className="flex items-center gap-2">
												<input
													type="checkbox"
													checked={icon.selected}
													onChange={() => toggleSelection(index)}
													className="h-4 w-4"
												/>
												<button
													type="button"
													onClick={() => setSelectedIndex(index)}
													className="flex-1 min-w-0 text-left"
												>
													<div className="flex items-center gap-2">
														<span className="font-medium truncate">{icon.iconId}</span>
														{icon.status === "success" && <span className="text-green-600">✓</span>}
														{icon.status === "error" && <span className="text-red-600">✗</span>}
														{icon.status === "uploading" && (
															<span className="text-blue-600">⟳</span>
														)}
													</div>
													<div className="text-xs text-muted-foreground">
														{icon.variant} • {icon.category}
													</div>
												</button>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														removeIcon(index);
													}}
												>
													×
												</Button>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Right: Icon Preview & Editor */}
			{selectedIcon && (
				<div className="lg:col-span-2 space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Icon Preview</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-center gap-4 rounded-md border border-border bg-muted/20 p-8">
								<div className="flex flex-col items-center gap-2">
									<div
										className="flex h-16 w-16 items-center justify-center rounded-md bg-background"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - admin tool with user's own SVG content
										dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent }}
									/>
									<span className="text-xs text-muted-foreground">Light</span>
								</div>
								<div className="flex flex-col items-center gap-2">
									<div
										className="flex h-16 w-16 items-center justify-center rounded-md bg-foreground"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - admin tool with user's own SVG content
										dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent }}
									/>
									<span className="text-xs text-muted-foreground">Dark</span>
								</div>
								<div className="flex flex-col items-center gap-2">
									<div
										className="flex h-16 w-16 items-center justify-center rounded-md bg-blue-500"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - admin tool with user's own SVG content
										dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent }}
									/>
									<span className="text-xs text-muted-foreground">Colored</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Icon Settings</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label htmlFor="iconId">Icon ID</Label>
								<Input
									id="iconId"
									value={selectedIcon.iconId}
									onChange={(e) => updateIcon(selectedIndex!, { iconId: e.target.value })}
									placeholder="e.g., arrow-up"
								/>
							</div>

							<div>
								<Label htmlFor="variant">Variant</Label>
								<Select
									value={selectedIcon.variant}
									onValueChange={(value) => updateIcon(selectedIndex!, { variant: value })}
								>
									<SelectTrigger id="variant">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{["outline", "broken", "bulk", "light", "two-tone"].map((v) => (
											<SelectItem key={v} value={v}>
												{v}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="category">Category</Label>
								<Select
									value={selectedIcon.category}
									onValueChange={(value) => updateIcon(selectedIndex!, { category: value })}
								>
									<SelectTrigger id="category">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{categories.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="svgContent">SVG Content</Label>
								<Textarea
									id="svgContent"
									value={selectedIcon.svgContent}
									onChange={(e) => updateIcon(selectedIndex!, { svgContent: e.target.value })}
									rows={10}
									className="font-mono text-sm"
								/>
							</div>

							{selectedIcon.status === "error" && selectedIcon.error && (
								<Alert variant="error">
									<AlertDescription>{selectedIcon.error}</AlertDescription>
								</Alert>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
