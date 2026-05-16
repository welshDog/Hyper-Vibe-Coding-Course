# 💳 MODULE 4 — Build Your Money Engine
> **Rewrite v1 — May 16, 2026**
> Status: 🟡 Draft — ready for review
> Original: "BROski$ Economy + Database Management"
> Rewrite goal: Beginner-safe Stripe walkthrough, plain English, no assumed knowledge

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ A real Stripe account connected to your app
- ✅ A working payment button that charges real (or test) money
- ✅ BROski$ tokens minting when someone pays
- ✅ Your first monetised AI platform 💰

**Time:** 25–30 minutes
**Vibe:** You're not just coding — you're building a business.

---

## 💡 Before We Start — What's Actually Happening?

Forget "payment gateway" and "webhook endpoints" for a second.

Here's the plain-English version:

> 🤝 **Stripe is the middleman between your app and your student's bank card.**
> When someone pays £10, Stripe handles all the scary stuff (fraud checks, card processing, receipts).
> It then taps your app on the shoulder and says: **"Hey, someone just paid. Do your thing."”**
> Your app hears that tap, mints BROski$ tokens, and unlocks the course.

Three moving parts:
1. **Stripe** — handles the money 💳
2. **Webhook** — the tap on the shoulder 👆
3. **Your app** — does something when it gets tapped ⚙️

---

## 🔑 Step 1 — Create Your Free Stripe Account

> ⏱️ **Time: 3 minutes**

