# Phase 1 Testing Checklist - GodJira Frontend

## 🎯 Phase 1 Objectives
Complete authentication flows with NIST-compliant password validation, JWT token management, and protected routing.

## ✅ Prerequisites
- [x] Backend API running on `http://localhost:3000`
- [x] Frontend dev server running on `http://localhost:5173`
- [x] PostgreSQL database initialized
- [x] All dependencies installed

## 🚀 Starting the Application

### Backend (Terminal 1)
```powershell
cd S:\greatlearningof2025\GodJira\apps
pnpm start:dev
```
**Expected**: NestJS app starts on port 3000

### Frontend (Terminal 2)
```powershell
cd S:\greatlearningof2025\GodJira\web
pnpm dev
```
**Expected**: Vite dev server starts on port 5173

## 📋 Test Cases

### 1. Initial Load & Routing
- [ ] Navigate to `http://localhost:5173`
- [ ] **Expected**: Automatic redirect to `http://localhost:5173/#/login`
- [ ] **Verify**: Login page displays with GodJira branding
- [ ] **Verify**: "Create a new account" link visible

### 2. Registration Flow

#### 2.1 Password Validation (NIST Compliance)
- [ ] Click "Create a new account" link
- [ ] **Expected**: Registration page displays
- [ ] Enter details:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `weak` (8 characters or less)
- [ ] **Expected**: Error message shows password requirements
- [ ] **Expected**: Password strength indicator shows "Weak" in red

#### 2.2 Strong Password Registration
- [ ] Enter valid details:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `SecurePass123!@#`
  - Confirm Password: `SecurePass123!@#`
- [ ] **Expected**: Password strength shows "Strong" in green
- [ ] Click "Create account" button
- [ ] **Expected**: Account created successfully
- [ ] **Expected**: Automatic redirect to dashboard
- [ ] **Expected**: Welcome message shows "Welcome, Test User"

#### 2.3 Duplicate Email Validation
- [ ] Sign out from dashboard
- [ ] Navigate to registration page
- [ ] Try registering with same email `test@example.com`
- [ ] **Expected**: Error message "Email already exists"

### 3. Login Flow

#### 3.1 Invalid Credentials
- [ ] Navigate to login page
- [ ] Enter:
  - Email: `test@example.com`
  - Password: `WrongPassword123!`
- [ ] Click "Sign in"
- [ ] **Expected**: Error message "Invalid email or password"
- [ ] **Verify**: No account lockout on first failed attempt

#### 3.2 Account Lockout (Rate Limiting)
- [ ] Attempt login with wrong password 5 times consecutively
- [ ] **Expected**: After 5 failed attempts, error shows "Account is locked due to too many failed login attempts. Please try again in 15 minutes."
- [ ] **Expected**: Login button becomes disabled
- [ ] **Expected**: Error displayed in red with border

#### 3.3 Successful Login
- [ ] Wait 15 minutes OR reset lockout in database (if testing lockout)
- [ ] Enter correct credentials:
  - Email: `test@example.com`
  - Password: `SecurePass123!@#`
- [ ] Click "Sign in"
- [ ] **Expected**: Successful login
- [ ] **Expected**: Redirect to dashboard at `/#/dashboard`
- [ ] **Expected**: User info displayed correctly

### 4. Protected Routes

#### 4.1 Authenticated Access
- [ ] While logged in, navigate to `http://localhost:5173/#/dashboard`
- [ ] **Expected**: Dashboard displays without redirect
- [ ] **Verify**: User details visible (ID, Name, Email, Role, Email verification status)

#### 4.2 Unauthenticated Access
- [ ] Open new incognito/private browser window
- [ ] Navigate to `http://localhost:5173/#/dashboard`
- [ ] **Expected**: Automatic redirect to `/#/login`
- [ ] **Expected**: Loading spinner briefly visible during auth check

### 5. Public Routes (Already Authenticated)

- [ ] While logged in, navigate to `http://localhost:5173/#/login`
- [ ] **Expected**: Automatic redirect to `/#/dashboard`
- [ ] Try accessing `/#/register`
- [ ] **Expected**: Automatic redirect to `/#/dashboard`

### 6. Password Reset Flow

