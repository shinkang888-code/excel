import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      status: "pending",
      scopes: [],
      lastValidatedAt: null,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user) {
    return NextResponse.json({
      status: "pending",
      scopes: [],
      lastValidatedAt: null,
    });
  }

  const providerToken = session?.provider_token;
  if (providerToken) {
    await supabase.from("google_connections").upsert(
      {
        user_id: user.id,
        provider: "google",
        status: "active",
        scopes: ["https://www.googleapis.com/auth/drive.file"],
        last_validated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" },
    );
  }

  const { data, error } = await supabase
    .from("google_connections")
    .select("status, scopes, last_validated_at")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({
      status: "pending",
      scopes: [],
      lastValidatedAt: null,
    });
  }

  return NextResponse.json({
    status: data.status ?? "pending",
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
    lastValidatedAt: data.last_validated_at ?? null,
  });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ status: "revoked" });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ status: "revoked" });
  }

  await supabase
    .from("google_connections")
    .update({ status: "revoked", last_validated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("provider", "google");

  return NextResponse.json({ status: "revoked" });
}
