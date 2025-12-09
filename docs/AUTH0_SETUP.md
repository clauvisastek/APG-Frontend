# Auth0 Configuration - Session Persistence

## ✅ Changes Implemented

### 1. Auth0Provider Configuration (`main.tsx`)
Added critical settings to maintain session across page refreshes:
- `cacheLocation="localstorage"` - Stores authentication state in browser localStorage
- `useRefreshTokens={true}` - Enables refresh token rotation for seamless re-authentication

### 2. ProtectedRoute Component
Created new `ProtectedRoute.tsx` component with improved logic:
- Properly handles `isLoading` state before checking authentication
- Redirects to Auth0 login only when user is not authenticated
- Preserves return URL using `appState.returnTo`
- Shows appropriate loading messages during authentication checks

### 3. RequireRole Component
Enhanced existing `RequireRole.tsx` with same improvements:
- Better loading state management
- Preserves return URL for role-protected pages
- Consistent user experience with ProtectedRoute

### 4. Router Updates (`App.tsx`)
- Replaced `RequireAuth` with new `ProtectedRoute` component
- All private routes now properly persist sessions after refresh

## 🎯 How It Works

### Before (Problem):
1. User logs in successfully
2. User refreshes page (F5)
3. Session was lost → redirected to Auth0 login again ❌

### After (Solution):
1. User logs in successfully
2. Auth0 stores session in localStorage with refresh tokens
3. User refreshes page (F5)
4. Auth0 automatically restores session from cache ✅
5. User stays logged in without re-authentication

## 🔒 Logout Behavior

The logout functionality remains unchanged and works correctly:
```tsx
logout({
  logoutParams: {
    returnTo: window.location.origin,
  },
});
```

When user clicks "Logout":
- Session is cleared from Auth0 and localStorage
- User is redirected to Auth0 logout endpoint
- Returns to app homepage (unauthenticated)
- Next visit requires fresh login ✅

## 🔑 Environment Variables Required

Make sure these are set in your `.env` file:
```
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

Optional (if using Auth0 API):
```
VITE_AUTH0_AUDIENCE=https://your-api-identifier
```

## 📋 Auth0 Dashboard Settings

Ensure these are configured in your Auth0 Application:
1. **Allowed Callback URLs**: `http://localhost:5173, https://your-production-url.com`
2. **Allowed Logout URLs**: `http://localhost:5173, https://your-production-url.com`
3. **Allowed Web Origins**: `http://localhost:5173, https://your-production-url.com`
4. **Refresh Token Rotation**: Enabled (recommended)
5. **Refresh Token Expiration**: Absolute expiration (e.g., 30 days)

## 🧪 Testing

1. **Login Flow**:
   - Visit any protected route (e.g., `/projects`)
   - Should redirect to Auth0 login
   - After login, should return to requested page

2. **Session Persistence**:
   - Login successfully
   - Refresh page (F5) multiple times
   - Should stay logged in ✅

3. **Logout Flow**:
   - Click "Se déconnecter" button
   - Should logout and return to homepage
   - Visiting protected route should redirect to login

4. **Token Expiration**:
   - After refresh token expires, will prompt for re-authentication
   - Default: 30 days (configurable in Auth0)

## 🚀 Deployment Notes

### Development
- Works with Vite dev server (`npm run dev`)
- Session persists across hot reloads

### Production
- Build with `npm run build`
- Ensure callback URLs include production domain
- Test session persistence in production environment
- Monitor refresh token usage in Auth0 logs

## 📝 Migration from RequireAuth

The old `RequireAuth` component has been replaced with `ProtectedRoute`:

**Before:**
```tsx
<RequireAuth>
  <ProjectsPage />
</RequireAuth>
```

**After:**
```tsx
<ProtectedRoute>
  <ProjectsPage />
</ProtectedRoute>
```

`RequireRole` continues to work the same way for admin routes.

## 🔍 Troubleshooting

### Issue: Still redirecting to Auth0 on refresh
**Solution**: Clear browser localStorage and cookies, then login again

### Issue: "Invalid state" error
**Solution**: Check Auth0 dashboard callback URLs match exactly

### Issue: Refresh token not working
**Solution**: Verify "Refresh Token Rotation" is enabled in Auth0 dashboard

### Issue: Session expires too quickly
**Solution**: Increase "Refresh Token Expiration" in Auth0 dashboard settings
