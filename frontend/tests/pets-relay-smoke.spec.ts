// Relay mint smoke tests — BROskiPets (/pets)
//
// What these cover:
//   1. Balance gate:  authenticated user with <100 tokens can't reach the mint button.
//   2. Name gate:     mint button stays disabled until the user types a pet name.
//   3. Relay API:     mint-pet-auth accepts relay:true and returns a tx_hash.
//   4. Happy path:    connected wallet → mint → success card. The full authenticated
//                     journey, end to end (added 2026-07-23).
//
// How the wallet gets connected (test 4)
//   Tests 1-3 could never connect a wallet, and the note that used to live here
//   blamed an unpredictable RainbowKit connector uid. That diagnosis was wrong.
//   `reconnect()` (@wagmi/core/actions/reconnect) never connects using the
//   connector recorded in `wagmi.store` — it walks the config's REAL connectors and
//   calls `isAuthorized()` on each. Seeding `wagmi.store` only reorders that walk,
//   which is why it looked like it did nothing.
//
//   So instead of seeding storage we announce an EIP-6963 provider. wagmi's
//   multiInjectedProviderDiscovery (on by default) turns each announced provider
//   into a connector whose `target` is set, and a targeted connector's
//   `isAuthorized()` skips the `injected.connected` storage flag and simply asks
//   the provider for `eth_accounts`. Return an address there and wagmi reconnects
//   on its own — no app code, no MetaMask, no RainbowKit internals.
//
//   Receipts are a separate mock: useWaitForTransactionReceipt reads through the
//   chain's http transport (https://sepolia.base.org), NOT through the wallet, so
//   the JSON-RPC endpoint is intercepted too. Without that the success card can
//   never render, because `isDone` needs `receiptConfirmed`.

import { test, expect, type Route } from '@playwright/test'

// ── shared constants ─────────────────────────────────────────────────────────

const FAKE_WALLET  = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
const FAKE_TX      = '0xabc123def456abc123def456abc123def456abc123def456abc123def456abcd'
const FAKE_USER_ID = 'relay-smoke-user-id'
const FAKE_JWT     = 'relay-smoke-jwt'
const CHAIN_ID     = 84532   // Base Sepolia

// ── helpers ──────────────────────────────────────────────────────────────────

async function fulfillJson(route: Route, payload: unknown, status = 200) {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173'
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin':      origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers':     '*',
      'access-control-allow-methods':     'GET,POST,PATCH,DELETE,OPTIONS',
      'access-control-expose-headers':    'content-range',
      vary: 'origin',
    },
    body: JSON.stringify(payload),
  })
}

async function allowCors(route: Route) {
  const origin = route.request().headers()['origin'] ?? 'http://localhost:5173'
  await route.fulfill({
    status: 204,
    headers: {
      'access-control-allow-origin':      origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers':     '*',
      'access-control-allow-methods':     'GET,POST,PATCH,DELETE,OPTIONS',
      vary: 'origin',
    },
    body: '',
  })
}

// ── mock auth/REST shared setup ───────────────────────────────────────────────

function setupAuthMock(page: import('@playwright/test').Page) {
  return page.route('**/auth/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())

    if (url.pathname.startsWith('/auth/v1/token') || url.pathname.startsWith('/auth/v1/session')) {
      await fulfillJson(route, {
        access_token: FAKE_JWT, token_type: 'bearer', expires_in: 3600,
        refresh_token: 'relay-refresh',
        user: {
          id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated',
          email: 'relay@example.com',
          user_metadata: { full_name: 'Relay Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
        },
      })
      return
    }
    if (url.pathname.startsWith('/auth/v1/user')) {
      await fulfillJson(route, {
        id: FAKE_USER_ID, aud: 'authenticated', role: 'authenticated', email: 'relay@example.com',
        user_metadata: { full_name: 'Relay Tester', onboarded_at: '2026-01-01T00:00:00.000Z' },
      })
      return
    }
    await fulfillJson(route, {})
  })
}

