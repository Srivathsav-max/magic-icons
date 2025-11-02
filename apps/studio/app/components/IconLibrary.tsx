"use client";

import {
	Badge,
	Button,
	Card,
	CardContent,
	Checkbox,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Textarea,
} from "@magic-icons/ui";
import { Cross, MagicStar, Search } from "magic-icons";
import { useEffect, useState } from "react";

interface IconData {
	name: string;
	category: string;
	tags: string[];
	description: string;
	variant: string;
	strokeWidth: number;
	aliases: string[];
	deprecated: boolean;
	svgPath?: string;
	metadataPath?: string;
	svgContent?: string;
}

interface IconMetadata {
	$schema: string;
	name: string;
	category: string;
	tags: string[];
	description: string;
	variant: string;
	strokeWidth: number;
	aliases: string[];
	deprecated: boolean;
	deprecationReason?: string;
}

export default function IconLibrary() {
	const [icons, setIcons] = useState<IconData[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [editingIcon, setEditingIcon] = useState<IconData | null>(null);
	const [metadata, setMetadata] = useState<IconMetadata | null>(null);
	const [svgContent, setSvgContent] = useState("");
	const [tagInput, setTagInput] = useState("");
	const [aliasInput, setAliasInput] = useState("");
	const [saving, setSaving] = useState(false);
	const [optimizing, setOptimizing] = useState(false);

	useEffect(() => {
		fetchIcons();
	}, []);

	const fetchIcons = async () => {
		try {
			const res = await fetch("/api/icons");
			const data = await res.json();
			if (data.success) {
				setIcons(data.icons);
			}
		} catch (error) {
			console.error("Error fetching icons:", error);
		} finally {
			setLoading(false);
		}
	};

	const openEditModal = async (icon: IconData) => {
		setEditingIcon(icon);

		// Load metadata and SVG from the API
		try {
			const metadataRes = await fetch(
				`/api/icons/file?variant=${icon.variant}&name=${icon.name}&type=metadata`,
			);
			const metadataData = await metadataRes.json();
			if (metadataData.success) {
				setMetadata(metadataData.content);
			}
		} catch (error) {
			console.error("Error loading metadata:", error);
		}

		try {
			const svgRes = await fetch(
				`/api/icons/file?variant=${icon.variant}&name=${icon.name}&type=svg`,
			);
			const svgData = await svgRes.json();
			if (svgData.success) {
				setSvgContent(svgData.content);
			}
		} catch (error) {
			console.error("Error loading SVG:", error);
		}
	};

	const closeEditModal = () => {
		setEditingIcon(null);
		setMetadata(null);
		setSvgContent("");
		setTagInput("");
		setAliasInput("");
		setOptimizing(false);
	};

	const handleOptimize = async () => {
		if (!editingIcon || !svgContent) return;

		setOptimizing(true);
		try {
			const response = await fetch("/api/icons/optimizer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					path: `${editingIcon.variant}/${editingIcon.name}.svg`,
					variant: editingIcon.variant,
				}),
			});

			const data = await response.json();
			if (data.success) {
				setSvgContent(data.svg);
				alert("SVG optimized successfully!");
			} else {
				alert("Failed to optimize SVG: " + data.error);
			}
		} catch (error) {
			console.error("Error optimizing SVG:", error);
			alert("Failed to optimize SVG");
		} finally {
			setOptimizing(false);
		}
	};

	const handleSave = async () => {
		if (!editingIcon || !metadata) return;

		setSaving(true);
		try {
			// Save metadata
			await fetch("/api/icons/file", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					variant: editingIcon.variant,
					name: editingIcon.name,
					type: "metadata",
					content: metadata,
				}),
			});

			// Save SVG if changed
			if (svgContent) {
				await fetch("/api/icons/file", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						variant: editingIcon.variant,
						name: editingIcon.name,
						type: "svg",
						content: svgContent,
					}),
				});
			}

			alert("Icon updated successfully!");
			closeEditModal();
			fetchIcons();
		} catch (error) {
			console.error("Error saving icon:", error);
			alert("Failed to save icon");
		} finally {
			setSaving(false);
		}
	};

	const addTag = () => {
		if (metadata && tagInput && !metadata.tags.includes(tagInput)) {
			setMetadata({ ...metadata, tags: [...metadata.tags, tagInput] });
			setTagInput("");
		}
	};

	const removeTag = (tag: string) => {
		if (metadata) {
			setMetadata({ ...metadata, tags: metadata.tags.filter((t) => t !== tag) });
		}
	};

	const addAlias = () => {
		if (metadata && aliasInput && !metadata.aliases.includes(aliasInput)) {
			setMetadata({ ...metadata, aliases: [...metadata.aliases, aliasInput] });
			setAliasInput("");
		}
	};

	const removeAlias = (alias: string) => {
		if (metadata) {
			setMetadata({ ...metadata, aliases: metadata.aliases.filter((a) => a !== alias) });
		}
	};

	// Get unique categories
	const categories = ["all", ...new Set(icons.map((icon) => icon.category))];

	// Filter icons
	const filteredIcons = icons.filter((icon) => {
		const matchesCategory = selectedCategory === "all" || icon.category === selectedCategory;
		const matchesSearch =
			searchQuery === "" ||
			icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			icon.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	// Group by category
	const iconsByCategory = filteredIcons.reduce(
		(acc, icon) => {
			if (!acc[icon.category]) {
				acc[icon.category] = [];
			}
			acc[icon.category].push(icon);
			return acc;
		},
		{} as Record<string, IconData[]>,
	);

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Search Bar */}
			<Card>
				<CardContent className="p-6">
					<div className="relative mx-auto max-w-lg">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search icons..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Category Filters */}
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-semibold text-foreground">Filter by Category</h3>
						<Badge variant="secondary">
							{filteredIcons.length} of {icons.length} icons
						</Badge>
					</div>
					<div className="flex gap-2 flex-wrap">
						{categories.map((cat) => (
							<Button
								key={cat}
								variant={selectedCategory === cat ? "default" : "outline"}
								onClick={() => setSelectedCategory(cat)}
								size="sm"
							>
								{cat.charAt(0).toUpperCase() + cat.slice(1)}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Icons Grid by Category */}
			{Object.entries(iconsByCategory).map(([category, categoryIcons]) => (
				<Card key={category}>
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold text-foreground capitalize">{category}</h2>
							<Badge>{categoryIcons.length}</Badge>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
							{categoryIcons.map((icon) => (
								<Card
									key={icon.name}
									className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
									onClick={() => openEditModal(icon)}
								>
									<CardContent className="p-4">
										<div
											className="w-12 h-12 mx-auto mb-2 flex items-center justify-center"
											dangerouslySetInnerHTML={{ __html: icon.svgContent || "" }}
										/>
										<p className="text-xs text-foreground truncate font-medium text-center">
											{icon.name}
										</p>
										{icon.deprecated && (
											<Badge variant="destructive" className="text-xs mt-1 w-full justify-center">
												Deprecated
											</Badge>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</CardContent>
				</Card>
			))}

			{filteredIcons.length === 0 && (
				<Card>
					<CardContent className="p-12 text-center">
						<p className="text-muted-foreground">No icons found</p>
					</CardContent>
				</Card>
			)}

			{/* Edit Dialog */}
			{editingIcon && metadata && (
				<Dialog open={true} onOpenChange={(open) => !open && closeEditModal()}>
					<DialogContent className="w-[98vw] max-w-none sm:max-w-[95vw] lg:max-w-[85vw] xl:max-w-[75vw] h-[98vh] p-0 gap-0 flex flex-col">
						<DialogHeader className="p-6 pb-4 border-b shrink-0">
							<DialogTitle>Edit Icon</DialogTitle>
						</DialogHeader>

						<div className="flex-1 overflow-y-auto px-6 py-6">
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
								{/* Left: SVG Editor */}
								<div className="space-y-4">
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label>SVG Preview</Label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={handleOptimize}
												disabled={optimizing}
												className="gap-2"
											>
												<MagicStar className="h-4 w-4" />
												{optimizing ? "Optimizing..." : "Optimize"}
											</Button>
										</div>
										<Card>
											<CardContent className="p-8 flex items-center justify-center bg-muted/30">
												<div
													className="w-32 h-32"
													dangerouslySetInnerHTML={{ __html: svgContent }}
												/>
											</CardContent>
										</Card>
									</div>

									<div className="space-y-2">
										<Label htmlFor="svg-code">SVG Code</Label>
										<Textarea
											id="svg-code"
											value={svgContent}
											onChange={(e) => setSvgContent(e.target.value)}
											className="font-mono text-sm"
											rows={12}
										/>
									</div>
								</div>

								{/* Right: Metadata Editor */}
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
										<Label htmlFor="icon-category">Category</Label>
										<Input
											id="icon-category"
											type="text"
											value={metadata.category}
											onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
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
											id="deprecated-edit"
											checked={metadata.deprecated}
											onCheckedChange={(checked) =>
												setMetadata({ ...metadata, deprecated: !!checked })
											}
										/>
										<Label htmlFor="deprecated-edit" className="cursor-pointer">
											Mark as deprecated
										</Label>
									</div>
								</div>
							</div>
						</div>

						<div className="flex gap-3 justify-end px-6 py-4 border-t bg-muted/30 shrink-0">
							<Button type="button" variant="outline" onClick={closeEditModal}>
								Cancel
							</Button>
							<Button type="button" onClick={handleSave} disabled={saving}>
								{saving ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
