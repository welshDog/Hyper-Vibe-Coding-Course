# 🎬 MODULE 4 — VIDEO SCRIPT
> **"Build Your Money Engine"**
> Source: `rewrites/MODULE_04_REWRITE.md`
> Script v1 — May 17, 2026
> Status: 🟡 Draft — ready for review

---

## 📋 Production Notes

| Field | Value |
|---|---|
| **Target runtime** | 3:00 (hard cap 3:15) |
| **Spoken word count** | ~460 words |
| **Pace** | Fast, punchy, ADHD-friendly — never linger |
| **Tone** | Hype builder energy. You're starting a business, not reading docs. |
| **On-screen code** | Pre-typed, zoomed, highlight the line as it's spoken |
| **Captions** | Burned-in (autoplay-safe) |
| **Music** | Low-energy lofi bed → swells at WIN MOMENT (2:25) |

---

## 🎥 THE SCRIPT

### ⏱️ 0:00 – 0:15 — COLD OPEN (Hook)

**🖼️ ON SCREEN:** Black screen → fast cut to a real Stripe dashboard showing a `£47.00` payment. Big text slams in: **"YOU. JUST. GOT. PAID."**

**🎙️ VO:**
> "Right now your app is free. By the end of this video, it charges money — and mints AI tokens the second someone pays. Three minutes. Let's build your money engine."

---

### ⏱️ 0:15 – 0:38 — THE BIG IDEA (Plain English)

**🖼️ ON SCREEN:** Simple 3-box animation: 💳 Stripe → 👆 Webhook → ⚙️ Your App. Arrows light up left to right.

**🎙️ VO:**
> "Forget the jargon. Stripe is just the middleman between your app and your student's bank card. Someone pays £47 — Stripe handles all the scary stuff. Then it taps your app on the shoulder and says: *someone paid, do your thing.* Your app hears that tap, mints BROski$, unlocks the course. Three parts. That's the whole game."

---

### ⏱️ 0:38 – 1:00 — STEPS 1 & 2 (Account + Keys)

**🖼️ ON SCREEN:** Screen-record: stripe.com → "Start now" → land on dashboard. Zoom on the **TEST MODE** toggle (highlight ring). Cut to API Keys page, the two keys blurred.

**🎙️ VO:**
> "Step one — go to stripe.com, sign up, done in three minutes. Leave it in **test mode**. Test mode is fake money — stay there until everything works. Step two — Developers, API Keys. You get two: publishable starts with `pk test` — safe. Secret starts with `sk test` — never share it, never push it to GitHub. Both go in your `.env` file. And `.env` is gitignored — your secret stays secret. Always."

---

### ⏱️ 1:00 – 1:22 — STEPS 3 & 4 (Install + Button)

**🖼️ ON SCREEN:** Terminal typing `pip install stripe`. Quick cut to `stripe_routes.py` — the checkout function appears, `unit_amount=4700` highlighted. Cut to a browser: a glowing **"💳 Get Course Access — £47"** button.

**🎙️ VO:**
> "Install Stripe — one command, backend and frontend. Now the payment button. This little function tells Stripe: charge forty-seven quid, give me back a checkout page. Your button sends the student to that page. Stripe handles the cards, the fraud checks, the receipt. You wrote about ten lines."

---

### ⏱️ 1:22 – 2:00 — STEP 5 (The Webhook — the magic)

**🖼️ ON SCREEN:** Animation: Stripe knocks 👆 → padlock 🔒 "is this knock real?" → ✅ → coins fly out 🪙. Then terminal running `stripe listen --forward-to localhost:8000/webhook`. Highlight the `whsec_` secret.

**🎙️ VO:**
> "This is the magic part. When Stripe gets a payment, it sends a secret knock to your app. The Stripe CLI forwards that knock to your machine while you build. Your webhook checks the knock is real — then mints the tokens. *checkout dot session dot completed* — that's not jargon anymore. That's a student who just bought your course. Automatic. Every single time."

---

### ⏱️ 2:00 – 2:25 — STEP 6 (Test With Fake Money)

**🖼️ ON SCREEN:** Big card graphic: **4242 4242 4242 4242**. Screen-record: click Buy → Stripe checkout → type the card → Pay → cut to terminal printing `✅ Payment received — 500 BROski$ minted!` in green.

**🎙️ VO:**
> "Test it with Stripe's magic card — four-two-four-two, all the way across. Any future expiry, any three-digit code. Click buy, pay, watch your terminal. When you see *payment received, five hundred BROski$ minted* — your money engine is alive."

---

### ⏱️ 2:25 – 2:48 — THE WIN MOMENT

**🖼️ ON SCREEN:** Music swells. Two-column table animates in — "What the tech says" vs "What actually happened". Final row punches: **"A student just bought your course."** Confetti 🎉.

**🎙️ VO:**
> "Let's be real about what just happened. That's the same payment infrastructure behind Shopify, behind every SaaS tool, behind subscription giants. You just built it. The only difference? Yours also mints AI tokens. Nobody else is doing that. Nobody."

---

### ⏱️ 2:48 – 3:00 — OUTRO + NEXT

**🖼️ ON SCREEN:** Checklist ticks itself off fast. End card: **"+250 BROski$ — Module 4 Complete"** → "MODULE 5: Meet The Agent Crew 🐶♾️".

**🎙️ VO:**
> "Tick the checklist, claim your two-fifty BROski$. Your brain's alive. Your money engine's running. Module 5 — we bring in the Agent Crew, the AI workers that run your empire while you sleep. Let's build your team."

---

## 🎬 B-ROLL / ASSET CHECKLIST

- [ ] Stripe dashboard screen-record (test mode, blurred keys)
- [ ] 3-box metaphor animation (Stripe → Webhook → App)
- [ ] Code zoom-ins: checkout function + webhook handler
- [ ] Glowing Buy button mockup
- [ ] "Knock → padlock → coins" webhook animation
- [ ] `4242` card graphic
- [ ] Green terminal success line
- [ ] Win-moment comparison table animation
- [ ] End card + Module 5 teaser

---

## 🗣️ VO TIMING CHEAT SHEET

| Section | Time | ~Words |
|---|---|---|
| Cold open | 0:00–0:15 | 35 |
| Big idea | 0:15–0:38 | 60 |
| Steps 1–2 | 0:38–1:00 | 75 |
| Steps 3–4 | 1:00–1:22 | 60 |
| Step 5 webhook | 1:22–2:00 | 75 |
| Step 6 test | 2:00–2:25 | 55 |
| Win moment | 2:25–2:48 | 55 |
| Outro | 2:48–3:00 | 45 |
| **TOTAL** | **3:00** | **~460** |

---

> 📝 *Script notes: Compressed the 6-step written rewrite into 8 timed scenes. Kept every plain-English metaphor (middleman, tap on the shoulder, secret knock). Spoke code symbols aloud (`pk test`, `sk test`) so captions/TTS stay clean. Front-loaded the hook, saved the music swell for the win-moment table. ~460 words = ~3:00 at a fast, ADHD-friendly delivery. All technical facts match `MODULE_04_REWRITE.md`.*
