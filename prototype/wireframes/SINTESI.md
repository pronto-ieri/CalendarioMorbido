# CalendarioMorbido — First Wireframe Exploration Summary

> Calendar web app for **non-competitive cyclo-tourism events** in Italy.
> Output of this phase: **mobile-first, low-fi** wireframes in Italian, sporty/energetic vibe.
> 6 screens × 2 variants, side by side on canvas for comparison.

---

## 1. Shared Input and Direction

Decisions from the initial interview, used as project constraints:

| Topic | Choice |
| --- | --- |
| **Device** | Mobile-first (on-the-go browsing) |
| **Screens in scope** | All: public calendar, map, event detail, personal calendar, propose event, manager area |
| **Calendar view** | Classic monthly grid + scrollable card list below |
| **Filters** | Expandable component suited to mobile (single-day / multi-day, region) |
| **Map** | Secondary alternative view — list/map toggle |
| **Variants** | 2 per screen, side by side |
| **Audience** | Broad mix of cycling enthusiasts |
| **Fidelity** | Clean but low-fi wireframes |
| **Tone** | Sporty and energetic |
| **Language** | Italian |

**Visual system adopted:** black/white on warm paper + one hi-vis accent (cycling green, adjustable), legible handwritten font (Patrick Hand / Caveat), line-art icons, dashed placeholders for images. Look and tone are adjustable via the **Tweaks** panel (accent colour, handwritten/readable text, paper tone).

### Role Model

- **Guest / user** → browse the public calendar, filters and map.
- **Registered user** → save events to personal calendar and propose events to the manager.
- **Manager** → review and approve/reject proposals.

---

## 2. Screens and Variant Comparison

Two directions were explored for each screen. Below: what differs and when to prefer each.

### 2.1 Public Calendar

Monthly grid + card list; core tension = how to handle filters on mobile.

| | **Variant A — Grid + chip filters** | **Variant B — Open filter panel + feed** |
| --- | --- | --- |
| Filters | Quick inline chips + "Filters" button (**collapsed** state) | Expandable panel **open** with Duration and Region |
| Calendar | Full monthly grid | Compact monthly grid |
| List | Compact cards (row: date, mini-cover, location, tag) | Feed with **large covers** per event |
| View toggle | Inline List/Map segmented control | — |
| **When** | Maximum density, scroll through many events quickly | Filtered exploration, more visual and editorial |

### 2.2 Map View

Activated from the list/map toggle; secondary role but present throughout.

| | **Variant A — Full map + bottom sheet** | **Variant B — Map + list below** |
| --- | --- | --- |
| Layout | Full-screen map with numbered pins | Half-screen map + compact list |
| Detail | "Peek" bottom sheet with scrollable single card | Scrollable list synced with pins |
| Filters | Search + floating chips above the map | Chips on the map, filtered list below |
| **When** | Immersive geographical exploration | Bridge between map and list, less modal |

### 2.3 Event Detail

All required data: start/end dates, start→end location, official website link, cover image.

| | **Variant A — Immersive hero** | **Variant B — Structured card** |
| --- | --- | --- |
| Cover | Full-bleed at the top | Contained cover + data card |
| Data | Icon+value rows (when, route, duration) | Ordered key/value table |
| Extra | Description + official link | **Route mini-map** A→B + link |
| CTA | Sticky "Add to my calendar" at the bottom | Sticky CTA at the bottom |
| **When** | Visual impact, "cover-worthy" event | Fast, scannable data reading |

### 2.4 Personal Calendar (members area)

Events saved by the user; linked to the status of submitted proposals.

| | **Variant A — Saved agenda** | **Variant B — Grid + My Proposals** |
| --- | --- | --- |
| Focus | "Next event" card highlighted + saved list | Personal grid + **Saved / My Proposals tab** |
| Proposal status | — | **Pending / Approved / Under review** badge |
| Navigation | Chronological list of saved events | Toggle between followed events and submitted proposals |
| **When** | "What do I have coming up" | 360° view including the user's contributions |

### 2.5 Propose an Event

Submitting a proposal to the public calendar manager (with review notice).

| | **Variant A — Single form** | **Variant B — Step wizard** |
| --- | --- | --- |
| Structure | All fields in a single scrollable screen | 3 steps: Basic Info · Location · Media |
| Fields | Cover, name, dates, duration, start/end, region, link, description | Few fields per step, with a progress bar |
| Cognitive load | Higher but everything visible at once | Lower, guided experience |
| **When** | Experienced users, fast completion | Gentle onboarding, fewer drop-offs |

### 2.6 Manager Area — Proposals to Approve

Queue of proposals to review.

| | **Variant A — Queue with inline actions** | **Variant B — Single review** |
| --- | --- | --- |
| Layout | List of cards with **Approve / Reject** inline | One proposal full-screen (1 of N) |
| Status filters | Segmented Pending / Approved / Rejected | Queue progress bar |
| Detail | Summary for fast scanning | Full detail: data, author, link, "Edit before publishing" |
| **When** | Process many requests quickly | Careful case-by-case evaluation |

---

## 3. Open Questions / Next Steps

- Choose the preferred variant **for each screen** (mixing between the two is also valid).
- Decide whether the map remains secondary or becomes more central.
- Define mandatory vs optional fields in the proposal form.
- Registration/login status (not yet wireframed): how users access the members area.
- Increase fidelity on the winning choices **or** turn them into a clickable prototype.
