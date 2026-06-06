import { NextResponse } from "next/server";
export async function GET(req: Request) {
  console.log("Test Started");
  return NextResponse.json({ message: "Get request received", success: true });
}
