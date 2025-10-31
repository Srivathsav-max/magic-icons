"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@magic-icons/ui";
import { Alert, AlertDescription } from "@magic-icons/ui";

interface SvgPreviewProps {
	iconId?: string;
	variant?: string;
	category?: string;
}

export function SvgPreview({ iconId, variant = "outline", category }: SvgPreviewProps) {
	const [svgContent, setSvgContent] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (iconId && category) {
			loadSvg();
		}
	}, [iconId, variant, category]);

	const loadSvg = async () => {
		if (!iconId || !category) return;

		setLoading(true);
		setError("");
		setSvgContent(null);

		try {
			// Try to fetch the SVG file from the icons directory
			const svgPath = `/api/icons/preview?iconId=${iconId}&variant=${variant}&category=${category}`;
			const response = await fetch(svgPath);
			
			if (response.ok) {
				const svg = await response.text();
				setSvgContent(svg);
			} else {
				setError("SVG file not found");
			}
		} catch (err) {
			setError("Failed to load SVG");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	if (!iconId) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>SVG Preview</CardTitle>
				</CardHeader>
				<CardContent className="py-12 text-center">
					<p className="text-muted-foreground">
						Select an icon to preview its SVG
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>SVG Preview: {iconId}</CardTitle>
			</CardHeader>
			<CardContent>
				{loading && (
					<div className="py-12 text-center text-muted-foreground">
						Loading preview...
					</div>
				)}

				{error && (
					<Alert variant="warning">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{svgContent && !loading && (
					<div className="space-y-4">
						<div className="flex items-center justify-center rounded-lg border border-border bg-muted/20 p-8">
							<div
								className="size-24"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: SVG content is from trusted source
								dangerouslySetInnerHTML={{ __html: svgContent }}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Variant:</span>
								<span className="font-medium">{variant}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Category:</span>
								<span className="font-medium">{category}</span>
							</div>
						</div>

						<details className="rounded-lg border border-border p-4">
							<summary className="cursor-pointer font-medium">View SVG Code</summary>
							<pre className="mt-4 overflow-x-auto rounded bg-muted p-4 text-xs">
								<code>{svgContent}</code>
							</pre>
						</details>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
