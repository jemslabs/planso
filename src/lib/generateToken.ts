import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
const SECRET_KEY = process.env.JWT_SECRET as string;
if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not defined in .env");
}
export async function generateToken(id: number, response: NextResponse) {
  const token = jwt.sign({ userId: id }, SECRET_KEY);

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const getToken = async () => {
  // const token = (await cookies()).get("token")?.value; //TODO
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1NDQ4ODY4MSwiZXhwIjoxNzU1MDkzNDgxfQ.gk3bwIza4TaV1OGvpXWSZEaprdZhQXYf9oVZuoO115c"
  if (token) {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    return decoded.userId;
  }
};