# BROskiPets Care System Brainstorming Report

## Overview

The current live BROskiPets experience already has a strong foundation: a pet identity layer, per-pet XP progression, a six-stage evolution ladder, customisation slots, a shop economy, and visible links between learning activity and pet growth.[cite:42][cite:43] The next design step is not to add random mechanics, but to turn the existing shop categories into a clean, low-friction pet care loop that feels playful, readable, and rewarding for neurodivergent learners.[cite:44][cite:28]

The live `/pets` page currently shows Luna as a Baby-stage Blizzard Lizard with 160 pet XP, four empty customisation slots, visible stage thresholds, recent course-driven rewards, and a clear “Boost Luna in the shop” path.[cite:42] The live `/shop` page already implies several item families including Pet Boosters, Pet Care, Snacks & Fuel, Toys & Gadgets, Clean & Tidy, cosmetics, and Sacred Relics, with price bands ranging from cheap repeatables to expensive prestige items.[cite:43]

## Current Product State

### Pets page signals

The `/pets` page already communicates a strong progression model: account XP and BROski$ are visible in the global shell, while the selected pet has its own XP label, current stage, next threshold, and automatic evolution messaging.[cite:42] The page also shows empty Aura, Frame, Badge, and Background slots, which means the customisation system is already positioned as a major companion loop rather than a minor extra.[cite:42]

The page also reveals three useful design truths. First, the pet is already framed as a persistent companion (`own it forever`) rather than a disposable gacha unit.[cite:42] Second, the primary motivation loop is still course activity and quests, not idle depletion mechanics.[cite:42] Third, the “How XP feeds your pet” section placeholder suggests there is room to explain the care system clearly once it exists.[cite:42]

### Shop page signals

The `/shop` page already gives enough structure to infer intended behaviour. Pet Boosters include effects such as `+50% XP from care actions for a day`, `max mood for 24h`, and `2× XP for 48h`, which implies temporary activated buffs rather than simple consumable food.[cite:43] Sacred Relics include items such as `Redemption Core` and `Vault Seal`, whose descriptions imply rare special powers and prestige functions rather than ordinary care actions.[cite:43]

The shop taxonomy is flavorful but slightly mixed. Some clearly playful items such as `Debug Duck`, `Holo Puzzle`, and `Quantum Toy` appear under Pet Care, while food-like items, cleaning items, and toy-like items are spread across multiple headings.[cite:43] This means the underlying system should separate **behaviour type** from display category so the fantasy flavor can stay intact without creating backend confusion.[cite:43]

## Design Goals

The care system should support five product goals:

- Make the pet feel responsive to player attention without becoming a chore.[cite:44]
- Preserve the central loop where real course progress fuels pet growth.[cite:42][cite:44]
- Keep the system visually simple and understandable at a glance for ADHD/dyslexic users.[cite:44][cite:50]
- Let cheap shop items create frequent micro-rewards while premium items create aspiration.[cite:43]
- Make category differences obvious so each item answers a single clear question: feed, cheer up, clean, boost, equip, or unlock something special.[cite:43]

The strongest design principle is low-pressure care. Earlier direction for BROskiPets favoured a Tamagotchi-Uni-meets-Finch model: emotionally sticky and rewarding, but not guilt-driven or punishing.[cite:44] That means no harsh neglect systems, no stat decay that undoes progress, and no “your pet suffered because you were offline” mechanics.[cite:44]

## Recommended Care Model

### Four primary stats

The cleanest starting point is a four-stat model:

- Hunger
- Happiness
- Cleanliness
- Focus

These stats are simple enough to scan and different enough to support distinct item effects.[cite:50][cite:49] They also map naturally to the current shop inventory and avoid turning the pet into an overcomplicated simulation.[cite:43]

### Optional mood layer

A lightweight mood layer should sit on top of the four stats. Instead of mood being a separate stat bar, it should be a readable label derived from current conditions and recent actions.[cite:44] Good mood examples include Sleepy, Focused, Playful, Grubby, Hype, and Zen; these are emotionally legible and can lightly influence outcomes without punishing the player.[cite:44][cite:46]

Example mood logic:

- High hunger + low happiness = Sleepy
- High cleanliness + recent toy use = Playful
- Focus booster active = Focused
- Low cleanliness = Grubby

This creates personality without adding another maintenance burden.[cite:44]

## Item Behaviour Framework

The current shop should be normalized into four main behaviour buckets plus two special buckets.[cite:43]

