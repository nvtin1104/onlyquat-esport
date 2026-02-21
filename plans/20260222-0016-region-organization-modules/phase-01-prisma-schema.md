# Phase 01 — Prisma Schema Update

**Context:** [plan.md](./plan.md)
**Dependencies:** None (first phase)
**Docs:** `serve/libs/common/prisma/schema.prisma`, `serve/prisma.config.ts`

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-22 |
| Priority | Critical |
| Status | ⬜ Pending |

Complete the incomplete schema: add `Region` model, fix `Organization` with proper FK relations, and add optional back-refs on `Team`, `Tournament`, `Match`, and `User`.

---

## Key Insights

- Schema already has `OrganizationType` enum and an incomplete `Organization` model (no `description`, no `ownerId`/`managerId` FK refs, no `Region` model)
- `Organization.ownerId` and `managerId` must relate to `User` — requires named relations to avoid Prisma ambiguous-relation error since `User` already has `organizedTournaments` and `refereedMatches`
- `Tournament.organizerId → User` already exists; add optional `organizationId → Organization` with named relation `"OrgTournaments"`
- `Match` needs optional `sponsorId → Organization` with named relation `"OrgSponsoredMatches"`
- `mediaLinks` stored as `Json` (array of `{url, description, regionId?}`) — no separate join table needed; keeps it simple
- `Team.region` is currently a raw `String?` — replace with optional FK `regionId → Region`; keep `String? region` field **renamed** to avoid breakage, or just add `regionId`/`region` relation alongside (preferred: add new FK, leave string field as deprecated or remove)

---

## Requirements

1. Add `Region` model with `id`, `name`, `code`, `logo`, timestamps, back-refs to `Team[]` and `Organization[]`
2. Fix `Organization` model:
   - Add `description String?`
   - Add `mediaLinks Json @default("[]")`
   - Add `ownerId String` + `owner User @relation("OrgOwner", ...)`
   - Add `managerId String?` + `manager User? @relation("OrgManager", ...)`
   - Add `regionId String?` + `region Region? @relation(...)`
   - Keep existing: `name`, `shortName`, `logo`, `website`, `roles OrganizationType[]`
   - Keep relations: `teams Team[]`, `tournaments Tournament[] @relation("OrgTournaments")`, `sponsoredMatches Match[] @relation("OrgSponsoredMatches")`
3. Update `User` model — add back-relations:
   - `ownedOrganizations Organization[] @relation("OrgOwner")`
   - `managedOrganizations Organization[] @relation("OrgManager")`
4. Update `Team` model — add:
   - `organizationId String?`
   - `organization Organization? @relation(...)`
   - `regionId String?`
   - `region Region? @relation(...)`
5. Update `Tournament` model — add:
   - `organizationId String?`
   - `organization Organization? @relation("OrgTournaments", ...)`
6. Update `Match` model — add:
   - `sponsorId String?`
   - `sponsor Organization? @relation("OrgSponsoredMatches", ...)`
7. Run migration: `pnpm run prisma:migrate` with name `add_region_organization`
8. Regenerate client: `pnpm run prisma:generate`

---

## Architecture

### Complete Final Schema Additions

```prisma
// NEW — add before Organization model
model Region {
  id        String   @id @default(uuid())
  name      String   @unique
  code      String   @unique
  logo      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teams         Team[]
  organizations Organization[]

  @@map("regions")
}

// REPLACE existing skeleton Organization with:
model Organization {
  id          String             @id @default(uuid())
  name        String             @unique
  shortName   String?
  logo        String?
  website     String?
  description String?
  mediaLinks  Json               @default("[]")
  roles       OrganizationType[]

  ownerId   String
  owner     User    @relation("OrgOwner", fields: [ownerId], references: [id])
  managerId String?
  manager   User?   @relation("OrgManager", fields: [managerId], references: [id])

  regionId String?
  region   Region? @relation(fields: [regionId], references: [id])

  teams            Team[]
  tournaments      Tournament[] @relation("OrgTournaments")
  sponsoredMatches Match[]      @relation("OrgSponsoredMatches")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([regionId])
  @@map("organizations")
}
```

### Diffs on Existing Models

**User** — append inside model:
```prisma
ownedOrganizations   Organization[] @relation("OrgOwner")
managedOrganizations Organization[] @relation("OrgManager")
```

**Team** — append:
```prisma
organizationId String?
organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
regionId       String?
region         Region?       @relation(fields: [regionId], references: [id], onDelete: SetNull)
```
> Also add `@@index([organizationId])` and `@@index([regionId])` to Team.

**Tournament** — append:
```prisma
organizationId String?
organization   Organization? @relation("OrgTournaments", fields: [organizationId], references: [id], onDelete: SetNull)
```

**Match** — append:
```prisma
sponsorId String?
sponsor   Organization? @relation("OrgSponsoredMatches", fields: [sponsorId], references: [id], onDelete: SetNull)
```

---

## Related Code Files

- `serve/libs/common/prisma/schema.prisma` — **modify**
- `serve/prisma.config.ts` — read only, no change needed
- `serve/libs/common/src/index.ts` — will need `Region`, `Organization` exports after generate (Phase 02)

---

## Implementation Steps

1. Open `schema.prisma`
2. Add `Region` model in the `// ─── Information System ───` section (before `Organization`)
3. Replace the incomplete `Organization` model skeleton with the complete version
4. Append back-relations to `User` model
5. Append FK fields + relations to `Team`, `Tournament`, `Match`
6. Run: `cd serve && pnpm run prisma:migrate` → name migration `add_region_organization`
7. Run: `pnpm run prisma:generate` to update the client

---

## Todo

- [ ] Add `Region` model to schema
- [ ] Fix `Organization` model (description, mediaLinks, owner/manager FKs, regionId)
- [ ] Add `User` back-relations (OrgOwner, OrgManager)
- [ ] Add `organizationId`/`regionId` to `Team`
- [ ] Add `organizationId` to `Tournament`
- [ ] Add `sponsorId` to `Match`
- [ ] Run `prisma:migrate` → `add_region_organization`
- [ ] Run `prisma:generate`

---

## Success Criteria

- `pnpm run prisma:migrate` succeeds with no errors
- `pnpm run prisma:generate` completes without type errors
- `prisma.organization.findMany()` and `prisma.region.findMany()` compile

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Ambiguous Prisma relation on User | Medium | High | Use named relations `"OrgOwner"`, `"OrgManager"` |
| `Team.region` String field conflicts with new FK | Low | Medium | Add `regionId`/`region` FK; remove or keep old `region String?` field if it exists (it does — rename existing field or drop) |
| Migration conflicts with existing data | Low | Low | All new fields are optional (`?`) — safe additive migration |

> **Note on `Team.region String?`:** The existing schema has `region String?` on Team. The new `region` relation would conflict with this field name. **Solution:** Rename the existing string field to `regionName String?` (or remove it) and add the new `regionId`/`region` relation.

---

## Security Considerations

- `ownerId` is required (non-null) — Organization must always have an owner, preventing orphaned orgs
- `managerId` optional — can be unset
- All new relation fields use `onDelete: SetNull` to avoid cascade deletes of business data

---

## Next Steps

→ Phase 02: Permissions & Common Library
