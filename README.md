# Base Mini App Quickstart

This is a **Mini App** template built using [OnchainKit](https://onchainkit.xyz) and the [Farcaster SDK](https://docs.farcaster.xyz/). It is designed to help you build and deploy a Mini App that can be published to the [Base App](https://www.base.dev) and Farcaster.

> [!IMPORTANT]
> This is a workshop template. Please follow the instructions below to configure and deploy your app.

## Prerequisites

Before getting started, make sure you have:

*   A [Farcaster](https://farcaster.xyz/) account (for testing)
*   A [Vercel](https://vercel.com/) account for deployment
*   A [Coinbase Developer Platform](https://portal.cdp.coinbase.com/) Onchainkit Client API Key
*   Basic knowledge of [Base Build](https://www.base.dev) platform

## Getting Started

### 1. Fork & Clone & Install

* Fork this [repository](https://github.com/Trio-Blockchain-Labs/mini-app-quickstart-template.git)
* After forking, clone your forked template project
```bash
git clone https://github.com/[your_username]/[your_forked_repository_name].git
cd [your_forked_repository_name]
npm install
```

### 2. Configure Environment

Create a `.env` file based on `.example.env`:

```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<YOUR-CDP-API-KEY>
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Customization

### Minikit Configuration

The `minikit.config.ts` file configures your app's manifest.

1.  Open `minikit.config.ts`.
2.  Update `name`, `subtitle`, and `description` to match your app idea.
3.  **Note:** Skip the `accountAssociation` for now; we will add this after deployment.
**IMPORTANT:** Follow [manifest](https://docs.base.org/mini-apps/core-concepts/manifest) documentation for configuring your app's manifest

**Note:** You can update manifest metadata of your app after **deployment** if you don't have an idea yet.

## Assets: Video & Mood Images (Braver Beaver)

To use the custom intro video and mood icons in the home screen, place files under the `public/` folder:

- Put your MP4 video at: `public/intro.mp4` (the homepage will autoplay this video as a background)
  
	If your file is named `background.mp4` (recommended), copy it with:

	```bash
	cp "~/Downloads/WhatsApp Video 2025-12-14 at 15.55.30.mp4" public/background.mp4
	```

	Or copy it as `intro.mp4` if you prefer the old name:

	```bash
	cp "~/Downloads/WhatsApp Video 2025-12-14 at 15.55.30.mp4" public/intro.mp4
	```
- Optional poster image for browsers that don't autoplay: `public/intro-poster.jpg`
- Mood images (optional). If you want the custom graphics to show on each mood button, place them as:
	- `public/moods/cry.png`
	- `public/moods/happy.png`
	- `public/moods/sweat.png`
	- `public/moods/sleep.png`
	- `public/moods/love.png`
	- `public/moods/fire.png`

If the mood images are not provided, the app will show emoji fallbacks on the buttons.

After adding the files, restart the dev server if needed:

```bash
npm run dev
```

### Slicing a single grid image into six mood icons (optional)

If you have a single image that contains all six stickers in a 3x2 grid (like the attachment you provided), you can split it automatically using the included Node script (requires `sharp`):

1. Put your source image into the repo (e.g. `public/moods-source.png`).
2. Install dependencies (if not already installed):

```bash
npm install
```

3. Run the slicing script:

```bash
npm run slice:moods public/moods-source.png
```

This will create `public/moods/cry.png`, `happy.png`, `sweat.png`, `sleep.png`, `love.png`, and `fire.png` in that left-to-right, top-to-bottom order. You can edit or re-run the script if the order doesn't match your image layout.



## Deployment

### 1. Deploy to Vercel

```bash
vercel --prod
```
**or** 

Use the [Vercel](https://vercel.com/) website and add your repository as a new project.

### 2. Update Production Env

In your Vercel project settings, add:

*   `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
*   `NEXT_PUBLIC_URL` (Your [Vercel](https://vercel.com/) deployment URL)

## Base Build & Publishing

To publish your app to the Base App ecosystem:

1.  Go to [Base Build](https://www.base.dev) and log in.
2.  Click **Mini App Tools** button at top right of the website.
3.  Paste your deployed website link provided by Vercel into the field.
4.  Use the **Account Association** tools on Base Build to sign your manifest.
5.  Update `minikit.config.ts` with the signature and redeploy.

For detailed docs, visit [docs.base.org](https://docs.base.org/docs/mini-apps/quickstart/create-new-miniapp/).

---

## Disclaimer

This project is a **demo application** for educational purposes only.

## Anxiety Game Prototype

Try the small anxiety-themed prototype by running the app locally and visiting `/game` or clicking **Play Demo** on the homepage. It's a minimal playable demo implementing the mechanics you described (anxiety meter, ghosts, power-ups and the "Stop & Breathe" mechanic).

Update (Dec 2025): The prototype now uses a small Pac‑Man‑style maze, arrow-key controls, and three ghosts. You have 3 lives; ghosts now roam the maze passively (they don't aggressively chase you). The player can use Shift to dash away. Your anxiety meter rises as ghosts get closer — avoid them and collect pellets to calm down. Restart the demo to play again.

Visuals: The game now uses simple SVG sprites located in `public/sprites/` for the beaver (player) and ghosts, and the maze walls are drawn with blue outlines to resemble classic arcade styling. Power pellets appear in the four corners. If you'd like, I can replace the SVGs with your exact artwork files (PNG/SVG) — just upload them and I'll swap them in.

Feedback welcome — tell me which mechanics you'd like me to tune next (difficulty, visuals, level progression, etc.).