#### 6.1 Forgot Password Request
- [ ] Sign out if logged in
- [ ] Click "Forgot your password?" link on login page
- [ ] **Expected**: Forgot password page displays
- [ ] Enter email: `test@example.com`
- [ ] Click "Send reset email"
- [ ] **Expected**: Success message: "Password reset email sent!"
- [ ] **Expected**: Green success banner displays
- [ ] **Note**: Check backend logs for reset token (no email service configured yet)

#### 6.2 Reset Password with Token
- [ ] Copy reset token from backend logs or database
- [ ] Navigate to `http://localhost:5173/#/reset-password?token=<TOKEN>`
- [ ] **Expected**: Reset password form displays
- [ ] Enter weak password: `12345678`
- [ ] **Expected**: NIST validation error
- [ ] Enter strong password: `NewSecure Pass456!`
- [ ] Confirm password: `NewSecurePass456!`
- [ ] **Expected**: Password strength indicator shows "Strong"
- [ ] Click "Reset password"
- [ ] **Expected**: Success message displays
- [ ] **Expected**: Automatic redirect to login after 3 seconds

#### 6.3 Invalid/Expired Token
- [ ] Navigate to `http://localhost:5173/#/reset-password?token=invalid_token_12345`
- [ ] Try to reset password
- [ ] **Expected**: Error "Failed to reset password. The link may have expired."

### 7. Email Verification

#### 7.1 Verify Email with Token
- [ ] Copy verification token from backend logs (sent during registration)
- [ ] Navigate to `http://localhost:5173/#/verify-email?token=<TOKEN>`
- [ ] **Expected**: Loading spinner displays briefly
- [ ] **Expected**: Green success banner: "Email verified successfully!"
- [ ] **Expected**: "Go to sign in" button displays
- [ ] Click "Go to sign in"
- [ ] Login with verified account
- [ ] **Expected**: Dashboard shows "✓ Verified" for email status

#### 7.2 Invalid Verification Token
- [ ] Navigate to `http://localhost:5173/#/verify-email?token=bad_token_xyz`
- [ ] **Expected**: Red error banner displays
- [ ] **Expected**: Error message about verification failure
- [ ] **Expected**: Links to login and register displayed

### 8. Token Management

#### 8.1 Access Token Expiry (30 minutes)
- [ ] Login successfully
- [ ] Wait for access token to expire (30 minutes) OR manually expire in localStorage
- [ ] Make an API call (navigate to dashboard or refresh page)
- [ ] **Expected**: Automatic token refresh using refresh token
- [ ] **Expected**: No logout or redirect to login
- [ ] **Expected**: Dashboard continues to function normally

#### 8.2 Refresh Token Expiry (7 days)
- [ ] Login successfully
- [ ] Manually expire both tokens in localStorage OR wait 7 days
- [ ] Refresh the page
- [ ] **Expected**: Automatic logout
- [ ] **Expected**: Redirect to login page
- [ ] **Expected**: localStorage cleared

### 9. Dashboard Features

#### 9.1 User Information Display
- [ ] Login and navigate to dashboard
- [ ] **Verify**: All user fields displayed:
  - User ID (UUID format)
  - Full name
  - Email address
  - Role badge (color-coded: ADMIN=purple, MANAGER=blue, USER=green)
  - Email verification status (✓ Verified or ✗ Not verified)

#### 9.2 Navigation Cards
- [ ] **Verify**: Three cards visible:
  - Projects (placeholder link)
  - Issues (placeholder link)
  - Reports (placeholder link)
- [ ] Hover over cards
- [ ] **Expected**: Shadow effect on hover

#### 9.3 Sign Out
- [ ] Click "Sign out" button in navbar
- [ ] **Expected**: Immediate logout
- [ ] **Expected**: Redirect to login page
- [ ] **Expected**: Tokens cleared from localStorage
- [ ] Try navigating back to dashboard
- [ ] **Expected**: Redirect to login (not authenticated)

### 10. 404 Not Found Page

- [ ] Navigate to `http://localhost:5173/#/invalid-page-xyz`
- [ ] **Expected**: 404 page displays with large "404" text
- [ ] **Expected**: "Page not found" message
- [ ] **Expected**: "Go back home" button
- [ ] Click "Go back home"
- [ ] **Expected**: Redirect to root `/` (which redirects to `/dashboard` if authenticated or `/login` if not)

