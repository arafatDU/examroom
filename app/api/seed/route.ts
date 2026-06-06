import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    
    const adminExists = await User.findOne({ role: "ADMIN" });
    
    if (adminExists) {
      return NextResponse.json({ message: "Admin already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    await User.create({
      name: "System Admin",
      email: "admin@examroom.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    return NextResponse.json({ 
      message: "Admin created successfully", 
      email: "admin@examroom.com", 
      password: "admin123" 
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
