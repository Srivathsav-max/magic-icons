"use client";

import { ArrowLeftTwo, Cross, Moon, Search, Sun } from "magic-icons";
import metadata from "magic-icons/metadata";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button, ScrollArea } from "@magic-icons/ui";
import { useEffect, useMemo, useState } from "react";
import IconDetailDialog from "@/components/IconDetailDialog";
import Sidebar from "@/components/Sidebar";
import * as Icons from "magic-icons";

interface IconData {
	name: string;
	componentName: string;
	category: string;
	tags: string[];
	description: string;
	aliases: string[];
	deprecated: boolean;
}

interface VariantConfig {
	id: string;
	name: string;
	description: string;
	defaultStrokeWidth: number;
	supportsStrokeWidth: boolean;
	fillType: string;
}

interface MetadataType {
	variant: VariantConfig;
	icons: IconData[];
}

export default function IconsPage() {
	const { theme, setTheme } = useTheme();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [size, setSize] = useState(24);
	const [color, setColor] = useState<string | undefined>(undefined);
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [absoluteStrokeWidth, setAbsoluteStrokeWidth] = useState(false);
	const [includeExternalLibs, setIncludeExternalLibs] = useState(false);
	const [view, setView] = useState<"all" | "categories">("all");
	const [selectedIcon, setSelectedIcon] = useState<IconData | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const typedMetadata = metadata as MetadataType;

	useEffect(() => {
		setMounted(true);
		const params = new URLSearchParams(window.location.search);
		const category = params.get("category");
		const search = params.get("search");

		if (category) setSelectedCategory(category);
		if (search) setSearchTerm(search);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const params = new URLSearchParams();
		if (selectedCategory !== "all") params.set("category", selectedCategory);
		if (searchTerm) params.set("search", searchTerm);

		const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
		window.history.replaceState({}, "", newUrl);
	}, [mounted, selectedCategory, searchTerm]);

	const filteredIcons = useMemo(() => {
		let icons = [...typedMetadata.icons];

		if (searchTerm) {
			icons = icons.filter(
				(icon) =>
					icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					icon.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					icon.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
			);
		}

		// Filter by selected category when a specific category is selected
		if (selectedCategory !== "all" && selectedCategory !== "categories") {
			icons = icons.filter((icon) => icon.category === selectedCategory);
		}

		return icons.sort((a, b) => a.name.localeCompare(b.name));
	}, [searchTerm, selectedCategory, typedMetadata.icons]);

	// Group icons by category for category grouped view
	const groupedByCategory = useMemo(() => {
		const grouped = new Map<string, IconData[]>();

		filteredIcons.forEach((icon) => {
			const category = icon.category;
			if (!grouped.has(category)) {
				grouped.set(category, []);
			}
			grouped.get(category)?.push(icon);
		});

		// Sort categories alphabetically and sort icons within each category
		return Array.from(grouped.entries())
			.map(([category, icons]) => ({
				category,
				label: category.charAt(0).toUpperCase() + category.slice(1),
				icons: icons.sort((a, b) => a.name.localeCompare(b.name)),
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [filteredIcons]);

	const categories = useMemo(() => {
		const categoryMap = new Map<string, number>();
		typedMetadata.icons.forEach((icon) => {
			categoryMap.set(icon.category, (categoryMap.get(icon.category) || 0) + 1);
		});
		return Array.from(categoryMap.entries())
			.map(([key, count]) => ({
				key,
				label: key.charAt(0).toUpperCase() + key.slice(1),
				count,
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [typedMetadata.icons]);

	const handleIconClick = (icon: IconData) => {
		setSelectedIcon(icon);
		setDialogOpen(true);
	};

	const iconsMap = Icons as Record<
		string,
		React.ComponentType<{
			size?: number;
			color?: string;
			strokeWidth?: number;
		}>
	>;

	return (
		<div className="flex h-screen bg-background">
			<Sidebar
				color={color}
				onColorChange={setColor}
				strokeWidth={strokeWidth}
				onStrokeWidthChange={setStrokeWidth}
				size={size}
				onSizeChange={setSize}
				absoluteStrokeWidth={absoluteStrokeWidth}
				onAbsoluteStrokeWidthChange={setAbsoluteStrokeWidth}
				includeExternalLibs={includeExternalLibs}
				onIncludeExternalLibsChange={setIncludeExternalLibs}
				view={view}
				onViewChange={setView}
				selectedCategory={selectedCategory}
				onCategoryChange={setSelectedCategory}
				categories={categories}
			/>

			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
					<div className="flex items-center gap-4 p-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push("/")}
							className="shrink-0"
						>
							<ArrowLeftTwo className="h-5 w-5" />
						</Button>
						<div className="flex-1" />
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							className="shrink-0"
						>
							{mounted && theme === "dark" ? (
								<Sun className="h-5 w-5" />
							) : (
								<Moon className="h-5 w-5" />
							)}
						</Button>
					</div>
				</header>

				<ScrollArea className="flex-1">
					<div className="p-6">
						{selectedCategory === "categories" ? (
							// Grouped by category view
							<div className="space-y-8">
								{groupedByCategory.map((group) => (
									<div key={group.category}>
										<h2 className="text-lg font-semibold text-foreground mb-4">
											{group.label}
										</h2>
										<div
											className="grid gap-2"
											style={{
												gridTemplateColumns: `repeat(auto-fill, minmax(${size + 16}px, 1fr))`
											}}
										>
											{group.icons.map((icon) => {
												const IconComponent = iconsMap[icon.componentName];
												if (!IconComponent) return null;

												return (
													<button
														type="button"
														key={icon.name}
														onClick={() => handleIconClick(icon)}
														className="flex items-center justify-center rounded bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
														style={{
															width: `${size + 16}px`,
															height: `${size + 16}px`
														}}
														title={icon.componentName}
													>
														<IconComponent
															size={size}
															{...(color !== undefined ? { color } : {})}
															strokeWidth={strokeWidth}
														/>
													</button>
												);
											})}
										</div>
									</div>
								))}
							</div>
						) : (
							// Flat view
							<div
								className="grid gap-2"
								style={{
									gridTemplateColumns: `repeat(auto-fill, minmax(${size + 16}px, 1fr))`
								}}
							>
								{filteredIcons.map((icon) => {
									const IconComponent = iconsMap[icon.componentName];
									if (!IconComponent) return null;

									return (
										<button
											type="button"
											key={icon.name}
											onClick={() => handleIconClick(icon)}
											className="flex items-center justify-center rounded bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
											style={{
												width: `${size + 16}px`,
												height: `${size + 16}px`
											}}
											title={icon.componentName}
										>
											<IconComponent
												size={size}
												{...(color !== undefined ? { color } : {})}
												strokeWidth={strokeWidth}
											/>
										</button>
									);
								})}
							</div>
						)}

						{filteredIcons.length === 0 && (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<p className="text-muted-foreground mb-4">No icons found matching your criteria</p>
								<button
									type="button"
									onClick={() => {
										setSearchTerm("");
										setSelectedCategory("all");
										setView("all");
									}}
									className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
								>
									Clear filters
								</button>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Floating Search Bar at Bottom */}
			<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 min-w-[500px]">
				<div className="relative bg-background rounded-full border border-border shadow-2xl">
					<div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
						<Search className="h-5 w-5 text-muted-foreground" />
					</div>
					<input
						type="text"
						placeholder={`Search ${filteredIcons.length} icons...`}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full bg-transparent rounded-full pl-14 pr-14 py-3 outline-none focus:ring-0 text-sm"
					/>
					{searchTerm && (
						<button
							type="button"
							onClick={() => setSearchTerm("")}
							className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
						>
							<Cross className="h-4 w-4" />
						</button>
					)}
				</div>
			</div>

			<IconDetailDialog
				icon={selectedIcon}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				size={size}
				color={color}
				strokeWidth={strokeWidth}
			/>
		</div>
	);
}
