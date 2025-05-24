import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Timer, Users, Trophy } from "lucide-react"
import { redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export default async function LoginPage() {

    const { isAuthenticated } = getKindeServerSession()

  if (await isAuthenticated()) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to FocusFlow</CardTitle>
            <CardDescription>
              Boost your productivity with smart Pomodoro sessions, real-time co-working, and AI insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Timer className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Smart Timer</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Co-working</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Trophy className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Leaderboard</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Zap className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-medium">AI Insights</p>
              </div>
            </div>

            <LoginLink>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
                Sign In to Get Started
              </Button> 
            </LoginLink>

            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
