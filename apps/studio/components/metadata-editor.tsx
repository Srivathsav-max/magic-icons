"use client";

import {
	Alert,
	AlertDescription,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Checkbox,
	Input,
	Label,
	Textarea,
} from "@magic-icons/ui";
import { useEffect, useState } from "react";

interface MetadataEditorProps {
	iconId?: string;
	onSaveSuccess?: () => void;
}

interface IconMetadata {
	id: string;
	name: string;
	componentBaseName: string;
	category: string;
	tags: string[];
	aliases: string[];
	description: string;
	variants: Record<string, unknown>;
	metadata: {
		addedDate: string;
		lastModified: string;
		version: string;
		author: string;
		popularity: number;
		isDeprecated: boolean;
		replacedBy?: string;
	};
	usage: {
		recommended: string[];
		codeExample: string;
	};
	accessibility: {
		ariaLabel: string;
		title: string;
	};
}

export function MetadataEditor({ iconId, onSaveSuccess }: MetadataEditorProps) {
	const [metadata, setMetadata] = useState<IconMetadata | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [isRenaming, setIsRenaming] = useState(false);
	const [newIconId, setNewIconId] = useState("");
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		if (iconId) {
			const fetchMetadata = async () => {
				setLoading(true);
				try {
					const response = await fetch(`/api/metadata?iconId=${iconId}`);
					const data = await response.json();

					if (data.success) {
						setMetadata(data.metadata);
					} else {
						setMessage(`Error: ${data.error}`);
					}
				} catch (error) {
					setMessage("Failed to load metadata");
					console.error(error);
				} finally {
					setLoading(false);
				}
			};
			fetchMetadata();
		}
	}, [iconId]);

	const handleRename = async () => {
		if (!newIconId || newIconId === metadata?.id) {
			setIsRenaming(false);
			return;
		}

		setSaving(true);
		setMessage("");

		try {
			const response = await fetch("/api/icons/rename", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					oldId: metadata?.id,
					newId: newIconId,
					category: metadata?.category,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setMessage("Icon renamed successfully!");
				setIsRenaming(false);
				onSaveSuccess?.();
			} else {
				setMessage(`Error: ${data.error}`);
			}
		} catch (error) {
			setMessage("Failed to rename icon");
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!metadata) return;

		const confirmed = window.confirm(
			`Are you sure you want to delete "${metadata.name}"? This will remove all variants and cannot be undone.`
		);

		if (!confirmed) return;

		setDeleting(true);
		setMessage("");

		try {
			const response = await fetch(
				`/api/icons/delete?iconId=${metadata.id}&category=${metadata.category}`,
				{ method: "DELETE" }
			);

			const data = await response.json();

			if (data.success) {
				setMessage("Icon deleted successfully!");
				setTimeout(() => {
					onSaveSuccess?.();
				}, 1000);
			} else {
				setMessage(`Error: ${data.error}`);
			}
		} catch (error) {
			setMessage("Failed to delete icon");
			console.error(error);
		} finally {
			setDeleting(false);
		}
	};

	const handleSave = async () => {
		if (!metadata) return;

		setSaving(true);
		setMessage("");

		try {
			const response = await fetch("/api/metadata", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					iconId: metadata.id,
					updates: metadata,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setMessage("Metadata saved successfully!");
				onSaveSuccess?.();
			} else {
				setMessage(`Error: ${data.error}`);
			}
		} catch (error) {
			setMessage("Failed to save metadata");
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const updateField = (field: string, value: unknown) => {
		if (!metadata) return;
		setMetadata({ ...metadata, [field]: value });
	};

	const updateNestedField = (parent: string, field: string, value: unknown) => {
		if (!metadata) return;
		setMetadata({
			...metadata,
			[parent]: {
				...(metadata[parent as keyof IconMetadata] as Record<string, unknown>),
				[field]: value,
			},
		});
	};

	if (loading) {
		return <div className="text-center">Loading metadata...</div>;
	}

	if (!metadata) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<p className="text-muted-foreground">Select an icon to edit its metadata</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Edit Metadata: {metadata.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div>
						<Label htmlFor="iconId">Icon ID</Label>
						<div className="flex gap-2">
							<Input
								id="iconId"
								type="text"
								value={isRenaming ? newIconId : metadata.id}
								onChange={(e) => setNewIconId(e.target.value)}
								disabled={!isRenaming}
								placeholder="e.g., arrow-up"
							/>
							<Button
								type="button"
								variant={isRenaming ? "default" : "outline"}
								onClick={() => {
									if (isRenaming) {
										handleRename();
									} else {
										setNewIconId(metadata.id);
										setIsRenaming(true);
									}
								}}
							>
								{isRenaming ? "Save" : "Rename"}
							</Button>
							{isRenaming && (
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setIsRenaming(false);
										setNewIconId("");
									}}
								>
									Cancel
								</Button>
							)}
						</div>
					</div>

					<div>
						<Label htmlFor="name">Display Name</Label>
						<Input
							id="name"
							type="text"
							value={metadata.name}
							onChange={(e) => updateField("name", e.target.value)}
						/>
					</div>

					<div>
						<Label htmlFor="componentBaseName">Component Base Name</Label>
						<Input
							id="componentBaseName"
							type="text"
							value={metadata.componentBaseName}
							onChange={(e) => updateField("componentBaseName", e.target.value)}
							placeholder="e.g., Activity, ArrowUp"
						/>
					</div>

					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={metadata.description}
							onChange={(e) => updateField("description", e.target.value)}
							rows={3}
						/>
					</div>

					<div>
						<Label htmlFor="tags">Tags (comma-separated)</Label>
						<Input
							id="tags"
							type="text"
							value={metadata.tags.join(", ")}
							onChange={(e) =>
								updateField(
									"tags",
									e.target.value.split(",").map((t) => t.trim()),
								)
							}
						/>
					</div>

					<div>
						<Label htmlFor="author">Author</Label>
						<Input
							id="author"
							type="text"
							value={metadata.metadata.author}
							onChange={(e) => updateNestedField("metadata", "author", e.target.value)}
						/>
					</div>

					<div>
						<Label htmlFor="version">Version</Label>
						<Input
							id="version"
							type="text"
							value={metadata.metadata.version}
							onChange={(e) => updateNestedField("metadata", "version", e.target.value)}
						/>
					</div>

					<div>
						<Label htmlFor="ariaLabel">ARIA Label</Label>
						<Input
							id="ariaLabel"
							type="text"
							value={metadata.accessibility.ariaLabel}
							onChange={(e) => updateNestedField("accessibility", "ariaLabel", e.target.value)}
						/>
					</div>

					<div className="flex items-center gap-2">
						<Checkbox
							id="deprecated"
							checked={metadata.metadata.isDeprecated}
							onCheckedChange={(checked) => updateNestedField("metadata", "isDeprecated", checked)}
						/>
						<Label htmlFor="deprecated">Mark as deprecated</Label>
					</div>

					<div className="flex gap-2">
						<Button type="button" onClick={handleSave} disabled={saving} className="flex-1">
							{saving ? "Saving..." : "Save Changes"}
						</Button>
						<Button
							type="button"
							onClick={handleDelete}
							disabled={deleting || saving}
							variant="destructive"
						>
							{deleting ? "Deleting..." : "Delete Icon"}
						</Button>
					</div>

					{message && (
						<Alert
							variant={
								message.includes("Error") || message.includes("Failed") ? "error" : "success"
							}
						>
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
