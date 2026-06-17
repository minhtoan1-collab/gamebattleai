import React from "react";
import { Link, useLocation } from "wouter";
import { Scroll, Sword, Trophy, Globe, Menu, X, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: "/", label: "Trang Chủ", icon: Home },
    { href: "/characters", label: "Nhân Vật", icon: Users },
    { href: "/worlds", label: "Thế Giới", icon: Globe },
    { href: "/leaderboard", label: "Xếp Hạng", icon: Trophy },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background dark text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sword className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-secondary tracking-wider font-serif">
              RPG World
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-secondary ${
                    isActive ? "text-secondary border-b-2 border-secondary h-16" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground hover:text-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card">
          <nav className="flex flex-col p-4 gap-4">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-2 rounded-md ${
                    isActive ? "bg-primary/10 text-secondary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
          <Scroll className="w-5 h-5 text-primary opacity-50" />
          <p>© {new Date().getFullYear()} RPG World. Huyền thoại bắt đầu từ đây.</p>
        </div>
      </footer>
    </div>
  );
}
