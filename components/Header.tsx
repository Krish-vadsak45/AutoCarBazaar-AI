'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Heart, Layout, LogOut, Menu, User, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

import { cn, getAvatarColor, getInitials } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getAdminPortalHref = () => {
    const role = session?.user?.role;
    console.log('User role:', session?.user);
    if (role === 'admin') {
      return `/admin/${session?.user?._id}/dashboard`;
    }
    if (role === 'vendor') {
      return `/vendor/${session?.user?.vendorId}/dashboard`;
    }
    return '/admin/login';
  };

  // Handle scroll effect for transparency/glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Cars', href: '/all-cars' },
    { name: 'About Us', href: '/aboutus' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b w-screen',
        isScrolled || isMobileMenuOpen
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-gray-200 dark:border-slate-800 shadow-sm py-3'
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary relative group',
                  pathname === link.href ? 'text-primary' : 'text-gray-600 dark:text-gray-300'
                )}
              >
                {link.name}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full',
                    pathname === link.href ? 'w-full' : ''
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {status === 'authenticated' ? (
              // SIGNED IN STATE (NextAuth)
              <div className="flex items-center gap-3">
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

                <Link href={getAdminPortalHref()} className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-card-foreground hover:bg-primary transition-all font-medium cursor-pointer"
                  >
                    <Layout size={18} className="mr-2" />
                    Admin Portal
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar size="lg">
                        <AvatarImage
                          src={session.user?.image || undefined}
                          alt={session.user?.name || 'User'}
                        />
                        <AvatarFallback
                          style={{
                            backgroundColor: getAvatarColor(session.user?.name || ''),
                          }}
                          className="text-white font-semibold"
                        >
                          {getInitials(session.user?.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/my-reservation">
                      <DropdownMenuItem className="cursor-pointer">
                        <Layout className="mr-2 h-4 w-4" />
                        <span>My Reservation</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // SIGNED OUT STATE (NextAuth)
              <div className="flex items-center gap-3">
                <Link href="/admin/login" className="hidden lg:block">
                  <Button
                    variant="ghost"
                    className="font-semibold text-muted-foreground hover:text-primary"
                  >
                    Admin Portal
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="ghost" className="font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />

            {/* Mobile User Profile (if authenticated) */}
            {status === 'authenticated' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar size="default">
                      <AvatarImage
                        src={session.user?.image || undefined}
                        alt={session.user?.name || 'User'}
                      />
                      <AvatarFallback
                        style={{
                          backgroundColor: getAvatarColor(session.user?.name || ''),
                        }}
                        className="text-white font-semibold"
                      >
                        {getInitials(session.user?.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/my-reservation">
                    <DropdownMenuItem className="cursor-pointer">
                      <Layout className="mr-2 h-4 w-4" />
                      <span>My Reservation</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/saved-cars">
                    <DropdownMenuItem className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Saved Cars
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <button
              className="p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen ? (
        <div className="md:hidden absolute top-full left-0 w-full h-[calc(100vh-80px)] bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'text-lg font-medium py-3 px-4 rounded-xl transition-colors',
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-900'
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {status === 'authenticated' ? (
            <div className="flex flex-col gap-3 mt-4 border-t pt-4 border-gray-100 dark:border-slate-800">
              <Link
                href="/saved-cars"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-xl"
              >
                <Heart size={20} />
                <span className="font-medium">Saved Cars</span>
              </Link>

              <Link
                href={getAdminPortalHref()}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-xl"
              >
                <Layout size={20} />
                <span className="font-medium">Admin Portal</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-auto">
              <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start px-4 h-12 text-base">
                  <Layout className="mr-2 h-5 w-5" />
                  Admin Portal
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-12 text-base">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full h-12 text-base">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
};

export default Header;
