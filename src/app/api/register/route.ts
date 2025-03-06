import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      id: Math.floor(Math.random() * 1000000).toString(), // or use a proper id generation method
      name,
      email,
      password: hashedPassword,
    })

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const usuarios = await db.select().from(users)
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Error fetching usuarios:", error)
    return NextResponse.json({ error: "Failed to fetch usuarios" }, { status: 500 })
  }
}

