"use client"

import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Check, Palette } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function ThemeSelector() {
  const { colorTheme, setColorTheme, availableColorThemes } = useTheme()
  const { toast } = useToast()

  const handleThemeChange = (value: string) => {
    console.log("ThemeSelector: changing theme to", value)
    setColorTheme(value)

    // Show a toast to confirm the theme change
    toast({
      title: "Theme Changed",
      description: `Theme changed to ${availableColorThemes.find((t) => t.value === value)?.name || value}`,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableColorThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <div className={cn("mr-2 h-4 w-4 rounded-full", theme.bgColor)} />
              <span>{theme.name}</span>
            </div>
            {colorTheme === theme.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
