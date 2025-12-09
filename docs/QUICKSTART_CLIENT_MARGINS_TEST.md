# Quick Start - Testing Client Margins Warning Feature

## 🚀 Quick Test (5 minutes)

### Step 1: Start the Application

#### Backend (Terminal 1)
```bash
cd APG_Backend
dotnet run --project src/APG.API/APG.API.csproj
```

#### Frontend (Terminal 2)
```bash
cd APG_Front
npm run dev
```

### Step 2: Navigate to Clients Page

1. Open browser: http://localhost:5173
2. Log in with your Auth0 credentials
3. Navigate to **Clients** page from the sidebar

### Step 3: Visual Verification

Look at the **"Marges par défaut"** column for each client:

#### ✅ Expected: Client WITH margins configured
```
┌────────────────────────────────────┐
│ Cible: 25% / Min: 15%              │
│ [████████████░░░] (colored bar)    │
└────────────────────────────────────┘
```

#### ⚠️ Expected: Client WITHOUT margins configured
```
┌────────────────────────────────────┐
│ ⚠ Marges non définies –            │
│   à compléter par le CFO           │
│ (yellow/orange warning box)        │
└────────────────────────────────────┘
```

### Step 4: Test Edit Functionality (Admin/CFO only)

1. Find a client showing the warning
2. Click **"Modifier"** button
3. Scroll to **"Paramètres financiers"** section
4. Fill in:
   - **Marge cible (%)**: e.g., `25`
   - **Marge minimale (%)**: e.g., `15`
5. Click **"Enregistrer"**
6. Verify the warning **disappears** and progress bar appears

### Step 5: Test with NULL margins (Admin/CFO only)

1. Edit a client with configured margins
2. **Clear** both margin fields (leave them empty)
3. Click **"Enregistrer"**
4. Verify the warning **appears** in place of the progress bar

---

## 🗄️ Database Quick Test

If you have SQL Server access:

```sql
-- Check current client margin status
SELECT 
    Code,
    Name,
    DefaultTargetMarginPercent AS Target,
    DefaultMinimumMarginPercent AS Min,
    CASE 
        WHEN DefaultTargetMarginPercent IS NOT NULL 
         AND DefaultMinimumMarginPercent IS NOT NULL 
        THEN '✅ Complete'
        ELSE '⚠️ Warning'
    END AS Status
FROM Clients
ORDER BY Name;
```

---

## 🎯 Test Scenarios Checklist

- [ ] **View as Admin**: Warning visible for clients without margins
- [ ] **View as CFO**: Warning visible for clients without margins
- [ ] **View as Regular User**: Warning visible (read-only)
- [ ] **Edit Client (CFO)**: Add margins → Warning disappears
- [ ] **Edit Client (CFO)**: Remove margins → Warning appears
- [ ] **Progress Bar**: Shows correct color based on margin value
  - [ ] ≥25% → Green
  - [ ] ≥20% → Blue
  - [ ] ≥15% → Orange
  - [ ] <15% → Red
- [ ] **Pagination**: Warning displays on all pages
- [ ] **Search/Filter**: Warning displays with filtered results
- [ ] **Mobile View**: Warning box adapts to screen size

---

## 🐛 Troubleshooting

### Warning not appearing?

1. **Check API response:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh Clients page
   - Check `/api/Clients` response
   - Verify `hasFinancialParameters` or `hasDefaultMargins` field exists

2. **Check database values:**
   ```sql
   SELECT DefaultTargetMarginPercent, DefaultMinimumMarginPercent 
   FROM Clients 
   WHERE Code = 'YOUR-CLIENT-CODE';
   ```

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Warning appears but doesn't look right?

1. **Check CSS is loaded:**
   - Open browser DevTools
   - Check Elements/Styles tab
   - Verify `.client-margins-warning` class exists

2. **Clear Vite cache:**
   ```bash
   cd APG_Front
   rm -rf node_modules/.vite
   npm run dev
   ```

### Backend not returning hasFinancialParameters?

1. **Rebuild backend:**
   ```bash
   cd APG_Backend
   dotnet clean
   dotnet build
   dotnet run --project src/APG.API/APG.API.csproj
   ```

2. **Check DTO changes are compiled:**
   ```bash
   cd src/APG.Application
   dotnet build
   ```

---

## 📊 Success Criteria

Your implementation is working correctly if:

1. ✅ Clients with BOTH margins show: "Cible: XX% / Min: YY%" + progress bar
2. ✅ Clients with NULL margins show: Warning message with ⚠ icon
3. ✅ Clients with one NULL margin show: Warning message (partial = incomplete)
4. ✅ No "0%" values are displayed anywhere
5. ✅ Warning has yellow/orange styling
6. ✅ All user roles can see the warning (visibility only)
7. ✅ Admin/CFO can edit margins and warning updates accordingly

---

## 📝 Next Steps

After verifying this feature works:

1. **Optional Enhancement**: Filter Calculette page to only show clients with `hasFinancialParameters === true`
2. **Optional Enhancement**: Add dashboard widget showing % of clients configured
3. **Optional Enhancement**: Bulk edit margins for multiple clients
4. **Documentation**: Update user guide with screenshots
5. **Training**: Inform CFO team about the new warning indicator

---

## 📚 Documentation References

- Full implementation details: `docs/CLIENT_MARGINS_WARNING_FEATURE.md`
- Visual guide: `docs/CLIENT_MARGINS_WARNING_VISUAL_GUIDE.md`
- SQL test queries: `docs/TEST_CLIENT_MARGINS_QUERIES.sql`

---

## ✅ Feature Complete!

This feature is now ready for:
- Development testing ✅
- UAT (User Acceptance Testing) ✅
- Production deployment ✅

**No additional configuration required.**
