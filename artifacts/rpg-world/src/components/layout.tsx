import React from "react";
import { Link, useLocation } from "wouter";
import { Sword, Trophy, Globe, Users, Home, Shield } from "lucide-react";

function StarField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 100 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${(i % 3) * 0.9 + 0.4}px`,
            height: `${(i % 3) * 0.9 + 0.4}px`,
            left: `${(i * 137.508) % 100}%`,
            top: `${(i * 97.3) % 100}%`,
            opacity: (i % 6) * 0.09 + 0.06,
            animation: `twinkle ${1.5 + (i % 5) * 0.6}s ease-in-out ${i * 0.07}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

const NAV = [
  { href: "/", label: "Sảnh Chờ", icon: Home },
  { href: "/characters", label: "Nhân Vật", icon: Users },
  { href: "/worlds", label: "Thế Giới", icon: Globe },
  { href: "/leaderboard", label: "Xếp Hạng", icon: Trophy },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div
      className="min-h-[100dvh] flex flex-col w-full text-foreground relative"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #150825 0%, #06020f 45%, #000000 100%)" }}
    >
      <StarField />

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }}
      />

      {/* Top HUD bar */}
      <header
        className="relative z-50 shrink-0"
        style={{
          background: "linear-gradient(180deg,rgba(0,0,0,0.98) 0%,rgba(8,3,18,0.95) 100%)",
          borderBottom: "1px solid rgba(180,130,0,0.25)",
          boxShadow: "0 0 60px rgba(180,120,0,0.06)",
        }}
      >
        {/* Top gold accent line */}
        <div style={{ height: "2px", background: "linear-gradient(90deg,transparent 0%,rgba(180,120,0,0.6) 15%,rgba(255,200,40,0.95) 50%,rgba(180,120,0,0.6) 85%,transparent 100%)" }} />

        <div className="flex items-center justify-between px-4 md:px-10 h-[52px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 select-none group">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Shield
                className="w-8 h-8 absolute inset-0 text-yellow-500"
                style={{ filter: "drop-shadow(0 0 12px rgba(220,170,0,0.9)) drop-shadow(0 0 30px rgba(220,140,0,0.4))" }}
              />
              <Sword
                className="w-4 h-4 absolute inset-0 m-auto text-red-400"
                style={{ filter: "drop-shadow(0 0 5px rgba(255,60,60,0.9))" }}
              />
            </div>
            <div>
              <div
                className="text-[13px] font-black uppercase tracking-[0.3em] leading-none"
                style={{
                  color: "#f0c040",
                  textShadow: "0 0 15px rgba(240,190,60,0.85), 0 0 40px rgba(240,160,0,0.3)",
                  fontFamily: "serif",
                  letterSpacing: "0.25em",
                }}
              >
                ⚔ RPG WORLD ⚔
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"
                  style={{ boxShadow: "0 0 6px #4ade80", animation: "twinkle 0.8s ease-in-out infinite alternate" }}
                />
                <span className="text-[9px] tracking-[0.25em] font-bold" style={{ color: "rgba(100,220,100,0.8)", fontFamily: "monospace" }}>
                  SERVER ONLINE
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center h-full">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? location === "/" : location.startsWith(href);
              return (
                <Link key={href} href={href}>
                  <div
                    className="relative flex items-center gap-2 px-5 h-[52px] text-[11px] font-black uppercase tracking-[0.18em] cursor-pointer select-none transition-all duration-200"
                    style={{
                      color: active ? "#f0c040" : "rgba(200,170,100,0.45)",
                      textShadow: active ? "0 0 20px rgba(240,190,60,1), 0 0 40px rgba(240,160,0,0.5)" : "none",
                      background: active ? "linear-gradient(180deg, rgba(200,150,0,0.06) 0%, transparent 100%)" : "transparent",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ filter: active ? "drop-shadow(0 0 4px rgba(240,190,60,0.8))" : "none" }} />
                    {label}
                    {active && (
                      <div
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                        style={{ background: "linear-gradient(90deg,transparent,#f0c040,transparent)", boxShadow: "0 0 12px rgba(240,190,60,0.8)" }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Server info */}
          <div
            className="hidden md:flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded"
            style={{ background: "rgba(0,20,0,0.5)", border: "1px solid rgba(0,180,0,0.2)", color: "rgba(0,200,0,0.7)" }}
          >
            <span style={{ color: "#4ade80" }}>◉</span> ONLINE
          </div>
        </div>

        {/* Bottom accent */}
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent 0%,rgba(180,120,0,0.25) 25%,rgba(180,120,0,0.25) 75%,transparent 100%)" }} />
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          background: "linear-gradient(180deg,rgba(5,2,12,0.97) 0%,rgba(0,0,0,0.99) 100%)",
          borderTop: "1px solid rgba(180,120,0,0.25)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.95)",
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link key={href} href={href} className="flex-1">
              <div
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-all"
                style={{
                  color: active ? "#f0c040" : "rgba(180,150,80,0.3)",
                  textShadow: active ? "0 0 14px rgba(240,190,60,0.9)" : "none",
                }}
              >
                {active && (
                  <div
                    className="absolute top-0 left-3 right-3 h-[2px]"
                    style={{ background: "linear-gradient(90deg,transparent,#f0c040,transparent)", boxShadow: "0 0 8px rgba(240,190,60,0.7)" }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden h-14" />
    </div>
  );
}