### 11. Browser DevTools Checks

#### 11.1 Network Tab
- [ ] Open browser DevTools → Network tab
- [ ] Perform login
- [ ] **Verify**: POST request to `/api/auth/login`
- [ ] **Verify**: Response contains `accessToken`, `refreshToken`, and `user` object
- [ ] **Verify**: 401 responses trigger automatic token refresh
- [ ] **Verify**: Subsequent requests include `Authorization: Bearer <token>` header

#### 11.2 Console Tab
- [ ] Check browser console for errors
- [ ] **Expected**: No critical errors
- [ ] **Note**: React DevTools warnings are acceptable

#### 11.3 Application/Storage Tab
- [ ] Navigate to Application → Local Storage
- [ ] **Verify**: `accessToken` and `refreshToken` stored after login
- [ ] **Verify**: Tokens removed after logout

### 12. Responsive Design

#### 12.1 Mobile View (375px width)
- [ ] Open DevTools → Toggle device toolbar
- [ ] Select iPhone SE or similar (375px)
- [ ] **Verify**: Login form fits within viewport
- [ ] **Verify**: All buttons and inputs are tappable (min 44px height)
- [ ] **Verify**: Text is readable without zoom

#### 12.2 Tablet View (768px width)
- [ ] Select iPad or similar (768px)
- [ ] **Verify**: Dashboard cards display properly
- [ ] **Verify**: Navigation remains functional

## 🐛 Known Issues / Limitations

### Phase 1 Scope
- ✅ Authentication flows complete
- ✅ NIST password validation
- ✅ JWT token refresh
- ✅ Protected/public routing
- ✅ Account lockout (5 failed attempts, 15min duration)
- ⚠️ Email service not configured (tokens logged to console)
- ⚠️ Projects, Issues, Reports pages are placeholders (Phase 2)
- ⚠️ No avatar upload yet (Phase 2)
- ⚠️ No real-time notifications yet (later phase)

### Expected Backend Endpoints (Must Be Running)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT tokens)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get JWT payload (lightweight, for healthcheck)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email with token
- `GET /api/users/me` - Get current user profile (full user data)
- `PATCH /api/users/me` - Update current user profile
- `PATCH /api/users/me/password` - Change password (authenticated)

## ✅ Phase 1 Completion Criteria

All test cases must pass before proceeding to Phase 2:
- [ ] Registration with NIST password validation works
- [ ] Login with account lockout works (5 attempts, 15min)
- [ ] Token refresh happens automatically on 401
- [ ] Protected routes redirect unauthenticated users
- [ ] Public routes redirect authenticated users
- [ ] Password reset flow completes end-to-end
- [ ] Email verification updates user status
- [ ] Dashboard displays user information correctly
- [ ] Logout clears tokens and redirects properly
- [ ] 404 page displays for unknown routes
- [ ] No critical console errors
- [ ] Basic responsive design works (mobile/tablet/desktop)

## 📝 Testing Notes

### Database Reset (If Needed)
```powershell
cd S:\greatlearningof2025\GodJira\apps
pnpm prisma migrate reset
pnpm prisma migrate deploy
```

### Clear Browser Storage
```javascript
// Run in browser console
localStorage.clear();
location.reload();
```

### View JWT Token Payload
```javascript
// Run in browser console
const token = localStorage.getItem('accessToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
}
```

## 🎉 Success Indicators

Phase 1 is complete when:
1. All 12 test sections pass
2. No blocking bugs identified
3. Authentication flow is smooth and secure
4. NIST password requirements enforced
5. Token refresh works transparently
6. User experience feels polished

## 🚦 Next Steps

After Phase 1 approval:
- **Phase 2**: Users & Profile (avatar upload, profile editing, user search)
- **Phase 3**: Projects & Teams (CRUD, permissions, member management)
- **Phase 4**: Issues & Workflows (Kanban, issue types, custom fields)

---

**Tester**: _______________  
**Date**: _______________  
**Status**: [ ] Pass  [ ] Fail  [ ] Blocked  
**Notes**: _________________________________________________
