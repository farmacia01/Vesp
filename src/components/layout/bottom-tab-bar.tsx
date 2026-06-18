"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CalendarDays, Wallet, Sparkles, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

const tabs: NavItem[] = [
  { name: 'Home', url: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', url: '/clients', icon: Users },
  { name: 'Tarefas', url: '/calendar', icon: CalendarDays },
  { name: 'Finanças', url: '/finance', icon: Wallet },
  { name: 'AI', url: '/vesp-ai', icon: Sparkles },
];

export function BottomTabBar() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(tabs[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Sync active tab with current URL
    const currentTab = tabs.find(t => pathname.startsWith(t.url))
    if (currentTab) setActiveTab(currentTab.name)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [pathname])

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2 z-50 mb-6 lg:hidden",
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 bg-background/60 border border-border backdrop-blur-xl py-1.5 px-1.5 rounded-full shadow-lg">
        {tabs.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 py-3 sm:px-6 sm:py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted/50 text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
