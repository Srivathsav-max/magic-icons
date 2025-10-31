import { waldenburg } from "@magic-icons/ui";
import type { Metadata } from "next";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "./globals.css";

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
		<html lang="en" suppressHydrationWarning className={waldenburg.variable}>
			<body className="antialiased">
				<NextThemesProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</NextThemesProvider>
			</body>
		</html>
	);
}
