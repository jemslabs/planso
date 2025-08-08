import { getToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { addFeedbackSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const userId = await getToken();
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }
    const validatedData = addFeedbackSchema.safeParse(data);

    if (!validatedData.success) {
      return NextResponse.json({ msg: "Invalid Data" }, { status: 400 });
    }

    const { postId, feedback } = validatedData.data;
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!post) {
      return NextResponse.json({ msg: "Post not found" }, { status: 404 });
    }

    const isMember = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: post.organizationId,
        },
      },
    });

    if (!isMember) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 400 });
    }

    const isFeedbackGiven = await prisma.feedback.findUnique({
        where: {
            memberId_postId: {
                memberId: isMember.id,
                postId: post.id
            }
        }
    })

    if(isFeedbackGiven){
        return NextResponse.json({msg: "Feedback already given"}, {status: 400});
    }
    await prisma.feedback.create({
        data: {
            postId: post.id,
            memberId: isMember.id,
            feedback
        }
    })

    return NextResponse.json({msg: "Feedback sent"}, {status: 200})
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
