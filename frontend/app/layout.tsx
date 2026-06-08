import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Starter",
  description: "Full-stack SaaS starter with Next.js and FastAPI"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
