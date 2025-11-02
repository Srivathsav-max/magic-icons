"use client";

import {
	Button,
	ColorPicker,
	ColorPickerAlpha,
	ColorPickerEyeDropper,
	ColorPickerFormat,
	ColorPickerHue,
	ColorPickerOutput,
	ColorPickerSelection,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ScrollArea,
	Separator,
	Slider,
} from "@magic-icons/ui";
import Color from "color";
import { RefreshTwo } from "magic-icons";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
	color: string | undefined;
	onColorChange: (value: string | undefined) => void;
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
	view,
	onViewChange,
	selectedCategory,
	onCategoryChange,
	categories,
}: SidebarProps) => {
	const [popoverOpen, setPopoverOpen] = useState(false);

	const handleReset = () => {
		onColorChange(undefined);
		onStrokeWidthChange(2);
		onSizeChange(24);
	};

	return (
		<div className="w-60 border-r border-border bg-sidebar h-screen flex flex-col">
			<div className="p-4 border-b border-sidebar-border">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-sidebar-foreground">Magic Icons</h2>
					<Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
						<RefreshTwo className="h-4 w-4" />
					</Button>
				</div>

				<div className="space-y-6">
					{/* Color */}
					<div className="space-y-2">
						<Label className="text-sm text-sidebar-foreground">Colour</Label>
						<div className="flex items-center gap-2 w-full px-2 py-1 rounded border border-sidebar-border bg-sidebar-accent/50">
							<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
								<PopoverTrigger>
									<button type="button" className="shrink-0 hover:opacity-80 transition-opacity">
										<div
											className="w-5 h-5 rounded border border-sidebar-border"
											style={{ backgroundColor: color || "#000000" }}
										/>
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-80 p-4">
									<div
										onPointerDown={(e) => {
											// Prevent popover from closing when interacting with color picker
											e.stopPropagation();
										}}
									>
										<ColorPicker
											value={color}
											onChange={(value) => {
												console.log("ColorPicker onChange:", value);
												if (Array.isArray(value) && value.length >= 3) {
													const newColor = Color.rgb(
														value[0] as number,
														value[1] as number,
														value[2] as number,
													);
													const hexColor = newColor.hex();
													console.log("Converted to hex:", hexColor);
													onColorChange(hexColor);
												}
											}}
										>
											<div className="space-y-3">
												<ColorPickerSelection className="h-32 w-full" />
												<div className="space-y-2">
													<label className="text-xs text-muted-foreground font-medium">Hue</label>
													<ColorPickerHue />
												</div>
												<div className="space-y-2">
													<label className="text-xs text-muted-foreground font-medium">
														Opacity
													</label>
													<ColorPickerAlpha />
												</div>
												<div className="space-y-2">
													<label className="text-xs text-muted-foreground font-medium">
														Format
													</label>
													<ColorPickerFormat />
												</div>
												<ColorPickerOutput className="w-full" />
												<ColorPickerEyeDropper className="w-full" />
											</div>
										</ColorPicker>
									</div>
								</PopoverContent>
							</Popover>
							<input
								type="text"
								value={color || ""}
								onChange={(e) => {
									const value = e.target.value;
									if (value === "") {
										onColorChange(undefined);
									} else {
										onColorChange(value);
									}
								}}
								placeholder="Default"
								className="flex-1 bg-transparent text-xs text-sidebar-foreground font-mono outline-none border-none focus:ring-0 min-w-0"
							/>
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
								onClick={() => {
									onViewChange("categories");
									onCategoryChange("categories");
								}}
								className={cn(
									"w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
									selectedCategory === "categories"
										? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
										: "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
								)}
							>
								Categories
							</button>

							<div className="ml-2 mt-1 space-y-1">
								{categories.map((category) => (
									<button
										key={category.key}
										type="button"
										onClick={() => {
											onViewChange("categories");
											onCategoryChange(category.key);
										}}
										className={cn(
											"w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between",
											selectedCategory === category.key && view === "categories"
												? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
												: "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
										)}
									>
										<span>{category.label}</span>
										<span className="text-xs opacity-60">{category.count}</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default Sidebar;
