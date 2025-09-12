import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder: wire to Hostfully API with env HOSTFULLY_BASE_URL + HOSTFULLY_API_TOKEN
  return NextResponse.json(
    { ok: false, error: "Not implemented. Configure Hostfully integration in lib/integrations/hostfully.ts and replace this route." },
    { status: 501 }
  );
}

