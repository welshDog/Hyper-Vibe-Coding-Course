# 🎮 ULTIMATE PLAYTEST — Hyper-Vibe Coding Course
> Written: May 19, 2026 | By: @welshDog + Perplexity AI
> "Stop apologising for your brain. Start building."

---

## 🧠 What This Is

This is the **definitive playtest script** for the Hyper-Vibe Coding Course.

Use this to simulate a real student journey — start to finish.
Catch broken flows, missing wins, confusing jumps, and dead ends BEFORE a real human hits them.

Run this:
- After every module rewrite
- Before any public launch
- When something "feels off" but you can't name it
- At the start of every Sprint review

---

## 👤 The Student Personas

Test against at least ONE of these every time:

| Persona | Profile | Watch For |
|---|---|---|
| 🧠 **Lex** | ADHD, 19, first coding course ever | Overwhelm at walls of text, loses thread between modules |
| 💻 **Sam** | Self-taught dev, impostor syndrome | Skims fast — do the wins land or feel patronising? |
| 🎨 **Priya** | Designer wanting to code | Needs real-world context before every tech concept |
| 🔄 **Jordan** | Started 3 courses, finished 0 | Does each module feel completable in one session? |
| 🏆 **Alex** | Ambitious, wants the BROski$ bag | Are rewards tangible, clear, and satisfying? |

---

## 🗺️ The Full Journey Map

```
M0 → M1 → M2 → M2b → M3 → M4 → M5 → M5b → M6 → M7 → M8 → M9 → M10
 ↑                                                               ↑
Onboarding                                               Graduation
```

Each module must answer **5 questions** before passing playtest:

1. ✅ Can a student explain what they built in one sentence?
2. ✅ Is there a clear WIN moment they can screenshot/share?
3. ✅ Does the next module feel like a natural next step?
4. ✅ Are there zero unexplained acronyms in the first screen?
5. ✅ Does the BROski$ XP claim feel earned?

---

## 🎮 MODULE-BY-MODULE PLAYTEST CHECKLIST

---

### 🟢 M0 — Welcome to the Zone
**Vibe check:** Does this feel like the first day of something epic, not a legal disclaimer?

- [ ] Opening line hooks in under 10 seconds
- [ ] Student knows exactly what they'll BUILD by the end of the course
- [ ] No jargon on the first screen
- [ ] BROski mascot/tone established immediately
- [ ] "This course is for brains like yours" message lands
- [ ] Time estimate given ("You'll be running your first AI agent in ~45 mins")

**WIN check:** Student thinks: *"I'm in the right place. These people get me."*

---

### 🔴 M1 — Your AI Brain (REWRITTEN ✅)
**Vibe check:** Does it feel like flipping ON a superpower, not installing software?

- [ ] Docker explained as "Your AI Brain" — not as "containerisation platform"
- [ ] `docker-compose up` moment has a clear "it worked!" visual
- [ ] Student can see containers running — something IS alive
- [ ] Analogy: Brain turning on 🧠 used consistently
- [ ] BROski$ XP claim is visible and clickable at the end
- [ ] Time estimate: ~45 mins confirmed

**WIN check:** Student can say: *"I turned on my AI brain and it's running."*

🧪 **Live test command:**
```bash
docker-compose up -d
docker ps  # should show containers running
```

---

### 🟡 M2 — First Contact (+ M2b merge check)
**Vibe check:** Does the student feel like they're TALKING to their creation?

- [ ] M2 and M2b flow naturally — no hard stop between them
- [ ] Bridge line present: "Now you've got it running — let's talk to it"
- [ ] First API call returns something the student actually cares about
- [ ] Error handling shown — "If you see X, do Y" pattern
- [ ] No assumption that student knows what an endpoint is

**WIN check:** Student gets a response back from their own running system. *"It replied to me!"*

---

### 🟡 M3 — What Just Happened? (WIN SUMMARY)
**Vibe check:** Does the student understand what they just built in plain English?

