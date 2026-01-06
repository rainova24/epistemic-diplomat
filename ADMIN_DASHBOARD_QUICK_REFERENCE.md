# 🔐 Admin Dashboard - Quick Reference

## Login Credentials

**Development Default:**
- URL: `http://localhost:3000/admin/login`
- Password: `tanya ke admin`

**Production:**
- URL: `https://yourdomain.com/admin/login`
- Password: [Set in environment variable `ADMIN_PASSWORD`]

---

## Quick Commands

### Test Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"tanya ke admin"}'
```

### Test Approve Article (with token)
```bash
TOKEN="YWRtaW46YWRtaW4xMjM="

curl -X PATCH http://localhost:3000/api/articles/1/approve \
  -H "x-admin-token: $TOKEN"
```

### Check if Dashboard is Protected
```bash
# Should redirect to login
curl -L http://localhost:3000/admin/dashboard
```

---

## File Locations

| Feature | File(s) |
|---------|---------|
| Login Page | `app/admin/login/page.tsx` |
| Login API | `app/api/admin/login/route.ts` |
| Dashboard | `app/admin/dashboard/page.tsx` |
| Article API | `app/api/articles/[id]/route.ts` |
| Approve/Reject API | `app/api/articles/[id]/{approve\|reject}/route.ts` |
| Middleware | `middleware.ts` (root) |

---

## Protected Routes Summary

| Route | Method | Requires Auth | Type |
|-------|--------|--------------|------|
| `/admin/login` | - | ❌ No | UI |
| `/admin/dashboard` | - | ✅ Yes | UI |
| `POST /api/admin/login` | POST | ❌ No | API |
| `POST /api/articles/submit` | POST | ❌ No | API |
| `PATCH /api/articles/{id}` | PATCH | ✅ Yes | API |
| `DELETE /api/articles/{id}` | DELETE | ✅ Yes | API |
| `PATCH /api/articles/{id}/approve` | PATCH | ✅ Yes | API |
| `PATCH /api/articles/{id}/reject` | PATCH | ✅ Yes | API |

---

## How Token Works

1. **Get Token**
   ```
   POST /api/admin/login
   Body: {"password":"tanya ke admin"}
   Response: {"token":"YWRtaW46YWRtaW4xMjM="}
   ```

2. **Use Token in API Calls**
   ```
   Header: x-admin-token: YWRtaW46YWRtaW4xMjM=
   ```

3. **Token Format**
   ```
   Base64(admin:{password})
   ```

4. **Token Storage** (Browser)
   ```
   Cookie: admin-token=YWRtaW46YWRtaW4xMjM=
   Max-Age: 86400 (24 hours)
   ```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't access dashboard | Login first at `/admin/login` |
| "Unauthorized" on API call | Include `x-admin-token` header |
| Login not working | Check `ADMIN_PASSWORD` environment variable |
| Cookie not saving | Verify HTTPS is enabled (production) |
| Token expired | Re-login to get new token |

---

## Environment Variables

### Development (.env.local)
```bash
ADMIN_PASSWORD=tanya ke admin
```

### Production (.env.local or hosting platform)
```bash
ADMIN_PASSWORD=YourSecurePassword123!
```

---

## Documentation Map

```
📁 Project Root
├── 📄 ADMIN_SECURITY_README.md ← START HERE (quick start)
├── 📄 SECURITY_AUDIT.md ← Detailed implementation
├── 📄 IMPLEMENTATION_SUMMARY.md ← What was changed
├── 📄 DEPLOYMENT_CHECKLIST.md ← Pre-deployment tasks
├── 📄 ADMIN_DASHBOARD_QUICK_REFERENCE.md ← This file
├── 📄 .env.example ← Configuration template
└── 🔐 app/admin/
    ├── login/page.tsx ← Login page
    └── dashboard/page.tsx ← Admin dashboard
```

---

## Key Endpoints Reference

### User Submission (Public)
```
POST /api/articles/submit
Headers: Content-Type: application/json
Body: {
  title: string,
  author: string,
  email: string,
  category: string,
  content: string
}
```

### Admin Login
```
POST /api/admin/login
Headers: Content-Type: application/json
Body: { password: string }
Response: { token: string, success: boolean }
```

### Approve Article (Admin Only)
```
PATCH /api/articles/{id}/approve
Headers: x-admin-token: {token}
Response: { message: string, article: {...} }
```

### Reject Article (Admin Only)
```
PATCH /api/articles/{id}/reject
Headers: x-admin-token: {token}
Response: { message: string, article: {...} }
```

### Edit Article (Admin Only)
```
PATCH /api/articles/{id}
Headers: x-admin-token: {token}, Content-Type: application/json
Body: {
  title: string,
  author: string,
  email: string,
  category: string,
  content: string,
  excerpt: string,
  image?: string
}
```

### Delete Article (Admin Only)
```
DELETE /api/articles/{id}
Headers: x-admin-token: {token}
Response: { message: string }
```

---

## Deployment Reminders

- ⚠️ **Change password before deploying!**
- ⚠️ **Use HTTPS in production!**
- ✅ Run through `DEPLOYMENT_CHECKLIST.md` before deploy
- ✅ Test login/logout after deploying
- ✅ Monitor logs for any issues

---

## Support

For detailed information:
1. **Quick Start:** See `ADMIN_SECURITY_README.md`
2. **Technical Details:** See `SECURITY_AUDIT.md`
3. **What Changed:** See `IMPLEMENTATION_SUMMARY.md`
4. **Pre-Deploy:** See `DEPLOYMENT_CHECKLIST.md`

---

**Last Updated:** 2025
**Status:** ✅ Ready for Production
