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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("et_access_token")?.value

  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (ADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    const role = getRole(decodeJwtPayload(token))
    if (role !== "Admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
