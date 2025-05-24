import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Settings, User, Bell, Shield, Palette } from "lucide-react"

export default async function SettingsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex">
      <Navigation
        user={{
          name: user.name,
          avatar: user.avatar,
        }}
      />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and app settings.</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your account details from Kinde authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name || "User"}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 text-xl font-medium">{user.name?.charAt(0) || "U"}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium">{user.name || "Anonymous User"}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  App Preferences
                </CardTitle>
                <CardDescription>Customize your FocusFlow experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">Default Focus Duration</h4>
                      <p className="text-sm text-gray-600">Standard Pomodoro session length</p>
                    </div>
                    <Badge variant="outline">25 minutes</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">Break Duration</h4>
                      <p className="text-sm text-gray-600">Short break between sessions</p>
                    </div>
                    <Badge variant="outline">5 minutes</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">Long Break Duration</h4>
                      <p className="text-sm text-gray-600">Extended break after multiple sessions</p>
                    </div>
                    <Badge variant="outline">15 minutes</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Control how FocusFlow notifies you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">Session Reminders</h4>
                      <p className="text-sm text-gray-600">Get notified when sessions start/end</p>
                    </div>
                    <Badge variant="secondary">Browser notifications</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">Daily Summary</h4>
                      <p className="text-sm text-gray-600">Receive daily productivity reports</p>
                    </div>
                    <Badge variant="outline">Coming soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Your data protection and account security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">Data Storage</h4>
                      <p className="text-sm text-gray-600">Session data and statistics</p>
                    </div>
                    <Badge variant="secondary">Encrypted</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">Authentication</h4>
                      <p className="text-sm text-gray-600">Powered by Kinde Auth</p>
                    </div>
                    <Badge variant="secondary">Secure</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel of FocusFlow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
                    </div>
                    <Badge variant="outline">Light mode</Badge>
                  </div>
                  <p className="text-sm text-gray-500">Dark mode and custom themes coming in future updates!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
