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
import { Add, ChevronLeft } from "magic-icons";
import { useEffect, useState } from "react";

interface Category {
	id: string;
	title: string;
	description: string;
	icon: string;
	weight: number;
}

export default function CategorySelector({
	variant,
	onSelect,
	onBack,
}: {
	variant: string;
	onSelect: (category: string) => void;
	onBack: () => void;
}) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newCategory, setNewCategory] = useState({
		id: "",
		title: "",
		description: "",
		icon: "",
		weight: 0,
	});

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			const res = await fetch("/api/categories");
			const data = await res.json();
			if (data.success) {
				setCategories(data.categories);
			}
		} catch (error) {
			console.error("Error fetching categories:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateCategory = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newCategory),
			});
			const data = await res.json();
			if (data.success) {
				setCategories([...categories, data.category]);
				setShowCreateForm(false);
				onSelect(data.category.id);
			}
		} catch (error) {
			console.error("Error creating category:", error);
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
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-2xl font-bold text-foreground mb-2">Select Category</h2>
							<p className="text-muted-foreground">Choose a category for your {variant} icons</p>
						</div>
						<Button variant="ghost" onClick={onBack} className="gap-2">
							<ChevronLeft className="h-4 w-4" />
							Back
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{categories.map((category) => (
							<Card
								key={category.id}
								className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
								onClick={() => onSelect(category.id)}
							>
								<CardContent className="p-6">
									<div className="flex items-start gap-3">
										<Badge className="w-10 h-10 rounded-lg flex items-center justify-center text-lg">
											{category.icon
												? category.icon.charAt(0).toUpperCase()
												: category.id.charAt(0).toUpperCase()}
										</Badge>
										<div className="flex-1">
											<h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
											{category.description && (
												<p className="text-sm text-muted-foreground mt-1">{category.description}</p>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}

						{/* Create New Category Card */}
						<Card
							className="cursor-pointer border-dashed hover:border-primary hover:bg-accent transition-all"
							onClick={() => setShowCreateForm(true)}
						>
							<CardContent className="p-6 flex flex-col items-center justify-center min-h-[140px]">
								<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
									<Add className="h-6 w-6 text-primary" />
								</div>
								<span className="font-medium text-foreground">Create New Category</span>
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>

			{/* Create Category Dialog */}
			<Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Category</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreateCategory} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="category-id">Category ID</Label>
							<Input
								id="category-id"
								type="text"
								required
								value={newCategory.id}
								onChange={(e) =>
									setNewCategory({
										...newCategory,
										id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
									})
								}
								placeholder="e.g., social-media"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="category-title">Title</Label>
							<Input
								id="category-title"
								type="text"
								required
								value={newCategory.title}
								onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
								placeholder="e.g., Social Media"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="category-description">Description</Label>
							<Textarea
								id="category-description"
								value={newCategory.description}
								onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
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
								Create & Continue
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
