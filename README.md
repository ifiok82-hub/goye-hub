# GOYE SERVICES HUB — Operations & Security Guide

## 🔐 Secure Admin Management Dashboard Lock

This cockpit represents the protected admin control center of GOYE SERVICES HUB.
To ensure elite operations security and comply with rigorous dual-use data isolation requirements, the dashboard is locked behind a strict, server-verified JWT and cryptographically hashed password security gate.

### **How to Configure Admin Credentials**

Define the following environment variables in your hosting provider (e.g., Vercel, Render, or GCP dashboard):

1.  **`ADMIN_PASSWORD`**:
    *   *Description*: The strong plain-text administrative password used for initial unlocking.
    *   *Default Fallback*: `GoyeBN3583773`
    *   *Example*: `Set ADMIN_PASSWORD in Vercel Env Vars`
2.  **`ADMIN_PASSWORD_HASH`**:
    *   *Description*: A cryptographically hashed (using `bcrypt` or similar algorithms) password. Recommended for maximum security.
3.  **`ADMIN_JWT_SECRET`**:
    *   *Description*: A strong secret hash key utilized to sign and authenticate Bearer JWT session tokens with an 8-hour expiry constraint.

---

### **Operations Security Rules**
*   No plain-text credentials are ever cached on client interfaces or within public frontend bundles.
*   Authentications are completely isolated server-side.
*   Profiles fetched via Admin control paths are automatically filtered to exclude administrative credentials and avoid customer-data leaks.
