import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Announcement from "@/models/Announcement";

// Admin API to send a predefined announcement
// Your friend's admin panel will call this endpoint
export async function POST(req: NextRequest) {
    try {
        // Simple admin key auth (your friend can replace with proper admin auth later)
        const adminKey = req.headers.get("x-admin-key");
        if (adminKey !== process.env.ADMIN_API_KEY) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, templateId } = await req.json();

        await dbConnect();

        let announcementMessage = message;

        // If a templateId is provided, use the predefined message
        if (templateId && !message) {
            const templates: Record<string, string> = {
                "welcome": "🕵️ Welcome to SherlockIT 2.0! The mystery begins now. Good luck, detectives!",
                "halfway": "⏰ You're halfway through! Keep going, the truth is within reach!",
                "hint": "🔍 Hint: Pay close attention to the storylines. The answers are closer than you think!",
                "final-open": "🚨 FINAL ANSWER IS NOW OPEN! You have 30 minutes to submit your answer. Go to the Final Answer section NOW!",
                "final-closing": "⏳ Only 10 minutes left to submit your final answer! Don't miss your chance!",
                "final-closed": "🔒 Final answer submission is now CLOSED. Thank you for participating!",
                "break": "☕ Take a 5-minute break! Grab some refreshments and come back stronger.",
                "update": "📢 Event update: Please check your dashboard for the latest world status.",
                "congrats": "🎉 Congratulations! A team has solved all the worlds! Can you keep up?",
                "last-world": "🌟 New world unlocked! The final world is now available for all teams.",
            };

            announcementMessage = templates[templateId];

            if (!announcementMessage) {
                return NextResponse.json(
                    {
                        error: "Invalid template ID",
                        availableTemplates: Object.keys(templates),
                    },
                    { status: 400 }
                );
            }
        }

        if (!announcementMessage) {
            return NextResponse.json(
                { error: "Either 'message' or 'templateId' is required" },
                { status: 400 }
            );
        }

        const announcement = await Announcement.create({
            message: announcementMessage,
        });

        return NextResponse.json({
            success: true,
            announcement: {
                _id: announcement._id.toString(),
                message: announcement.message,
                createdAt: announcement.createdAt,
            },
        });
    } catch (error) {
        console.error("Send announcement error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET available templates (for admin panel to list buttons)
export async function GET(req: NextRequest) {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = [
        { id: "welcome", label: "🕵️ Welcome", message: "Welcome to SherlockIT 2.0! The mystery begins now. Good luck, detectives!" },
        { id: "halfway", label: "⏰ Halfway", message: "You're halfway through! Keep going, the truth is within reach!" },
        { id: "hint", label: "🔍 Hint", message: "Hint: Pay close attention to the storylines. The answers are closer than you think!" },
        { id: "final-open", label: "🚨 Final Open", message: "FINAL ANSWER IS NOW OPEN! You have 30 minutes to submit your answer. Go to the Final Answer section NOW!" },
        { id: "final-closing", label: "⏳ Final Closing", message: "Only 10 minutes left to submit your final answer! Don't miss your chance!" },
        { id: "final-closed", label: "🔒 Final Closed", message: "Final answer submission is now CLOSED. Thank you for participating!" },
        { id: "break", label: "☕ Break Time", message: "Take a 5-minute break! Grab some refreshments and come back stronger." },
        { id: "update", label: "📢 Update", message: "Event update: Please check your dashboard for the latest world status." },
        { id: "congrats", label: "🎉 Congrats", message: "Congratulations! A team has solved all the worlds! Can you keep up?" },
        { id: "last-world", label: "🌟 Last World", message: "New world unlocked! The final world is now available for all teams." },
    ];

    return NextResponse.json({ templates });
}
