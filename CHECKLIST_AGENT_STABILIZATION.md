# LeadWeb AI Stabilization Checklist

## Phase 1 - Stabilize Existing App (no redesign)

- [x] `npm run build` passes
- [x] Dashboard major buttons connected (view leads, demo links, copy/send message)
- [x] Demos page switched from static summary to real Supabase listing
- [x] Settings danger-zone cleanup button for test data
- [ ] Full button audit across all pages (remaining low-priority buttons)
- [ ] Create/Edit lead UX hardening (forms + validation + success/error feedback)
- [ ] Final i18n pass in leads/campaigns/settings dynamic strings

## Phase 2 - Agent API Layer

- [x] Create `src/lib/agent/types.ts`
- [x] Create `src/lib/agent/schemas.ts`
- [x] Create `src/lib/agent/client.ts` with mock fallback when `OPENAI_AGENT_ID` missing
- [x] Add routes:
  - [x] `POST /api/agent/analyze-business`
  - [x] `POST /api/agent/generate-website`
  - [x] `POST /api/agent/regenerate-website`
  - [x] `POST /api/agent/generate-message`
  - [x] `POST /api/agent/next-action`
- [ ] Wire all primary frontend buttons to `/api/agent/*` endpoints

## Phase 3 - Internal Tool Functions (Supabase)

- [x] Create `src/lib/tools/lead-tools.ts`
  - [x] `getLeadById`
  - [x] `updateLeadAnalysis`
  - [x] `createGeneratedWebsite`
  - [x] `updateGeneratedWebsite`
  - [x] `createSalesMessage`
  - [x] `createActivity`
  - [x] `getLatestGeneratedWebsiteForLead`

## Phase 4 - Website Generation Robustness

- [x] Strengthen regenerate flow fallback to avoid hard failures
- [x] Improve crawl fallback messages and extraction
- [x] Add restaurant subtype style variations in generator
- [ ] Add explicit normalize layer (`normalize-generated-website.ts`) with strict defaults
- [ ] Add GenericSectionBlock fallback for unknown section types in renderer path requested

## Phase 5 - End-to-End Priority Paths

- [ ] Create lead
- [ ] Analyze with IA (`/api/agent/analyze-business`)
- [ ] Generate personalized website (`/api/agent/generate-website`)
- [ ] Verify demo slug opens at `/demo/[slug]`
- [ ] Generate message (`/api/agent/generate-message`)
- [ ] Regenerate style/copy (`/api/agent/regenerate-website`)
- [ ] Approve demo + activity logging
- [ ] Update lead status transitions

## Validation

- [ ] `npm run build`
- [ ] Manual smoke test in UI for all priority buttons
- [ ] Deploy to Vercel and verify production behavior
