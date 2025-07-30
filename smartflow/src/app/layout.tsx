import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./contexts/auth-context";

export const metadata: Metadata = {
  title: "SmartFlow - IT Management System",
  description: "Comprehensive IT management system for hardware requests, tickets, and access management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
