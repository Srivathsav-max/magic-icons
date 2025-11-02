"use client";

import { Button, Card } from "@magic-icons/ui";
import { ArrowRightTwo, Check, Copy, Github, Moon, Sun } from "magic-icons";
import metadata from "magic-icons/metadata";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import DiagonalIconsBackground from "@/components/DiagonalIconsBackground";

interface IconData {
	name: string;
	componentName: string;
}

interface MetadataType {
	icons: IconData[];
}

export default function Home() {
	const { theme, setTheme } = useTheme();
	const [copied, setCopied] = useState(false);
	const [mounted, setMounted] = useState(false);
	const router = useRouter();

	const installCommand = "npm install magic-icons";
	const typedMetadata = metadata as MetadataType;
	const iconCount = typedMetadata.icons.length;

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

	return (
		<div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
			{/* Diagonal Icons Background */}
			<DiagonalIconsBackground />

			{/* Main Card */}
			<Card className="max-w-4xl w-full relative z-10 bg-background border-2 shadow-2xl">
				<div className="p-12 space-y-12 text-center">
					{/* Theme Toggle - Inside Card */}
					<div className="absolute top-6 right-6">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						>
							{mounted && theme === "dark" ? (
								<Sun className="h-5 w-5" />
							) : (
								<Moon className="h-5 w-5" />
							)}
						</Button>
					</div>
					{/* Hero Section */}
					<div className="space-y-6">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
							<span className="relative flex h-3 w-3">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
								<span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_12px_rgba(34,197,94,0.8),inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-1px_2px_rgba(0,0,0,0.2)]" />
							</span>
							{iconCount} Icons Available
						</div>

						<h1 className="text-6xl md:text-7xl font-bold tracking-tight">
							<span className="bg-foreground bg-clip-text text-transparent">Magic Icons</span>
						</h1>

						<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
							A comprehensive icon library for developer&apos;s
						</p>
					</div>

					{/* Installation */}
					<div className="space-y-4">
						<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Installation
						</p>
						<div className="flex flex-col items-center gap-3 max-w-2xl mx-auto">
							<button
								type="button"
								onClick={handleCopy}
								className="w-full bg-muted/50 backdrop-blur rounded-lg px-6 py-4 font-mono text-left border border-border hover:bg-muted transition-colors cursor-pointer flex items-center justify-between gap-3"
							>
								<code className="text-foreground">{installCommand}</code>
								{copied ? (
									<Check className="h-5 w-5 shrink-0 text-green-500" />
								) : (
									<Copy className="h-5 w-5 shrink-0 text-muted-foreground" />
								)}
							</button>
						</div>
					</div>

					{/* CTA Buttons */}
					<div className="flex items-center justify-center gap-4 flex-wrap">
						<Button
							onClick={() => router.push("/icons")}
							size="lg"
							className="gap-2 text-base px-8"
						>
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

					{/* Footer */}
					<div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
						<p className="flex items-center gap-1">
							Made with <span className="text-red-500">♥</span> by{" "}
							<a
								href="https://github.com/srivathsav-max"
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-foreground hover:text-primary transition-colors"
							>
								Srivathsav
							</a>
						</p>
						<p className="text-xs">
							© {new Date().getFullYear()} Magic Icons. All rights reserved.
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
