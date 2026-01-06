# Admin Dashboard Security - Implementation Guide

## Quick Start

### 1. Set Admin Password (Development)

For development, the default password is `tanya ke admin`. To change it:

```bash
# In your terminal, set environment variable:
# Windows (PowerShell):
$env:ADMIN_PASSWORD = "your-secure-password"

# Linux/Mac:
export ADMIN_PASSWORD="your-secure-password"

# Or create .env.local file:
echo "ADMIN_PASSWORD=your-secure-password" > .env.local
```

### 2. Access Admin Dashboard

1. Navigate to `http://localhost:3000/admin/login`
2. Enter password: `tanya ke admin` (or your custom password)
3. Click "Login"
4. You'll be redirected to `/admin/dashboard`

### 3. Logout

Click the "Logout" button in the top-right corner of the dashboard.

## How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│  User Visits /admin/login                               │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  User Enters Password & Submits Form                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  POST /api/admin/login with {password}                  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Server Verifies Password Against ADMIN_PASSWORD        │
│  - If valid: Return token (Base64 encoded)              │
│  - If invalid: Return 401 Unauthorized                  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼ (if valid)
┌─────────────────────────────────────────────────────────┐
│  Client Stores Token in Cookie                          │
│  - Cookie name: admin-token                             │
│  - Expires: 24 hours                                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Redirect to /admin/dashboard                           │
└─────────────────────────────────────────────────────────┘
```

### Protected Routes

#### `/admin/dashboard` (Frontend Route)
- Checks for `admin-token` cookie
- If not present: Redirects to `/admin/login`
- If present: Displays admin dashboard

#### Admin API Endpoints
All endpoints require `x-admin-token` header:

```
PATCH /api/articles/{id}              - Edit article
PATCH /api/articles/{id}/approve      - Approve article
PATCH /api/articles/{id}/reject       - Reject article
DELETE /api/articles/{id}             - Delete article
```

### Token Structure

```
Token = Base64("admin:{password}")

Example:
- Password: "tanya ke admin"
- Token: "YWRtaW46YWRtaW4xMjM="
```

## Files Added/Modified

### New Files

1. **`app/admin/login/page.tsx`**
   - Admin login page component
   - Password input form
   - Calls `/api/admin/login` on submit

2. **`app/api/admin/login/route.ts`**
   - Login API endpoint
   - Verifies password against `ADMIN_PASSWORD`
   - Returns token on success

3. **`SECURITY_AUDIT.md`**
   - Comprehensive security documentation
   - Testing procedures
   - Future improvements

4. **`.env.example`**
   - Example environment variables
   - Shows password configuration

### Modified Files

1. **`app/admin/dashboard/page.tsx`**
   - Added auth check on component mount
   - Redirects to login if no token
   - Added logout button and handler
   - Updated all API calls to include `x-admin-token` header

2. **`components/edit-article-dialog.tsx`**
   - Updated handleSubmit to include `x-admin-token` header

3. **`app/api/articles/[id]/route.ts`** (PATCH & DELETE)
   - Added `verifyAdminToken()` function
   - Added auth check at start of both handlers
   - Returns 401 if unauthorized

4. **`app/api/articles/[id]/approve/route.ts`**
   - Added `verifyAdminToken()` function
   - Added auth check at start of handler
   - Returns 401 if unauthorized

5. **`app/api/articles/[id]/reject/route.ts`**
   - Added `verifyAdminToken()` function
   - Added auth check at start of handler
   - Returns 401 if unauthorized

## Testing the Security

### Test 1: Login with Correct Password
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"tanya ke admin"}'
```

Expected Response:
```json
{
  "success": true,
  "token": "YWRtaW46YWRtaW4xMjM=",
  "message": "Login berhasil"
}
```

### Test 2: Login with Wrong Password
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"wrongpassword"}'
```

Expected Response: 401 Unauthorized
```json
{
  "error": "Password tidak valid"
}
```

### Test 3: Access Protected Endpoint Without Token
```bash
curl -X PATCH http://localhost:3000/api/articles/1/approve
```

Expected Response: 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### Test 4: Access Protected Endpoint With Token
```bash
curl -X PATCH http://localhost:3000/api/articles/1/approve \
  -H "x-admin-token: YWRtaW46YWRtaW4xMjM="
```

Expected Response: 200 OK
```json
{
  "message": "Artikel berhasil disetujui",
  "article": { ... }
}
```

### Test 5: Dashboard Redirects to Login
Visit: `http://localhost:3000/admin/dashboard`

Expected: Redirected to `http://localhost:3000/admin/login`

## Production Deployment

### Pre-Deployment Checklist

- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Ensure HTTPS is enabled
- [ ] Test all login/logout flows
- [ ] Test all admin operations
- [ ] Verify non-authenticated users are redirected
- [ ] Monitor server logs for any security issues

### Setting Password in Production

Create `.env.local` or use environment variables provided by your hosting platform:

```bash
# .env.local
ADMIN_PASSWORD=YourSuperSecurePassword123!
```

### Security Best Practices

1. **Use HTTPS Only**
   - Always deploy with HTTPS in production
   - Never use HTTP for admin features

2. **Strong Password**
   - Use at least 12 characters
   - Mix uppercase, lowercase, numbers, symbols
   - Example: `Ep!st3m1c_D1pl0m4t_2025`

3. **Rotate Password Periodically**
   - Change password every 90 days
   - Use a password manager

4. **Monitor Logs**
   - Check server logs for failed login attempts
   - Consider adding rate limiting (future improvement)

5. **Backup & Recovery**
   - Document password in secure location
   - Have recovery procedure in place

## Troubleshooting

### "Cannot access /admin/dashboard"
- Check if you're logged in (visit `/admin/login`)
- Clear browser cookies and login again
- Check browser console for errors

### "Unauthorized" on API calls
- Verify token is included in `x-admin-token` header
- Check if token has expired (24-hour expiration)
- Re-login to get new token

### "Password tidak valid" on login
- Check if you're using correct password
- Verify `ADMIN_PASSWORD` environment variable is set correctly
- Check if password contains special characters (may need escaping)

### Token not stored in cookie
- Check if browser allows cookies (some privacy settings block)
- Verify you're using HTTPS in production (cookies need secure flag)
- Clear browser cookies and login again

## Future Improvements

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for detailed recommendations on:

- [ ] Implement NextAuth.js for production
- [ ] Add rate limiting on login endpoint
- [ ] Implement audit logging
- [ ] Add multiple admin accounts
- [ ] Implement session timeout with warning
- [ ] Add CSRF protection
- [ ] Secure `/api/articles/all` endpoint

## Questions?

Refer to [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for complete security documentation.
