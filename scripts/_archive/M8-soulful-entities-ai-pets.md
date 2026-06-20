# 🐕 Soulful Entities & AI Pets

**Module:** M8 | **Level:** Advanced | **XP:** 70 | **Coins:** 25 BROski$

> What if your AI agent had a personality? A memory? A mood? This module is where tech meets soul.

---

## 🎯 What You'll Learn

- Understand the BROskiPets-LLM-dNFT architecture
- Give an agent a persistent personality using Supabase memory tables
- Implement mood states and behavioural drift over time
- Connect agent personality to on-chain NFT metadata
- Build an AI pet that remembers you, grows with you, and has a vibe

---

## 🧠 The Big Idea

A **soulful entity** is an AI agent that:
1. Has a **persistent memory** (remembers past conversations)
2. Has a **personality** (defined traits, communication style)
3. Has **mood states** (changes behaviour based on interactions)
4. Has an **on-chain identity** (NFT that evolves as the agent grows)

**The pattern:** Agent = code + memory + personality + on-chain soul.

---

## 🐾 BROskiPet Architecture

```
On-chain NFT (Solana/EVM)
    │
    ├─ Pet metadata (name, traits, level, mood)
    ├─ Evolution triggers (XP milestones, interactions)
    └─ LLM personality layer
            │
            ├─ Supabase memory (conversation history)
            ├─ Mood state machine (happy/tired/hyperfocused)
            └─ Personality prompt (SYSTEM message injected per conversation)
```

---

## ⚡ Step-by-Step

### Step 1 — Create the personality SYSTEM prompt
```typescript
const PERSONALITY_SYSTEM = `
You are ${pet.name}, a BROski AI pet.
Personality: ${pet.traits.join(', ')}.
Current mood: ${pet.mood}.
You remember: ${pet.memory_summary}.
Respond in character. Keep responses under 3 sentences unless asked for more.
`;
```

### Step 2 — Build the memory table
```sql
create table pet_memories (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  role text, -- 'user' | 'assistant'
  content text,
  created_at timestamptz default now()
);
```

### Step 3 — Implement mood drift
```typescript
function calculateMood(interactions: number, lastActive: Date): Mood {
  const hoursSince = (Date.now() - lastActive.getTime()) / 3600000;
  if (hoursSince > 48) return 'lonely';
  if (interactions > 20) return 'hyperfocused';
  return 'happy';
}
```

### Step 4 — Connect to NFT metadata
When the pet levels up, trigger an on-chain metadata update:
```typescript
await updateNFTMetadata(pet.token_id, {
  level: pet.level,
  mood: pet.mood,
  traits: pet.traits,
  image: generatePetImage(pet) // AI-generated based on current state
});
```

---

## 🌟 The Neurodivergent Edge

AI pets aren't just fun — they're **accountability partners** that don't judge you.

For ADHD minds that struggle with consistency, a pet that gets "lonely" if you don't check in creates a gentle, non-punishing motivation loop.

---

## ✨ Practical Task

Create a BROski pet with a name, 3 personality traits, and a basic memory system. Have a conversation with it. Watch it remember something from earlier in the conversation.

---

## 📊 XP Check

- [ ] Pet personality SYSTEM prompt written
- [ ] Memory table created in Supabase
- [ ] Mood state machine implemented (at least 3 states)
- [ ] Conversation with your pet that demonstrates memory

**Complete all 4 → Claim your 70 XP + 25 BROski$ 🤑**