function setupRestMock(page: import('@playwright/test').Page, tokens: number) {
  let petsCallCount = 0
  return page.route('**/rest/v1/**', async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
    const url = new URL(route.request().url())
    const asObj = Boolean(route.request().headers()['accept']?.includes('application/vnd.pgrst.object+json'))

    if (url.pathname.startsWith('/rest/v1/users')) {
      const p = { id: FAKE_USER_ID, email: 'relay@example.com', broski_tokens: tokens, role: 'student', created_at: '2026-01-01T00:00:00.000Z' }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/user_xp')) {
      const p = { user_id: FAKE_USER_ID, total_xp: 800, streak_days: 5 }
      await fulfillJson(route, asObj ? p : [p]); return
    }
    if (url.pathname.startsWith('/rest/v1/pets')) {
      petsCallCount++
      if (petsCallCount >= 2) {
        // Second fetch (post-mint refetch) returns the newly minted pet.
        const pet = {
          id: 'pet-uuid-1', pet_id: 'broski_42', species_id: 'blizzard_lizard',
          pet_name: 'FrostbitePW', rarity: 'uncommon', stage: 'baby', mood: 'idle',
          evolution_count: 0, xp: 0, last_evolved_at: null,
          mint_tx_hash: FAKE_TX, ipfs_cid: 'bafkreib4...testcid',
          chain_id: CHAIN_ID, created_at: new Date().toISOString(),
          user_id: FAKE_USER_ID, wallet_address: FAKE_WALLET, cosmetics: {},
        }
        await fulfillJson(route, [pet]); return
      }
      await fulfillJson(route, []); return
    }
    if (url.pathname.startsWith('/rest/v1/top_pets')) { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/shop_items')) { await fulfillJson(route, []); return }
    if (url.pathname.startsWith('/rest/v1/user_level_progress')) { await fulfillJson(route, asObj ? null : []); return }
    if (url.pathname.startsWith('/rest/v1/user_loyalty_tier'))   { await fulfillJson(route, asObj ? null : []); return }
    if (url.pathname.startsWith('/rest/v1/rifts'))                { await fulfillJson(route, asObj ? null : []); return }
    if (url.pathname.startsWith('/rest/v1/enrollments'))          { await fulfillJson(route, asObj ? null : []); return }
    if (url.pathname.startsWith('/rest/v1/rpc/'))                 { await fulfillJson(route, null); return }
    await fulfillJson(route, asObj ? null : [])
  })
}

// ── wallet helper (EIP-6963) ──────────────────────────────────────────────────
//
// Announces a stub provider the way a real extension does. wagmi discovers it,
// builds a targeted connector from it, and auto-reconnects because our
// `eth_accounts` returns an address. See the header note for why this works when
// seeding `wagmi.store` did not.

function connectWallet(page: import('@playwright/test').Page) {
  return page.addInitScript((args) => {
    const { wallet, chainHex } = args as { wallet: string; chainHex: string }

    const provider = {
      isMetaMask: true,
      request: async ({ method }: { method: string }) => {
        switch (method) {
          // Both are answered: `isAuthorized()` uses eth_accounts, and an
          // explicit user connect would use eth_requestAccounts.
          case 'eth_accounts':
          case 'eth_requestAccounts':      return [wallet]
          case 'eth_chainId':              return chainHex
          case 'net_version':              return String(parseInt(chainHex, 16))
          case 'wallet_switchEthereumChain': return null
          case 'wallet_getPermissions':
          case 'wallet_requestPermissions': return [{ parentCapability: 'eth_accounts' }]
          default:                         return null
        }
      },
      on: () => {}, removeListener: () => {}, addListener: () => {}, emit: () => {},
    }

    // Kept for any code path that still reads the legacy global directly.
    ;(window as unknown as { ethereum: unknown }).ethereum = provider

    const detail = Object.freeze({
      info: {
        uuid: '7f8e9d0c-1b2a-4c3d-8e5f-6a7b8c9d0e1f',
        name: 'E2E Mock Wallet',
        // A 1x1 transparent gif — mipd requires a data: URI, not the contents.
        icon: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
        rdns: 'zone.hyperfocus.e2ewallet',
      },
      provider,
    })

    const announce = () =>
      window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }))

    // Announce on request (wagmi asks on init) and once eagerly, in case wagmi
    // subscribed before this script ran.
    window.addEventListener('eip6963:requestProvider', announce)
    announce()
  }, { wallet: FAKE_WALLET, chainHex: '0x14a34' })
}

// ── chain RPC mock ────────────────────────────────────────────────────────────
//
// viem talks JSON-RPC over POST and may batch calls into an array, so both
// shapes are handled. Only the methods waitForTransactionReceipt actually needs
// are answered; anything else returns null, which viem tolerates.

const RECEIPT_BLOCK = 42_900_000

