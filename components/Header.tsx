"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Heart, Layout, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import { redirect, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const Header = () => {
  const pathname = usePathname();
  // Avoid reading theme during render to prevent SSR/CSR mismatch.
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for transparency/glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Cars", href: "/all-cars" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out border-b pt-1.5",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm"
          : "bg-transparent border-transparent",
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-8">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          {/* Render both logos and let CSS (tailwind 'dark' class) show/hide them.
              This avoids reading theme on render and prevents hydration mismatches. */}
          <div className="relative w-20 h-6">
            <Image
              src="/logo-black.png"
              alt="Logo"
              width={80}
              height={80}
              className="object-contain dark:hidden"
            />
            <Image
              src="/logo-white.png"
              alt="Logo"
              width={80}
              height={80}
              className="object-contain hidden dark:block absolute inset-0"
            />
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block text-foreground">
            AutoCarBazaar
          </span>
        </Link>

        {/* Middle: Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "relative text-sm font-medium transition-colors cursor-pointer hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground",
                "group",
              )}
            >
              {link.name}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full",
                  pathname === link.href ? "w-full" : "w-0",
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />

          <SignedIn>
            <Link href="/saved-cars" className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-card-foreground hover:bg-primary transition-all font-medium cursor-pointer"
              >
                <Heart size={18} className="mr-2" />
                Saved Cars
              </Button>
            </Link>
            <Link href="/admin" className="hidden md:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-card-foreground hover:bg-primary transition-all font-medium cursor-pointer"
              >
                <Layout size={18} className="mr-2" />
                Admin Portal
              </Button>
            </Link>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Reservations"
                  labelIcon={
                    <Image
                      src="/reservation-icon.png"
                      alt="Reservations"
                      width={24}
                      height={24}
                    />
                  }
                  onClick={() => redirect("/reservations")}
                />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground hover:bg-accent rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg animate-in slide-in-from-top-5">
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-border w-full my-1" />
            <SignedIn>
              <Link
                href="/saved-cars"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  <Heart size={18} className="mr-2" />
                  Saved Cars
                </Button>
              </Link>
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Layout size={18} className="mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
