import { getToken } from "@/lib/generateToken";
import { prisma } from "@/lib/prisma";
import { addPostSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

export async function POST(req: Request){
    try {
        const data = await req.json();
        const userId = await getToken();        
        if(!userId){
            return NextResponse.json({msg: "Unuathorized"}, {status: 401})
        }
        const validatedData = addPostSchema.safeParse(data);
        if(!validatedData.success){
            return NextResponse.json({msg: "Invalid Data"}, {status: 400})
        }

        const {title, description, platforms, organizationId} = validatedData.data;
        const org = await prisma.organization.findUnique({
            where: {
                id: organizationId
            }
        })

        if(!org){
            return NextResponse.json({msg: "Organization not found"}, {status: 404})
        }

        const isMember = await prisma.member.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId: org.id

                }
            }
        })

        if(!isMember){
            return NextResponse.json({msg: "Unauthorized"}, {status: 400})
        }

        await prisma.post.create({
            data: {
                title,
                description,
                platforms,
                status: "PENDING",
                organizationId: org.id,
                memberId: isMember.id
            }
        })
        
        return NextResponse.json({msg: "Post added successfully"}, {status: 200})
    } catch  {
        return NextResponse.json({msg: "Internal Server Error"}, {status: 500})
    }
}