| Behaviour bucket | Meaning | Typical action pattern | Current examples |
|---|---|---|---|
| Feed | Restores hunger and sometimes focus/happiness | One-time consume | Classic Kibble, Markdown Muffin, API Apple, Pixel Sushi [cite:43] |
| Care | Restores cleanliness or stabilizes mood | One-time consume | Lint Brush, Log Floss, Cache Shampoo [cite:43] |
| Play | Raises happiness and tiny pet XP | One-time consume or short cooldown | Debug Duck, Holo Puzzle, Code Ball, Webhook Whistle [cite:43] |
| Boost | Activates timed premium effects | Timed activation | Hyper Kibble, Happiness Max, XP Booster [cite:43] |
| Equip | Cosmetic slot items | Persistent equip/unequip | Auras, Frames, Badges, Backgrounds [cite:42][cite:43] |
| Relic | Rare special powers | Exceptional one-off action | Redemption Core, Vault Seal [cite:43] |

This framework matters because the shop headings can stay fun and thematic, while the actual system underneath becomes predictable and easy to extend.[cite:43]

## Category Recommendations

### Pet Care

Pet Care should become the “safe default” section for simple dependable care. These items should be cheap, common, and useful for beginners.[cite:43] If an item sits in Pet Care but behaves like a toy, the frontend can still show it in Pet Care while the backend marks it with a `play` effect type.[cite:43]

Best design role:

- Reliable starter items
- Cheap enough for frequent use
- Clear stat effects
- No cooldown complexity

### Snacks & Fuel

Snacks & Fuel should focus on immediate hunger recovery plus a small secondary effect such as Focus or Happiness.[cite:43] This category is the easiest to understand and should probably be the first real usable inventory loop added to `/pets`.[cite:43]

Best design role:

- Fast consumables
- Tiny pet XP on use
- Strong visual feedback (“Luna loved that snack”) 
- Main daily interaction loop

### Toys & Gadgets

Toys & Gadgets should be about joy, bonding, and personality. These items should increase Happiness and sometimes award a little pet XP, but they should not overshadow real learning-linked XP from quests and modules.[cite:42][cite:44]

Best design role:

- Short playful interaction
- Small XP bumps
- Mood changes such as Playful or Hype
- Great place for cute animations later

### Clean & Tidy

Clean & Tidy should exist to remove low-energy or grubby states and restore “ready to train” vibes.[cite:43][cite:42] This category is useful because it gives a second type of daily check-in beyond feeding, but it should never behave like a punishment tax.[cite:44]

Best design role:

- Cleanliness restoration
- Mood recovery
- Visual polish moments such as sparkle/shine states
- No harsh penalties if ignored

### Pet Boosters

Pet Boosters already read like activated premium buffs, and the live shop wording supports keeping them that way.[cite:43] These should feel more strategic and less frequent than ordinary care items.

Best design role:

- Timed bonus effects
- Ideal for event weekends, streak pushes, or special lesson sessions
- Visible active-buff area on `/pets`
- Higher price and stronger feedback

Possible examples already suggested by the live data include bonus care XP, max mood windows, and temporary XP multipliers.[cite:43]

### Sacred Relics

Sacred Relics should remain rare, strange, and emotionally significant.[cite:43] They should never be reduced to “very expensive stat food,” because the current names and descriptions already imply mythic, account-history-level meaning.[cite:43]

Best design role:

- Fix or reverse one meaningful mistake
- Mark a pet with prestige or legacy status
- Unlock hidden cosmetic variants or remembrance features
- Create future endgame goals for collectors

This category works best when used sparingly and explained clearly through special action dialogs rather than ordinary consume flows.[cite:43]

## XP Philosophy

Per-pet XP is already the right emotional metric for bonding and growth, while account XP remains the course-wide progression signal.[cite:42][cite:47] The care system should therefore give only **small** pet XP rewards, while real module and quest completion remain the major growth engine.[cite:42][cite:44]

Recommended XP pattern:

- Feed action: +2 pet XP
- Play action: +3 pet XP
- Clean action: +2 pet XP
- Complete daily care trio: +10 bonus pet XP
- Course milestones/events: major pet XP through the existing global-to-pet progression path[?]

The purpose of these small care-XP rewards is responsiveness, not grinding. The player should feel that pet attention matters, but should never be able to bypass the course loop by chain-spamming shop items.[cite:42][cite:44]

## Economy Structure

The live shop already hints at a strong three-tier economy.[cite:43]

| Tier | Price vibe | Intended behaviour |
|---|---|---|
| Daily items | Roughly 18–45 BROski$ | Cheap feed/care/play loop items [cite:43] |
| Mid-tier upgrades | Roughly 80–300 BROski$ | Boosters and cosmetics worth saving for [cite:43] |
| Endgame prestige | Roughly 1,200–1,500 BROski$ | Sacred Relics and legacy flex items [cite:43] |

