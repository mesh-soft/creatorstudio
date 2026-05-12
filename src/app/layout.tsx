import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Studio | Healthcare Sites",
  description: "Next-generation healthcare site builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Outfit:wght@400;700&family=Plus+Jakarta+Sans:wght@400;700;800&family=Roboto:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
