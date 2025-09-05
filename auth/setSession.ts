"use server";
import { cookies } from "next/headers";
export const setSession = async (token: string) => {
  (await cookies()).set("token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  })}