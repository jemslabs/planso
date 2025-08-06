import { generateToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = loginSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json(
        { msg: "Invalid email or password" },
        { status: 400 }
      );
    }

    const { email, password } = validatedData.data;

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          msg: "Email not found",
        },
        { status: 400 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ msg: "Incorrect password" }, { status: 401 });
    }

    const response = NextResponse.json({ msg: "Login successful" }, { status: 200 });
    const res = generateToken(user.id, response)
    return res;
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