- [ ] Plain-English summary lands BEFORE any next steps
- [ ] Key line present: *"Your server just responded. That's the same tech Netflix runs on."*
- [ ] Celebration moment is explicit — not just implied
- [ ] Student is told what skills they now have (name them!)
- [ ] Smooth bridge to M4: "Now let's add payments"

**WIN check:** Student can tell a non-technical friend what they built. That's the test.

---

### 🔴 M4 — Getting Paid (Stripe Walkthrough) (REWRITTEN ✅)
**Vibe check:** Does Stripe feel like a tap on the shoulder, not a bank exam?

- [ ] Webhook explained as: "Stripe tapping your server on the shoulder 👆"
- [ ] Test mode vs live mode explained BEFORE any keys are shown
- [ ] stripe listen command confirmed working
- [ ] Student receives a test payment event — sees it in their terminal
- [ ] "Real money is coming into YOUR system" moment lands emotionally
- [ ] NEVER: Tell student to use live keys before test is confirmed

**WIN check:** Student sees a Stripe test event hit their server. *"Someone just paid me."*

🧪 **Live test command:**
```bash
stripe listen --forward-to localhost:3000/api/webhook
stripe trigger payment_intent.succeeded
```

---

### 🟡 M5 — Meet Your Agents (SPLIT CHECK)
**Vibe check:** Does the student feel like they're hiring a crew, not debugging Prometheus?

- [ ] M5 CORE: Agents only — no observability stack yet
- [ ] Each agent introduced with a JOB, not a tech spec
- [ ] Analogy used: *"Your crew of specialists 👥"*
- [ ] Student sees agents communicating — something moves
- [ ] Observability (Grafana/Prometheus) pushed to M5b — NOT here
- [ ] M5b clearly signposted: "Want to add CCTV for your agents? → M5b"

**WIN check:** Student can name what each agent does in plain English.

---

### 🟡 M5b — Your CCTV Stack (Observability)
**Vibe check:** Does monitoring feel like power, not punishment?

- [ ] Grafana introduced as: *"CCTV for your server 📹"*
- [ ] Prometheus = the camera. Grafana = the screen. Loki = the recording.
- [ ] Student sees a live dashboard within 10 minutes
- [ ] Alert manager explained as: *"The alarm that calls you 🚨"*
- [ ] This is OPTIONAL for M5 completers — not a blocker

**WIN check:** Student sees their own system on a live Grafana dashboard. *"I can see everything."*

---

### 🟡 M6 — Deploy to the World (M5→M6 Handoff)
**Vibe check:** Does the leap from local to live feel exciting, not terrifying?

- [ ] Handoff line present: *"M5 = meet your agents. M6 = deploy your agents to the world."*
- [ ] What CHANGES in M6 vs M5 is stated explicitly (not implied)
- [ ] Vercel/deployment target is clear — student knows WHERE it's going
- [ ] NEVER: `db push` without migration warning
- [ ] NEVER: global wagmi setup mentioned without context
- [ ] Student sees their live URL at the end

**WIN check:** Student pastes their live URL in Discord. *"It's live. Anyone can hit it."*

---

### 🟡 M7 — Lock the Door (Security + Prompt Injection)
**Vibe check:** Does security feel like being smart, not being scared?

- [ ] Prompt injection explained BEFORE VenomEep intro
- [ ] Analogy used: *"A con artist trying to talk their way past your bouncer 🥸"*
- [ ] VenomEep shown as the solution, not the problem
- [ ] Rate limiting = *"Auto-throttle on attacks 🚫"*
- [ ] Student adds at least ONE security layer and tests it
- [ ] "You just protected a production system" moment lands

**WIN check:** Student blocks a simulated attack. *"I just stopped that."*

---

### 🔴 M8 — Web3 Plain English (REWRITTEN ✅)
**Vibe check:** Does Web3 feel like upgrading your passport, not joining a cult?

