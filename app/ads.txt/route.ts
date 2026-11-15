export const dynamic = "force-static";

/**
 * ads.txt is only served when a real AdSense publisher ID is configured.
 * Publishing an ads.txt line without an authorized seller would be inaccurate,
 * so the route returns 404 while monetization is disabled.
 */
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  if (!client || !client.startsWith("pub-")) {
    return new Response("ads.txt is not configured for this deployment.\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(`google.com, ${client}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
