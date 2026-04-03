import transporter from "@/lib/nodemailer";
import Vendor from "@/models/vendor.model";
import connectToDatabase from "./db";

export const dynamicPrices: Record<number, number> = {
  1: 1000,
  2: 1500,
  3: 2000,
  4: 2500,
  5: 3000,
};

/**
 * Sends the first day of the month email to a vendor detailing their metrics and VIP price.
 */
export async function sendFirstDayVipEmail(vendor: any) {
  const score =
    (vendor.totalTestDrivesBooked || 0) * 500 + (vendor.totalRevenue || 0);
  const priority = vendor.priority || 1;
  const price = dynamicPrices[priority] || 1000;
  const vendorEmail = vendor.userId?.email || vendor.email;
  const vendorName = vendor.userId?.name || vendor.name;

  if (!vendorEmail) return;

  const mailOptions = {
    from: '"AutoCarBazaar Admin" <admin@autocarbazaar.com>', // Replace with appropriate sender
    to: vendorEmail,
    subject: `Action Required: VIP Subscription Payment for ${new Date().toLocaleString("default", { month: "long" })}`,
    html: `
      <h2>Hello ${vendorName},</h2>
      <p>It's the first day of the month! Your VIP subscription payment for this month is now due.</p>
      <p>Please review your performance metrics and ensure your subscription is renewed within the <strong>first 7 days</strong> of the month.</p>
      <hr />
      <h3>Your Performance Metrics</h3>
      <ul>
        <li><strong>Vendor ID:</strong> ${vendor._id}</li>
        <li><strong>Total Test Drives Booked:</strong> ${vendor.totalTestDrivesBooked || 0}</li>
        <li><strong>Total Revenue:</strong> ₹${(vendor.totalRevenue || 0).toLocaleString()}</li>
        <li><strong>Current Evaluation Score:</strong> ${score}</li>
        <li><strong>Priority Level:</strong> Level ${priority}</li>
      </ul>
      <p>Based on your priority tier, your VIP subscription fee for this month is <strong>₹${price.toLocaleString()}</strong>.</p>
      <p>Please log in to your dashboard payment portal to complete the transaction.</p>
      <br />
      <p>Best Regards,</p>
      <p>AutoCarBazaar Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`First day VIP email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error("Error sending first day VIP email:", error);
  }
}

/**
 * Sends a warning email strictly to vendors who missed payment in the first week.
 */
export async function sendMissedPaymentWarningEmail(vendor: any) {
  const priority = vendor.priority || 1;
  const price = dynamicPrices[priority] || 1000;
  const vendorEmail = vendor.userId?.email || vendor.email;
  const vendorName = vendor.userId?.name || vendor.name;

  if (!vendorEmail) return;

  const mailOptions = {
    from: '"AutoCarBazaar Admin" <admin@autocarbazaar.com>',
    to: vendorEmail,
    subject: "URGENT: Missed VIP Subscription Payment",
    html: `
      <h2>Hello ${vendorName},</h2>
      <p style="color: red;"><strong>URGENT: Missed Payment Warning</strong></p>
      <p>We noticed that you have not completed your VIP subscription payment (<strong>₹${price.toLocaleString()}</strong>) for this month, and the first week has passed.</p>
      <p>Please note that failure to renew your VIP subscription may impact your visibility and privileges on the platform.</p>
      <p>Please log in to your portal immediately to complete your payment and avoid any service interruptions.</p>
      <br />
      <p>Best Regards,</p>
      <p>AutoCarBazaar Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Missed payment warning email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error("Error sending missed payment warning email:", error);
  }
}

/**
 * Core function to evaluate date boundaries and dispatch correct emails.
 * Can be called inside a daily CRON job.
 */
export async function processMonthlySubscriptionEmails() {
  await connectToDatabase();

  const today = new Date().getDate();
  const isFirstDay = today === 1;
  const isWarningDay = today === 8; // 8th day means the first week (days 1-7) has elapsed

  // If it's neither the 1st nor the 8th of the month, no batch emails need to go out.
  if (!isFirstDay && !isWarningDay) {
    console.log("No batch VIP emails necessary for today.");
    return;
  }

  const vendors = await Vendor.find({}).populate("userId", "name email");

  for (const vendor of vendors) {
    if (isFirstDay) {
      // Day 1: Remind everyone
      await sendFirstDayVipEmail(vendor);
    } else if (isWarningDay) {
      // Day 8+: Warn only those who haven't paid (status !== ACTIVE)
      if (vendor.subscriptionStatus !== "ACTIVE") {
        await sendMissedPaymentWarningEmail(vendor);
      }
    }
  }
}
