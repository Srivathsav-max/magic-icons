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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea, // Add Textarea import
} from "@magic-icons/ui";
import { useState } from "react";

interface IconUploadProps {
	onUploadSuccess?: (iconId?: string) => void;
}

export function IconUpload({ onUploadSuccess }: IconUploadProps) {
	const [iconId, setIconId] = useState("");
	const [category, setCategory] = useState("action");
	const [variant, setVariant] = useState("outline");
	const [file, setFile] = useState<File | null>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [svgContent, setSvgContent] = useState("");
	const [uploading, setUploading] = useState(false);
	const [message, setMessage] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single");

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

	const variants = ["outline", "broken", "bulk", "light", "two-tone"];

	const processSvgContent = (content: string): string => {
		// Replace fill attributes with none
		let processed = content.replace(/fill="[^"]*"/g, 'fill="none"');
		// Replace stroke attributes with currentColor
		processed = processed.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
		// Add fill="none" and stroke="currentColor" to svg tag if not present
		if (!processed.includes("fill=")) {
			processed = processed.replace(/<svg/, '<svg fill="none"');
		}
		if (!processed.includes("stroke=")) {
			processed = processed.replace(/<svg/, '<svg stroke="currentColor"');
		}
		return processed;
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (uploadMode === "single") {
			const selectedFile = e.target.files?.[0];
			if (selectedFile) {
				setFile(selectedFile);
				const content = await selectedFile.text();
				const processed = processSvgContent(content);
				setSvgContent(processed);
			}
		} else {
			const selectedFiles = Array.from(e.target.files || []);
			setFiles(selectedFiles);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith(".svg"));
		if (droppedFiles.length > 0) {
			setFiles(droppedFiles);
			setUploadMode("bulk");
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (uploadMode === "single") {
			if (!file || !iconId) {
				setMessage("Please provide icon ID and SVG file");
				return;
			}

			setUploading(true);
			setMessage("");

			try {
				const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
				const svgFile = new File([svgBlob], file.name, { type: "image/svg+xml" });

				const formData = new FormData();
				formData.append("iconId", iconId);
				formData.append("category", category);
				formData.append("variant", variant);
				formData.append("svgFile", svgFile);

				const response = await fetch("/api/icons", {
					method: "POST",
					body: formData,
				});

				const data = await response.json();

				if (data.success) {
					setMessage("Icon uploaded successfully!");
					const uploadedId = iconId;
					setIconId("");
					setFile(null);
					setSvgContent("");
					onUploadSuccess?.(uploadedId);
				} else {
					setMessage(`Error: ${data.error}`);
				}
			} catch (error) {
				setMessage("Failed to upload icon");
				console.error(error);
			} finally {
				setUploading(false);
			}
		} else {
			if (files.length === 0) {
				setMessage("Please select SVG files to upload");
				return;
			}

			setUploading(true);
			setMessage("");

			let successCount = 0;
			let failCount = 0;

			for (const file of files) {
				try {
					const content = await file.text();
					const processed = processSvgContent(content);
					const svgBlob = new Blob([processed], { type: "image/svg+xml" });
					const svgFile = new File([svgBlob], file.name, { type: "image/svg+xml" });

					// Extract icon info from filename (e.g., "arrow-up-outline.svg")
					const fileName = file.name.replace(".svg", "");
					const parts = fileName.split("-");
					const variantName = parts[parts.length - 1];
					const iconName = parts.slice(0, -1).join("-");

					const formData = new FormData();
					formData.append("iconId", iconName);
					formData.append("category", category);
					formData.append("variant", variantName);
					formData.append("svgFile", svgFile);

					const response = await fetch("/api/icons", {
						method: "POST",
						body: formData,
					});

					const data = await response.json();
					if (data.success) {
						successCount++;
					} else {
						failCount++;
					}
				} catch (error) {
					failCount++;
					console.error(`Failed to upload ${file.name}:`, error);
				}
			}

			setMessage(`Uploaded ${successCount} icons successfully. ${failCount} failed.`);
			setFiles([]);
			setUploading(false);
			onUploadSuccess?.();
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Upload Icon</CardTitle>
					<div className="flex gap-2">
						<Button
							type="button"
							variant={uploadMode === "single" ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setUploadMode("single");
								setFiles([]);
							}}
						>
							Single
						</Button>
						<Button
							type="button"
							variant={uploadMode === "bulk" ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setUploadMode("bulk");
								setFile(null);
								setSvgContent("");
							}}
						>
							Bulk
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{uploadMode === "bulk" && (
						<div
							onDrop={handleDrop}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							role="button"
							tabIndex={0}
							className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
								isDragging ? "border-primary bg-primary/5" : "border-border"
							}`}
						>
							<div className="flex flex-col items-center gap-2">
								<svg
									className="h-12 w-12 text-muted-foreground"
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
								<p className="text-sm font-medium">Drag and drop SVG files here</p>
								<p className="text-xs text-muted-foreground">or click to browse</p>
								<Input
									type="file"
									accept=".svg"
									multiple
									onChange={handleFileChange}
									className="mt-2"
								/>
							</div>
						</div>
					)}

					{uploadMode === "bulk" && files.length > 0 && (
						<div>
							<Label>Selected Files ({files.length})</Label>
							<div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-2">
								{files.map((file, index) => (
									<div
										key={index}
										className="flex items-center justify-between rounded bg-muted px-3 py-2"
									>
										<span className="text-sm truncate">{file.name}</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeFile(index)}
										>
											×
										</Button>
									</div>
								))}
							</div>
						</div>
					)}
					{uploadMode === "single" && (
						<div>
							<Label htmlFor="iconId">Icon ID (kebab-case)</Label>
							<Input
								id="iconId"
								type="text"
								value={iconId}
								onChange={(e) => setIconId(e.target.value)}
								placeholder="e.g., arrow-up"
								required
							/>
						</div>
					)}
					{uploadMode === "single" && (
						<div>
							<Label htmlFor="category">Category</Label>
							<Select value={category} onValueChange={setCategory}>
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
					)}
					{uploadMode === "single" && (
						<div>
							<Label htmlFor="variant">Variant</Label>
							<Select value={variant} onValueChange={setVariant}>
								<SelectTrigger id="variant">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{variants.map((v) => (
										<SelectItem key={v} value={v}>
											{v}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{uploadMode === "single" && (
						<div>
							<Label htmlFor="file">SVG File</Label>
							<Input id="file" type="file" accept=".svg" onChange={handleFileChange} required />
						</div>
					)}

					{uploadMode === "single" && svgContent && (
						<div className="space-y-4">
							<div>
								<Label>SVG Preview</Label>
								<div className="mt-2 flex items-center justify-center gap-4 rounded-md border border-border bg-muted/20 p-8">
									<div className="flex flex-col items-center gap-2">
										<div className="flex h-16 w-16 items-center justify-center rounded-md bg-background" />
										<span className="text-xs text-muted-foreground">Light</span>
									</div>
									<div className="flex flex-col items-center gap-2">
										<div className="flex h-16 w-16 items-center justify-center rounded-md bg-foreground" />
										<span className="text-xs text-muted-foreground">Dark</span>
									</div>
									<div className="flex flex-col items-center gap-2">
										<div className="flex h-16 w-16 items-center justify-center rounded-md bg-blue-500" />
										<span className="text-xs text-muted-foreground">Colored</span>
									</div>
								</div>
							</div>

							<div>
								<Label htmlFor="svgContent">SVG Content (Editable)</Label>
								<Textarea
									id="svgContent"
									value={svgContent}
									onChange={(e) => setSvgContent(e.target.value)}
									rows={10}
									className="font-mono text-sm"
									placeholder="SVG content will appear here..."
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Automatically replaced fill with "none" and stroke with "currentColor"
								</p>
							</div>
						</div>
					)}

					{uploadMode === "bulk" && (
						<div>
							<Label htmlFor="category">Category (applies to all)</Label>
							<Select value={category} onValueChange={setCategory}>
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
					)}

					<Button type="submit" disabled={uploading} className="w-full">
						{uploading ? "Uploading..." : "Upload Icon"}
					</Button>

					{message && (
						<Alert
							variant={
								message.includes("Error") || message.includes("Failed") ? "error" : "success"
							}
						>
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
