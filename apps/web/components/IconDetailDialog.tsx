"use client";

import { Check, Copy } from "lucide-react";
import * as Icons from "magic-icons";
import type React from "react";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface IconDetailDialogProps {
	icon: {
		name: string;
		originalName: string;
		variant: string;
		category: string;
		supportsStrokeWidth: boolean;
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
	const [activeTab, setActiveTab] = useState("text");

	if (!icon) return null;

	const IconComponent = getIconComponent(icon.name);

	const getCode = (framework: string) => {
		const colorProp = color ? ` color="${color}"` : "";
		const colorComment = color ? "" : "\n";

		switch (framework) {
			case "react":
				return `import { ${icon.name} } from 'magic-icons';\n\nfunction App() {${colorComment}\n  return (\n    <${icon.name} size={24}${colorProp} />\n  );\n}\n\nexport default App;`;
			case "preact":
				return `import { ${icon.name} } from 'magic-icons';\n\nexport default function App() {${colorComment}\n  return (\n    <${icon.name} size={24}${colorProp} />\n  );\n}`;
			case "vue":
				return `<template>${colorComment ? `\n  <!-- ${colorComment.trim()} -->` : ""}\n  <${icon.name} :size="24"${colorProp} />\n</template>\n\n<script setup>\nimport { ${icon.name} } from 'magic-icons';\n</script>`;
			case "svelte":
				return `<script>\n  import { ${icon.name} } from 'magic-icons';\n</script>\n${colorComment ? `\n<!-- ${colorComment.trim()} -->` : ""}\n<${icon.name} size={24}${colorProp} />`;
			case "solid":
				return `import { ${icon.name} } from 'magic-icons';\n\nfunction App() {${colorComment}\n  return (\n    <${icon.name} size={24}${colorProp} />\n  );\n}\n\nexport default App;`;
			case "angular":
				return `import { ${icon.name} } from 'magic-icons';\n${colorComment ? `\n// ${colorComment.trim()}` : ""}\n@Component({\n  selector: 'app-root',\n  template: '<${icon.name} [size]="24"${colorProp} />'\n})\nexport class AppComponent {}`;
			case "vanilla":
				return `import { ${icon.name} } from 'magic-icons';\n${colorComment ? `\n// ${colorComment.trim()}` : ""}\nconst icon = ${icon.name}({ size: 24${color ? `, color: '${color}'` : ""} });\ndocument.body.appendChild(icon);`;
			default:
				return `import { ${icon.name} } from 'magic-icons';`;
		}
	};

	const getSvgString = async () => {
		const container = document.createElement("div");
		container.style.position = "absolute";
		container.style.left = "-9999px";
		document.body.appendChild(container);

		try {
			const IconComponentForSvg = getIconComponent(icon.name);

			const { createRoot } = await import("react-dom/client");
			const root = createRoot(container);

			await new Promise<void>((resolve) => {
				root.render(
					<IconComponentForSvg
						size={size}
						{...(color !== undefined ? { color } : {})}
						{...(icon.supportsStrokeWidth ? { strokeWidth } : {})}
					/>,
				);
				setTimeout(resolve, 100);
			});

			const svgElement = container.querySelector("svg");
			if (svgElement) {
				const clonedSvg = svgElement.cloneNode(true) as SVGElement;
				const svgString = clonedSvg.outerHTML;

				root.unmount();
				document.body.removeChild(container);

				return svgString;
			}

			document.body.removeChild(container);
			return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">\n  <!-- ${icon.originalName} - ${icon.variant} variant -->\n</svg>`;
		} catch (error) {
			console.error("Error generating SVG:", error);
			document.body.removeChild(container);
			return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">\n  <!-- ${icon.originalName} - ${icon.variant} variant -->\n</svg>`;
		}
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

	const tags = ["letter", "font size", "text", "formatting"];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="text-2xl">{icon.originalName}</DialogTitle>
					<div className="flex gap-2 mt-2">
						{tags.map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
					</div>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex-1 flex flex-col overflow-hidden"
				>
					<TabsList className="grid w-fit grid-cols-2">
						<TabsTrigger value="text">Text</TabsTrigger>
						<TabsTrigger value="design">Design</TabsTrigger>
					</TabsList>

					<TabsContent value="text" className="flex-1 overflow-auto mt-4 space-y-4">
						<div className="flex gap-3">
							<Button
								variant="outline"
								className="gap-2"
								onClick={async () => {
									const svg = await getSvgString();
									handleCopy(svg, "svg");
								}}
							>
								{copiedSvg ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
								Copy SVG
							</Button>
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => handleCopy(getCode(selectedFramework), "jsx")}
							>
								{copiedJsx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
								Copy JSX
							</Button>
						</div>

						<div className="flex gap-2 flex-wrap border-b border-border pb-3">
							{frameworks.map((framework) => (
								<Button
									key={framework.id}
									variant={selectedFramework === framework.id ? "default" : "ghost"}
									size="sm"
									onClick={() => setSelectedFramework(framework.id)}
									className={cn(
										"text-sm",
										selectedFramework === framework.id && "bg-foreground text-background",
									)}
								>
									{framework.label}
								</Button>
							))}
						</div>

						<div className="bg-muted/50 rounded-lg p-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs font-medium text-muted-foreground">
									{selectedFramework.toUpperCase()}
								</span>
							</div>
							<pre className="text-sm overflow-x-auto">
								<code className="text-foreground">{getCode(selectedFramework)}</code>
							</pre>
						</div>
					</TabsContent>

					<TabsContent value="design" className="flex-1 overflow-auto mt-4">
						<div className="grid grid-cols-4 gap-6">
							<div className="col-span-1 space-y-4">
								<div className="flex items-center justify-center p-8 border border-border rounded-lg bg-background">
									<Suspense fallback={<div>Loading...</div>}>
										<IconComponent
											size={size * 2}
											{...(color !== undefined ? { color } : {})}
											{...(icon.supportsStrokeWidth ? { strokeWidth } : {})}
										/>
									</Suspense>
								</div>
								<div className="flex items-center justify-center p-6 border border-border rounded-lg bg-background">
									<Suspense fallback={<div>Loading...</div>}>
										<IconComponent
											size={size}
											{...(color !== undefined ? { color } : {})}
											{...(icon.supportsStrokeWidth ? { strokeWidth } : {})}
										/>
									</Suspense>
								</div>
								<div className="flex items-center justify-center p-4 border border-border rounded-lg bg-background">
									<Suspense fallback={<div>Loading...</div>}>
										<IconComponent
											size={size / 1.5}
											{...(color !== undefined ? { color } : {})}
											{...(icon.supportsStrokeWidth ? { strokeWidth } : {})}
										/>
									</Suspense>
								</div>
							</div>

							<div className="col-span-3 flex items-center justify-center p-12 border border-border rounded-lg bg-background">
								<Suspense fallback={<div>Loading...</div>}>
									<IconComponent
										size={size * 4}
										{...(color !== undefined ? { color } : {})}
										{...(icon.supportsStrokeWidth ? { strokeWidth } : {})}
									/>
								</Suspense>
							</div>
						</div>

						<div className="mt-6 p-4 bg-muted/50 rounded-lg">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium">Version:</span> v0.0.2
								</div>
								<div>
									<span className="font-medium">Variant:</span> {icon.variant}
								</div>
								<div className="col-span-2">
									<span className="font-medium">Contributor:</span>
									<div className="flex items-center gap-2 mt-2">
										<div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
											JR
										</div>
										<span className="text-sm">Jaya Raj Srivathsav Adari</span>
									</div>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

export default IconDetailDialog;
