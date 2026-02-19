import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { teamName } = await req.json();

        if (!teamName || typeof teamName !== "string") {
            return NextResponse.json(
                { error: "Team name is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user is already in a team
        const existingTeam = await Team.findOne({
            "members.googleId": session.user.googleId,
        });

        if (existingTeam) {
            return NextResponse.json(
                { error: "You are already part of a team: " + existingTeam.teamName },
                { status: 400 }
            );
        }

        // Find team by name (case-insensitive)
        const team = await Team.findOne({
            teamName: { $regex: new RegExp(`^${teamName.trim()}$`, "i") },
        });

        if (!team) {
            return NextResponse.json(
                { error: "Team not found. Please check the exact team name and try again." },
                { status: 404 }
            );
        }

        // Add user to team
        team.members.push({
            googleId: session.user.googleId || "",
            email: session.user.email,
            name: session.user.name || "",
        });

        await team.save();

        return NextResponse.json({
            success: true,
            teamName: team.teamName,
            teamId: team._id.toString(),
        });
    } catch (error) {
        console.error("Join team error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
