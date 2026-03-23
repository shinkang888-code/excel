import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "pending",
    scopes: [],
    lastValidatedAt: null,
  });
}

export async function DELETE() {
  return NextResponse.json({
    status: "revoked",
  });
}
