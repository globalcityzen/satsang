# Satsang

*Sitting with truth.*

Satsang — *sat* (truth, being) + *sang* (company, sitting with). Being in the company of what is real.

A Vedantic daily practice app. Ring the bell. Sit with truth. Walk into the day.

No account. No streak. No notifications you didn't ask for. Your words never leave your device.

---

## What it does

**Morning:** Open the app. Ring the bell. A teaching arrives — from the Vedantic canon or from your own teacher's words. Read slowly. Sit with it. Tap "I've sat with this." Close the app. Walk your dog. Find your bench. Ring the bell again when you're ready. Sit. The bell closes the silence. Go into the day.

**Evening:** Ring the bell. A closing truth arrives. Sit with it. Rest.

---

## Setup

```bash
git clone <your-repo>
cd satsang
npm install
cp .env.example .env.local
# Add ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000. Tap the bell.

---

## Deploy to Vercel

```bash
npx vercel
# Add ANTHROPIC_API_KEY in Vercel environment variables
```

Open the URL in Safari on your phone → Share → Add to Home Screen.

---

## Feed your teacher's words

Open app → tap "feed the satsang" → upload a recording, PDF, or text from your weekly class. Your teacher's words join the morning corpus from the next day.

Audio transcription requires OPENAI_API_KEY. Text/PDF only needs ANTHROPIC_API_KEY.

---

## Stack

Next.js 14 · Anthropic Claude · OpenAI Whisper · Web Audio API · localStorage · Vercel

No database. No auth. No tracking.
