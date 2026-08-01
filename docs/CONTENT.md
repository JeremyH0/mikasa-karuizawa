# Content provenance & open questions

All copy on the site comes from `Mikasa marketing material.pdf` (4 pages).
This file records where the site **departs** from the deck, and what still
needs confirming before launch.

---

## 1. Wording corrected against the deck

Three phrases were corrected rather than reproduced verbatim. Each is a typo in
the source, and on a page selling a ¥-hundreds-of-millions asset, reproducing
them would read as carelessness.

| Deck | Site | Why |
|---|---|---|
| "One of the most Prestigious Address" | "One of the Most Prestigious Addresses" | Number agreement |
| "Land at a Glace" | "Land at a Glance" | Typo — "Glace" |
| "4 Minutes to old Ginza street" | "Four minutes to Old Ginza Street" | Old Ginza Street is a proper noun |

**If any of these were deliberate, revert them in `src/i18n/en.ts`.**

---

## 2. Terms clarified

| Deck | Site | Why |
|---|---|---|
| "Floor Area 50%" | "Floor Area Ratio — 50%" | A bare "Floor Area" of 50% is ambiguous. 50% is the 容積率 (floor area *ratio*), the standard Japanese planning term. Left as-is, an overseas buyer could read it as "half the site is floor area". |
| "Building Coverage 30%" | "Building Coverage Ratio — 30%" | Same reasoning — 建ぺい率. |
| "Category I Low-rise Residential District" | "Category I Low-rise **Exclusive** Residential District" | The statutory English rendering of 第一種低層住居専用地域 includes "Exclusive"; 専用 is the operative word and it is what constrains what can be built. |
| "Site Area: 2,926.84" | "2,926.84 m²" | The deck's table omits the unit; its site plan gives it as sqm. |

---

## 3. Content added, not in the deck

These exist on the site but have **no source in the PDF** — they are reasonable
for a property page but are **unverified and must be confirmed or deleted**.

### ⚠️ Travel times — `location.times`
The deck states only "4 Minutes to old Ginza street". These are estimates:

| Destination | Claimed | Status |
|---|---|---|
| Old Ginza Street | 4 min | ✅ from the deck |
| Karuizawa Station | 9 min | ⚠️ **estimated** |
| Tokyo Station | 70 min, Hokuriku Shinkansen | ⚠️ **estimated** |
| Haneda Airport | 2 hr 20 min | ⚠️ **estimated** |

Fix in `src/i18n/en.ts` → `location.times`.

### ⚠️ Contact address — `inquiry.email`
Set to `info@hirafucapital.com` as a placeholder. **Confirm the correct
enquiry address**, which for a private sale may not be the general company one.

### ⚠️ Geo coordinates — `StructuredData.astro`
`36.3667, 138.6` is the approximate centroid of the Mikasa district, used so
the listing can appear on a map. Deliberately **not** the surveyed parcel
corner. Adjust or remove if even district-level precision is too much for a
private offering.

### ⚠️ Site plan geometry — `SitePlan.astro`
Reconstructed from the deck's edge lengths fitted to the stated area; encloses
~2,950 m² against the stated 2,926.84 m², about 0.8% over. The deck gives edge
lengths and an area but no bearings, so no single polygon satisfies all of them
exactly. Labels carry the **real surveyed figures**; the outline is a faithful
sketch. The disclaimer shown to readers says exactly this. Replace with the
real survey CAD if it becomes available.

### Date — `StructuredData.astro`
`datePosted: '2026-08-01'`. Update on launch.

---

## 4. Domain

`astro.config.mjs` → `site` is set to `https://mikasa-karuizawa.com`, a
**placeholder**. It must match the real domain before launch, because it builds
every canonical URL and the sitemap. `public/robots.txt` carries the same value
and must be changed with it.

---

## 5. Translations

Japanese, Simplified Chinese and Traditional Chinese dictionaries are written
and complete, but **not yet natively reviewed**, and are currently **not built**
— `locales` in `src/i18n/config.ts` is set to `['en']`.

Notes for the reviewer:

- **Statutory terms must not be paraphrased.** 第一種低層住居専用地域, 建ぺい率,
  容積率, 宅地 are the legal wordings. Both Chinese files keep the Japanese
  zoning term because buyers need the exact string to search the registry.
- **zh-Hant is not a character conversion of zh-Hans.** Register and vocabulary
  differ deliberately: 平方公尺 / 車程 / 洽詢 vs 平方米 / 车程 / 咨询.
- **⚠️ `land.rows.location.value`** is a real registered address in each
  language. Confirm against the 登記簿 before launch.
- Japanese tone target: 敬体 (です・ます), restrained, no exclamation.

When the English copy is frozen: set `locales` back to `allLocales`, do one
translation pass against the final English, then get all three reviewed.
