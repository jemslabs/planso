import { getToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { createOrgSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const userId = await getToken();
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 400 });
    }
    const validatedData = createOrgSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json({ msg: "Invalid Inputs" }, { status: 400 });
    }

    const { name, description } = validatedData.data;
    const orgExists = await prisma.organization.findUnique({
      where: {
        name,
      },
    });

    if (orgExists) {
      return NextResponse.json(
        { msg: "An organization with this name already exists." },
        { status: 400 }
      );
    }
    let uuid = crypto.randomUUID();
    const org = await prisma.organization.create({
      data: {
        name,
        description,
        ownerId: userId,
        inviteCode: uuid.toString()
      },
    });

    if (!org) {
      return NextResponse.json(
        { msg: "Failed to create organization" },
        { status: 400 }
      );
    }

    await prisma.member.create({
      data: {
        userId,
        role: "OWNER",
        access: true,
        organizationId: org.id,
      },
    });
    return NextResponse.json(
      { msg: "Organization created successfully" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
