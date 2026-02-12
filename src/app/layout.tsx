"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentURl, setCurrentURl] = useState("");
  const [adminContainer, setAdminContainer] = useState(false);
  useEffect(() => {
    setCurrentURl(window.location.href);
    if (currentURl.includes("/admin")) {
      setAdminContainer(true);
    } else {
      setAdminContainer(false);
    }
  }, [currentURl]);
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} scrollbar-hide`}>
          <ThemeProvider>
            {!adminContainer && <Header />}
            {children}
            {!adminContainer && <Footer />}{" "}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
