"use client";

import { ArrowLeft, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import IconCard from "@/components/IconCard";
import IconDetailDialog from "@/components/IconDetailDialog";
import metadata from "@/components/metadata.json";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IconData {
	name: string;
	originalName: string;
	variant: string;
	category: string;
	supportsStrokeWidth: boolean;
	defaultStrokeWidth: number;
	fillType: string;
}

interface VariantConfig {
	name: string;
	directory: string;
	description: string;
	defaultStrokeWidth: number;
	supportsStrokeWidth: boolean;
	fillType: string;
}

interface CategoryData {
	label: string;
	keywords: string[];
}

interface MetadataType {
	icons: IconData[];
	variants: VariantConfig[];
	categories: Record<string, CategoryData>;
	defaultSettings: {
		size: number;
		color: string;
		strokeWidth: number;
	};
	stats: {
		total: number;
		byVariant: Record<string, number>;
		byCategory: Record<string, number>;
	};
}

const IconShowcase = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [size, setSize] = useState(32);
	const [color, setColor] = useState("#000000");
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [absoluteStrokeWidth, setAbsoluteStrokeWidth] = useState(false);
	const [includeExternalLibs, setIncludeExternalLibs] = useState(false);
	const [view, setView] = useState<"all" | "categories">("all");
	const [selectedIcon, setSelectedIcon] = useState<IconData | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [manualColorOverride, setManualColorOverride] = useState(false);

	const typedMetadata = metadata as MetadataType;

	// Handle theme changes and update icon color
	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted && !manualColorOverride) {
			if (theme === "dark") {
				setColor("#ffffff");
			} else {
				setColor("#000000");
			}
		}
	}, [theme, mounted, manualColorOverride]);

	const handleColorChange = (newColor: string) => {
		setColor(newColor);
		const themeColor = theme === "dark" ? "#ffffff" : "#000000";
		setManualColorOverride(newColor !== themeColor);
	};

	const filteredIcons = useMemo(() => {
		let icons = typedMetadata.icons;

		if (searchTerm) {
			icons = icons.filter((icon) =>
				icon.originalName.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		if (selectedCategory !== "all") {
			icons = icons.filter((icon) => icon.category === selectedCategory);
		}

		return icons;
	}, [searchTerm, selectedCategory, typedMetadata.icons]);

	const categories = Object.entries(typedMetadata.categories).map(([key, value]) => ({
		key,
		label: value.label,
		count: typedMetadata.stats.byCategory[key] || 0,
	}));

	const handleIconClick = (icon: IconData) => {
		setSelectedIcon(icon);
		setDialogOpen(true);
	};

	return (
		<div className="flex h-screen bg-background">
			<Sidebar
				color={color}
				onColorChange={handleColorChange}
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
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div className="relative flex-1 max-w-2xl">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder={`Search ${typedMetadata.stats.total} icons ...`}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
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
									key={`${icon.variant}-${icon.name}`}
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