1. Go to **[stripe.com](https://stripe.com)** and click **"Start now"**
2. Fill in your email + password
3. Verify your email
4. You're in — **don't activate live payments yet** (we use test mode first)

> 💬 **Test mode = fake money. Real mode = real money.**
> Stay in test mode until you're 100% happy with how everything works.
> Stripe makes this dead easy — there's a toggle at the top of your dashboard.

---

## 🔑 Step 2 — Get Your API Keys

> ⏱️ **Time: 2 minutes**

1. In your Stripe dashboard, click **Developers** (top right)
2. Click **API Keys**
3. You'll see two keys:
   - **Publishable key** — starts with `pk_test_...` — safe to use in frontend
   - **Secret key** — starts with `sk_test_...` — **NEVER share this, never commit to GitHub**

4. Copy both keys and add them to your `.env` file:

```bash
# In your .env file
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

> ⚠️ **Important:** Your `.env` file is in `.gitignore` — that means it never gets pushed to GitHub. Your secret key stays secret. Always.

---

## 🛠️ Step 3 — Install Stripe in Your App

> ⏱️ **Time: 1 minute**

In your terminal:

```bash
# Install Stripe Python library
pip install stripe

# Install Stripe JS (for your Next.js frontend)
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Then update your `requirements.txt`:

```bash
pip freeze > requirements.txt
```

> 🧠 **Plain English:** You just gave your app the tools it needs to talk to Stripe.

---

## 💆 Step 4 — Create a Payment Button

> ⏱️ **Time: 10 minutes**

In your FastAPI backend (`/api/stripe_routes.py`), add this:

```python
import stripe
import os
from fastapi import APIRouter

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/create-checkout")
async def create_checkout():
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "gbp",
                "product_data": {"name": "Hyper-Vibe Course Access"},
                "unit_amount": 4700,  # £47.00 in pence
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url="http://localhost:3000/success",
        cancel_url="http://localhost:3000/cancel",
    )
    return {"checkout_url": session.url}
```

> 💬 **What this does:** When someone hits this endpoint, Stripe creates a checkout page and gives you a URL. You send them to that URL. Stripe handles the rest.

In your Next.js frontend, add a button:

```jsx
// components/BuyButton.jsx
export default function BuyButton() {
  const handleBuy = async () => {
    const res = await fetch("/api/create-checkout", { method: "POST" });
    const data = await res.json();
    window.location.href = data.checkout_url; // 🚀 sends them to Stripe
  };

  return (
    <button onClick={handleBuy} className="buy-btn">
      💳 Get Course Access — £47
    </button>
  );
}
```

---

## 👂 Step 5 — Set Up the Webhook (The Tap on the Shoulder)

> ⏱️ **Time: 8 minutes**

This is where the magic happens. When Stripe gets a payment, it needs to tell YOUR app.

**First — install the Stripe CLI:**
```bash
# Mac
brew install stripe/stripe-cli/stripe

# Windows — download from:
# https://github.com/stripe/stripe-cli/releases
```

**Start listening for webhooks locally:**
```bash
stripe listen --forward-to localhost:8000/webhook
```

You'll see a **webhook signing secret** — copy it into your `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

**Add the webhook handler to your FastAPI:**
```python
@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except Exception:
        return {"error": "Invalid webhook"}
    
    # 🎉 Someone just paid!
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_email = session["customer_details"]["email"]
        
        # 🪙 Mint their BROski$ tokens
        await mint_broski_tokens(customer_email, amount=500)
        print(f"✅ Payment received from {customer_email} — 500 BROski$ minted!")
    
    return {"status": "ok"}
```

> 🧠 **Plain English:** Every time Stripe gets a payment, it sends a secret knock to your app. Your app checks the knock is real, then mints the student's tokens. Automatic. Every time.

---

## 🧪 Step 6 — Test It With Fake Money

> ⏱️ **Time: 3 minutes**

Stripe gives you a magic test card number:

```
Card number:  4242 4242 4242 4242
Expiry:       Any future date (e.g. 12/28)
CVV:          Any 3 digits (e.g. 123)
```

1. Click your **Buy Button** in the browser
2. You'll land on Stripe's checkout page
3. Enter the test card details above
4. Hit **Pay**
5. Check your terminal — you should see:
   ```
   ✅ Payment received from test@example.com — 500 BROski$ minted!
   ```

**If you see that message — your money engine works.** 🏆

---

## 🏆 Your Win Moment

Let's be clear about what just happened:

| What the tech says | What actually happened |
|---|---|
| "Stripe checkout session" | A real payment page, owned by you |
| "Webhook received" | Stripe told your app money arrived |
| "500 BROski$ minted" | You automated your business logic |
| "checkout.session.completed" | A student just bought your course |

> 🔥 **You just built the same payment infrastructure that powers Shopify stores, SaaS tools, and subscription businesses.**
> The only difference? Yours also mints AI tokens. Nobody else is doing that.

---

## 🛑 Something Went Wrong?

**Problem: "No such customer" error**
- Make sure you're in **test mode** in Stripe dashboard (toggle top right)
- Make sure your `.env` keys start with `pk_test_` and `sk_test_`

**Problem: Webhook not receiving events**
```bash
# Make sure stripe CLI is running
stripe listen --forward-to localhost:8000/webhook
# Keep this terminal open while testing!
```

**Problem: "Invalid webhook signature"**
- Double check `STRIPE_WEBHOOK_SECRET` in your `.env`
- Copy it fresh from the `stripe listen` output

> 💬 **Still stuck?** Post in Discord `#payments-help` with your error message. The crew's got you.

---

## ✅ Module 4 Complete Checklist

- [ ] Stripe account created
- [ ] API keys added to `.env`
- [ ] Stripe installed in backend + frontend
- [ ] Payment button working
- [ ] Webhook receiving events
- [ ] Test payment processed with 4242 card
- [ ] BROski$ tokens minting on payment
- [ ] 🪙 **+250 BROski$ claimed for completing M4**

---

## 🔮 What's Next — Module 5

Your Brain is alive. Your money engine is running.

In Module 5 we bring in **the Agent Crew** — the AI workers that run your empire while you sleep. Self-healing. Self-monitoring. Always on.

**Let's build your team.** 🐶♾️

---

> 📝 *Rewrite notes: Added full plain-English metaphor (middleman, tap on shoulder). Split into 6 numbered steps with time estimates. Added test card details. Added troubleshooting section. Added win moment table. Added completion checklist. Kept all technical commands accurate.*
