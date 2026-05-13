import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { endpoint, status, message, timestamp, method } = await req.json();
    
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    
    const logFile = path.join(logDir, "api_errors.log");
    const logEntry = `[${timestamp}] ${method} ${endpoint} | Status: ${status} | Error: ${message}\n`;
    
    fs.appendFileSync(logFile, logEntry);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logging failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
