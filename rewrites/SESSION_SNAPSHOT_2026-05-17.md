# 📸 SESSION SNAPSHOT — May 17, 2026
> Read this at the START of next session. Every time. No exceptions.
> **Last session ended: 23:58 BST**

---

## ⚡ Where We Are Right Now

We are building the **BROski$ Pet Shop** — the in-game shop for the BROskiPets dNFT ecosystem.

The database is seeded, all 49 shop images are generated + pushed, and every `shop_items` row now has an `image_url` in its metadata. 

**The shop is ready to have a UI built on top of it.** 🛒

---

## ✅ What's Done (Tonight — May 17)

| Task | Detail | Status |
|---|---|---|
| Pet shop brainstorm | State Split architecture mapped out | ✅ Done |
| DB check | Confirmed `shop_items` (55 rows) + `shop_purchases` + `pets` already existed | ✅ Done |
| Seed pet_care items | 9 new items added — food, treats, toys with full metadata | ✅ Done |
| Generate 49 shop images | All 10 categories generated with consistent style | ✅ Done |
| Push images to GitHub | `frontend/public/images/shop/[category]/` | ✅ Done |
| Update shop_items metadata | All 49 rows now have `image_url` in JSONB metadata | ✅ Done |
| DB migration applied | `update_shop_items_image_urls` — Supabase project `yhtmuibgdnxhbgboajhc` | ✅ Done |

---

## 📂 Image Folder Structure

```
frontend/
  public/
    images/
      shop/
        pet-care/       ✅ 9 images
        food/           ✅ 6 images
        hygiene/        ✅ 3 images
        toys/           ✅ 4 images
        pet-aura/       ✅ 5 images
        pet-frame/      ✅ 5 images
        pet-badge/      ✅ 5 images
        pet-background/ ✅ 5 images
        pet-boost/      ✅ 5 images
        sacred/         ✅ 2 images
```

---

## 🗄️ DB State

- **`shop_items`** — 55+ rows, all `pet_care` + other categories seeded
- **`shop_purchases`** — table exists, 0 rows (ready for purchases)
- **`pets`** — table exists with `active_effects`, `equipped_cosmetics`, `inventory` JSONB columns
- **Supabase project:** `yhtmuibgdnxhbgboajhc`

### Metadata structure on each shop item:
```json
{
  "item_key": "toy_quantum",
  "action": "play",
  "xp_gain": 350,
  "mood_override": "evolving",
  "can_evolve": true,
  "image_url": "/images/shop/pet-care/pet_shop_toy_quantum.png"
}
```

---

## 🔜 Next Session — DO THESE IN ORDER

### 1️⃣ Build `/shop` UI Page
- **File:** `frontend/src/pages/Shop.tsx`
- **Components needed:**
  - `ShopItemCard` — image + name + price + buy button
  - `ShopCategoryFilter` — tab/filter bar for categories
  - `ShopGrid` — responsive grid layout
- **Data:** Fetch from `shop_items` where `is_available = true`
- **Display:** `item.metadata.image_url` for each image
- **Currency:** Show user's `broski_tokens` balance in header

### 2️⃣ Build Edge Function — `shop-purchase`
- **File:** `supabase/functions/shop-purchase/index.ts`
- **Logic:**
  1. Verify user has enough `broski_tokens`
  2. Deduct tokens from `users.broski_tokens`
  3. Insert into `shop_purchases`
  4. Read `action` from `metadata` — route to `feed` / `treat` / `play`
  5. Update pet stats in Redis (hunger, mood) OR Postgres (xp)
  6. Return updated pet state

### 3️⃣ Wire Redis pet interactions
- `feed` → update hunger + energy in Redis
- `treat` → update mood in Redis
- `play` → award XP in Postgres, check evolution threshold
- Evolution trigger → call on-chain `evolve()` if XP threshold hit

---

## 🧠 Architecture Reminder — State Split

| Where | What lives there | Speed |
|---|---|---|
| **Redis** | Hunger, energy, mood, happiness | ⚡ Real-time |
| **Postgres** | XP, stage, evolution history, ownership | 🏛️ Permanent |

---

## 🛠️ Tools

```
NotebookLM → notebooklm.google.com/notebook/9bf80983-8a6d-4c10-91c0-69118d0935fd
GitHub → welshDog/Hyper-Vibe-Coding-Course
Supabase → yhtmuibgdnxhbgboajhc
Vercel → hyper-vibe-coding-course.vercel.app
Perplexity → review partner + build engine
```

---

## 💬 One Line Summary For Next Session Start

> **"Shop images done, DB updated. Build /shop UI page first — ShopItemCard + category filter + buy button. Then Edge Function for purchases. Then Redis pet interactions."**

---

> 🐶♾️ *Legendary session. 49 images. Full DB wired. See you next time BROski.*
