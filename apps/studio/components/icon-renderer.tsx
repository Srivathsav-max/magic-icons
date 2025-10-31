"use client";

import * as Icons from "magic-icons";
import { memo } from "react";

interface IconRendererProps {
	iconName?: string;
	componentBaseName?: string;
	variant?: string;
	size?: number;
	className?: string;
}

export const IconRenderer = memo(({ iconName, componentBaseName, variant = "Outline", size = 24, className }: IconRendererProps) => {
	const iconsMap = Icons as Record<
		string,
		React.ComponentType<{
			size?: number;
			color?: string;
		}>
	>;
	
	// Try different component name formats
	let IconComponent = null;
	let attemptedName = "";
	
	// 1. Try the provided iconName directly
	if (iconName && iconsMap[iconName]) {
		IconComponent = iconsMap[iconName];
		attemptedName = iconName;
	}
	
	// 2. Try componentBaseName + variant
	if (!IconComponent && componentBaseName) {
		// Capitalize variant
		const capitalizedVariant = variant.charAt(0).toUpperCase() + variant.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
		const fullName = `${componentBaseName}${capitalizedVariant}`;
		attemptedName = fullName;
		if (iconsMap[fullName]) {
			IconComponent = iconsMap[fullName];
		}
	}
	
	// 3. Try with default Outline variant
	if (!IconComponent && componentBaseName) {
		const outlineName = `${componentBaseName}Outline`;
		attemptedName = outlineName;
		if (iconsMap[outlineName]) {
			IconComponent = iconsMap[outlineName];
		}
	}

	if (!IconComponent) {
		// Debug: log what we tried
		console.log('Icon not found:', { componentBaseName, variant, attemptedName, iconName });
		return (
			<div 
				className={className}
				style={{ width: size, height: size }}
			>
				<div className="flex items-center justify-center w-full h-full border-2 border-dashed border-muted-foreground/20 rounded">
					<span className="text-xs text-muted-foreground">?</span>
				</div>
			</div>
		);
	}

	return (
		<div className={className}>
			<IconComponent size={size} />
		</div>
	);
});

IconRenderer.displayName = "IconRenderer";
