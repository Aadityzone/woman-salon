import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "maison_owner_session";
const secret = () => {
  const value = process.env.OWNER_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("OWNER_SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(value);
};

export async function createOwnerSession() {
  const token = await new SignJWT({ role: "owner" }).setProtectedHeader({ alg: "HS256" }).setSubject("salon-owner")
    .setIssuedAt().setExpirationTime("8h").sign(secret());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 });
}
export async function clearOwnerSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}
export async function isOwnerAuthenticated() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret());
    return payload.sub === "salon-owner" && payload.role === "owner";
  } catch { return false; }
}
