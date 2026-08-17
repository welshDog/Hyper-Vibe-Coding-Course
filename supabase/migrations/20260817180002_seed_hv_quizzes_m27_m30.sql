-- Batch 3 (final) quizzes for the M21-M30 expansion. Must run after the
-- content migration (20260817180001).

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M27",
  "title": "Quiz: 📊 Building a Living Dashboard",
  "questions": [
    {
      "id": "m27q1",
      "type": "multiple_choice",
      "prompt": "What's the sharpened difference between M18's Personal Dev Dashboard and this module's dashboard?",
      "choices": ["They're identical", "Personal = for you alone; this module = a real join serving someone else", "This module has no data source", "M18 already covered product-scale dashboards"],
      "answer_index": 1,
      "explanation": "M18 answered questions for you alone. This module scales that instinct to a real dashboard someone else relies on, backed by a real join."
    },
    {
      "id": "m27q2",
      "type": "multiple_choice",
      "prompt": "What should back a product-scale dashboard's data, instead of gluing two fetches together in the frontend?",
      "choices": ["A real DB view/RPC joining tables server-side", "Two separate REST calls merged in useEffect", "A single unjoined table", "Hardcoded JSON"],
      "answer_index": 0,
      "explanation": "A server-side join is externalized correctness -- you're not trusting the frontend to glue two truths together consistently every time."
    },
    {
      "id": "m27q3",
      "type": "multiple_choice",
      "prompt": "How many questions should one dashboard screen try to answer?",
      "choices": ["As many as fit", "Exactly one, chosen on purpose", "Zero, just show raw data", "Whatever's convenient that day"],
      "answer_index": 1,
      "explanation": "A dashboard that tries to answer everything ends up answering nothing clearly -- one question per screen, same no-scope-creep discipline as every practical task."
    },
    {
      "id": "m27q4",
      "type": "true_false",
      "prompt": "A dashboard built for other people should be confirmed usable by a real person who isn't you.",
      "choices": ["True", "False"],
      "answer_index": 0,
      "explanation": "Building for someone else forces the 'does this make sense to a stranger' pass that a personal dashboard lets you skip."
    },
    {
      "id": "m27q5",
      "type": "practical",
      "prompt": "Ship one dashboard screen that answers one specific question, backed by a real database view or RPC joining at least two tables. Confirm a real person who isn't you can answer that question from it unassisted.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- a real join, one question, verified by someone else."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M27'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M28",
  "title": "Quiz: ⛓️ On-Chain Basics for Builders",
  "questions": [
    {
      "id": "m28q1",
      "type": "multiple_choice",
      "prompt": "What actually lives on-chain for most NFTs/dNFTs?",
      "choices": ["Every pixel of the image", "Token ID and owner address", "The pet's mood and level", "All game state"],
      "answer_index": 1,
      "explanation": "Ownership (token ID -> address) lives on-chain. Almost everything else is metadata, referenced off-chain."
    },
    {
      "id": "m28q2",
      "type": "multiple_choice",
      "prompt": "Where does a dNFT's metadata (name/image/attributes) usually live?",
      "choices": ["On-chain, inside the transaction", "Off-chain, referenced by a URI", "Nowhere, it's generated on the fly", "In the user's browser cache"],
      "answer_index": 1,
      "explanation": "Metadata is usually off-chain JSON, pointed to by a URI the token stores on-chain."
    },
    {
      "id": "m28q3",
      "type": "multiple_choice",
      "prompt": "In BROskiPets specifically, where does evolving state (level/mood/care stats) live?",
      "choices": ["On-chain, in the smart contract", "Off-chain, in this repo's real Supabase tables", "It doesn't exist", "In the wallet's local storage"],
      "answer_index": 1,
      "explanation": "BROskiPets' real evolution model keeps ownership on-chain and evolving game state off-chain, in this repo's own database."
    },
    {
      "id": "m28q4",
      "type": "true_false",
      "prompt": "\"It's on the blockchain\" means everything about an NFT is stored on-chain.",
      "choices": ["True", "False"],
      "answer_index": 1,
      "explanation": "False -- ownership is on-chain, but metadata and evolving state are almost always off-chain, by design, not as a shortcut."
    },
    {
      "id": "m28q5",
      "type": "practical",
      "prompt": "Trace a real BROskiPet mint end-to-end and write down which fields are on-chain vs. off-chain. Design a metadata schema (name/image/attributes) for a toy dNFT idea of your own.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- ground the on-chain/off-chain split in a real trace, not just theory."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M28'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M29",
  "title": "Quiz: 🔐 Safe Web3 Integration Patterns",
  "questions": [
    {
      "id": "m29q1",
      "type": "multiple_choice",
      "prompt": "What's the cost of importing a Web3 library globally rather than lazily?",
      "choices": ["No cost, imports are free", "Every visitor pays for it in bundle size, even non-Web3 users", "Only wallet users pay for it", "It only affects backend performance"],
      "answer_index": 1,
      "explanation": "A global import ships to every page, every user -- slower loads and bigger bundles for a feature most visitors never touch."
    },
    {
      "id": "m29q2",
      "type": "multiple_choice",
      "prompt": "How does this repo's real sacred rule scope wagmi/rainbowkit?",
      "choices": ["Loaded globally on every page", "Lazy-loaded, /pets-only, never global", "Loaded only in production", "Not used anywhere in this repo"],
      "answer_index": 1,
      "explanation": "wagmi/rainbowkit are lazy-loaded and scoped to /pets only -- this is an actual enforced rule in this codebase, not a suggestion."
    },
    {
      "id": "m29q3",
      "type": "multiple_choice",
      "prompt": "How do you actually verify a non-Web3 route pays zero bundle cost?",
      "choices": ["Assume it's fine if the code looks lazy", "Check the network tab on that route and confirm the library didn't load", "Ask the Web3 library's docs", "You can't verify this"],
      "answer_index": 1,
      "explanation": "Verifying via the network tab beats trusting 'it should be fine' -- the same evidence-over-assumption habit as every module since M23."
    },
    {
      "id": "m29q4",
      "type": "true_false",
      "prompt": "A lazy-loading boundary for Web3 code is the same blast-radius discipline as M22's file-access boundary, applied to bundle size.",
      "choices": ["True", "False"],
      "answer_index": 0,
      "explanation": "Same shape, different resource -- M22 bounds which files an agent can touch, this bounds which routes pay a bundle cost."
    },
    {
      "id": "m29q5",
      "type": "practical",
      "prompt": "Wrap a toy Web3 feature in a lazy-loading boundary. Prove via the network tab that a non-Web3 route pays zero bundle cost for it, and that the Web3 route loads it on demand.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the module's Definition of Done -- prove the isolation with real network tab evidence, not just code structure."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M29'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();

insert into public.hv_quizzes (module_id, source, version, payload)
select id, 'manual', 1, $json$
{
  "module_code": "M30",
  "title": "Quiz: 🎓 Launch Day: Ship Your Empire",
  "questions": [
    {
      "id": "m30q1",
      "type": "multiple_choice",
      "prompt": "What does this capstone teach that's new?",
      "choices": ["A brand new technical skill", "Nothing new -- it's about using M13-M29's skills together on one real shipped thing", "How to skip the approval gate for speed", "A shortcut past writing documentation"],
      "answer_index": 1,
      "explanation": "Every module since M13 taught one capability. This capstone fuses them on one real, shipped artifact -- it doesn't add a new skill."
    },
    {
      "id": "m30q2",
      "type": "multiple_choice",
      "prompt": "What's required before building in this capstone?",
      "choices": ["Nothing, just start coding", "A Project Dossier (same shape as M19's Mini-PRD)", "A funding round", "A hired team"],
      "answer_index": 1,
      "explanation": "A Project Dossier -- goal, non-goals, done means, files allowed -- comes before any building, same discipline as M19."
    },
    {
      "id": "m30q3",
      "type": "multiple_choice",
      "prompt": "What counts as genuine proof this capstone is 'done'?",
      "choices": ["The code compiles locally", "A real, working public artifact -- URL, repo, or share", "A private draft only you've seen", "A todo list marked complete"],
      "answer_index": 1,
      "explanation": "A public artifact is the only real proof of 'done' -- the capstone's hard requirement is shipping publicly, not just finishing locally."
    },
    {
      "id": "m30q4",
      "type": "true_false",
      "prompt": "The incident runbook for your capstone should be written down before you consider it launch-ready, not improvised after something breaks.",
      "choices": ["True", "False"],
      "answer_index": 0,
      "explanation": "A written runbook, prepared in advance, is exactly the M25 discipline this capstone requires you to actually apply."
    },
    {
      "id": "m30q5",
      "type": "practical",
      "prompt": "Ship one real thing publicly with a Project Dossier, an approval-gated build, minimal observability, a written incident runbook, and a graduation contribution post.",
      "choices": [],
      "answer_index": null,
      "explanation": "This is the course's final Definition of Done -- every artifact actually used together, shipped publicly, for real."
    }
  ]
}
$json$::jsonb
from public.hv_modules where code = 'M30'
on conflict (module_id, version) do update set payload = excluded.payload, updated_at = now();
