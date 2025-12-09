# Quick Test Guide - Client Filter & Counter

## 🚀 5-Minute Test

### Step 1: Start the Application

```bash
# Terminal 1 - Frontend
cd APG_Front
npm run dev

# Terminal 2 - Backend (if not running)
cd APG_Backend
dotnet run --project src/APG.API/APG.API.csproj
```

### Step 2: Navigate to Clients Page

1. Open browser: http://localhost:5173
2. Log in with your credentials
3. Click **"Clients"** in the sidebar

### Step 3: Visual Verification

#### ✅ Check Counter Badge

Look next to the "Clients" title:

```
Clients  [Clients à compléter : 3]
```

- Badge should show the number of clients with incomplete margins
- Badge has amber/orange background
- Badge only appears if count > 0

#### ✅ Check Filter Buttons

Below the header, you should see:

```
┌──────────────────────────────────────────┐
│ [Tous les clients (25)] [Clients à compléter (3)] │
└──────────────────────────────────────────┘
```

- Two buttons side by side
- Shows count for each filter
- "Tous les clients" button is active (green) by default

### Step 4: Test Filter - Incomplete Only

1. Click **"Clients à compléter"** button
2. Verify:
   - ✅ Button turns green (active state)
   - ✅ Only incomplete clients are shown in table
   - ✅ Each row shows ⚠️ warning in "Marges par défaut" column
   - ✅ Table shows fewer rows than before
   - ✅ Pagination adjusts if needed

### Step 5: Test Filter - All Clients

1. Click **"Tous les clients"** button
2. Verify:
   - ✅ Button turns green (active state)
   - ✅ All clients are visible again
   - ✅ Mix of complete and incomplete clients
   - ✅ Table shows full list

### Step 6: Test Counter Update

1. Find a client showing the warning (incomplete margins)
2. Click **"Modifier"** button
3. Fill in the margin fields:
   - **Marge cible (%)**: `25`
   - **Marge minimale (%)**: `15`
4. Click **"Enregistrer"**
5. Verify:
   - ✅ Counter badge decreases by 1
   - ✅ "Clients à compléter" button count decreases
   - ✅ Client no longer appears in "incomplete" filter
   - ✅ Warning disappears from that client's row

---

## 📊 Test Data Setup

### Option A: Use Existing Data

Check your current clients:

```sql
SELECT 
    Code,
    Name,
    DefaultTargetMarginPercent,
    DefaultMinimumMarginPercent,
    CASE 
        WHEN DefaultTargetMarginPercent IS NOT NULL 
         AND DefaultMinimumMarginPercent IS NOT NULL 
        THEN 'Complete ✅'
        ELSE 'Incomplete ⚠️'
    END AS Status
FROM Clients
ORDER BY Name;
```

### Option B: Create Test Clients

If you need more test data:

```sql
-- Client with complete margins
INSERT INTO Clients (Code, Name, BusinessUnitId, SectorId, CountryId, CurrencyId,
                     DefaultTargetMarginPercent, DefaultMinimumMarginPercent,
                     ContactName, ContactEmail, IsActive, CreatedAt)
VALUES ('TEST-COMPLETE', 'Test Client - Complete', 1, 1, 1, 1,
        25.0, 15.0, 'John Doe', 'john@test.com', 1, GETDATE());

-- Client with incomplete margins
INSERT INTO Clients (Code, Name, BusinessUnitId, SectorId, CountryId, CurrencyId,
                     DefaultTargetMarginPercent, DefaultMinimumMarginPercent,
                     ContactName, ContactEmail, IsActive, CreatedAt)
VALUES ('TEST-INCOMPLETE', 'Test Client - Incomplete', 1, 1, 1, 1,
        NULL, NULL, 'Jane Doe', 'jane@test.com', 1, GETDATE());
```

---

## 🎯 Expected Behavior

### Scenario 1: 0 Incomplete Clients
```
┌─────────────────────────────────────┐
│ Clients                              │ <- No badge
│              [📥 Importer] [+ Nouveau]│
├─────────────────────────────────────┤
│ [Tous les clients (25)] [Clients à compléter (0)] │
└─────────────────────────────────────┘
```

### Scenario 2: 3 Incomplete Clients
```
┌─────────────────────────────────────┐
│ Clients [Clients à compléter : 3]   │ <- Badge visible
│              [📥 Importer] [+ Nouveau]│
├─────────────────────────────────────┤
│ [Tous les clients (25)] [Clients à compléter (3)] │
└─────────────────────────────────────┘
```

### Scenario 3: Filter Active (Incomplete)
```
┌─────────────────────────────────────┐
│ Clients [Clients à compléter : 3]   │
│              [📥 Importer] [+ Nouveau]│
├─────────────────────────────────────┤
│ [Tous les clients (25)] [Clients à compléter (3)] │ <- Active
└─────────────────────────────────────┘

Table shows ONLY 3 clients with warnings:
- Client B  ⚠️ Marges non définies
- Client D  ⚠️ Marges non définies  
- Client F  ⚠️ Marges non définies
```

