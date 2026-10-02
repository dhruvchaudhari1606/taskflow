"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterSidebar = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setSidebarHovered(true);
  };

  const handleMouseLeaveSidebar = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarHovered(false);
    }, 200);
  };

  const handleHideSidebar = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setSidebarPinned(false);
    setSidebarHovered(false);
  };

  const handleExpandSidebar = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setSidebarPinned(true);
    setSidebarHovered(false);
  };

  // Close hover sidebar on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarHovered && !sidebarPinned) {
        setSidebarHovered(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarHovered, sidebarPinned]);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#faf8ff] dark:bg-[#0b0f17] text-[#131b2e] dark:text-[#f8fafc] font-sans selection:bg-[#4F46E5] selection:text-white">
      {/* Invisible Hover Trigger on Left Screen Edge when sidebar is unpinned */}
      {!sidebarPinned && (
        <div
          onMouseEnter={handleMouseEnterSidebar}
          className="fixed left-0 top-0 bottom-0 w-3.5 z-40 bg-transparent hover:bg-[#4F46E5]/10 transition-colors cursor-e-resize"
          title="Hover to reveal menu"
        />
      )}

      {/* Left Sidebar (Auto-hide hover drawer or pinned layout column) */}
      <Sidebar
        pinned={sidebarPinned}
        onHide={handleHideSidebar}
        onExpand={handleExpandSidebar}
        isHovered={sidebarHovered}
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
      />

      {/* Main Full-Screen Content Area (Takes 100% width, no outer horizontal scroll) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          sidebarPinned={sidebarPinned}
          onExpandSidebar={handleExpandSidebar}
        />
        <main className="flex-1 w-full min-h-0 overflow-auto custom-scrollbar px-2 sm:px-3 pt-1.5 sm:pt-2 pb-0 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
