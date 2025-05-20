"use client"

import { CardFooter } from "@/components/ui/card"
import type React from "react"
import { useState } from "react"
import { User, Mail, Calendar, Edit2, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ThemeSettings } from "@/components/theme-settings"
import { NotificationSettings } from "@/components/notification-settings"

interface UserProfileProps {
  onClose?: () => void
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Task management enthusiast and productivity expert.",
    location: "San Francisco, CA",
    joinDate: "January 2023",
    timezone: "Pacific Time (PT)",
    language: "English",
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      weeklyDigest: false,
    },
  })

  const { toast } = useToast()

  const handleSaveProfile = () => {
    // In a real app, you would save the profile data to the backend here
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form data to original values
    setProfileData({
      ...profileData,
      name: user?.name || "",
      email: user?.email || "",
    })
  }

  const handleImageUpload = () => {
    // In a real app, this would open a file picker
    toast({
      title: "Feature Coming Soon",
      description: "Profile image upload will be available in a future update.",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle profile update
    console.log("Profile updated", { name: profileData.name, email: profileData.email })
  }

  return (
    <div className="container mx-auto py-6 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.picture || "/placeholder.svg"} alt={user?.name || "User"} />
                <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-1/3 rounded-full"
                onClick={handleImageUpload}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Upload new picture</span>
              </Button>
            </div>
            <CardTitle>{user?.name}</CardTitle>
            <CardDescription>{profileData.bio}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 opacity-70" />
                <span>{profileData.location}</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 opacity-70" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 opacity-70" />
                <span>Joined {profileData.joinDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column - Profile Details */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Update your account details</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                          id="timezone"
                          value={profileData.timezone}
                          onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-[100px] p-2 border rounded-md bg-background"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </form>
                </CardContent>
                {isEditing && (
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button type="submit" onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="appearance">
              <ThemeSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Close button at the bottom right */}
        <div className="md:col-span-3 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