This is good because it supports three player rhythms: daily spend, weekly reward, and long-term aspiration.[cite:43] The best way to use this is to ensure that beginners can always afford some meaningful low-tier interactions, while more dedicated users can chase booster builds, full cosmetic sets, and relic status.[cite:43][cite:46]

## UX Recommendations for `/pets`

The `/pets` page should become the **use and bond** page, while `/shop` remains the **buy and collect** page.[cite:42][cite:43] That separation keeps each page mentally clean and matches the current “Boost Luna in the shop” CTA already present on the page.[cite:42]

Recommended additions to `/pets` before deeper systems:

- A compact action bar: Feed, Play, Clean, Boost.[cite:42][cite:43]
- An “Owned items” drawer filtered by action type.[cite:43]
- An active effects row showing current boosters.[cite:43]
- A clearer explanatory module in the currently sparse “How XP feeds your pet” area.[cite:42]
- Later: mood sparkles, pet reactions, and tiny animations after the mechanics are proven.[cite:45][cite:52]

A good first interaction should look like this:

1. User clicks Feed on `/pets`.[cite:42]
2. Owned compatible items appear (for example Classic Kibble, Hyper Donut, API Apple).[cite:43]
3. User selects one item and confirms use on Luna.[cite:42][cite:43]
4. Hunger rises, a small mood reaction appears, and pet XP nudges slightly.[cite:44]
5. If a booster is active, the result panel explains the bonus clearly.[cite:43]

## Data Model Recommendations

Before building UI, the backend should support a structured item-effect system instead of hardcoding per-item logic.[cite:43] Useful fields for each shop item or derived item-effect record include:

- `effect_type` — `feed`, `care`, `play`, `boost`, `equip`, `relic`
- `target_stat` — `hunger`, `happiness`, `cleanliness`, `focus`, `mood`, `pet_xp`, `special`
- `effect_value`
- `duration_minutes`
- `consumable`
- `equippable`
- `cooldown_minutes`
- `special_action`
- `rarity`
- `ui_category`

This lets the frontend keep flavorful headings while the backend remains consistent.[cite:43] It also gives room for items that belong to a display section like Pet Care but actually execute a `play`-style effect.[cite:43]

## Risks to Avoid

Several traps are worth avoiding from the start:

- Do not make care replace course progress as the main XP source.[cite:42][cite:44]
- Do not create punishing stat decay that makes absence feel like failure.[cite:44]
- Do not let every category collapse into generic “+XP item” behaviour.[cite:43]
- Do not overload the page with too many visible meters at once; four primary stats is enough initially.[cite:50]
- Do not spend time on elaborate animations until the care actions, item model, and pet state flow are stable.[cite:45][cite:52]

## Recommended Build Order

### Wave 1 — simple consumables

Start with the easiest, most legible loop:

- Snacks & Fuel
- Clean & Tidy
- Basic Pet Care

This creates a usable daily care cycle with simple feedback and minimal system risk.[cite:43]

### Wave 2 — play and buffs

Add:

- Toys & Gadgets
- Pet Boosters

This introduces joy, mood variety, and temporary effect logic after the core consumption flow works.[cite:43]

### Wave 3 — special systems

Add:

- Sacred Relics
- Advanced mood interactions
- Cosmetic synergies or collection bonuses

This preserves relic mystique and prevents rare-item systems from being built on unstable foundations.[cite:43]

## Open Questions for Brainstorming

Before implementation, these questions should be answered clearly:

1. Should pet stats be always visible, or partly abstracted into a simple mood badge plus one or two bars?
2. Should toys be consumable, cooldown-based, or reusable with charges?
3. Should boosters affect only care actions, only learning-linked XP, or both?[cite:43]
4. Should relics be spendable consumables, permanent account unlocks, or one-time-per-pet actions?[cite:43]
5. Should the player care for one active hero pet only, or eventually apply some actions across all owned pets?
6. How much pet XP from care feels responsive without undermining lesson-driven progression?[cite:42][cite:44]
7. Should “How XP feeds your pet” become a tutorial panel that explains account XP, pet XP, boosters, and care in one place?[cite:42]

## Recommended Next Step

The best next step is not coding the `/pets` page yet. The strongest next move is to define the item-effect matrix and pet-state model in writing first, using the current live shop inventory as source material.[cite:42][cite:43] Once each current item has a clear behaviour type, target stat, duration rule, and rarity role, the frontend can be built quickly without redesign churn.[cite:43]

A practical follow-up deliverable would be a structured item matrix covering all current shop items, with columns for category label, effect type, target stat, value, duration, rarity, and whether the item is consumed, equipped, activated, or reserved for special actions.[cite:43]
