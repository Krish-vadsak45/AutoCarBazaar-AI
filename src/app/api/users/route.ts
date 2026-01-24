import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = getAuth(request as any);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const user = await User.findOne({ clerkId: userId }).lean();

  return NextResponse.json({ user: user ?? null });
}

export async function POST(request: Request) {
  const { userId } = getAuth(request as any);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, image, role, meta } = body;

  await connectToDatabase();

  console.log("Upserting user:", {
    clerkId: userId,
    name,
    email,
    image,
    role,
    meta,
  });

  const updated = await User.findOneAndUpdate(
    { clerkId: userId },
    { $set: { name, email, image, role, meta } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return NextResponse.json({ user: updated }, { status: 201 });
}
