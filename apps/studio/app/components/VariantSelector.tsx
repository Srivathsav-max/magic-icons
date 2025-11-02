"use client";

import {
	Badge,
	Button,
	Card,
	CardContent,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Textarea,
} from "@magic-icons/ui";
import { Add, Check } from "magic-icons";
import { useEffect, useState } from "react";

interface Variant {
	id: string;
	name: string;
	description: string;
	defaultStrokeWidth: number;
	supportsStrokeWidth: boolean;
	fillType: string;
}

export default function VariantSelector({ onSelect }: { onSelect: (variant: string) => void }) {
	const [variants, setVariants] = useState<Variant[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newVariant, setNewVariant] = useState({
		id: "",
		name: "",
		description: "",
		defaultStrokeWidth: 2,
		supportsStrokeWidth: true,
		fillType: "stroke",
	});

	useEffect(() => {
		fetchVariants();
	}, []);

	const fetchVariants = async () => {
		try {
			const res = await fetch("/api/variants");
			const data = await res.json();
			if (data.success) {
				setVariants(data.variants);
			}
		} catch (error) {
			console.error("Error fetching variants:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateVariant = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/variants", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newVariant),
			});
			const data = await res.json();
			if (data.success) {
				setVariants([...variants, data.variant]);
				setShowCreateForm(false);
				setNewVariant({
					id: "",
					name: "",
					description: "",
					defaultStrokeWidth: 2,
					supportsStrokeWidth: true,
					fillType: "stroke",
				});
			}
		} catch (error) {
			console.error("Error creating variant:", error);
		}
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardContent className="p-6">
					<h2 className="text-2xl font-bold text-foreground mb-2">Select Icon Variant</h2>
					<p className="text-muted-foreground mb-6">Choose the style variant for your icons</p>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{variants.map((variant) => (
							<Card
								key={variant.id}
								className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
								onClick={() => onSelect(variant.id)}
							>
								<CardContent className="p-6">
									<div className="flex items-start justify-between mb-3">
										<h3 className="text-lg font-semibold text-foreground">{variant.name}</h3>
										<Badge variant="secondary">{variant.fillType}</Badge>
									</div>
									<p className="text-sm text-muted-foreground mb-3">{variant.description}</p>
									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<span>Stroke: {variant.defaultStrokeWidth}px</span>
										{variant.supportsStrokeWidth && (
											<Badge variant="default" className="gap-1">
												<Check className="h-3 w-3" /> Customizable
											</Badge>
										)}
									</div>
								</CardContent>
							</Card>
						))}

						{/* Create New Variant Card */}
						<Card
							className="cursor-pointer border-dashed hover:border-primary hover:bg-accent transition-all"
							onClick={() => setShowCreateForm(true)}
						>
							<CardContent className="p-6 flex flex-col items-center justify-center min-h-[180px]">
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
									<Add className="h-6 w-6 text-primary" />
								</div>
								<span className="font-medium text-foreground">Create New Variant</span>
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>

			{/* Create Variant Dialog */}
			<Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Variant</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreateVariant} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="variant-id">Variant ID</Label>
							<Input
								id="variant-id"
								type="text"
								required
								value={newVariant.id}
								onChange={(e) => setNewVariant({ ...newVariant, id: e.target.value })}
								placeholder="e.g., filled, outline"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="variant-name">Name</Label>
							<Input
								id="variant-name"
								type="text"
								required
								value={newVariant.name}
								onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
								placeholder="e.g., Filled Icons"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="variant-description">Description</Label>
							<Textarea
								id="variant-description"
								value={newVariant.description}
								onChange={(e) => setNewVariant({ ...newVariant, description: e.target.value })}
								rows={3}
							/>
						</div>
						<div className="flex gap-4 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowCreateForm(false)}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button type="submit" className="flex-1">
								Create
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
