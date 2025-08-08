import { getToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const userId = await getToken();
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }
    if (!postId) {
      return NextResponse.json(
        { msg: "Post Id not provided" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
    });

    if (!post) {
      return NextResponse.json({ msg: "Post not found" }, { status: 404 });
    }

    if (post.status !== "PENDING") {
      return NextResponse.json(
        {
          msg: `Post cannot be approved because it is already ${post.status.toLowerCase()}`,
        },
        { status: 400 }
      );
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
        { msg: "You don't have permission to approve posts" },
        { status: 401 }
      );
    }

    await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        status: "APPROVED",
        approvedById: member.id,
      },
    });
    return NextResponse.json(
      { msg: "Post approved successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
