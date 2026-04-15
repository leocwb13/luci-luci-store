import { compare } from "bcryptjs";
import { createHmac } from "crypto";
import { cookies } from "next/headers";

import { getUserByEmail, getUserById } from "@/lib/store";
import { UserRole } from "@/lib/types";

const COOKIE_NAME = "luci_luci_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "luci-luci-dev-secret";
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getAuthSecret()).update(encodedPayload).digest("base64url");
}

function createSessionToken(payload: SessionPayload) {
  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function parseSessionToken(token: string | undefined) {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  if (signPayload(encodedPayload) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user?.active) return null;

  const validPassword = await compare(password, user.passwordHash);
  if (!validPassword) return null;

  return user;
}

export async function setLoginSession(userId: string, role: UserRole) {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Date.now() + SESSION_DURATION_MS
  };

  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(payload.exp)
  });
}

export async function clearLoginSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return parseSessionToken(token);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session) return null;
  const user = await getUserById(session.userId);
  if (!user?.active) return null;
  return user;
}

export async function isAdminAuthenticated() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function ensureAdmin() {
  return isAdminAuthenticated();
}

export async function ensureRoles(roles: UserRole[]) {
  const user = await getCurrentUser();
  return user ? roles.includes(user.role) : false;
}