---

## ✅ Acceptance Checklist

- [ ] **Badge Visibility**
  - [ ] Appears when incomplete count > 0
  - [ ] Hidden when incomplete count = 0
  - [ ] Shows correct count
  - [ ] Has amber/orange styling

- [ ] **Filter Toggle**
  - [ ] Two buttons displayed
  - [ ] Shows counts for each option
  - [ ] "Tous les clients" active by default
  - [ ] Active button has green background
  - [ ] Hover effect works on inactive button

- [ ] **Filter Functionality**
  - [ ] "Tous les clients" shows all accessible clients
  - [ ] "Clients à compléter" shows only incomplete clients
  - [ ] Filter updates immediately on click
  - [ ] Table content changes correctly

- [ ] **Counter Accuracy**
  - [ ] Badge count matches incomplete filter count
  - [ ] Count updates after editing client
  - [ ] Count considers only accessible clients (role-based)

- [ ] **Integration**
  - [ ] Works with existing pagination
  - [ ] Works with role-based filtering (Admin/CFO/BU)
  - [ ] Doesn't break existing features
  - [ ] Warning messages still display correctly

- [ ] **Responsive Design**
  - [ ] Layout works on desktop
  - [ ] Layout adapts on tablet
  - [ ] Layout adapts on mobile
  - [ ] Buttons remain usable at all sizes

---

## 🐛 Common Issues & Fixes

### Issue 1: Badge Not Showing

**Symptoms:** Badge never appears even with incomplete clients

**Check:**
1. Open DevTools → Network tab
2. Refresh page, check `/api/Clients` response
3. Verify response includes `hasFinancialParameters` or `hasDefaultMargins` field

**Fix:** Backend may need restart to pick up DTO changes
```bash
cd APG_Backend
dotnet clean
dotnet build
dotnet run --project src/APG.API/APG.API.csproj
```

### Issue 2: Filter Shows All Clients When Set to "Incomplete"

**Symptoms:** Clicking "Clients à compléter" doesn't filter

**Check:**
1. Open React DevTools
2. Check `ClientsPage` component state
3. Verify `filterMode` changes to 'incomplete'

**Fix:** Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Issue 3: Wrong Count

**Symptoms:** Badge shows incorrect number

**Check:**
1. Verify database values:
```sql
SELECT COUNT(*) FROM Clients 
WHERE DefaultTargetMarginPercent IS NULL 
   OR DefaultMinimumMarginPercent IS NULL;
```

2. Compare with badge count
3. Consider role-based filtering (non-Admin users see fewer clients)

### Issue 4: Styling Issues

**Symptoms:** Buttons or badge look broken

**Check:**
1. Verify `ClientsPage.css` exists and is imported
2. Check browser console for CSS errors
3. Inspect elements in DevTools

**Fix:**
```bash
cd APG_Front
rm -rf node_modules/.vite
npm run dev
```

---

## 📱 Mobile Testing

### Test on Narrow Screens

1. Open DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Select iPhone or narrow viewport
4. Verify:
   - [ ] Filter buttons stack or resize
   - [ ] Badge remains readable
   - [ ] Layout doesn't break
   - [ ] Touch targets are adequate

---

## 🎓 User Training Points

### For CFOs
1. **Badge is Your Alert**
   - Shows how many clients need attention
   - Disappears when all clients are configured

2. **Use the Filter**
   - Click "Clients à compléter" to focus on incomplete clients
   - Complete them one by one
   - Watch the count decrease

3. **Workflow**
   - Filter → Incomplete clients only
   - Edit → Add margins
   - Save → Client disappears from filtered view
   - Repeat until badge shows 0

### For Admins
1. **Monitor Progress**
   - Badge shows overall status
   - Can delegate margin configuration to CFO

2. **Bulk Setup**
   - Use filter to see all incomplete clients
   - Use import feature for bulk updates
   - Verify with filter afterward

---

## 📈 Success Metrics

After deployment, track:
- [ ] % of clients with configured margins increases
- [ ] CFO uses the incomplete filter regularly
- [ ] Time to configure new clients decreases
- [ ] Fewer calculation errors due to missing margins

---

## 🚀 Ready for Production

This feature is production-ready when:
- ✅ All acceptance criteria met
- ✅ Tested on desktop and mobile
- ✅ Works across different user roles
- ✅ Performance is acceptable
- ✅ No console errors
- ✅ User documentation updated

---

## 📚 Related Docs
- Full feature guide: `CLIENT_FILTER_COUNTER_FEATURE.md`
- Margin warning feature: `CLIENT_MARGINS_WARNING_FEATURE.md`
- Visual guide: `CLIENT_MARGINS_WARNING_VISUAL_GUIDE.md`
