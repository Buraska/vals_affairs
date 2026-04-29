import { revalidateAll } from "@/app/lib/hooks/hookUtility"
import { NextRequest } from "next/server"

export const payloadToken = 'payload-token'

export async function GET( request: NextRequest
): Promise<Response> {
  const token = request.cookies.get(payloadToken)?.value

  if (!token) {
    new Response('You are not allowed to preview this page', { status: 403 })
  }

  const userReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
    headers: {
      Authorization: `JWT ${token}`,
    },
  })

  const userRes = await userReq.json()

  if (!userReq.ok || !userRes?.user) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  revalidateAll()

  return new Response("The web was revaledated");
}