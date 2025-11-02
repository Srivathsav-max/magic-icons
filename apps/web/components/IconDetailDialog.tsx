"use client";

import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@magic-icons/ui";
import * as Icons from "magic-icons";
import { ArrowDown, Check, Copy, Download } from "magic-icons";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface IconDetailDialogProps {
	icon: {
		name: string;
		componentName: string;
		category: string;
		tags: string[];
		description: string;
		aliases: string[];
		deprecated: boolean;
	} | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	size: number;
	color: string | undefined;
	strokeWidth: number;
}

const frameworks = [
	{ id: "vanilla", label: "Vanilla" },
	{ id: "react", label: "React" },
	{ id: "vue", label: "Vue" },
	{ id: "svelte", label: "Svelte" },
	{ id: "preact", label: "Preact" },
	{ id: "solid", label: "Solid" },
	{ id: "angular", label: "Angular" },
	{ id: "icon-font", label: "Icon font" },
];

const getIconComponent = (
	iconName: string,
): React.ComponentType<{
	size?: number;
	color?: string;
	strokeWidth?: number;
}> => {
	const iconsMap = Icons as Record<
		string,
		React.ComponentType<{
			size?: number;
			color?: string;
			strokeWidth?: number;
		}>
	>;
	return iconsMap[iconName];
};

