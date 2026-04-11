import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { geminiModel, CAR_ANALYSIS_PROMPT } from "@/lib/ai";
import connectToDatabase from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { canUseSmartAddAi } from "@/lib/vip";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "vendor" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "vendor") {
      await connectToDatabase();
      const vendor = await Vendor.findOne({
        userId: session.user._id,
      });
      if (!vendor) {
        return NextResponse.json(
          { error: "Vendor profile not found" },
          { status: 404 },
        );
      }
      if (!canUseSmartAddAi(vendor.priority)) {
        return NextResponse.json(
          {
            error:
              "Smart Add (AI) requires VIP level 4 or higher (priority > 3).",
          },
          { status: 403 },
        );
      }
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    // Fetch the image to get its content for Gemini
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Content = Buffer.from(imageBuffer).toString("base64");

    const result = await geminiModel.generateContent([
      CAR_ANALYSIS_PROMPT,
      {
        inlineData: {
          data: base64Content,
          mimeType: imageResponse.headers.get("content-type") || "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const jsonString = response.text();

    // Safety check for JSON parsing
    let analysisData;
    try {
      analysisData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("AI Parse error:", jsonString);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 },
      );
    }

    return NextResponse.json(analysisData);
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze car image" },
      { status: 500 },
    );
  }
}
