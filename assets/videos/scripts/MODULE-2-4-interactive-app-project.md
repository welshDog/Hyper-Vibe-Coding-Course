# MODULE 2.4 — Deploy Your Own Interactive App
## Project Walkthrough
### 🎬 OBS: Show options list, then live build of water tracker example

---

**DURATION:** ~12 minutes
**FORMAT:** Show the options, then build one live as a model.

---

## ⚡ INTRO (0:00 – 1:00)
### 🎬 SCREEN: Slide — "Week 2 Project: Build something you'll actually use"

---

Week 2 project.

[PAUSE]

You're building any interactive app you actually want to exist.

[PAUSE]

Not for a grade. Not to impress me.
For you. Something you'll open tomorrow.

[PAUSE]

One rule: it must save data to the browser.

[PAUSE]

---

## 🔧 PICK YOUR APP (1:00 – 3:00)
### 🎬 SCREEN: Options list appears one by one

---

Here are seven options. Pick one. Or make your own.

[PAUSE]

Water tracker — log water, show daily progress.
Stretch reminder — log quick stretches, track completions.
Gratitude journal — log one thing daily, see weekly patterns.
Focus timer — Pomodoro-style with motivational messages.
Habit tracker — multiple habits, show streaks.
Expense quick log — small purchases, category breakdown.
Or your own idea.

[PAUSE]

### 🎬 SCREEN: Highlight "YOUR IDEA" option

Honestly? Your own idea is the best option.
Something you actually want.

[PAUSE]

But if you're stuck — pick the water tracker.
I'm building that one live right now.

[PAUSE]

---

## 🔧 LIVE BUILD — Water Tracker (3:00 – 10:00)
### 🎬 SCREEN: Claude open, build the prompt live

---

Step one. Plan the interaction.

[PAUSE]

### 🎬 SCREEN: Notepad — jot down the five parts quickly

Role + Context: Health app, makes hydration fun.

Core Interaction: Click "Drank water" → logs a glass.

State: Today's count, daily streak, progress toward 8 glasses.

Edge Cases: Reset at midnight, persist on refresh.

Taste: Celebratory, fun, not preachy.

[PAUSE]

Now the prompt.

[PAUSE]

### 🎬 SCREEN: Type prompt into Claude

```
You're building a health app that makes hydration fun, not preachy.

I want a water tracker where:
- I click "Drank water" to log a glass
- Shows progress toward 8 glasses per day as a visual bar
- Shows today's count: "You've had 3 glasses today!"
- Celebrates when I hit 8 glasses (animation + message)
- Every glass triggers a small confetti or emoji animation
- Shows my streak (days in a row I hit 8 glasses)
- Resets daily count automatically at midnight
- Saves to browser local storage

Make it feel fun and celebratory, not medical.
Use sky blue and white as the main colours.
Include playful water droplet emojis 💧
Friendly fonts, rounded corners, big happy buttons.

Give me complete HTML + CSS + JS.
```

[PAUSE]

Send it.

[PAUSE]

### 🎬 SCREEN: Copy code → Replit → Run

Copy. Paste. Run.

[PAUSE]

### 🎬 SCREEN: Show the water tracker loading

Look at that.

[PAUSE]

Click it a few times.

[PAUSE]

### 🎬 SCREEN: Click 8 times — show the celebration

HIT EIGHT GLASSES.

[PAUSE]

Confetti. Celebration message.
That's what interactive feels like.

[PAUSE]

---

## 🔧 ITERATE (10:00 – 11:30)
### 🎬 SCREEN: One follow-up prompt to Claude

---

One quick improvement.
I want the streak counter to be more prominent.

[PAUSE]

"Make the streak counter larger and put it at the top.
Show a flame emoji 🔥 next to it."

[PAUSE]

Update. Deploy. Done.

[PAUSE]

---

## 🎉 CLOSE (11:30 – 12:00)
### 🎬 SCREEN: Finished app, then submission checklist

---

Deploy yours. Post the link in #projects.

[PAUSE]

Before you post — run through the checklist.
Buttons work. Data persists on refresh.
Mobile looks decent. Reset button works.

[PAUSE]

If all five tick — you're done.

[PAUSE]

Week 2 complete. Week 3 — we talk about taste.
The thing that makes your apps look like YOURS.

[PAUSE]

BROski♾

---
**END OF MODULE 2.4 PROJECT**
