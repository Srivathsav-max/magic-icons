"use client";

import * as Icons from "magic-icons";
import metadata from "magic-icons/metadata";
import { useEffect, useMemo, useState } from "react";

interface IconData {
	name: string;
	componentName: string;
}

interface MetadataType {
	icons: IconData[];
}

const calculateRows = (height: number, width: number) => {
	const diagonalDistance = Math.sqrt(height ** 2 + width ** 2);
	const rowSpacing = 200;
	const neededRows = Math.ceil(diagonalDistance / rowSpacing) + 8;
	return Math.max(12, neededRows);
};

export default function DiagonalIconsBackground() {
	const typedMetadata = metadata as MetadataType;

	const [rowCount, setRowCount] = useState(() => {
		if (typeof window !== "undefined") {
			return calculateRows(window.innerHeight, window.innerWidth);
		}
		return 20;
	});

	useEffect(() => {
		const handleResize = () => {
			setRowCount(calculateRows(window.innerHeight, window.innerWidth));
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const backgroundIcons = useMemo(() => {
		return typedMetadata.icons;
	}, [typedMetadata.icons]);

	const iconsMap = Icons as Record<
		string,
		React.ComponentType<{
			size?: number;
			className?: string;
		}>
	>;

	const rows = useMemo(() => {
		return Array.from({ length: rowCount }, (_, index) => {
			const isEvenRow = index % 2 === 0;
			const topPosition = -800 + index * 200;
			const iconStartIndex = (index * 100) % backgroundIcons.length;
			const iconEndIndex = Math.min(iconStartIndex + 100, backgroundIcons.length);
			const rowIcons = backgroundIcons.slice(iconStartIndex, iconEndIndex);

			return {
				key: `row-${index}`,
				animationClass: isEvenRow ? "animate-diagonal-scroll-1" : "animate-diagonal-scroll-2",
				topPosition,
				icons: rowIcons,
			};
		});
	}, [rowCount, backgroundIcons]);

	return (
		<div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
			{rows.map((row) => (
				<div
					key={row.key}
					className={`absolute ${row.animationClass}`}
					style={{
						transform: "rotate(-35deg)",
						top: `${row.topPosition}px`,
						left: "-800px",
						width: "250%",
					}}
				>
					<div className="flex gap-12 whitespace-nowrap">
						{row.icons.map((icon, index) => {
							const IconComponent = iconsMap[icon.componentName];
							if (!IconComponent) return null;
							return (
								<div key={`${row.key}-${index}`} className="shrink-0">
									<IconComponent size={40} className="text-foreground" />
								</div>
							);
						})}
						{row.icons.map((icon, index) => {
							const IconComponent = iconsMap[icon.componentName];
							if (!IconComponent) return null;
							return (
								<div key={`${row.key}-dup-${index}`} className="shrink-0">
									<IconComponent size={40} className="text-foreground" />
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
