import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { authOptions } from "../../auth/[...nextauth]/route";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendorId = (session.user as any).vendorId;

    await connectToDatabase();
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status === "paid") {
      if (
        stripeSession.metadata?.type === "vendor_registration" &&
        stripeSession.metadata?.vendorId === vendorId
      ) {
        if (!vendor.isActive) {
          await Vendor.findByIdAndUpdate(vendorId, {
            isActive: true,
            isVerified: true,
          });
          vendor.isActive = true;
          vendor.isVerified = true;
        }
        return NextResponse.json({
          success: true,
          isActive: vendor.isActive,
          isVerified: vendor.isVerified,
        });
      }

      if (
        stripeSession.metadata?.type === "vip_subscription" &&
        stripeSession.metadata?.vendorId === vendorId
      ) {
        if (vendor.subscriptionStatus !== "ACTIVE") {
          await Vendor.findByIdAndUpdate(vendorId, {
            subscriptionStatus: "ACTIVE",
          });
          vendor.subscriptionStatus = "ACTIVE";
        }
        return NextResponse.json({
          success: true,
          subscriptionStatus: vendor.subscriptionStatus,
        });
      }
    }

    return NextResponse.json(
      { error: "Payment not verified" },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
