import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { prisma } from "./prisma"

export async function getAuthenticatedUser() {
  const { getUser, isAuthenticated } = getKindeServerSession()

  if (!(await isAuthenticated())) {
    return null
  }

  const kindeUser = await getUser()
  if (!kindeUser) return null

  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { kindeId: kindeUser.id },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        kindeId: kindeUser.id,
        email: kindeUser.email || "",
        name: `${kindeUser.given_name || ""} ${kindeUser.family_name || ""}`.trim() || null,
        avatar: kindeUser.picture || null,
      },
    })
  }

  return user
}

export async function requireAuth() {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}
