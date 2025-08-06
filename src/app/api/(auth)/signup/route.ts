import { generateToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = signupSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json({ msg: "Invalid Inputs" }, { status: 400 });
    }

    const { username, email, password } = validatedData.data;

    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userExists) {
      return NextResponse.json(
        {
          msg: "Email already exists",
        },
        { status: 400 }
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    if (!user) {
      return NextResponse.json(
        { msg: "Failed to create user" },
        { status: 400 }
      );
    }
    const response = NextResponse.json(
      { msg: "Signup successful" },
      { status: 200 }
    );
    const res = generateToken(user.id, response);

    return res;
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
