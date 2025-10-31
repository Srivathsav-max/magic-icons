"use client";

import {
	Badge,
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
} from "@magic-icons/ui";
import { useEffect, useState } from "react";
import { IconRenderer } from "./icon-renderer";

interface Icon {
	id: string;
	name: string;
	componentBaseName?: string;
	category: string;
	tags: string[];
	description: string;
	variants?: {
		[key: string]: {
			available: boolean;
			componentName: string;
		};
	};
}

interface IconListProps {
	onSelectIcon?: (iconId: string, category: string) => void;
	refreshTrigger?: number;
}

export function IconList({ onSelectIcon, refreshTrigger }: IconListProps) {
	const [icons, setIcons] = useState<Icon[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedVariant, setSelectedVariant] = useState<string>("outline");
	const [searchQuery, setSearchQuery] = useState("");

	const categories = [
		"all",
		"user",
		"action",
		"navigation",
		"data",
		"communication",
		"media",
		"business",
		"system",
	];

	const variants = ["outline", "broken", "bulk", "light", "two-tone"];

	useEffect(() => {
		const fetchIcons = async () => {
			setLoading(true);
			try {
				const url =
					selectedCategory === "all" ? "/api/icons" : `/api/icons?category=${selectedCategory}`;

				const response = await fetch(url);
				const data = await response.json();

				if (data.success) {
					console.log('Loaded icons:', data.icons.length, 'First icon:', data.icons[0]);
					setIcons(data.icons);
				}
			} catch (error) {
				console.error("Failed to load icons:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchIcons();
	}, [selectedCategory, refreshTrigger]);

	const filteredIcons = icons.filter((icon) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			icon.name?.toLowerCase().includes(query) ||
			icon.id?.toLowerCase().includes(query) ||
			icon.tags?.some((tag) => tag.toLowerCase().includes(query))
		);
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Icon Library</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-4 space-y-3">
					<div>
						<Label htmlFor="search">Search</Label>
						<Input
							id="search"
							type="text"
							placeholder="Search icons..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div>
						<Label htmlFor="category">Category</Label>
						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger id="category">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{categories.map((cat) => (
									<SelectItem key={cat} value={cat}>
										{cat === "all" ? "All Categories" : cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="variant">Variant</Label>
						<Select value={selectedVariant} onValueChange={setSelectedVariant}>
							<SelectTrigger id="variant">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{variants.map((variant) => (
									<SelectItem key={variant} value={variant}>
										{variant}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{loading ? (
					<div className="text-center text-muted-foreground">Loading icons...</div>
				) : (
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">
							{filteredIcons.length} icon{filteredIcons.length !== 1 ? "s" : ""} found
						</p>

						<ScrollArea className="h-[500px]">
							<div className="space-y-1 pr-4">
								{filteredIcons.map((icon) => (
									<button
										key={icon.id}
										type="button"
										onClick={() => onSelectIcon?.(icon.id, icon.category)}
										className="w-full rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
									>
										<div className="flex items-center gap-3">
											<div className="shrink-0">
												<IconRenderer
													iconName={
														icon.variants?.[selectedVariant]?.componentName ||
														icon.variants?.outline?.componentName ||
														icon.variants?.broken?.componentName ||
														`${icon.componentBaseName}${selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1).replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())}`
													}
													size={32}
												/>
											</div>
											<div className="flex-1 min-w-0">
												<div className="font-medium truncate">{icon.name}</div>
												<div className="text-sm text-muted-foreground truncate">
													{icon.id} • {icon.category}
												</div>
												{icon.tags?.length > 0 && (
													<div className="mt-2 flex flex-wrap gap-1">
														{icon.tags.slice(0, 3).map((tag) => (
															<Badge key={tag} variant="secondary">
																{tag}
															</Badge>
														))}
													</div>
												)}
											</div>
										</div>
									</button>
								))}
							</div>
						</ScrollArea>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
