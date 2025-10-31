"use client";

import { RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SidebarProps {
	color: string;
	onColorChange: (value: string) => void;
	strokeWidth: number;
	onStrokeWidthChange: (value: number) => void;
	size: number;
	onSizeChange: (value: number) => void;
	absoluteStrokeWidth: boolean;
	onAbsoluteStrokeWidthChange: (value: boolean) => void;
	includeExternalLibs: boolean;
	onIncludeExternalLibsChange: (value: boolean) => void;
	view: "all" | "categories";
	onViewChange: (value: "all" | "categories") => void;
	selectedCategory: string;
	onCategoryChange: (value: string) => void;
	categories: Array<{ key: string; label: string; count: number }>;
}

const Sidebar = ({
	color,
	onColorChange,
	strokeWidth,
	onStrokeWidthChange,
	size,
	onSizeChange,
	absoluteStrokeWidth,
	onAbsoluteStrokeWidthChange,
	includeExternalLibs,
	onIncludeExternalLibsChange,
	view,
	onViewChange,
	selectedCategory,
	onCategoryChange,
	categories,
}: SidebarProps) => {
	const { theme } = useTheme();

	const handleReset = () => {
		const defaultColor = theme === "dark" ? "#ffffff" : "#000000";
		onColorChange(defaultColor);
		onStrokeWidthChange(2);
		onSizeChange(32);
		onAbsoluteStrokeWidthChange(false);
		onIncludeExternalLibsChange(false);
	};

	return (
		<div className="w-60 border-r border-border bg-sidebar h-screen flex flex-col">
			<div className="p-4 border-b border-sidebar-border">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-sidebar-foreground">Customizer</h2>
					<Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>

				<div className="space-y-6">
					{/* Color */}
					<div className="space-y-2">
						<Label htmlFor="color" className="text-sm text-sidebar-foreground">
							Color
						</Label>
						<div className="flex items-center gap-2">
							<input
								id="color"
								type="color"
								value={color}
								onChange={(e) => onColorChange(e.target.value)}
								className="h-8 w-12 rounded border border-sidebar-border cursor-pointer"
							/>
							<span className="text-xs text-sidebar-foreground/70">current</span>
						</div>
					</div>

					{/* Stroke Width */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="stroke-width" className="text-sm text-sidebar-foreground">
								Stroke width
							</Label>
							<span className="text-xs text-sidebar-foreground/70">{strokeWidth}px</span>
						</div>
						<Slider
							id="stroke-width"
							value={[strokeWidth]}
							onValueChange={(values) => {
								const value = Array.isArray(values) ? values[0] : values;
								if (value !== undefined) onStrokeWidthChange(value);
							}}
							min={0.5}
							max={4}
							step={0.5}
							className="w-full"
						/>
					</div>

					{/* Size */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="size" className="text-sm text-sidebar-foreground">
								Size
							</Label>
							<span className="text-xs text-sidebar-foreground/70">{size}px</span>
						</div>
						<Slider
							id="size"
							value={[size]}
							onValueChange={(values) => {
								const value = Array.isArray(values) ? values[0] : values;
								if (value !== undefined) onSizeChange(value);
							}}
							min={16}
							max={64}
							step={4}
							className="w-full"
						/>
					</div>

					{/* Absolute Stroke Width */}
					<div className="flex items-center justify-between">
						<Label htmlFor="absolute-stroke" className="text-sm text-sidebar-foreground">
							Absolute Stroke width
						</Label>
						<Switch
							id="absolute-stroke"
							checked={absoluteStrokeWidth}
							onCheckedChange={onAbsoluteStrokeWidthChange}
						/>
					</div>
				</div>
			</div>

			<Separator />

			{/* Include external libs */}
			<div className="p-4 border-b border-sidebar-border">
				<div className="space-y-3">
					<Label className="text-sm font-medium text-sidebar-foreground">
						Include external libs
					</Label>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="lab"
							checked={includeExternalLibs}
							onCheckedChange={(checked) => onIncludeExternalLibsChange(checked as boolean)}
						/>
						<label htmlFor="lab" className="text-sm text-sidebar-foreground cursor-pointer">
							Lab
						</label>
					</div>
				</div>
			</div>

			<Separator />

			{/* View */}
			<div className="flex-1 flex flex-col min-h-0">
				<div className="p-4">
					<Label className="text-sm font-medium text-sidebar-foreground">View</Label>
				</div>

				<ScrollArea className="flex-1">
					<div className="px-4 pb-4 space-y-1">
						<button
							type="button"
							onClick={() => {
								onViewChange("all");
								onCategoryChange("all");
							}}
							className={cn(
								"w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
								view === "all"
									? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
									: "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
							)}
						>
							All
						</button>

						<div className="pt-2">
							<button
								type="button"
								onClick={() => onViewChange("categories")}
								className={cn(
									"w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
									view === "categories" && selectedCategory === "all"
										? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
										: "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
								)}
							>
								Categories
							</button>

							{view === "categories" && (
								<div className="ml-2 mt-1 space-y-1">
									{categories.map((category) => (
										<button
											key={category.key}
											type="button"
											onClick={() => onCategoryChange(category.key)}
											className={cn(
												"w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between",
												selectedCategory === category.key
													? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
													: "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
											)}
										>
											<span>{category.label}</span>
											<span className="text-xs opacity-60">{category.count}</span>
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default Sidebar;
