import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "../../../../utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get user session from Supabase cookie or header (adjust as per your auth setup)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json(
        { error: "Error fetching user" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ validated: false });
    }

    // Check if user's email is confirmed
    const emailConfirmed = user.email_confirmed_at !== null;

    return NextResponse.json({ validated: emailConfirmed });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
