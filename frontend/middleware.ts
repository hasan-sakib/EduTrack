import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login"]
const ADMIN_ONLY_PATHS = ["/users", "/settings"]

interface DecodedToken {
  [claim: string]: unknown
}

function decodeJwtPayload(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1]
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = Buffer.from(base64, "base64").toString("utf-8")
    return JSON.parse(json) as DecodedToken
  } catch {
    return null
  }
}

function getRole(decoded: DecodedToken | null): string | null {
  if (!decoded) return null
  return (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string) ?? null
}

function isTokenValid(decoded: DecodedToken | null): boolean {
  if (!decoded) return false
  const exp = decoded["exp"] as number | undefined
  return typeof exp === "number" && Date.now() < exp * 1000
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("et_access_token")?.value
  const decoded = token ? decodeJwtPayload(token) : null
  const hasValidToken = isTokenValid(decoded)

  if (PUBLIC_PATHS.includes(pathname)) {
    if (hasValidToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (!hasValidToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    const response = NextResponse.redirect(loginUrl)
    if (token) {
      response.cookies.delete("et_access_token")
    }
    return response
  }

  if (ADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    const role = getRole(decoded)
    if (role !== "Admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Excludes API routes, Next internals, and any path with a file extension (favicon.ico,
  // icon.png, and any other static asset in public/ or app/) — not just today's known files.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}