const IconDetailDialog = ({
	icon,
	open,
	onOpenChange,
	size,
	color,
	strokeWidth,
}: IconDetailDialogProps) => {
	const [copiedSvg, setCopiedSvg] = useState(false);
	const [copiedJsx, setCopiedJsx] = useState(false);
	const [selectedFramework, setSelectedFramework] = useState("preact");
	const [sourceSvg, setSourceSvg] = useState<string | null>(null);
	const [copiedCode, setCopiedCode] = useState(false);
	const [showContributorName, setShowContributorName] = useState(false);

	useEffect(() => {
		if (!icon) return;

		const loadSourceSvg = async () => {
			try {
				const response = await fetch(`/api/icons/source?name=${icon.name}&variant=lines`);
				if (response.ok) {
					const svgText = await response.text();
					setSourceSvg(svgText);
				}
			} catch (error) {
				console.error("Failed to load source SVG:", error);
			}
		};
		loadSourceSvg();
	}, [icon]);

	if (!icon) return null;

	const IconComponent = getIconComponent(icon.componentName);

	if (!IconComponent) return null;

	const getCode = (framework: string) => {
		const colorProp = color ? ` color="${color}"` : "";
		const colorComment = color ? "" : "You can add a color prop to customize the icon color";

		switch (framework) {
			case "react":
				return `import { ${icon.componentName} } from 'magic-icons';\n\nfunction App() {\n  // ${colorComment}\n  return (\n    <${icon.componentName} size={24}${colorProp} />\n  );\n}\n\nexport default App;`;
			case "preact":
				return `import { ${icon.componentName} } from 'magic-icons';\n\nexport default function App() {\n  // ${colorComment}\n  return (\n    <${icon.componentName} size={24}${colorProp} />\n  );\n}`;
			case "vue":
				return `<template>\n  <!-- ${colorComment} -->\n  <${icon.componentName} :size="24"${colorProp} />\n</template>\n\n<script setup>\nimport { ${icon.componentName} } from 'magic-icons';\n</script>`;
			case "svelte":
				return `<script>\n  import { ${icon.componentName} } from 'magic-icons';\n</script>\n\n<!-- ${colorComment} -->\n<${icon.componentName} size={24}${colorProp} />`;
			case "solid":
				return `import { ${icon.componentName} } from 'magic-icons';\n\nfunction App() {\n  // ${colorComment}\n  return (\n    <${icon.componentName} size={24}${colorProp} />\n  );\n}\n\nexport default App;`;
			case "angular":
				return `import { ${icon.componentName} } from 'magic-icons';\n// ${colorComment}\n@Component({\n  selector: 'app-root',\n  template: '<${icon.componentName} [size]="24"${colorProp} />'\n})\nexport class AppComponent {}`;
			case "vanilla":
				return `import { ${icon.componentName} } from 'magic-icons';\n// ${colorComment}\nconst icon = ${icon.componentName}({ size: 24${color ? `, color: '${color}'` : ""} });\ndocument.body.appendChild(icon);`;
			default:
				return `import { ${icon.componentName} } from 'magic-icons';`;
		}
	};

	const getSvgString = async () => {
		if (sourceSvg) {
			const parser = new DOMParser();
			const doc = parser.parseFromString(sourceSvg, "image/svg+xml");
			const svgEl = doc.querySelector("svg");

			if (svgEl) {
				svgEl.setAttribute("width", size.toString());
				svgEl.setAttribute("height", size.toString());
				if (color) {
					svgEl.setAttribute("stroke", color);
				}
				svgEl.setAttribute("stroke-width", strokeWidth.toString());
				return svgEl.outerHTML;
			}
		}

		// Fallback: fetch from API if not loaded yet
		try {
			const response = await fetch(`/api/icons/source?name=${icon.name}&variant=lines`);
			if (response.ok) {
				const svgText = await response.text();
				const parser = new DOMParser();
				const doc = parser.parseFromString(svgText, "image/svg+xml");
				const svgEl = doc.querySelector("svg");

				if (svgEl) {
					svgEl.setAttribute("width", size.toString());
					svgEl.setAttribute("height", size.toString());
					if (color) {
						svgEl.setAttribute("stroke", color);
					}
					svgEl.setAttribute("stroke-width", strokeWidth.toString());
					return svgEl.outerHTML;
				}
			}
		} catch (error) {
			console.error("Error loading source SVG:", error);
		}

		// Final fallback: return a basic SVG template
		return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">\n  <!-- Icon: ${icon.name} -->\n</svg>`;
	};

	const handleCopy = async (text: string, type: "svg" | "jsx") => {
		try {
			await navigator.clipboard.writeText(text);
			if (type === "svg") {
				setCopiedSvg(true);
				setTimeout(() => setCopiedSvg(false), 2000);
			} else {
				setCopiedJsx(true);
				setTimeout(() => setCopiedJsx(false), 2000);
			}
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const handleDownloadSvg = async () => {
		try {
			const svg = sourceSvg || (await getSvgString());
			const blob = new Blob([svg], { type: "image/svg+xml" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${icon.name}.svg`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download SVG:", error);
		}
	};

	const svgToDataUrl = async (): Promise<string> => {
		const svg = sourceSvg || (await getSvgString());
		const base64 = btoa(unescape(encodeURIComponent(svg)));
		return `data:image/svg+xml;base64,${base64}`;
	};

	const handleCopyDataUrl = async () => {
		try {
			const dataUrl = await svgToDataUrl();
			await navigator.clipboard.writeText(dataUrl);
			setCopiedSvg(true);
			setTimeout(() => setCopiedSvg(false), 2000);
		} catch (error) {
			console.error("Failed to copy data URL:", error);
		}
	};

	const handleDownloadPng = async () => {
		try {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			// Set canvas size (using 2x for better quality)
			const scale = 2;
			canvas.width = size * scale;
			canvas.height = size * scale;

			// Create image from SVG
			const img = new Image();
			const dataUrl = await svgToDataUrl();

			await new Promise<void>((resolve, reject) => {
				img.onload = () => {
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					resolve();
				};
				img.onerror = reject;
				img.src = dataUrl;
			});

			// Convert canvas to blob and download
			canvas.toBlob((blob) => {
				if (!blob) return;
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${icon.name}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, "image/png");
		} catch (error) {
			console.error("Failed to download PNG:", error);
		}
	};

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(getCode(selectedFramework));
			setCopiedCode(true);
			setTimeout(() => setCopiedCode(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[90vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
				{/* Two Column Layout */}
				<div className="flex flex-1 overflow-hidden">
					{/* Left Side - Icon Previews */}
					<div className="w-[35%] bg-muted/30 p-6 flex flex-col">
						{/* Large Icon Preview */}
						<div
							className="flex items-center justify-center rounded-lg mb-4 flex-1"
							style={{
								backgroundImage:
									"linear-gradient(to right, rgba(128, 128, 128, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(128, 128, 128, 0.15) 1px, transparent 1px)",
								backgroundSize: "10px 10px",
							}}
						>
							<Suspense fallback={<div>Loading...</div>}>
								<IconComponent
									size={120}
									{...(color !== undefined ? { color } : {})}
									strokeWidth={strokeWidth}
								/>
							</Suspense>
						</div>

						{/* Smaller Icon Previews - Horizontal Row */}
						<div className="flex items-center gap-3 justify-center">
							<div
								className="flex items-center justify-center p-3 rounded-lg"
								style={{
									backgroundImage:
										"linear-gradient(to right, rgba(128, 128, 128, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(128, 128, 128, 0.15) 1px, transparent 1px)",
									backgroundSize: "10px 10px",
								}}
							>
								<Suspense fallback={<div>Loading...</div>}>
									<IconComponent
										size={48}
										{...(color !== undefined ? { color } : {})}
										strokeWidth={strokeWidth}
									/>
								</Suspense>
							</div>
							<div
								className="flex items-center justify-center p-3 rounded-lg"
								style={{
									backgroundImage:
										"linear-gradient(to right, rgba(128, 128, 128, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(128, 128, 128, 0.15) 1px, transparent 1px)",
									backgroundSize: "10px 10px",
								}}
							>
								<Suspense fallback={<div>Loading...</div>}>
									<IconComponent
										size={32}
										{...(color !== undefined ? { color } : {})}
										strokeWidth={strokeWidth}
									/>
								</Suspense>
							</div>
							<div
								className="flex items-center justify-center p-3 rounded-lg"
								style={{
									backgroundImage:
										"linear-gradient(to right, rgba(128, 128, 128, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(128, 128, 128, 0.15) 1px, transparent 1px)",
									backgroundSize: "10px 10px",
								}}
							>
								<Suspense fallback={<div>Loading...</div>}>
									<IconComponent
										size={24}
										{...(color !== undefined ? { color } : {})}
										strokeWidth={strokeWidth}
									/>
								</Suspense>
							</div>
						</div>
					</div>

					{/* Right Side - Content */}
					<div className="flex-1 flex flex-col overflow-hidden">
						<DialogHeader className="px-6 pt-6 pb-4">
							<div className="flex items-start justify-between gap-6">
								<div className="flex-1 space-y-3">
									<DialogTitle className="text-2xl">{icon.componentName}</DialogTitle>
									{/* Tags below title */}
									<div className="flex gap-2 flex-wrap">
										{icon.tags.map((tag) => (
											<span
												key={tag}
												className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
											>
												{tag}
											</span>
										))}
									</div>

									{/* Action Buttons */}
									<div className="flex items-center gap-3">
										{/* Copy SVG with Dropdown */}
										<DropdownMenu>
											<DropdownMenuTrigger>
												<Button variant="default" className="gap-2">
													{copiedSvg ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
													Copy SVG
													<ArrowDown className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="start">
												<DropdownMenuItem
													onClick={async () => {
														const svg = sourceSvg || (await getSvgString());
														handleCopy(svg, "svg");
													}}
												>
													<Copy className="h-4 w-4 mr-2" />
													Copy SVG
												</DropdownMenuItem>
												<DropdownMenuItem onClick={handleCopyDataUrl}>
													<Copy className="h-4 w-4 mr-2" />
													Copy Data URL
												</DropdownMenuItem>
												<DropdownMenuItem onClick={handleDownloadSvg}>
													<Download className="h-4 w-4 mr-2" />
													Download SVG
												</DropdownMenuItem>
												<DropdownMenuItem onClick={handleDownloadPng}>
													<Download className="h-4 w-4 mr-2" />
													Download PNG
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>

										{/* Copy JSX with Framework Dropdown */}
										<DropdownMenu>
											<DropdownMenuTrigger>
												<Button variant="outline" className="gap-2">
													{copiedJsx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
													Copy{" "}
													{selectedFramework === "react"
														? "JSX"
														: selectedFramework.charAt(0).toUpperCase() +
															selectedFramework.slice(1)}
													<ArrowDown className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="start">
												{frameworks.map((framework) => (
													<DropdownMenuItem
														key={framework.id}
														onClick={() => {
															setSelectedFramework(framework.id);
															handleCopy(getCode(framework.id), "jsx");
														}}
													>
														Copy {framework.label}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>

								{/* Metadata Box - Top Right */}
								<div className="bg-muted/50 rounded-lg p-4 min-w-[240px]">
									<div className="flex items-start justify-between gap-6 text-sm">
										{/* Version and Category */}
										<div className="space-y-3">
											<div>
												<div className="text-muted-foreground text-xs mb-1">Version</div>
												<div className="font-medium">v0.0.2</div>
											</div>
											<div>
												<div className="text-muted-foreground text-xs mb-1">Category</div>
												<div className="font-medium capitalize">{icon.category}</div>
											</div>
										</div>

										{/* Contributor */}
										<div>
											<div className="text-muted-foreground text-xs mb-2">Contributor</div>
											<button
												type="button"
												className="relative"
												onMouseEnter={() => setShowContributorName(true)}
												onMouseLeave={() => setShowContributorName(false)}
												onClick={() => setShowContributorName(!showContributorName)}
											>
												<div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold cursor-pointer">
													JR
												</div>
												{showContributorName && (
													<div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-lg whitespace-nowrap z-50 border border-border">
														Jaya Raj Srivathsav Adari
													</div>
												)}
											</button>
										</div>
									</div>
								</div>
							</div>
						</DialogHeader>

						<div className="flex-1 overflow-auto px-6 pb-6 space-y-6">
							{/* Framework Tabs */}
							<div className="flex gap-2 flex-wrap border-b border-border pb-2">
								{frameworks.map((framework) => (
									<button
										key={framework.id}
										type="button"
										onClick={() => setSelectedFramework(framework.id)}
										className={`px-3 py-1.5 text-sm font-medium transition-colors ${
											selectedFramework === framework.id
												? "text-foreground border-b-2 border-primary"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{framework.label}
									</button>
								))}
							</div>

							{/* Code Display */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs font-medium text-muted-foreground uppercase">
										{selectedFramework}
									</span>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 px-2 gap-1"
										onClick={handleCopyCode}
									>
										{copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
										Copy
									</Button>
								</div>
								<div className="rounded-lg overflow-hidden">
									<SyntaxHighlighter
										language={
											selectedFramework === "vanilla"
												? "javascript"
												: selectedFramework === "vue"
													? "html"
													: "jsx"
										}
										style={vscDarkPlus}
										customStyle={{
											margin: 0,
											padding: "1rem",
											fontSize: "0.875rem",
											borderRadius: "0.5rem",
										}}
										showLineNumbers={false}
									>
										{getCode(selectedFramework)}
									</SyntaxHighlighter>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default IconDetailDialog;
