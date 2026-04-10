# MODULE 2.2 — Building the Mood Tracker
## Lab Walkthrough
### 🎬 OBS: Screen record browser — show Replit + Claude side by side

---

**DURATION:** ~20 minutes (students spend 90 min building + customising)
**FORMAT:** Full live build. Show every step. No cuts.

---

## ⚡ INTRO (0:00 – 0:45)
### 🎬 SCREEN: Blank Replit + Claude tabs open

---

We're building the mood tracker.

[PAUSE]

This is your first interactive app.
It saves data. It responds to clicks. It feels alive.

[PAUSE]

I'm building mine live right now.
Open your Replit. Let's go.

[PAUSE]

---

## 🔧 STEP 1 — New Replit Project (0:45 – 2:00)
### 🎬 SCREEN: Create new Replit project

---

New project. HTML CSS JS.
Call it "mood-tracker" or whatever you like.

[PAUSE]

Delete the default code. We're starting fresh.

[PAUSE]

---

## 🔧 STEP 2 — The Prompt (2:00 – 5:00)
### 🎬 SCREEN: Switch to Claude, paste the prompt

---

Here's the full prompt. Copy this exactly.

[PAUSE]

### 🎬 SCREEN: Show prompt — big text, easy to read

```
You are a designer building mental health tools.
I want a simple daily mood tracker app that:

- Shows 5 mood buttons: 😭 😞 😐 🙂 😄
- When I click a mood, it logs that I selected it
- Shows "Your mood today: [emoji]" at the top
- Below, shows "Mood Summary This Week":
  - "😭 Sad: 1 time"
  - "😞 Bad: 2 times"
  - "😐 Neutral: 3 times"  
  - "🙂 Good: 4 times"
  - "😄 Happy: 5 times"
- Uses colours that match each mood
  (red for sad, green for happy)
- Saves data to browser local storage so it persists
- Has a "Reset Week" button that clears all data
- Shows encouraging text: "Great job checking in today!"

Use modern fonts, soft colours (pastels), rounded corners.
Make it feel friendly, not clinical.
Give me complete HTML + CSS + JS code.
```

[PAUSE]

Paste that in. Send it.

[PAUSE]

### 🎬 SCREEN: Watch AI generate

Watching the code come out...

[PAUSE]

---

## 🔧 STEP 3 — Deploy (5:00 – 8:00)
### 🎬 SCREEN: Copy code, switch to Replit, paste

---

Copy the full code block.
Back to Replit. Paste into index.html.
Hit Run.

[PAUSE]

### 🎬 SCREEN: App loads in preview

THERE WE GO.

[PAUSE]

Five mood buttons.
Click one.

[PAUSE]

### 🎬 SCREEN: Click happy button, show it registering

"Your mood today: 😄"

[PAUSE]

It works first time.

[PAUSE]

---

## 🔧 STEP 4 — Test It Properly (8:00 – 12:00)
### 🎬 SCREEN: Click through different moods, show the counter updating

---

Let's test every part.

[PAUSE]

Click each mood a few times.
Watch the summary update.

[PAUSE]

### 🎬 SCREEN: Refresh the page

Now refresh the page.

[PAUSE]

Still there.

[PAUSE]

That's local storage working.
Your data survives a page refresh.

[PAUSE]

### 🎬 SCREEN: Click Reset Week button

Click Reset Week.
Clears everything.

[PAUSE]

### 🎬 SCREEN: Open DevTools → Application → Local Storage

Want to see the data?
Open DevTools. F12.
Go to Application → Local Storage.

[PAUSE]

See that? That's your mood data.
Living in the browser.

[PAUSE]

---

## 🔧 STEP 5 — Customise (12:00 – 18:00)
### 🎬 SCREEN: Go back to Claude with follow-up prompt

---

Now customise it. One thing at a time.

[PAUSE]

I want to change a few things.

[PAUSE]

### 🎬 SCREEN: Type follow-up prompt

"The mood buttons feel too small on mobile.
Make them bigger — at least 60px tall.
Also add a small celebratory animation when I click Happy."

[PAUSE]

Send. Copy. Paste. Run.

[PAUSE]

### 🎬 SCREEN: Show updated version

Better.

[PAUSE]

That's your iteration loop.
One ask. One change. See it. Repeat.

[PAUSE]

---

## 🎉 CLOSE (18:00 – 20:00)
### 🎬 SCREEN: Show finished mood tracker, then slide

---

That's your mood tracker.

[PAUSE]

Deploy it. Get your live URL.
Post it in Discord #projects.

[PAUSE]

Get two pieces of feedback from other students.
Make one improvement based on what they say.

[PAUSE]

That's Week 2 module two complete.

[PAUSE]

Next up — Module 2.3.
We go deep on interactive prompting.

[PAUSE]

BROski♾

---
**END OF MODULE 2.2 LAB**
