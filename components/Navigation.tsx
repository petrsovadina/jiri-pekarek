"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Home, Table, FileSpreadsheet, Settings, HelpCircle, Moon, Sun, User } from "lucide-react"
import { intl } from "@/lib/i18n"
import { Toggle } from "@/components/ui/toggle"

export function Navigation() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = [
    { href: "/", label: intl.formatMessage({ id: "app.home" }), icon: Home },
    { href: "/projects", label: intl.formatMessage({ id: "app.projects" }), icon: FileSpreadsheet },
    { href: "/data", label: intl.formatMessage({ id: "app.data" }), icon: Table },
    { href: "/settings", label: intl.formatMessage({ id: "app.settings" }), icon: Settings },
    { href: "/help", label: intl.formatMessage({ id: "app.help" }), icon: HelpCircle },
    { href: "/account", label: intl.formatMessage({ id: "app.account" }), icon: User },
  ]

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return null
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800 dark:text-white">TableGenAI</span>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Toggle
              aria-label="Toggle dark mode"
              pressed={theme === "dark"}
              onPressedChange={handleThemeToggle}
              className="ml-4"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Toggle>
          </div>
          <div className="sm:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="inline-flex items-center justify-center p-2 rounded-md">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-2" />
                        {item.label}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleThemeToggle}>
                  <div className="flex items-center">
                    {theme === "dark" ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                    {intl.formatMessage({ id: "app.toggleTheme" })}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

