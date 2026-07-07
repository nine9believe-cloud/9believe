import crypto from "crypto";
import { cookies } from "next/headers";

/* Admin auth: PIN from env (ADMIN_PIN, default 9999). The session cookie
   holds an HMAC derived from the PIN so the PIN itself is never stored. */

const pin = () => process.env.ADMIN_PIN || "9999";

export const adminToken = () =>
  crypto.createHmac("sha256", "9believe-admin-v1").update(pin()).digest("hex");

export function checkPin(input: string) {
  const a = Buffer.from(String(input));
  const b = Buffer.from(pin());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return jar.get("9b_admin")?.value === adminToken();
}
