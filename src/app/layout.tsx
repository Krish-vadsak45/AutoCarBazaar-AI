"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import AuthProvider from "./providers";
import { usePathname } from "next/navigation";
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

  const pathname = usePathname();

  const isAdminTab = pathname.includes("/admin");
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <AuthProvider>
          <ThemeProvider>
            {!isAdminTab && <Header />}
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            {!isAdminTab && <Footer />}{" "}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
