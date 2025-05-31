import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// ✅ CORRECT: This is server-side code - NO Firebase imports here
// ✅ NO "use client" directive - this is a server component
// ✅ NO import of auth, db, or any Firebase client code

export async function POST(request: Request) {
  try {
    const { caller_id, receiver_id, call_type, duration, status } = await request.json()

    if (!caller_id || !receiver_id || !call_type || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase.from("call_history").insert({
      caller_id,
      receiver_id,
      call_type,
      duration: duration || 0,
      status,
      started_at: new Date().toISOString(),
      ended_at: status === "completed" ? new Date().toISOString() : null,
    })

    if (error) {
      console.error("Error saving call history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in call history API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("call_history")
      .select("*, caller:contacts!caller_id(*), receiver:contacts!receiver_id(*)")
      .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("started_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching call history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in call history API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
