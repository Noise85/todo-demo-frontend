"use client"

import { useTheme } from "@/contexts/theme-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function ThemeSettings() {
  const { colorTheme, setColorTheme, availableColorThemes } = useTheme()
  const { toast } = useToast()
  const [selectedTheme, setSelectedTheme] = useState(colorTheme)

  const handleThemeChange = (value: string) => {
    console.log("ThemeSettings: selecting theme", value)
    setSelectedTheme(value)
  }

  const handleSaveTheme = () => {
    console.log("ThemeSettings: saving theme", selectedTheme)
    setColorTheme(selectedTheme)

    toast({
      title: "Theme Saved",
      description: `Your color theme has been updated to ${
        availableColorThemes.find((theme) => theme.value === selectedTheme)?.name || selectedTheme
      }`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Color Theme</h3>
        <p className="text-muted-foreground mb-4">
          Choose a color theme for the application. This will change the primary color used throughout the app.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <RadioGroup value={selectedTheme} onValueChange={handleThemeChange} className="space-y-3">
            {availableColorThemes.map((theme) => (
              <div key={theme.value} className="flex items-center space-x-2">
                <RadioGroupItem value={theme.value} id={`theme-${theme.value}`} />
                <Label htmlFor={`theme-${theme.value}`} className="flex items-center cursor-pointer">
                  <div className={`w-4 h-4 rounded-full mr-2 ${theme.bgColor}`}></div>
                  {theme.name}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex flex-col space-y-4">
            <div className="p-4 border rounded-md">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="flex flex-wrap gap-2">
                <Button>Primary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="secondary">Secondary Button</Button>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSaveTheme}>Save Theme Settings</Button>
      </div>
    </div>
  )
}
