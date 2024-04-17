export function extractTokenWithBearerPrefix(authToken: string): string {
  const tokenMatch = authToken.match(/^(Bearer )?(.*)$/);
  return !tokenMatch || tokenMatch.length < 3 || tokenMatch[1] !== 'Bearer ' ? authToken : tokenMatch[2];
}
