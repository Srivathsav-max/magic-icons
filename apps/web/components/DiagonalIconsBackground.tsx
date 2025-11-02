"use client";

import * as Icons from "magic-icons";
import metadata from "magic-icons/metadata";
import { useMemo } from "react";

interface IconData {
	name: string;
	componentName: string;
}

interface MetadataType {
	icons: IconData[];
}

export default function DiagonalIconsBackground() {
	const typedMetadata = metadata as MetadataType;

	// Use all icons for the background
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

	return (
		<div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
			{/* First diagonal row - moving right */}
			<div
				className="absolute animate-diagonal-scroll-1"
				style={{ transform: "rotate(-35deg)", top: "-400px", left: "-600px", width: "200%" }}
			>
				<div className="flex gap-12 whitespace-nowrap">
					{backgroundIcons.slice(0, 100).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row1-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{backgroundIcons.slice(0, 100).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row1-dup-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
				</div>
			</div>

			{/* Second diagonal row - moving left */}
			<div
				className="absolute animate-diagonal-scroll-2"
				style={{ transform: "rotate(-35deg)", top: "-200px", left: "-600px", width: "200%" }}
			>
				<div className="flex gap-12 whitespace-nowrap">
					{backgroundIcons.slice(100, 200).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row2-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{backgroundIcons.slice(100, 200).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row2-dup-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
				</div>
			</div>

			{/* Third diagonal row - moving right */}
			<div
				className="absolute animate-diagonal-scroll-1"
				style={{ transform: "rotate(-35deg)", top: "0px", left: "-600px", width: "200%" }}
			>
				<div className="flex gap-12 whitespace-nowrap">
					{backgroundIcons.slice(200, 300).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row3-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{backgroundIcons.slice(200, 300).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row3-dup-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
				</div>
			</div>

			{/* Fourth diagonal row - moving left */}
			<div
				className="absolute animate-diagonal-scroll-2"
				style={{ transform: "rotate(-35deg)", top: "200px", left: "-600px", width: "200%" }}
			>
				<div className="flex gap-12 whitespace-nowrap">
					{backgroundIcons.slice(300, 400).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row4-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{backgroundIcons.slice(300, 400).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row4-dup-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
				</div>
			</div>

			{/* Fifth diagonal row - moving right */}
			<div
				className="absolute animate-diagonal-scroll-1"
				style={{ transform: "rotate(-35deg)", top: "400px", left: "-600px", width: "200%" }}
			>
				<div className="flex gap-12 whitespace-nowrap">
					{backgroundIcons.slice(400, 500).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row5-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{backgroundIcons.slice(400, 500).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row5-dup-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
				</div>
			</div>

			{/* Sixth diagonal row - moving left */}
			<div
				className="absolute animate-diagonal-scroll-2"
				style={{ transform: "rotate(-35deg)", top: "600px", left: "-600px", width: "200%" }}
			>
				<div className="flex gap-12 whitespace-nowrap">
					{backgroundIcons.slice(0, 100).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row6-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{backgroundIcons.slice(0, 100).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row6-dup-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
				</div>
			</div>

			{/* Seventh diagonal row - moving right */}
			<div
				className="absolute animate-diagonal-scroll-1"
				style={{ transform: "rotate(-35deg)", top: "800px", left: "-600px", width: "200%" }}
			>
				<div className="flex gap-12 whitespace-nowrap">
					{backgroundIcons.slice(100, 200).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row7-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{backgroundIcons.slice(100, 200).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row7-dup-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
				</div>
			</div>

			{/* Eighth diagonal row - moving left */}
			<div
				className="absolute animate-diagonal-scroll-2"
				style={{ transform: "rotate(-35deg)", top: "1000px", left: "-600px", width: "200%" }}
			>
				<div className="flex gap-12 whitespace-nowrap">
					{backgroundIcons.slice(200, 300).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row8-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
					{/* Duplicate for seamless loop */}
					{backgroundIcons.slice(200, 300).map((icon, index) => {
						const IconComponent = iconsMap[icon.componentName];
						if (!IconComponent) return null;
						return (
							<div key={`row8-dup-${index}`} className="shrink-0">
								<IconComponent size={40} className="text-foreground" />
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
