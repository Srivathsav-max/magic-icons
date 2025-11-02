import { waldenburg } from "@magic-icons/ui";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Magic Icons Studio",
	description: "Magic Icons Studio",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${waldenburg.variable} antialiased`}>{children}</body>
		</html>
	);
}
