export function resolveUserToken(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const namedToken = searchParams.user_token;
  if (typeof namedToken === "string" && namedToken.trim()) {
    return namedToken.trim();
  }

  const entries = Object.entries(searchParams);
  if (entries.length !== 1) {
    return null;
  }

  const [key, value] = entries[0];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (key.trim()) {
    return key.trim();
  }

  return null;
}
