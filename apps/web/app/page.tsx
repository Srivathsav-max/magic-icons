"use client";

import { Button } from "@magic-icons/ui";
import { ArrowRightTwo, Check, Copy, Github, Moon, Sun } from "magic-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import IconShowcase from "@/components/IconShowcase";

export default function Home() {
	const { theme, setTheme } = useTheme();
	const [showShowcase, setShowShowcase] = useState(false);
	const [copied, setCopied] = useState(false);
	const [mounted, setMounted] = useState(false);

	const installCommand = "npm install magic-icons";

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(installCommand);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	if (showShowcase) {
		return <IconShowcase />;
	}

	return (
		<div className="min-h-screen from-background via-background to-muted/20 flex items-center justify-center p-6 relative">
			{/* Theme Toggle */}
			<div className="absolute top-6 right-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					{mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
				</Button>
			</div>

			<div className="max-w-4xl w-full space-y-12 text-center">
				{/* Hero Section */}
				<div className="space-y-6">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
						</span>
						500+ Icons Available
					</div>

					<h1 className="text-6xl md:text-7xl font-bold tracking-tight">
						<span className="bg-foreground bg-clip-text text-transparent">Magic Icons</span>
					</h1>

					<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
						A comprehensive React icon library with 500 customizable icons across 5 beautiful
						variants
					</p>
				</div>

				{/* Installation */}
				<div className="space-y-4">
					<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Installation
					</p>
					<div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
						<div className="flex-1 bg-muted/50 backdrop-blur rounded-lg px-6 py-4 font-mono text-left border border-border">
							<code className="text-foreground">{installCommand}</code>
						</div>
						<Button
							onClick={handleCopy}
							variant="outline"
							size="icon"
							className="h-12 w-12 shrink-0"
						>
							{copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
						</Button>
					</div>
				</div>

				{/* CTA Buttons */}
				<div className="flex items-center justify-center gap-4 flex-wrap">
					<Button onClick={() => setShowShowcase(true)} size="lg" className="gap-2 text-base px-8">
						Browse Icons
						<ArrowRightTwo className="h-5 w-5" />
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="gap-2 text-base px-8"
						onClick={() => window.open("https://github.com/srivathsav-max/magic-icons", "_blank")}
					>
						<Github className="h-5 w-5" />
						View on GitHub
					</Button>
				</div>
			</div>
		</div>
	);
}