- [ ] Smart contract = *"Database nobody can delete 🔒"* — stated upfront
- [ ] Dynamic NFT = *"Live passport 🛂"* — before any Solidity
- [ ] First interaction is READ-only — no gas fees on first contact
- [ ] Student mints something — sees it on a real chain
- [ ] No assumed prior crypto knowledge
- [ ] BROski Pets connection made: *"This is how your Pet evolves"*

**WIN check:** Student holds a token they created. *"I just made something on the blockchain."*

---

### 🔴 M9 — You Are the SRE (Security + SRE) (REWRITTEN ✅)
**Vibe check:** Does the student feel like a systems guardian, not a sysadmin drone?

- [ ] SRE defined in plain English FIRST: *"The person who makes sure it never goes down"*
- [ ] Lighthouse 100/100 target shown as achievable — not mythical
- [ ] a11y framed as: *"More users = more revenue. Accessibility is business sense."*
- [ ] Sprint 3 cert harness reusable pattern documented
- [ ] vibe-labs-a11y + vibe-labs-anon-flow referenced
- [ ] Grafana alert wired to something real

**WIN check:** Student runs Lighthouse, gets a score, improves one thing. *"I made it faster."*

---

### 🟡 M10 — You're a Meta-Architect (GRADUATION)
**Vibe check:** Does this feel like the end of a hero's journey, not the last lecture?

- [ ] STOPS being a tech lesson — becomes a CELEBRATION
- [ ] Student's full journey recapped: what they built, module by module
- [ ] Emotional arc present: *"You started as a permission-seeker. You leave as a Meta-Architect."*
- [ ] BROski Elite Certificate moment — real, shareable, named
- [ ] BROski$ maximum XP claim — biggest reward of the course
- [ ] Clear "what's next" path: HyperCode-V2.4, Discord, community
- [ ] Final line hits hard — no waffle

**WIN check:** Student posts their certificate in Discord. That IS the test.

---

## 🚦 PLAYTEST SCORING

After running the full journey, score each module:

| Score | Meaning |
|---|---|
| 🟢 PASS | All 5 core questions answered. WIN moment lands. |
| 🟡 NEEDS WORK | 3-4 questions pass. WIN moment weak or missing. |
| 🔴 FAIL | Less than 3 pass. Student would drop here. |

---

## 🔴 KNOWN DROP POINTS (Test Extra Hard)

These are where students historically quit:

1. **M1 → Docker install** — Windows WSL2 issues. Have a fallback path documented.
2. **M2 → First API call** — Port already in use. Show the fix inline.
3. **M4 → Stripe keys** — Students use LIVE keys by mistake. Gate this hard.
4. **M5 → Agent swarm** — Too many concepts at once without M5b split.
5. **M8 → Gas fees** — Student gets scared of spending money. Testnet ONLY first.
6. **M10 → Ending** — Too tech-heavy. Should feel like a party, not a postmortem.

---

## ✅ PLAYTEST PASS CRITERIA

The course passes full playtest when:

- [ ] All 13 modules score 🟢
- [ ] A non-technical person watching over your shoulder knows what just happened at each WIN
- [ ] BROski$ XP flows correctly end-to-end
- [ ] No dead links, broken commands, or 404s in any module
- [ ] Persona **Jordan** (serial quitter) would finish all 13 modules in one weekend

---

## 📋 PLAYTEST LOG — Fill In As You Go

| Date | Tester | Module | Score | Notes |
|---|---|---|---|---|
| 2026-05-19 | @welshDog | Full run | 🟡 In progress | Rewrites landing well |

---

## 🔖 After Playtest — Fixes Go Here

Create issues with format:
```
[PLAYTEST] M{number} — {what broke} — {persona it affects}
```

Example:
```
[PLAYTEST] M4 — Stripe live key warning missing — affects all personas
```

---

> 🐶♾️ Built by @welshDog + Perplexity AI — May 19, 2026
> *"Stop apologising for your brain. Start building."*
