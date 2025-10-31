import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "./globals.css";

export const waldenburg = localFont({
	src: [
		{
			path: "../public/fonts/Waldenburg-Buch.otf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/Waldenburg-BuchKursiv.otf",
			weight: "400",
			style: "italic",
		},
		{
			path: "../public/fonts/Waldenburg-Halbfett.otf",
			weight: "600",
			style: "normal",
		},
		{
			path: "../public/fonts/Waldenburg-HalbfettKursiv.otf",
			weight: "600",
			style: "italic",
		},
	],
	variable: "--font-waldenburg",
});

export const metadata: Metadata = {
	title: "Magic Icons",
	description: "A comprehensive React icon library - perfect for modern web applications",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<NextThemesProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<body className={`${waldenburg.variable} font-sans antialiased`}>{children}</body>
			</NextThemesProvider>
		</html>
	);
}
