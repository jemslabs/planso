import { getToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("id");
    const code = searchParams.get("inviteCode");
    const userId = await getToken();
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 400 });
    }

    if (!orgId) {
      return NextResponse.json(
        { msg: "Organization Id not provided" },
        { status: 400 }
      );
    }
    if (!code) {
      return NextResponse.json(
        {
          msg: "No invite code provided",
        },
        {
          status: 400,
        }
      );
    }
    const org = await prisma.organization.findUnique({
      where: {
        id: orgId,
      },
    });

    if (!org) {
      return NextResponse.json(
        { msg: "Organization not found or may have been deleted." },
        { status: 404 }
      );
    }

    if (org.inviteCode !== code) {
      return NextResponse.json({ msg: "Invalid invite code" }, { status: 400 });
    }

    const alreadyMember = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: org.id,
        },
      },
    });

    if (alreadyMember) {
      return NextResponse.json(
        { msg: "You are already a member of this organization" },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        userId,
        organizationId: org.id,
        role: "MEMBER",
        access: false,
      },
    });
    if (!member) {
      return NextResponse.json(
        { msg: "Failed to join this organization" },
        { status: 400 }
      );
    }

    return NextResponse.json({ msg: `Joined ${org.name}` }, { status: 200 });
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request){
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("id");

    if(!orgId){
      return NextResponse.json({msg: "No organization id provided"}, {status: 404})
    }

    const org = await prisma.organization.findUnique({
      where: {
        id: orgId
      },
      select: {
        name: true,
        description: true,
        ownerId: true,
        owner: true,
        members: true
      },
    })
    if(!org){
      return NextResponse.json({msg: "No organization found"}, {status: 404})
    }
    return NextResponse.json(org, {status: 200});
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });   
  }
}