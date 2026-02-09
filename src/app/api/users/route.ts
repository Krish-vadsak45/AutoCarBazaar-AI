import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email })
      .select("-password") // hide password
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create or update user (Upsert)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, password } = body;

    await connectToDatabase();

    const userEmail = session.user.email;

    let hashedPassword: string | undefined;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          name: name || session.user.name,
          ...(hashedPassword && { password: hashedPassword }),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select("-password");

    return NextResponse.json({ user: updatedUser }, { status: 201 });
  } catch (error) {
    console.error("Error upserting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
