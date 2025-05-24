import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Page() {
  const user = await getAuthenticatedUser()

  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
