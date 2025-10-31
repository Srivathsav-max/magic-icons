"use client";

import * as Icons from "magic-icons";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IconCardProps {
	icon: {
		name: string;
		originalName: string;
		variant: string;
		category: string;
		supportsStrokeWidth: boolean;
	};
	size: number;
	color: string;
	strokeWidth: number;
	onClick?: () => void;
}

const IconCard = memo(({ icon, size, color, strokeWidth, onClick }: IconCardProps) => {
	const iconsMap = Icons as Record<
		string,
		React.ComponentType<{
			size?: number;
			color?: string;
			strokeWidth?: number;
		}>
	>;
	const IconComponent = iconsMap[icon.name];

	if (!IconComponent) {
		return null;
	}

	return (
		<Card
			className={cn(
				"group cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
				"bg-card",
			)}
			onClick={onClick}
		>
			<CardContent className="p-6 flex flex-col items-center gap-3">
				<div className="flex items-center justify-center w-full h-16 transition-transform group-hover:scale-110">
					<IconComponent
						size={size}
						color={color}
						{...(icon.supportsStrokeWidth ? { strokeWidth } : {})}
					/>
				</div>

				<div className="text-center w-full">
					<h3 className="text-sm font-medium text-foreground truncate">{icon.originalName}</h3>
					<span className="text-xs text-muted-foreground">{icon.variant}</span>
				</div>
			</CardContent>
		</Card>
	);
});

IconCard.displayName = "IconCard";

export default IconCard;
