"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Filter, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserDropdown } from "@/components/user-dropdown"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/contexts/auth-context"

interface HeaderProps {
  showProfile: boolean
  onShowProfile: () => void
  onHideProfile: () => void
}

export function Header({ showProfile, onShowProfile, onHideProfile }: HeaderProps) {
  const { user } = useAuth()
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        {showProfile && (
          <Button variant="ghost" size="icon" onClick={onHideProfile} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">Todo Board</span>
        </Link>
        {showProfile && <span className="text-xl font-semibold">/ My Profile</span>}
      </div>
      <div className="flex items-center gap-2">
        {!showProfile && (
          <>
            <Button variant="ghost" size="icon" onClick={toggleFilters} title="Filters">
              <Filter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="New Task">
              <Plus className="h-5 w-5" />
            </Button>
          </>
        )}
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
        <div className="flex items-center gap-2">
          <UserDropdown onShowProfile={onShowProfile} />
        </div>
      </div>
    </header>
  )
}
