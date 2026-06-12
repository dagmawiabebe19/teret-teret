/** Returns true when request carries the configured ADMIN_SECRET. */
export function isAdminAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const header = request.headers.get("x-admin-secret");
  return header === secret;
}
