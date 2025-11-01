"use client";

import {
	Badge,
	Button,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ScrollArea,
} from "@magic-icons/ui";
import { ArrowLeftTwo, Cross, Moon, Search, Setting, Sun } from "magic-icons";
import metadata from "magic-icons/metadata";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import IconCard from "@/components/IconCard";
import IconDetailDialog from "@/components/IconDetailDialog";
import Sidebar from "@/components/Sidebar";

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

const IconShowcase = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [size, setSize] = useState(32);
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

		if (selectedCategory !== "all") {
			icons = icons.filter((icon) => icon.category === selectedCategory);
		}

		return icons.sort((a, b) => a.name.localeCompare(b.name));
	}, [searchTerm, selectedCategory, typedMetadata.icons]);

	// Get unique categories from icons
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
							onClick={() => window.location.reload()}
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
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
							{filteredIcons.map((icon) => (
								<IconCard
									key={icon.name}
									icon={icon}
									size={size}
									color={color}
									strokeWidth={strokeWidth}
									onClick={() => handleIconClick(icon)}
								/>
							))}
						</div>

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
			<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
				<div className="bg-background/95 rounded-full border border-border shadow-2xl px-2 py-2 flex items-center gap-2 min-w-[500px]">
					<Search className="h-5 w-5 text-muted-foreground ml-3" />
					<Input
						type="text"
						placeholder={`Search icons...`}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="border-0 bg-transparent flex-1 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
					/>
					{searchTerm && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSearchTerm("")}
							className="h-8 w-8 rounded-full"
						>
							<Cross className="h-4 w-4" />
						</Button>
					)}
					<div className="px-3">
						<Badge variant="secondary" className="text-xs">
							{filteredIcons.length} icons
						</Badge>
					</div>
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
};

export default IconShowcase;
