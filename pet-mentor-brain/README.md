# 🐾 BROskiPet Mentor Brain

> The AI personality layer for all 10 BROskiPet species.
> Created: 2026-06-02
> Owner: @welshDog 🏴󠁧󠁢󠁷󠁬󠁳󠁧

---

## 📁 What's In Here

| File | Purpose |
|---|---|
| `petPersonalities.ts` | All 10 species — system prompts, example lines, helpers |
| `README.md` | This file |

---

## 🐾 The 10 Species

| # | Species | Emoji | Vibe |
|---|---|---|---|
| 1 | Sonic Spider | 🕷️ | Ship it fast, zero overthinking |
| 2 | Apex Dragon | 🐲 | Ancient systems thinker |
| 3 | Blizzard Lizard | ❄️ | Ice cold debugger |
| 4 | Chaos Cat | 🐈 | Creative wildcard rebel |
| 5 | Cyber Fox | 🦊 | Slick hacker shortcut king |
| 6 | Gigabyte Guinea Pig | 🐹 | Chaotic curious experimenter |
| 7 | Hyper Beam Bunny | 🐰 | Intense sprint coach |
| 8 | Hyper Hamster | 🐭 | Deep dive research machine |
| 9 | Hyperfocus Horse | 🐴 | Flow state guardian |
| 10 | Power Pup | 🐶 | Unconditional loyalty mentor |

---

## 🛠️ How To Use

```ts
import { buildSystemPrompt, getPetPersonality } from './petPersonalities'

// Get a personality
const personality = getPetPersonality('sonic_spider')

// Build a filled system prompt for the Edge Function
const prompt = buildSystemPrompt('sonic_spider', 450, 'Module 3 — Win Summary')
```

---

## 🔜 What Gets Built Next

1. `PetMentorBubble.tsx` — floating UI widget on lesson pages
2. `pet-mentor-chat` Supabase Edge Function — LLM wired to personalities
3. `usePetMoodSync.ts` — live mood triggers from student actions
4. Wire bubble into `/vibe-labs/level-[n]` pages

---

> 🧠 These personalities are the SOUL of the platform.
> The course teaches the skills. The pet makes the student feel seen.
