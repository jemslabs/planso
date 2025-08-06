import { getToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { accessSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const userId = await getToken()
    if(!userId){
        return NextResponse.json({msg: "Unauthorised"}, {status: 400});
    }
    const validatedData = accessSchema.safeParse(data);
    if(!validatedData.success){
        return NextResponse.json({msg: "Invalid Data"}, {status: 400})
    }

    const {memberId} = validatedData.data;

    const member = await prisma.member.findUnique({
        where: {
            id: memberId
        },
        include: {
            organization: true
        }
    })
    
    if(!member){
        return NextResponse.json({msg: "Member not found"}, {status: 404})
    }
    if(member.organization.ownerId !== userId){
        return NextResponse.json({msg: "Unauthorized to give access"}, {status: 400})
    }

    if(member.access){
        return NextResponse.json({msg: "This member already has access"}, {status: 400})
    }

    await prisma.member.update({
        where: {
            id: member.id
        },
        data: {
            access: true
        }
    })

    return NextResponse.json({msg: "Access granted"}, {status: 200});
  } catch {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
