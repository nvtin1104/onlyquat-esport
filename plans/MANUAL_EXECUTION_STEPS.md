# Manual Execution Steps for Permission Flow Refactor

**Created**: 2026-02-21  
**Status**: Ready to Execute

## ⚠️ Important Notes
- PowerShell 6+ is required for these commands
- Make sure Docker containers are running (PostgreSQL, NATS, Redis)
- Back up your database before running migrations
- Review all changes before executing

---

## Step 1: Install PowerShell 6+ (If Not Installed)

Download and install from: https://aka.ms/powershell

Or use winget:
```powershell
winget install --id Microsoft.Powershell --source winget
```

---

## Step 2: Generate Prisma Client

```powershell
cd C:\project\onlyquat-esport\serve
pnpm run prisma:generate
```

**Expected output**: Prisma Client generated successfully

---

## Step 3: Create Migration

```powershell
cd C:\project\onlyquat-esport\serve
pnpm run prisma:migrate
```

**When prompted for migration name**, enter:
```
permission_flow_refactor
```

**Expected**: Migration file created in `libs/common/prisma/migrations/`

---

## Step 4: Review Migration (IMPORTANT)

Before applying, check the generated migration file in:
```
serve\libs\common\prisma\migrations\<timestamp>_permission_flow_refactor\migration.sql
```

**The migration should:**
- Drop tables: `user_permission_items`, `role_permissions`, `permissions`
- Create tables: `group_permissions`, `user_group_permissions`
- Alter table: `user_permissions` (add `additionalPermissions` column)

**⚠️ WARNING**: This migration will DROP existing permission data!  
Make sure you have a backup or are prepared to lose this data.

---

## Step 5: Apply Migration (After Review)

If migration SQL looks correct:
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run prisma:migrate
```

---

## Step 6: Run Modified Seed (After All Code Changes)

**Do NOT run this yet** - wait until all code changes are complete.

```powershell
cd C:\project\onlyquat-esport\serve
pnpm run prisma:seed
```

---

## Step 7: Verify Database Schema

Check that new tables exist:
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run prisma:studio
```

**Expected tables:**
- `group_permissions`
- `user_permissions` (with new columns)
- `user_group_permissions`

**Dropped tables:**
- `permissions` (should be gone)
- `role_permissions` (should be gone)
- `user_permission_items` (should be gone)

---

## Step 8: Test Application Startup

```powershell
cd C:\project\onlyquat-esport\serve
pnpm run start:dev:gateway
```

**In separate terminals:**
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run start:dev:core
```

```powershell
cd C:\project\onlyquat-esport\serve
pnpm run start:dev:esports
```

**Or start all together:**
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run start:all
```

---

## Step 9: Test Permission System

### Test ROOT user bypass:
```bash
# Login as ROOT user
# Try accessing any protected endpoint
# Should succeed regardless of permissions
```

### Test Group Permissions:
```bash
# Login as ADMIN user
# Check JWT token includes correct permissions
# Try accessing protected endpoints
```

### Test Account Type Validation:
```bash
# Try to assign ROOT role to accountType=1 user
# Should fail with validation error
```

---

## Troubleshooting

### Issue: "Table does not exist" errors
**Solution**: Run `pnpm run prisma:generate` again

### Issue: Migration conflicts
**Solution**: 
```powershell
cd C:\project\onlyquat-esport\serve
pnpm run prisma:migrate resolve --applied <migration_name>
```

### Issue: Seed data fails
**Solution**: Check that all code changes are complete first

### Issue: TypeScript errors after migration
**Solution**: 
1. Restart TypeScript server in IDE
2. Run `pnpm install` to refresh types
3. Check that `@app/common` exports are correct

---

## Rollback Plan (If Needed)

If something goes wrong:

1. **Stop all services**
2. **Restore database from backup** (if you made one)
3. **Or reset database completely:**
   ```powershell
   cd C:\project\onlyquat-esport\serve
   pnpm run prisma:migrate reset
   ```
4. **Revert code changes** using git:
   ```powershell
   git checkout HEAD -- serve/libs/common/prisma/schema.prisma
   git checkout HEAD -- serve/libs/common/src/constants/permissions.ts
   git checkout HEAD -- serve/libs/common/src/index.ts
   ```
5. **Regenerate Prisma client:**
   ```powershell
   pnpm run prisma:generate
   ```

---

## Next Steps After Manual Execution

Once Steps 1-5 are complete successfully:
1. ✅ Continue with remaining code changes (PermissionsService, Guards, etc.)
2. ✅ Create new seed files
3. ✅ Test thoroughly
4. ✅ Update documentation

---

## Status Checklist

- [ ] PowerShell 6+ installed
- [ ] Prisma client generated
- [ ] Migration created
- [ ] Migration reviewed (SQL checked)
- [ ] Migration applied
- [ ] Database schema verified
- [ ] Application starts without errors
- [ ] Ready for next phase of code changes
