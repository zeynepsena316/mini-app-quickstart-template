const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 * @see {@link https://docs.base.org/mini-apps/core-concepts/manifest}
 */
export const minikitConfig = {
  
  
  
  accountAssociation: {
    header: "eyJmaWQiOjE2MDg5MzQsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgzM2FlNmYyZTUxNjUwM2Q0NDEzMTc3MjM5RTE4ZENiNEJENTRGQjZiIn0",
    payload: "eyJkb21haW4iOiJtaW5pLWFwcC1xdWlja3N0YXJ0LXRlbXBsYXRlLXRocmVlLnZlcmNlbC5hcHAifQ",
    signature: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMPgNZkgoPx-IdiGCsp1j33bPVPyFtr20DOy-AYNIQgRo7sDXv1yQfVHn9yVg5ZqNcExDpKc2-3ED9-rZh3zRzQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAl8ZgIay2xclZzG8RWZzuWvO8j9R0fus3XxDee9lRlVy8dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKeyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiN3QxVHlja0Y4UmMzZlNQOEpBdGZWVUliX19NNWM4VUd5dzFPSFFNSFdWYyIsIm9yaWdpbiI6Imh0dHBzOi8va2V5cy5jb2luYmFzZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  },



  miniapp: {
    version: "1",
    name: "Mini App Quickstart Template",
    subtitle: "Quickstart Template",
    description:
      "A starter template for building Base Mini Apps using Next.js. By Trio Blockchain Labs.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "developer-tools",
    tags: ["developer-tools", "productivity"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Ship mini apps faster. By TriO",
    ogTitle: "Mini App Quickstart Template",
    ogDescription:
      "A template for building Base Mini Apps using Next.js and TypeScript. By Trio Blockchain Labs",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
