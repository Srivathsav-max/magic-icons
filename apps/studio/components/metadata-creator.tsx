"use client";

import {
	Alert,
	AlertDescription,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from "@magic-icons/ui";
import { useState } from "react";

interface MetadataCreatorProps {
	iconId?: string;
	onCreateSuccess?: () => void;
}

export function MetadataCreator({ iconId: initialIconId, onCreateSuccess }: MetadataCreatorProps) {
	const [iconId, setIconId] = useState(initialIconId || "");
	const [name, setName] = useState("");
	const [category, setCategory] = useState("action");
	const [description, setDescription] = useState("");
	const [tags, setTags] = useState("");
	const [author, setAuthor] = useState("");
	const [creating, setCreating] = useState(false);
	const [message, setMessage] = useState("");

	const categories = [
		"user",
		"communication",
		"navigation",
		"media",
		"file",
		"commerce",
		"action",
		"security",
		"ui",
		"data",
		"time",
		"location",
		"status",
		"work",
		"misc",
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!iconId || !name) {
			setMessage("Please provide icon ID and name");
			return;
		}

		setCreating(true);
		setMessage("");

		const metadata = {
			id: iconId,
			name,
			componentBaseName: name.replace(/\s+/g, ""),
			category,
			tags: tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
			aliases: [],
			description: description || `${name} icon - ${category}`,
			variants: {
				outline: {
					available: false,
					componentName: `${name.replace(/\s+/g, "")}Outline`,
				},
				bulk: {
					available: false,
					componentName: `${name.replace(/\s+/g, "")}Bulk`,
				},
				broken: {
					available: false,
					componentName: `${name.replace(/\s+/g, "")}Broken`,
				},
				light: {
					available: false,
					componentName: `${name.replace(/\s+/g, "")}Light`,
				},
				twoTone: {
					available: false,
					componentName: `${name.replace(/\s+/g, "")}TwoTone`,
				},
			},
			metadata: {
				addedDate: new Date().toISOString().split("T")[0],
				lastModified: new Date().toISOString().split("T")[0],
				version: "0.0.1",
				author: author || "Unknown",
				popularity: 0,
				isDeprecated: false,
			},
			usage: {
				recommended: [],
				codeExample: `import { ${name.replace(/\s+/g, "")}TwoTone } from 'magic-icons';\n\n<${name.replace(/\s+/g, "")}TwoTone size={24} color="currentColor" />`,
			},
			accessibility: {
				ariaLabel: iconId,
				title: name,
			},
		};

		try {
			const response = await fetch("/api/metadata", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ iconId, metadata }),
			});

			const data = await response.json();

			if (data.success) {
				setMessage("Metadata created successfully!");
				setIconId("");
				setName("");
				setDescription("");
				setTags("");
				setAuthor("");
				onCreateSuccess?.();
			} else {
				setMessage(`Error: ${data.error}`);
			}
		} catch (error) {
			setMessage("Failed to create metadata");
			console.error(error);
		} finally {
			setCreating(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create New Metadata</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="iconId">Icon ID (kebab-case)</Label>
						<Input
							id="iconId"
							type="text"
							value={iconId}
							onChange={(e) => setIconId(e.target.value)}
							placeholder="e.g., arrow-up"
							required
						/>
					</div>

					<div>
						<Label htmlFor="name">Display Name</Label>
						<Input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g., Arrow Up"
							required
						/>
					</div>

					<div>
						<Label htmlFor="category">Category</Label>
						<Select value={category} onValueChange={setCategory}>
							<SelectTrigger id="category">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{categories.map((cat) => (
									<SelectItem key={cat} value={cat}>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Optional description"
							rows={3}
						/>
					</div>

					<div>
						<Label htmlFor="tags">Tags (comma-separated)</Label>
						<Input
							id="tags"
							type="text"
							value={tags}
							onChange={(e) => setTags(e.target.value)}
							placeholder="e.g., arrow, direction, up"
						/>
					</div>

					<div>
						<Label htmlFor="author">Author</Label>
						<Input
							id="author"
							type="text"
							value={author}
							onChange={(e) => setAuthor(e.target.value)}
							placeholder="Your name"
						/>
					</div>

					<Button type="submit" disabled={creating} className="w-full">
						{creating ? "Creating..." : "Create Metadata"}
					</Button>

					{message && (
						<Alert
							variant={
								message.includes("Error") || message.includes("Failed") ? "error" : "success"
							}
						>
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}
				</form>
			</CardContent>
		</Card>
	);
}
