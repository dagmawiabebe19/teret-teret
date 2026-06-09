export function isPremiumStatus(status: string | null | undefined): boolean {
  return status === "premium" || status === "active";
}
