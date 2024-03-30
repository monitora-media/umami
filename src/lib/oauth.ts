export function callbackUrl(providerId: string): URL {
  return new URL(
    `/api/auth/providers/${providerId}/callback`,
    process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  );
}
