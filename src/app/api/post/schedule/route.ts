import { getToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { schedulePostSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const userId = await getToken();
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }
    const data = await req.json();
    const validatedData = schedulePostSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json({ msg: "Invalid Data" }, { status: 400 });
    }

    const { date, postId } = validatedData.data;
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!post) {
      return NextResponse.json({ msg: "Post not found" }, { status: 404 });
    }

    const member = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: post.organizationId,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    if (!member.access) {
      return NextResponse.json(
        { msg: "You don't have access to schedule this post" },
        { status: 401 }
      );
    }

    if (post.status !== "APPROVED") {
      return NextResponse.json(
        {
          msg: `Post cannot be scheduled because it is ${post.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }
    if (new Date(date) <= new Date()) {
      return NextResponse.json(
        { msg: "Scheduled date must be in the future" },
        { status: 400 }
      );
    }

    await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        scheduledAt: date,
        status: "SCHEDULED",
        scheduledById: member.id,
      },
    });

    return NextResponse.json({ msg: "Post scheduled" }, { status: 200 });
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
