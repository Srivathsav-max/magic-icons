"use client";

import { Slider as SliderPrimitive } from "@base-ui-components/react/slider";
import Color from "color";
import { Drop } from "magic-icons";
import {
	type ComponentProps,
	createContext,
	type HTMLAttributes,
	memo,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type ColorPickerContextValue = {
	hue: number;
	saturation: number;
	lightness: number;
	alpha: number;
	mode: string;
	setHue: (hue: number) => void;
	setSaturation: (saturation: number) => void;
	setLightness: (lightness: number) => void;
	setAlpha: (alpha: number) => void;
	setMode: (mode: string) => void;
};

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined);

export const useColorPicker = () => {
	const context = useContext(ColorPickerContext);

	if (!context) {
		throw new Error("useColorPicker must be used within a ColorPickerProvider");
	}

	return context;
};

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
	value?: Parameters<typeof Color>[0];
	defaultValue?: Parameters<typeof Color>[0];
	onChange?: (value: Parameters<typeof Color.rgb>[0]) => void;
};

export const ColorPicker = ({
	value,
	defaultValue = "#000000",
	onChange,
	className,
	...props
}: ColorPickerProps) => {
	const selectedColor = Color(value);
	const defaultColor = Color(defaultValue);

	const [hue, setHue] = useState(selectedColor.hue() || defaultColor.hue() || 0);
	const [saturation, setSaturation] = useState(
		selectedColor.saturationl() || defaultColor.saturationl() || 100,
	);
	const [lightness, setLightness] = useState(
		selectedColor.lightness() || defaultColor.lightness() || 50,
	);
	const [alpha, setAlpha] = useState(selectedColor.alpha() * 100 || defaultColor.alpha() * 100);
	const [mode, setMode] = useState("hex");

	// Use ref to track if this is the initial mount to avoid calling onChange on mount
	const isInitialMount = useRef(true);
	// Store onChange in a ref to avoid it being in dependency arrays
	const onChangeRef = useRef(onChange);
	// Track if we're updating from value prop to prevent triggering onChange
	const isUpdatingFromValue = useRef(false);

	// Update ref when onChange changes
	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	// Update color when controlled value changes
	useEffect(() => {
		if (value) {
			isUpdatingFromValue.current = true;
			const color = Color(value);
			const hslColor = color.hsl();
			const [h, s, l] = hslColor.array();

			setHue(h);
			setSaturation(s);
			setLightness(l);
			setAlpha(color.alpha() * 100);

			// Reset flag after state updates complete (using microtask queue)
			queueMicrotask(() => {
				isUpdatingFromValue.current = false;
			});
		}
	}, [value]);

	// Notify parent of changes
	useEffect(() => {
		// Skip calling onChange on initial mount
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		// Skip if we're updating from value prop (parent controlled change)
		if (isUpdatingFromValue.current) {
			return;
		}

		if (onChangeRef.current) {
			const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100);
			const rgba = color.rgb().array();

			onChangeRef.current([rgba[0], rgba[1], rgba[2], alpha / 100]);
		}
	}, [hue, saturation, lightness, alpha]);

	return (
		<ColorPickerContext.Provider
			value={{
				hue,
				saturation,
				lightness,
				alpha,
				mode,
				setHue,
				setSaturation,
				setLightness,
				setAlpha,
				setMode,
			}}
		>
			<div className={cn("flex size-full flex-col gap-4", className)} {...props} />
		</ColorPickerContext.Provider>
	);
};

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerSelection = memo(({ className, ...props }: ColorPickerSelectionProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [positionX, setPositionX] = useState(0);
	const [positionY, setPositionY] = useState(0);
	const { hue, setSaturation, setLightness } = useColorPicker();

	const backgroundGradient = useMemo(() => {
		return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`;
	}, [hue]);

	const handlePointerMove = useCallback(
		(event: PointerEvent) => {
			if (!(isDragging && containerRef.current)) {
				return;
			}
			const rect = containerRef.current.getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
			const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
			setPositionX(x);
			setPositionY(y);
			setSaturation(x * 100);
			const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x);
			const lightness = topLightness * (1 - y);

			setLightness(lightness);
		},
		[isDragging, setSaturation, setLightness],
	);

	useEffect(() => {
		const handlePointerUp = () => setIsDragging(false);

		if (isDragging) {
			window.addEventListener("pointermove", handlePointerMove);
			window.addEventListener("pointerup", handlePointerUp);
		}

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
		};
	}, [isDragging, handlePointerMove]);

	return (
		<div
			className={cn("relative size-full cursor-Xhair rounded", className)}
			onPointerDown={(e) => {
				e.preventDefault();
				setIsDragging(true);
				handlePointerMove(e.nativeEvent);
			}}
			ref={containerRef}
			style={{
				background: backgroundGradient,
			}}
			{...props}
		>
			<div
				className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white"
				style={{
					left: `${positionX * 100}%`,
					top: `${positionY * 100}%`,
					boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
				}}
			/>
		</div>
	);
});

ColorPickerSelection.displayName = "ColorPickerSelection";

export type ColorPickerHueProps = ComponentProps<typeof SliderPrimitive.Root>;

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
	const { hue, setHue } = useColorPicker();

	return (
		<SliderPrimitive.Root
			className={cn("relative flex h-4 w-full touch-none", className)}
			min={0}
			max={360}
			onValueChange={(next) => {
				const nextHue = Array.isArray(next) ? next[0] : next;
				if (typeof nextHue === "number" && !Number.isNaN(nextHue)) {
					setHue(nextHue);
				}
			}}
			step={1}
			thumbAlignment="edge"
			value={hue}
			{...props}
		>
			<SliderPrimitive.Control className="relative flex h-full w-full items-center">
				<SliderPrimitive.Track className="relative my-0.5 h-3 w-full grow overflow-hidden rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
					<SliderPrimitive.Indicator className="absolute inset-0 bg-transparent" />
					<SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
				</SliderPrimitive.Track>
			</SliderPrimitive.Control>
		</SliderPrimitive.Root>
	);
};

export type ColorPickerAlphaProps = ComponentProps<typeof SliderPrimitive.Root>;

export const ColorPickerAlpha = ({ className, ...props }: ColorPickerAlphaProps) => {
	const { alpha, setAlpha } = useColorPicker();

	return (
		<SliderPrimitive.Root
			className={cn("relative flex h-4 w-full touch-none", className)}
			min={0}
			max={100}
			onValueChange={(next) => {
				const nextAlpha = Array.isArray(next) ? next[0] : next;
				if (typeof nextAlpha === "number" && !Number.isNaN(nextAlpha)) {
					setAlpha(nextAlpha);
				}
			}}
			step={1}
			thumbAlignment="edge"
			value={alpha}
			{...props}
		>
			<SliderPrimitive.Control className="relative flex h-full w-full items-center">
				<SliderPrimitive.Track className="relative my-0.5 h-3 w-full grow overflow-hidden rounded-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')] bg-center bg-repeat-x dark:bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALklEQVR4nGP8+vWrCAMewM3N/QafPBM+SWLAqAGDwQBGQgoIpZOB98KoAVQwAADxzQcSVIRCfQAAAABJRU5ErkJggg==')]">
					<div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-black/50 dark:to-white/50" />
					<SliderPrimitive.Indicator className="absolute inset-0 bg-transparent" />
					<SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
				</SliderPrimitive.Track>
			</SliderPrimitive.Control>
		</SliderPrimitive.Root>
	);
};

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>;

export const ColorPickerEyeDropper = ({ className, ...props }: ColorPickerEyeDropperProps) => {
	const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker();

	const handleEyeDropper = async () => {
		try {
			// @ts-expect-error - EyeDropper API is experimental
			const eyeDropper = new EyeDropper();
			const result = await eyeDropper.open();
			const color = Color(result.sRGBHex);
			const [h, s, l] = color.hsl().array();

			setHue(h);
			setSaturation(s);
			setLightness(l);
			setAlpha(100);
		} catch (error) {
			console.error("EyeDropper failed:", error);
		}
	};

	return (
		<Button
			className={cn("shrink-0 text-muted-foreground", className)}
			onClick={handleEyeDropper}
			size="icon"
			type="button"
			variant="outline"
			{...props}
		>
			<Drop size={16} />
		</Button>
	);
};

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>;

const formats = ["hex", "rgb", "css", "hsl"];

export const ColorPickerOutput = ({ className, ...props }: ColorPickerOutputProps) => {
	const { mode, setMode } = useColorPicker();

	return (
		<Select onValueChange={setMode} value={mode}>
			<SelectTrigger className={cn("h-8 w-full text-xs", className)} {...props}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{formats.map((format) => (
					<SelectItem className="text-xs" key={format} value={format}>
						{format.toUpperCase()}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerFormat = ({ className, ...props }: ColorPickerFormatProps) => {
	const { hue, saturation, lightness, alpha, mode, setHue, setSaturation, setLightness } =
		useColorPicker();
	const color = Color.hsl(hue, saturation, lightness, alpha / 100);
	const [localValue, setLocalValue] = useState("");

	const handleHexChange = (value: string) => {
		setLocalValue(value);
		try {
			const newColor = Color(value);
			const [h, s, l] = newColor.hsl().array();
			setHue(h);
			setSaturation(s);
			setLightness(l);
		} catch {
			// Invalid color, ignore
		}
	};

	if (mode === "hex") {
		const hex = color.hex();

		return (
			<div className={cn("w-full rounded-md shadow-sm", className)} {...props}>
				<Input
					className="h-8 w-full bg-secondary px-3 text-xs shadow-none"
					type="text"
					value={localValue || hex}
					onChange={(e) => handleHexChange(e.target.value)}
					onBlur={() => setLocalValue("")}
				/>
			</div>
		);
	}

	if (mode === "rgb") {
		const rgb = color
			.rgb()
			.array()
			.map((value) => Math.round(value));

		return (
			<div
				className={cn("-space-x-px flex items-center rounded-md shadow-sm", className)}
				{...props}
			>
				{rgb.map((value, index) => (
					<Input
						className={cn(
							"h-8 bg-secondary px-2 text-xs shadow-none",
							index === 0 && "rounded-r-none",
							index > 0 && index < rgb.length - 1 && "rounded-none",
							index === rgb.length - 1 && "rounded-l-none",
						)}
						key={index}
						readOnly
						type="text"
						value={value}
					/>
				))}
			</div>
		);
	}

	if (mode === "css") {
		const rgb = color
			.rgb()
			.array()
			.map((value) => Math.round(value));

		return (
			<div className={cn("w-full rounded-md shadow-sm", className)} {...props}>
				<Input
					className="h-8 w-full bg-secondary px-3 text-xs shadow-none"
					readOnly
					type="text"
					value={`rgba(${rgb.join(", ")}, ${alpha / 100})`}
				/>
			</div>
		);
	}

	if (mode === "hsl") {
		const hsl = color
			.hsl()
			.array()
			.map((value) => Math.round(value));

		return (
			<div
				className={cn("-space-x-px flex items-center rounded-md shadow-sm", className)}
				{...props}
			>
				{hsl.map((value, index) => (
					<Input
						className={cn(
							"h-8 bg-secondary px-2 text-xs shadow-none",
							index === 0 && "rounded-r-none",
							index > 0 && index < hsl.length - 1 && "rounded-none",
							index === hsl.length - 1 && "rounded-l-none",
						)}
						key={index}
						readOnly
						type="text"
						value={value}
					/>
				))}
			</div>
		);
	}

	return null;
};