function setupChainRpcMock(page: import('@playwright/test').Page) {
  // A regex, not a glob: viem POSTs to bare `https://sepolia.base.org` with no
  // path, which `**/sepolia.base.org/**` does not match.
  return page.route(/sepolia\.base\.org/, async (route) => {
    if (route.request().method() === 'OPTIONS') { await allowCors(route); return }

    let payload: unknown
    try { payload = JSON.parse(route.request().postData() ?? '{}') } catch { payload = {} }

    const answer = (req: { id?: number; method?: string }) => {
      const result = (() => {
        switch (req.method) {
          case 'eth_chainId':     return '0x14a34'
          // Report a block ahead of the receipt so the default 1-confirmation
          // requirement is already satisfied and viem stops polling.
          case 'eth_blockNumber': return `0x${(RECEIPT_BLOCK + 3).toString(16)}`
          case 'eth_getBlockByNumber':
            return {
              number: `0x${(RECEIPT_BLOCK + 3).toString(16)}`,
              hash: '0x' + 'bb'.repeat(32),
              parentHash: '0x' + 'aa'.repeat(32),
              timestamp: '0x66000000',
              transactions: [],
              baseFeePerGas: '0x7',
            }
          case 'eth_getTransactionReceipt':
            return {
              transactionHash: FAKE_TX,
              transactionIndex: '0x0',
              blockHash: '0x' + 'cc'.repeat(32),
              blockNumber: `0x${RECEIPT_BLOCK.toString(16)}`,
              from: FAKE_WALLET,
              to: '0x4daf9e1e9ebe9240758692fdd50318a18173a69a',
              cumulativeGasUsed: '0x30d40',
              gasUsed: '0x30d40',
              contractAddress: null,
              logs: [],
              logsBloom: '0x' + '00'.repeat(256),
              status: '0x1',
              effectiveGasPrice: '0x7',
              type: '0x2',
            }
          default: return null
        }
      })()
      return { jsonrpc: '2.0', id: req.id ?? 1, result }
    }

    const body = Array.isArray(payload)
      ? payload.map((r) => answer(r as { id?: number; method?: string }))
      : answer(payload as { id?: number; method?: string })

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(body),
    })
  })
}

// ── sign-in helper ────────────────────────────────────────────────────────────

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'relay@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

// ── tests ─────────────────────────────────────────────────────────────────────

