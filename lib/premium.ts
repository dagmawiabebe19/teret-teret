export function isPremiumStatus(status: string | null | undefined): boolean {
  const normalized = status?.trim().toLowerCase();
  return normalized === "premium" || normalized === "active";
}
