"use client";

import { Badge, Button, Card, CardContent } from "@magic-icons/ui";
import { ArrowLeft, Check, Import } from "magic-icons";
import { useState } from "react";
import CategorySelector from "./components/CategorySelector";
import IconLibrary from "./components/IconLibrary";
import IconUploader from "./components/IconUploader";
import VariantSelector from "./components/VariantSelector";

type View = "library" | "upload";
type Step = "variant" | "category" | "upload";

export default function StudioPage() {
	const [view, setView] = useState<View>("library");
	const [step, setStep] = useState<Step>("variant");
	const [selectedVariant, setSelectedVariant] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");

	const handleVariantSelect = (variant: string) => {
		setSelectedVariant(variant);
		setStep("category");
	};

	const handleCategorySelect = (category: string) => {
		setSelectedCategory(category);
		setStep("upload");
	};

	const handleBack = () => {
		if (step === "upload") {
			setStep("category");
		} else if (step === "category") {
			setStep("variant");
			setSelectedVariant("");
		}
	};

	const startUpload = () => {
		setView("upload");
		setStep("variant");
	};

	const backToLibrary = () => {
		setView("library");
		setStep("variant");
		setSelectedVariant("");
		setSelectedCategory("");
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<Card className="mb-8">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-bold text-foreground mb-2">Magic Icons Studio</h1>
								<p className="text-muted-foreground">
									{view === "library" ? "Manage your icon library" : "Create and upload new icons"}
								</p>
							</div>
							<div className="flex gap-3">
								{view === "upload" && (
									<Button variant="outline" onClick={backToLibrary} className="gap-2">
										<ArrowLeft className="h-4 w-4" />
										Back to Library
									</Button>
								)}
								{view === "library" && (
									<Button onClick={startUpload} className="gap-2">
										<Import className="h-4 w-4" />
										Upload New Icons
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Progress Steps - Only show during upload */}
				{view === "upload" && (
					<Card className="mb-8">
						<CardContent className="p-6">
							<div className="flex items-center justify-center space-x-4">
								<StepIndicator
									number={1}
									label="Variant"
									active={step === "variant"}
									completed={step === "category" || step === "upload"}
								/>
								<div className="h-px w-16 bg-border" />
								<StepIndicator
									number={2}
									label="Category"
									active={step === "category"}
									completed={step === "upload"}
								/>
								<div className="h-px w-16 bg-border" />
								<StepIndicator
									number={3}
									label="Upload"
									active={step === "upload"}
									completed={false}
								/>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Content */}
				<div className="max-w-7xl mx-auto">
					{view === "library" && <IconLibrary />}

					{view === "upload" && (
						<>
							{step === "variant" && <VariantSelector onSelect={handleVariantSelect} />}

							{step === "category" && (
								<CategorySelector
									variant={selectedVariant}
									onSelect={handleCategorySelect}
									onBack={handleBack}
								/>
							)}

							{step === "upload" && (
								<IconUploader
									variant={selectedVariant}
									category={selectedCategory}
									onBack={handleBack}
								/>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function StepIndicator({
	number,
	label,
	active,
	completed,
}: {
	number: number;
	label: string;
	active: boolean;
	completed: boolean;
}) {
	return (
		<div className="flex flex-col items-center">
			<Badge
				variant={completed || active ? "default" : "secondary"}
				className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
					active ? "ring-4 ring-primary/20 scale-110" : ""
				}`}
			>
				{completed ? <Check className="h-4 w-4" /> : number}
			</Badge>
			<span
				className={`mt-2 text-sm font-medium ${
					active ? "text-foreground" : "text-muted-foreground"
				}`}
			>
				{label}
			</span>
		</div>
	);
}
