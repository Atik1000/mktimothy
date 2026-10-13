import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId, reason, details } = await request.json();
    if (!targetUserId || !reason) {
      return NextResponse.json(
        { error: "targetUserId and reason are required" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { firstName: true, lastName: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a Support Ticket for the report
    const ticketNumber = `REP-${Date.now().toString().slice(-6)}`;
    
    await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: `User Report: ${targetUser.firstName} ${targetUser.lastName}`,
        description: `Reason: ${reason}\n\nDetails: ${details || "No additional details provided."}\n\nReported User ID: ${targetUserId}\nReporter ID: ${user.id}`,
        category: "GENERAL_INQUIRY", // Since "REPORT" is not in the TicketCategory enum
        priority: "HIGH",
        status: "OPEN",
        userId: user.id, // The reporter
      },
    });

    return NextResponse.json({ success: true, message: "Report submitted successfully." });
  } catch (error: any) {
    console.error("[chat/report] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
