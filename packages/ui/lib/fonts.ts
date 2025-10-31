import localFont from "next/font/local";

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