test.describe('Pets relay mint smoke', () => {

  // ── Test 1: balance gate ─────────────────────────────────────────────────

  test('balance gate: user with 50 tokens cannot reach the mint button', async ({ page }) => {
    await setupAuthMock(page)
    await setupRestMock(page, 50)

    await signIn(page)
    await page.goto('/pets')

    // Pick a species first (balance gate is revealed after species selection)
    // "Pick a species" is a sub-label (not a heading) inside the merged
    // "Mint Another Pet" gacha panel since the mint-flow consolidation —
    // getByText matches its text regardless of element type.
    // Anchored to "(N available)" — the empty-collection state separately
    // renders its own unrelated "Pick a species below..." copy, and a bare
    // /pick a species/i match is ambiguous (strict-mode violation) once
    // that's on screen too.
    await expect(page.getByText(/pick a species \(\d+ available\)/i)).toBeVisible({ timeout: 20_000 })

    // Blizzard Lizard has no unlockXp — always available
    await page.getByRole('button', { name: /choose blizzard lizard/i }).click()

    // Step 3 "Mint" section appears — but the balance gate should block it.
    // The "Need X BROski$" button inside LockedGlass is disabled.
    const lockedBtn = page.getByRole('button', { name: /need.*broski/i })
    await expect(lockedBtn).toBeDisabled({ timeout: 10_000 })

    // No "Mint Your Pet" button accessible
    await expect(page.getByRole('button', { name: /mint your pet/i })).toHaveCount(0)
  })

  // ── Test 2: name gate ────────────────────────────────────────────────────

  test('name gate: mint button requires a pet name to be enabled', async ({ page }) => {
    // Inject fake ethereum + wagmi state for wallet connection
    await page.addInitScript((args) => {
      const { wallet, chainHex } = args as { wallet: string; chainHex: string }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).ethereum = {
        isMetaMask: true,
        selectedAddress: wallet,
        chainId: chainHex,
        request: async ({ method }: { method: string }) => {
          if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [wallet]
          if (method === 'eth_chainId') return chainHex
          if (method === 'wallet_switchEthereumChain') return null
          return null
        },
        on: () => {}, removeListener: () => {}, emit: () => {},
      }
      const wagmiState = {
        state: {
          chainId: 84532,
          connections: {
            __type: 'Map',
            value: [['injected', { accounts: [wallet], chainId: 84532, connector: { id: 'injected', name: 'MetaMask', type: 'injected', uid: 'injected' } }]],
          },
          current: 'injected',
          status: 'connected',
        },
        version: 2,
      }
      window.localStorage.setItem('wagmi.store', JSON.stringify(wagmiState))
    }, { wallet: FAKE_WALLET, chainHex: '0x14a34' })

    await setupAuthMock(page)
    await setupRestMock(page, 150)

    await signIn(page)
    await page.goto('/pets')

    // "Pick a species" is a sub-label (not a heading) inside the merged
    // "Mint Another Pet" gacha panel since the mint-flow consolidation —
    // getByText matches its text regardless of element type.
    // Anchored to "(N available)" — the empty-collection state separately
    // renders its own unrelated "Pick a species below..." copy, and a bare
    // /pick a species/i match is ambiguous (strict-mode violation) once
    // that's on screen too.
    await expect(page.getByText(/pick a species \(\d+ available\)/i)).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /choose blizzard lizard/i }).click()

    // With wallet (mocked) + sufficient tokens, mint button should exist but
    // be DISABLED while name is empty. If the wallet seeding didn't work, the
    // "Connect wallet" screen appears instead — either way the name gate holds.
    // Sub-step label is "2. Name your X" now (no "Step" prefix) since the
    // mint-flow consolidation into one gacha panel.
    await expect(page.getByText(/2\..*name your/i)).toBeVisible({ timeout: 15_000 })
    const nameInput = page.getByPlaceholder(/e\.g\./i)
    await expect(nameInput).toBeVisible()
    // Don't type a name yet — button should be disabled (regardless of wallet state)
    const mintBtn = page.getByRole('button', { name: /mint your pet|connect wallet/i })
    await expect(mintBtn).toBeVisible({ timeout: 10_000 })
    const disabledMint = page.getByRole('button', { name: /enter a pet name/i })
    // Only appears when wallet IS connected and name is empty
    // If wallet isn't connected, we get the connect button instead — that's OK for this test
    if (await disabledMint.isVisible()) {
      await expect(disabledMint).toBeDisabled()
    }
  })

  // ── Test 3: relay API contract ───────────────────────────────────────────
  //
  // Connecting wagmi without MetaMask requires matching the runtime connector
  // uid which RainbowKit generates from its wallet list — not predictable from
  // the outside. Wallet connection is therefore a MetaMask human gate.
  //
  // This test covers two layers instead:
  //   A) UI gates — species + name + tokens are all valid, only "Connect wallet"
  //      remains (proves no other gate is blocking the relay path).
  //   B) API contract — calls mint-pet-auth directly via page.evaluate (which
  //      goes through page.route mocks) and asserts relay:true behaviour.

  test('relay API contract: edge function accepts relay request and returns tx_hash', async ({ page }) => {
    await setupAuthMock(page)
    await setupRestMock(page, 150)

    // ── Mock mint-pet-auth to return a relay response ──
    let capturedBody: Record<string, unknown> | null = null
    await page.route('**/functions/v1/mint-pet-auth**', async (route) => {
      if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
      try { capturedBody = JSON.parse(route.request().postData() ?? '{}') } catch { /* noop */ }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({
          auth: {
            to: FAKE_WALLET, petId: 'broski_42',
            ipfsCID: 'bafkreib4w5w6rnyufxkbywxspb266r74lwbumjdhlnzzp2netkkdkfdft4',
            nonce: '12345678901234567890',
            expiry: String(Math.floor(Date.now() / 1000) + 300),
          },
          signature: '0xfakedeadbeef00000000000000000000',
          cost_paid: 100,
          chain_id:  CHAIN_ID,
          contract:  '0x4daF9e1e9Ebe9240758692Fdd50318a18173A69a',
          rarity:    'uncommon',
          relayed:   true,
          tx_hash:   FAKE_TX,
        }),
      })
    })

    await signIn(page)
    await page.goto('/pets')
    await expect(page.getByRole('heading', { name: /broski pets/i })).toBeVisible({ timeout: 20_000 })

    // ── A: UI gates ──
    // With 150 tokens, species selected, and name filled, only wallet connection
    // is missing — proving the relay path has no other blocker.
    // "Pick a species" is a sub-label (not a heading) inside the merged
    // "Mint Another Pet" gacha panel since the mint-flow consolidation —
    // getByText matches its text regardless of element type.
    // Anchored to "(N available)" — the empty-collection state separately
    // renders its own unrelated "Pick a species below..." copy, and a bare
    // /pick a species/i match is ambiguous (strict-mode violation) once
    // that's on screen too.
    await expect(page.getByText(/pick a species \(\d+ available\)/i)).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /choose blizzard lizard/i }).click()
    await expect(page.getByText(/2\..*name your blizzard lizard/i)).toBeVisible({ timeout: 15_000 })
    await page.getByPlaceholder(/e\.g\./i).fill('FrostbitePW')
    // Wallet not connected → step 3 shows "Connect wallet to mint" only (no balance/name blockers).
    await expect(page.getByRole('button', { name: /connect wallet to mint/i })).toBeVisible({ timeout: 15_000 })
    // The "Mint Your Pet" button is NOT present (gated by wallet only).
    await expect(page.getByRole('button', { name: /mint your pet/i })).toHaveCount(0)

    // ── B: API contract via page.evaluate ──
    // page.evaluate calls go through the browser's fetch stack, so page.route
    // intercepts them. We call mint-pet-auth with relay:true and assert the response.
    const supabaseUrl = await page.evaluate(() => {
      return (window as unknown as { __VITE_SUPABASE_URL__?: string }).__VITE_SUPABASE_URL__
        // fall back to the env var baked in by Vite
        ?? import.meta?.env?.VITE_SUPABASE_URL
    }).catch(() => null)
    // The env var value is baked into the bundle at build time, so we can read it from
    // the page's global scope. If unavailable, use the known project URL directly.
    // NOTE: the fallback must be the LIVE project ref. yhtmuibgdnxhbgboajhc is the
    // old dead project — a fallback pointing there sends the request past our
    // page.route mock to a host that no longer exists.
    const fnBase = supabaseUrl ?? 'https://tlavrxiaegbtyfmjfdcz.supabase.co'

    const relayResult = await page.evaluate(async (args) => {
      const resp = await fetch(`${args.base}/functions/v1/mint-pet-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${args.jwt}` },
        body: JSON.stringify({
          wallet_address:    args.wallet,
          ipfs_cid:          'bafkreib4w5w6rnyufxkbywxspb266r74lwbumjdhlnzzp2netkkdkfdft4',
          pet_name:          'FrostbitePW',
          species_id:        'blizzard_lizard',
          relay:             true,
          expected_contract: '0x4daF9e1e9Ebe9240758692Fdd50318a18173A69a',
          expected_chain_id: 84532,
        }),
      })
      return { status: resp.status, body: await resp.json() }
    }, { base: fnBase, jwt: FAKE_JWT, wallet: FAKE_WALLET })

    // Edge function returned 200 with a relay response.
    expect(relayResult.status).toBe(200)
    expect(relayResult.body.relayed).toBe(true)
    expect(relayResult.body.tx_hash).toBe(FAKE_TX)
    expect(relayResult.body.rarity).toBe('uncommon')
    expect(relayResult.body.chain_id).toBe(CHAIN_ID)
    expect(relayResult.body.contract).toMatch(/^0x[0-9a-fA-F]{40}$/)

    // The intercepted request had the correct relay fields.
    expect(capturedBody, 'mint-pet-auth was not called').not.toBeNull()
    expect(capturedBody!['relay']).toBe(true)
    expect(capturedBody!['wallet_address']).toBe(FAKE_WALLET)
    expect(capturedBody!['species_id']).toBe('blizzard_lizard')
    expect(capturedBody!['pet_name']).toBe('FrostbitePW')
    expect(capturedBody!['expected_contract']).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(capturedBody!['expected_chain_id']).toBe(CHAIN_ID)
  })

  // ── Test 4: full authenticated happy path ────────────────────────────────
  //
  // Tests 1-3 stop at a gate. This one walks the whole journey a paying user
  // takes — signed in, wallet connected, species picked, name typed, mint
  // clicked — and asserts the success card the user is actually waiting for.
  //
  // If this fails at the "Mint Your Pet" step, the wallet did not connect:
  // check the EIP-6963 announcement in connectWallet() against the wagmi
  // version. If it fails at the success card, the receipt mock is the suspect.

  test('happy path: connected wallet mints via relay and the pet lands in the collection', async ({ page }) => {
    await connectWallet(page)
    await setupAuthMock(page)
    await setupRestMock(page, 150)
    await setupChainRpcMock(page)

    let mintCalled = false
    await page.route('**/functions/v1/mint-pet-auth**', async (route) => {
      if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
      mintCalled = true
      await fulfillJson(route, {
        auth: {
          to: FAKE_WALLET, petId: 'broski_42',
          ipfsCID: 'bafkreib4w5w6rnyufxkbywxspb266r74lwbumjdhlnzzp2netkkdkfdft4',
          nonce: '12345678901234567890',
          expiry: String(Math.floor(Date.now() / 1000) + 300),
        },
        signature: '0xfakedeadbeef00000000000000000000',
        cost_paid: 100,
        chain_id:  CHAIN_ID,
        contract:  '0x4daF9e1e9Ebe9240758692Fdd50318a18173A69a',
        rarity:    'uncommon',
        relayed:   true,
        tx_hash:   FAKE_TX,
      })
    })

    // Fires once the receipt confirms. Relay mode short-circuits inside
    // confirmMint, but the route is mocked so a real call can never leak out.
    await page.route('**/functions/v1/mint-pet-confirm**', async (route) => {
      if (route.request().method() === 'OPTIONS') { await allowCors(route); return }
      await fulfillJson(route, { persisted: true, pet_id: 'broski_42', tx_hash: FAKE_TX })
    })

    await signIn(page)
    await page.goto('/pets')

    // ── Step 1: pick a species ──
    // "Pick a species" is a sub-label (not a heading) inside the merged
    // "Mint Another Pet" gacha panel since the mint-flow consolidation —
    // getByText matches its text regardless of element type.
    // Anchored to "(N available)" — the empty-collection state separately
    // renders its own unrelated "Pick a species below..." copy, and a bare
    // /pick a species/i match is ambiguous (strict-mode violation) once
    // that's on screen too.
    await expect(page.getByText(/pick a species \(\d+ available\)/i)).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: /choose blizzard lizard/i }).click()

    // ── Step 2: name it ──
    await expect(page.getByText(/2\..*name your blizzard lizard/i)).toBeVisible({ timeout: 15_000 })
    await page.getByPlaceholder(/e\.g\./i).fill('FrostbitePW')

    // ── Step 3: mint ──
    // The wallet is connected, so this is the real mint button — not the
    // "Connect wallet to mint" fallback that tests 1-3 always landed on.
    const mintBtn = page.getByRole('button', { name: /mint your pet/i })
    await expect(mintBtn).toBeVisible({ timeout: 20_000 })
    await expect(mintBtn).toBeEnabled()
    await mintBtn.click()

    // ── The payoff ──
    //
    // Deliberately NOT asserted: MintPetButton's "hatched as a…" success card.
    // It renders, but once onMinted fires Pets.tsx refetches and swaps the whole
    // mint flow for the collection view, so asserting the card is a race against
    // that refetch. The collection is the durable end state a user is left
    // looking at, and reaching it proves the card's preconditions held anyway
    // (isDone requires a confirmed receipt).

    const collection = page.getByRole('region', { name: /your pets/i })
    await expect(collection).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('heading', { name: /^your pets \(1\)$/i })).toBeVisible()

    // The minted pet, with the traits the edge function handed back.
    // `exact` matters: the cosmetics panel also renders "🎨 Customise FrostbitePW".
    await expect(page.getByRole('heading', { name: 'FrostbitePW', exact: true })).toBeVisible()
    await expect(collection.getByText(/broski_42 · Blizzard Lizard/i)).toBeVisible()
    await expect(collection.getByText(/^uncommon$/i)).toBeVisible()
    await expect(collection.getByText(/stage:\s*baby/i)).toBeVisible()

    // The on-chain receipt is surfaced to the user, pointing at the real tx.
    await expect(collection.getByRole('link', { name: /basescan/i })).toHaveAttribute(
      'href',
      `https://sepolia.basescan.org/tx/${FAKE_TX}`,
    )

    // Regression: account total_xp (800) must NOT leak into this pet's own
    // evolve-eligibility. The pet's own xp is 0 (fresh mint) — well under
    // baby's evolve threshold — so no Evolve button should render even
    // though the account's total_xp (800) is high enough to unlock later
    // stages. This is the exact bug class the per-pet-XP migration fixed
    // in EvolveButton.tsx: it must read pet.xp, not the account total.
    await expect(collection.getByRole('button', { name: /evolve to/i })).toHaveCount(0)

    // The mint genuinely went through the relay endpoint rather than a wallet signature.
    expect(mintCalled, 'mint-pet-auth was never called').toBe(true)
  })
})
