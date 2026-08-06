# Hyper-Vibe Pets Cosmetics & Overlay Art – Current Status Handover

## Overview

This report captures the current state of the `/pets` page cosmetics system in the Hyper-Vibe Coding Course project as of 2026‑08‑03, focusing on overlay art, shop items, and Luna’s live pet card. It consolidates the recent fixes, design decisions, and open work so that future sessions, agents, and collaborators can see exactly “where things are up to” before continuing.[^1]

## Live Pet State – Luna

- The authenticated account’s `/pets` page currently shows **one pet, Luna (Blizzard Lizard)**, at stage BABY with account-wide XP tracked toward the next learner level.[^1]
- Luna has all four cosmetic slots equipped using real shop items:
  - **Aura:** Flame Aura.
  - **Frame:** Basic Neon Frame.
  - **Badge:** BROski Holo Badge.
  - **Background:** Dark Lab.[^1]
- The page correctly reports **4 / 4 cosmetic slots equipped**, and the pet-care/customise panel shows the equipped items with green checkmarks in each slot row.[^1]

## Grants & Asset Path Fix – PR #49

- A previous bug prevented cosmetic equip/unequip from working cleanly, and some assets had incorrect `.png.png` paths. This was fixed in branch `fix/cosmetic-grants-and-asset-paths` and merged via **PR #49**.[^2]
- After the fix, the Aura swatch shows a working thumbnail (fire ring art) with a green checkmark, and equipping the Aura on Luna succeeds without permission errors.[^3][^4]
- The equip RPC now runs under the correct permission context, restoring functional cosmetic equip/unequip for the pet without touching unrelated course or XP logic.[^2]

## Overlay Asset Split – PR #52

- The deeper root cause identified for the Frame was that **`shop_items.image_url` held opaque shop-preview card art**, which is unsuitable for compositing over a pet portrait (it includes a baked background, cat art, and promo text).[^2]
- **PR #52** introduced and proved a clean data model split:
  - `preview_image_url` – opaque shop-preview artwork for catalogue tiles and picker swatches.
  - `overlay_image_url` – transparent compositable artwork for the pet portrait (Aura/Frame/Badge/Background overlays).[^2]
- A real transparent overlay PNG was generated for **Basic Neon Frame**:
  - Border/glow only.
  - Purple → cyan gradient.
  - ~10% safe-edge inset.
  - No cat art, no promo text.[^2]
- `PetPortrait.tsx` was updated to **prefer `frame.overlay_image_url` and fall back to `frame.image_url`** when overlay art is absent, so migrated items gain the new behavior while un-migrated frames remain unchanged.[^2]
- Live verification on the real account confirms:
  - Luna’s Blizzard Lizard portrait stays fully visible in the centre.
  - Basic Neon Frame displays as a clean neon border around Luna, with no ghosted card text and no duplicate cat.[^5]
- Other frames and layered auras still use the old opaque fallback path and are tracked in **issue #51: “Cosmetics: separate opaque catalogue art from transparent overlay art.”**[^2]

## Cosmetics Visual Polish Design – Spec & PR #53

- After shipping the Frame overlay proof case, a visual gap was observed: Aura flames were too subtle, Dark Lab behaved like a “card inside a card,” and the Holo Badge felt too small relative to the pet-card canvas.[^6]
- The team inspected the actual asset files for **Dark Lab, Flame Aura, and BROski Holo Badge** to determine whether the problem was CSS or baked art:
  - **Dark Lab background:** `PetPortrait` already renders the background as `absolute inset-0 object-cover`, but the image itself has a rounded-square vignette border baked in, causing a card-within-card look even when full-bleed. Real fix: crop past the vignette into the actual lab scene and re-export. 
  - **Flame Aura:** The flame ring art is good and blend-mode compatible (near-black background), but the asset contains large dead starfield margins so the ring only fills ~60% of its canvas. Tight cropping plus a modest scale bump yields “visibly surrounds Luna” without new art. 
  - **BROski Holo Badge:** The medallion is small relative to its canvas. Margin cropping lets the badge scale up; its baked “PREMIUM COLLECTIBLE / EST. 2024” caption is non-problematic because it lives on the badge chip and does not overlap Luna’s face. 
