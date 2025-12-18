# 🔐 Security Quick Reference Card

Quick commands and best practices for secure development and deployment.

## 🚀 Quick Start

### Generate Secure JWT Secret

**Node.js (Recommended):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**OpenSSL:**
```bash
openssl rand -base64 32
```

**PowerShell (Windows):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## 📋 GitHub Secrets Setup (3 Steps)

### 1. Generate Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Add to GitHub
- Go to: **Repository → Settings → Secrets → Actions**
- Click: **New repository secret**
- Name: `JWT_SECRET_TEST`
- Paste your generated value
- Click: **Add secret**

### 3. Done! ✅
Your workflow will automatically use the secret on next push.

## 🔑 Required Secrets by Environment

| Environment | Secret Name | Required | Notes |
|-------------|-------------|----------|-------|
| **Testing/CI** | `JWT_SECRET_TEST` | Recommended | Used in GitHub Actions |
| **Staging** | `JWT_SECRET_STAGING` | Future | For staging deployments |
| **Production** | `JWT_SECRET_PROD` | Critical | Never use defaults! |

## ✅ Security Checklist

- [ ] Generated strong, random JWT secret (32+ chars)
- [ ] Added `JWT_SECRET_TEST` to GitHub Secrets
- [ ] Never committed `.env` file to Git
- [ ] Using different secrets for dev/staging/prod
- [ ] Documented secret purpose and rotation schedule
- [ ] Limited CORS origins in production
- [ ] Rotated secrets in last 90 days

## 🚨 Emergency: Secret Exposed

If a secret is accidentally exposed:

1. **Rotate immediately:**
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update GitHub Secret:**
   - Go to Repository Settings → Secrets
   - Click on the exposed secret
   - Click "Update" and paste new value
   - Save

3. **Revoke old tokens:**
   - All JWT tokens with old secret become invalid
   - Users need to login again (automatic)

4. **Audit logs:**
   - Check GitHub Actions logs
   - Review recent deployments
   - Check for unauthorized access

## 📊 Environment Variable Priority

```
1. System Environment Variables (highest)
2. .env file
3. Default values in code (lowest)
```

**In CI/CD:**
```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET_TEST || 'fallback' }}
  # Uses secret if exists, otherwise fallback
```

## 🔍 Verify Security

### Check Current Configuration
```bash
# Start app and check console
npm start

# Look for warnings:
# ⚠️  WARNING: Using default JWT_SECRET
```

### Test with Custom Secret
```bash
# Set environment variable temporarily
JWT_SECRET=my-test-secret-123 npm start

# Should start without warnings
```

### Verify GitHub Actions
1. Push code to GitHub
2. Go to Actions tab
3. Check workflow run logs
4. Look for: "✅ API should be ready"
5. No warnings = secrets working!

## 🎯 Best Practices Summary

### ✅ DO
- Use 32+ character random secrets
- Different secrets per environment
- Store in GitHub Secrets
- Rotate every 90 days
- Document what each secret is for

### ❌ DON'T
- Commit secrets to Git
- Reuse secrets across projects
- Use predictable values
- Share secrets in chat/email
- Use production secrets in testing

## 📚 Documentation Links

- **Full Setup Guide:** [GITHUB-SECRETS-SETUP.md](./GITHUB-SECRETS-SETUP.md)
- **Environment Config:** [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md)
- **Main README:** [README.md](../README.md)

## 💡 Pro Tips

### Tip 1: Multiple Environments
```yaml
# Use GitHub Environments for production
jobs:
  deploy:
    environment: production
    env:
      JWT_SECRET: ${{ secrets.JWT_SECRET_PROD }}
```

### Tip 2: Secret Rotation
```bash
# Keep old secret for 24h during rotation
# Add both to workflow temporarily:
JWT_SECRET_NEW: ${{ secrets.JWT_SECRET_V2 }}
JWT_SECRET_OLD: ${{ secrets.JWT_SECRET_V1 }}
```

### Tip 3: Local Development
```bash
# Copy template and customize
cp env.template .env

# Generate unique local secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" >> .env
```

### Tip 4: Debug Mode
```bash
# Check what values are being used (without exposing them)
NODE_ENV=test npm start

# App will show which config values are defaults vs custom
```

## 🆘 Common Issues

### "Secret not found"
- Check spelling (case-sensitive)
- Verify secret exists in Settings
- Use fallback value: `${{ secrets.X || 'default' }}`

### "Authentication failed"
- Secret might have extra spaces
- Verify secret is correct for environment
- Check if secret rotation needed

### "Still showing warnings"
- Clear GitHub Actions cache
- Re-run workflow
- Check if secret name matches exactly

---

**Need help?** See full documentation: [GITHUB-SECRETS-SETUP.md](./GITHUB-SECRETS-SETUP.md)

**Last Updated:** October 2024