- Based on this inspection, the design direction chosen was:
  - **Reuse existing art** via crop/re-export rather than generate entirely new assets.
  - **Reuse `overlay_image_url` for all compositable slots** (Background/Aura/Frame/Badge), keyed by the existing `pet_slot`, instead of adding a separate `background_image_url` or render-mode metadata. 
- A docs-only design spec, **“/pets cosmetic layers visual polish”**, was committed in `docs/superpowers/specs/2026-08-03-pets-cosmetics-visual-polish-design.md` and opened as **PR #53**.[^2]
- The spec defines **one proof-case item per slot**:
  - Background: **Dark Lab**.
  - Aura: **Flame Aura**.
  - Badge: **BROski Holo Badge**.
  - Frame: **Basic Neon Frame (already proven in #52, only regression-checked).**[^2]
- It establishes slot-specific rules:
  - Background uses full-bleed compositable art behind Luna.
  - Aura uses transparent ring/particles surrounding Luna at an increased scale (~1.5 vs 1.25).
  - Frame remains the neon border overlay proven by #52.
  - Badge is enlarged from hero `h-10 w-10` to `h-16 w-16` with well-defined responsive sizes for other tiers, positioned bottom-right on the frame.[^2]
- CodeRabbit’s review suggested small clarifications (e.g., explicitly stating that each cropped overlay PNG must be published and wired into `shop_items.overlay_image_url`, and tightening badge sizing descriptions). These are to be folded into the spec before implementation.[^2]

## Current Cosmetics Behavior on Live Preview

- The Vercel preview and local dev builds show Luna with:
  - Dark Lab as background.
  - Flame Aura equipped.
  - Basic Neon Frame overlay.
  - BROski Holo Badge equipped.[^5][^6]
- With the overlay fix in place for Basic Neon Frame:
  - Frame: visually correct, border/glow only, no card-within-card artifact.
- Before the new crop/export work:
  - Background: still appears as “card within card” due to baked vignette; technically rendered full-bleed but visually constrained by art.[^6]
  - Aura: flame ring visible but small; the effect reads as subtle rather than strongly wrapping Luna.[^6]
  - Badge: appears as a small thumbnail; reward feeling is present but not yet satisfying relative to available space.[^6]

## BROski$ Balance and Shop Testing State

- The account initially had **12 BROski$**, earned from course activity, which was not enough to buy and test the full cosmetic catalogue.[^7]
- An audited admin-only grant was applied via the existing `award_tokens()` path:
  - Reason: **“QA cosmetic testing grant: +5,000 BROski$.”**
  - Source ID: `admin_qa_cosmetics_grant_2026_08_03` (stable, dedup-safe, same protection pattern as course-completion rewards). 
  - Amount: +5,000.
  - New balance: **5,012 BROski$** at the time of the grant.[^7]
- No learner-facing “free money” UI was added; this remains an admin-only QA tool.
- After purchasing additional cosmetics (e.g., Dark Lab, BROski Holo Badge), the balance reflects the correct deductions (e.g., 4,842 BROski$ after specific purchases), confirming that price, purchase flow, and balance updates work as expected.[^1]

## Open Work – Issue #51 and Visual Polish Implementation

- **Issue #51** tracks the full rollout of the overlay-art approach across all cosmetics:
  - Separate opaque catalogue art (`preview_image_url` / `image_url`) from transparent compositable overlay art (`overlay_image_url`) for frames, auras, badges, and backgrounds.[^2]
  - Ensure every layered cosmetic has a safe-to-composite overlay asset.
- The newly added **visual polish spec** (PR #53) carves out a lower-risk first implementation pass:
  - Crop/re-export Dark Lab, Flame Aura, and BROski Holo Badge overlay PNGs from existing art.
  - Wire their URLs to `shop_items.overlay_image_url`.
  - Adjust Aura and Badge scaling in `PetPortrait.tsx` while preserving frame behavior and background full-bleed semantics.
  - Keep untouched items on the existing fallback path until their overlay art is produced.[^2]
- Implementation planning for this spec will need to:
  - Add the three overlay files to `frontend/public/images/shop/pet-*`.
  - Write a small migration or seed update to set `overlay_image_url` for Dark Lab, Flame Aura, and BROski Holo Badge.
  - Update `PetPortrait.tsx` background branch to prefer `overlay_image_url`, matching the frame’s behavior.
  - Introduce precise Tailwind class changes for Aura scale and Badge sizes as specified.
  - Extend or augment Playwright coverage to assert overlay preference vs fallback and basic accessibility/anonymous-flow behaviors alongside the live authenticated visual check.

## Summary – “Where Things Are Up To”

- Frame overlay behavior for **Basic Neon Frame** is solved and live on `main`; Luna’s portrait is correctly framed and visible.[^2]
- Cosmetic equip/grant behavior is working, with a clean admin-only BROski$ grant used for QA and confirmed by live balance changes.[^7]
- Background/Aura/Badge visuals are diagnosed as **asset-margin/vignette issues**, not core rendering bugs; a design spec (PR #53) now defines a crop/re-export approach using `overlay_image_url` for one exemplar item per slot.[^2]
- Full catalogue overlay rollout and long-tail art production remain open in **issue #51**, with the next concrete step being the implementation plan derived from the newly merged design spec.

---

## References

1. [Hyper Vibe Coding Course — Code by Vibe, Not Syntax](https://hyper-vibe-coding-course-6vw43i7y6-bro-skis.vercel.app/pets) - Build real AI apps by talking, not memorising syntax. Neurodivergent-first: ADHD, dyslexic & autisti...

2. [docs: add /pets cosmetic layers visual polish design spec by welshDog · Pull Request #53 · welshDog/Hyper-Vibe-Coding-Course](https://github.com/welshDog/Hyper-Vibe-Coding-Course/pull/53) - # docs: add /pets cosmetic layers visual polish design spec - #53

Open

welshDog wants to merge 1 c...

3. [screenshot.jpg](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/107547080/c377af51-f966-449a-9cc1-1c1131c43e2f/screenshot.jpg?AWSAccessKeyId=ASIA2F3EMEYE7AGDL3VT&Signature=YOk1MLF%2FXQAQgQl5b26xu9MV4r0%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEHQaCXVzLWVhc3QtMSJHMEUCIDWzsAZNlYAriua9grWSI%2BNavZ6GqnKlY8vWJI4CQLrxAiEAxlo6A2dJPj0qARVEYcmJNgAFobBzSy%2FHpMHiIOx9yCwq8wQIPRABGgw2OTk3NTMzMDk3MDUiDDgFNau%2FEa%2FeTJHEKirQBDQHXmdzAtymBvFdqm%2BoEURP0FmkIurkJhYoX1mlT3JQJpBxpUQWOS%2FHq9j7uniSjLxqsjai7HCJ4oSrEJIHFnVD1xr8veHw%2F3FzMVmCwbc3cG5MDTzlQqSjlJHGUrT3cB%2FwFpajsUPvu%2Bdq94hCxV2wHyoCMRYztRriQF8QmkN%2FY5TDN2HhLpN2n0tgHEzg70v0gcdVTt9hcIKTRXAD8q%2FMyUaezF4EtQPgu6FOJHYkY5VgrgHVGrNCkYTvoyesPFtuvqL2e9DH58xCvEaR1oEQqcefQkl7otEh9Ragf1g4L6fpwHO%2B6s4%2BU9StSzR%2ByNMovyOxTI9Se1cDP0Ho9Ci7TVeWgXbF5lrbG0cOkG%2Bs%2BAE7iOx9EHSqCLQNKa37N9J5KUdr3Y9A81seYHO0xHgtZsj60oVZNmGoIKL7jMg3WHf4G5Ksyy0%2BLwrA7vXTqNoviIUGyvpNo9xvcTm%2FBicar71enf0ZJNxrNnCAog%2FaKeRqtBS0%2Bqdm6X8tVR0ttNfetVleyg51PUbYyIYvzXWLmkGZW2sEt90NejLfxeJjqYpKliMP9dH28aYwQPoWuYtBladP060HRts1mHmqZKfy92j6whuzjnpSYXK2Lv%2F1KV0a2i%2FEyN1eF4Z%2F2UoOI8QiFQcLCYnpUmS7BzdwDkbghglfMb0Ygbvt2S9pBn80AMK%2BKjRIoj7BAiGpubDl0roxU2oXflAqO8650BGKMxK3uRVMHAeRv96g1QjKoTlHmlLmqhtrf6kBI6O14pWo1nq9aVUGvxQ16TTetzagOEEwnd%2FR0wY6mAHyI3gvrzfVe51pX%2BzjQ4D9hkCOU%2BYZEdVTYbp2lLSoGpkMdYfEnG2ZZI76finfFMu53oCmSvAMSKvkfnxVtG1gaM7U2psgPWwCzlXQtqG7pLbsal4JEe2GyB4jSpK7nAABdJj1PukRBM%2BrjOkHK%2FF8rhYY9urEdlLVu3GWgW1Hpp4Z1J2JXnSmnnlqAlMhWRue8QmhDnyb1g%3D%3D&Expires=1786019184)

4. [screenshot.jpg](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/107547080/0c1b9bc7-ab0a-492a-af40-3ffb5ef8a88e/screenshot.jpg?AWSAccessKeyId=ASIA2F3EMEYE7AGDL3VT&Signature=sWZSIAGC0PBwN125gA1ALCJxqJM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEHQaCXVzLWVhc3QtMSJHMEUCIDWzsAZNlYAriua9grWSI%2BNavZ6GqnKlY8vWJI4CQLrxAiEAxlo6A2dJPj0qARVEYcmJNgAFobBzSy%2FHpMHiIOx9yCwq8wQIPRABGgw2OTk3NTMzMDk3MDUiDDgFNau%2FEa%2FeTJHEKirQBDQHXmdzAtymBvFdqm%2BoEURP0FmkIurkJhYoX1mlT3JQJpBxpUQWOS%2FHq9j7uniSjLxqsjai7HCJ4oSrEJIHFnVD1xr8veHw%2F3FzMVmCwbc3cG5MDTzlQqSjlJHGUrT3cB%2FwFpajsUPvu%2Bdq94hCxV2wHyoCMRYztRriQF8QmkN%2FY5TDN2HhLpN2n0tgHEzg70v0gcdVTt9hcIKTRXAD8q%2FMyUaezF4EtQPgu6FOJHYkY5VgrgHVGrNCkYTvoyesPFtuvqL2e9DH58xCvEaR1oEQqcefQkl7otEh9Ragf1g4L6fpwHO%2B6s4%2BU9StSzR%2ByNMovyOxTI9Se1cDP0Ho9Ci7TVeWgXbF5lrbG0cOkG%2Bs%2BAE7iOx9EHSqCLQNKa37N9J5KUdr3Y9A81seYHO0xHgtZsj60oVZNmGoIKL7jMg3WHf4G5Ksyy0%2BLwrA7vXTqNoviIUGyvpNo9xvcTm%2FBicar71enf0ZJNxrNnCAog%2FaKeRqtBS0%2Bqdm6X8tVR0ttNfetVleyg51PUbYyIYvzXWLmkGZW2sEt90NejLfxeJjqYpKliMP9dH28aYwQPoWuYtBladP060HRts1mHmqZKfy92j6whuzjnpSYXK2Lv%2F1KV0a2i%2FEyN1eF4Z%2F2UoOI8QiFQcLCYnpUmS7BzdwDkbghglfMb0Ygbvt2S9pBn80AMK%2BKjRIoj7BAiGpubDl0roxU2oXflAqO8650BGKMxK3uRVMHAeRv96g1QjKoTlHmlLmqhtrf6kBI6O14pWo1nq9aVUGvxQ16TTetzagOEEwnd%2FR0wY6mAHyI3gvrzfVe51pX%2BzjQ4D9hkCOU%2BYZEdVTYbp2lLSoGpkMdYfEnG2ZZI76finfFMu53oCmSvAMSKvkfnxVtG1gaM7U2psgPWwCzlXQtqG7pLbsal4JEe2GyB4jSpK7nAABdJj1PukRBM%2BrjOkHK%2FF8rhYY9urEdlLVu3GWgW1Hpp4Z1J2JXnSmnnlqAlMhWRue8QmhDnyb1g%3D%3D&Expires=1786019184)

5. [screenshot.jpg](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/107547080/aafdc4ea-e2c1-4730-80cf-abf2e8f6715b/screenshot.jpg?AWSAccessKeyId=ASIA2F3EMEYE7AGDL3VT&Signature=ukD3K216T0HA3W9dOTRfO4QRIPg%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEHQaCXVzLWVhc3QtMSJHMEUCIDWzsAZNlYAriua9grWSI%2BNavZ6GqnKlY8vWJI4CQLrxAiEAxlo6A2dJPj0qARVEYcmJNgAFobBzSy%2FHpMHiIOx9yCwq8wQIPRABGgw2OTk3NTMzMDk3MDUiDDgFNau%2FEa%2FeTJHEKirQBDQHXmdzAtymBvFdqm%2BoEURP0FmkIurkJhYoX1mlT3JQJpBxpUQWOS%2FHq9j7uniSjLxqsjai7HCJ4oSrEJIHFnVD1xr8veHw%2F3FzMVmCwbc3cG5MDTzlQqSjlJHGUrT3cB%2FwFpajsUPvu%2Bdq94hCxV2wHyoCMRYztRriQF8QmkN%2FY5TDN2HhLpN2n0tgHEzg70v0gcdVTt9hcIKTRXAD8q%2FMyUaezF4EtQPgu6FOJHYkY5VgrgHVGrNCkYTvoyesPFtuvqL2e9DH58xCvEaR1oEQqcefQkl7otEh9Ragf1g4L6fpwHO%2B6s4%2BU9StSzR%2ByNMovyOxTI9Se1cDP0Ho9Ci7TVeWgXbF5lrbG0cOkG%2Bs%2BAE7iOx9EHSqCLQNKa37N9J5KUdr3Y9A81seYHO0xHgtZsj60oVZNmGoIKL7jMg3WHf4G5Ksyy0%2BLwrA7vXTqNoviIUGyvpNo9xvcTm%2FBicar71enf0ZJNxrNnCAog%2FaKeRqtBS0%2Bqdm6X8tVR0ttNfetVleyg51PUbYyIYvzXWLmkGZW2sEt90NejLfxeJjqYpKliMP9dH28aYwQPoWuYtBladP060HRts1mHmqZKfy92j6whuzjnpSYXK2Lv%2F1KV0a2i%2FEyN1eF4Z%2F2UoOI8QiFQcLCYnpUmS7BzdwDkbghglfMb0Ygbvt2S9pBn80AMK%2BKjRIoj7BAiGpubDl0roxU2oXflAqO8650BGKMxK3uRVMHAeRv96g1QjKoTlHmlLmqhtrf6kBI6O14pWo1nq9aVUGvxQ16TTetzagOEEwnd%2FR0wY6mAHyI3gvrzfVe51pX%2BzjQ4D9hkCOU%2BYZEdVTYbp2lLSoGpkMdYfEnG2ZZI76finfFMu53oCmSvAMSKvkfnxVtG1gaM7U2psgPWwCzlXQtqG7pLbsal4JEe2GyB4jSpK7nAABdJj1PukRBM%2BrjOkHK%2FF8rhYY9urEdlLVu3GWgW1Hpp4Z1J2JXnSmnnlqAlMhWRue8QmhDnyb1g%3D%3D&Expires=1786019184)

6. [screenshot.jpg](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/107547080/654413dc-5353-4126-aa74-e3f07e472765/screenshot.jpg?AWSAccessKeyId=ASIA2F3EMEYE7AGDL3VT&Signature=LZe19Yv0KgHqXuMlinL7P31bfL8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEHQaCXVzLWVhc3QtMSJHMEUCIDWzsAZNlYAriua9grWSI%2BNavZ6GqnKlY8vWJI4CQLrxAiEAxlo6A2dJPj0qARVEYcmJNgAFobBzSy%2FHpMHiIOx9yCwq8wQIPRABGgw2OTk3NTMzMDk3MDUiDDgFNau%2FEa%2FeTJHEKirQBDQHXmdzAtymBvFdqm%2BoEURP0FmkIurkJhYoX1mlT3JQJpBxpUQWOS%2FHq9j7uniSjLxqsjai7HCJ4oSrEJIHFnVD1xr8veHw%2F3FzMVmCwbc3cG5MDTzlQqSjlJHGUrT3cB%2FwFpajsUPvu%2Bdq94hCxV2wHyoCMRYztRriQF8QmkN%2FY5TDN2HhLpN2n0tgHEzg70v0gcdVTt9hcIKTRXAD8q%2FMyUaezF4EtQPgu6FOJHYkY5VgrgHVGrNCkYTvoyesPFtuvqL2e9DH58xCvEaR1oEQqcefQkl7otEh9Ragf1g4L6fpwHO%2B6s4%2BU9StSzR%2ByNMovyOxTI9Se1cDP0Ho9Ci7TVeWgXbF5lrbG0cOkG%2Bs%2BAE7iOx9EHSqCLQNKa37N9J5KUdr3Y9A81seYHO0xHgtZsj60oVZNmGoIKL7jMg3WHf4G5Ksyy0%2BLwrA7vXTqNoviIUGyvpNo9xvcTm%2FBicar71enf0ZJNxrNnCAog%2FaKeRqtBS0%2Bqdm6X8tVR0ttNfetVleyg51PUbYyIYvzXWLmkGZW2sEt90NejLfxeJjqYpKliMP9dH28aYwQPoWuYtBladP060HRts1mHmqZKfy92j6whuzjnpSYXK2Lv%2F1KV0a2i%2FEyN1eF4Z%2F2UoOI8QiFQcLCYnpUmS7BzdwDkbghglfMb0Ygbvt2S9pBn80AMK%2BKjRIoj7BAiGpubDl0roxU2oXflAqO8650BGKMxK3uRVMHAeRv96g1QjKoTlHmlLmqhtrf6kBI6O14pWo1nq9aVUGvxQ16TTetzagOEEwnd%2FR0wY6mAHyI3gvrzfVe51pX%2BzjQ4D9hkCOU%2BYZEdVTYbp2lLSoGpkMdYfEnG2ZZI76finfFMu53oCmSvAMSKvkfnxVtG1gaM7U2psgPWwCzlXQtqG7pLbsal4JEe2GyB4jSpK7nAABdJj1PukRBM%2BrjOkHK%2FF8rhYY9urEdlLVu3GWgW1Hpp4Z1J2JXnSmnnlqAlMhWRue8QmhDnyb1g%3D%3D&Expires=1786019184)

7. [Hyper Vibe Coding Course — Code by Vibe, Not Syntax](http://localhost:5173/pets) - Build real AI apps by talking, not memorising syntax. Neurodivergent-first: ADHD, dyslexic & autisti...

