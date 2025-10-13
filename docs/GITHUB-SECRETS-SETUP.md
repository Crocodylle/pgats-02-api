# 🔐 GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for secure CI/CD pipelines.

## 📋 Table of Contents

- [Why Use GitHub Secrets?](#why-use-github-secrets)
- [Required Secrets](#required-secrets)
- [How to Create Secrets](#how-to-create-secrets)
- [Environment-Specific Secrets](#environment-specific-secrets)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Why Use GitHub Secrets?

GitHub Secrets provide secure storage for sensitive information:

- ✅ **Encrypted at rest** - Secrets are encrypted in GitHub's database
- ✅ **Masked in logs** - Secret values are automatically hidden in workflow logs
- ✅ **Access control** - Only authorized workflows can access secrets
- ✅ **Audit trail** - GitHub tracks when secrets are accessed
- ✅ **No code exposure** - Secrets never appear in your repository
- ✅ **Easy rotation** - Update secrets without changing code

## 🔑 Required Secrets

### For Testing/CI Environment

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `JWT_SECRET_TEST` | JWT signing key for CI/CD tests | `pgats-ci-test-key-2024-abc123` | Recommended |

### For Staging Environment (Future)

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `JWT_SECRET_STAGING` | JWT signing key for staging | `pgats-staging-key-2024-xyz789` | Yes |
| `DATABASE_URL_STAGING` | Staging database connection | `postgresql://user:pass@host/db` | Future |

### For Production Environment (Future)

| Secret Name | Description | Example Value | Required |
|-------------|-------------|---------------|----------|
| `JWT_SECRET_PROD` | JWT signing key for production | `ultra-secure-prod-key-2024-...` | **Critical** |
| `DATABASE_URL_PROD` | Production database connection | `postgresql://user:pass@host/db` | Future |
| `API_KEYS_PROD` | Third-party API keys | `key1,key2,key3` | Future |

## 📖 How to Create Secrets

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add New Secret

1. Click **New repository secret**
2. Enter the secret name (e.g., `JWT_SECRET_TEST`)
3. Enter the secret value
4. Click **Add secret**

### Step 3: Verify Secret

- The secret will appear in the list (value is hidden)
- You can update or delete it anytime
- The secret is now available to your workflows

## 🎨 How to Generate Secure Secrets

### Method 1: Using Node.js (Recommended)

```bash
# Generate a random 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# 7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b
```

### Method 2: Using OpenSSL

```bash
# Generate a secure random string
openssl rand -base64 32

# Output example:
# K8vX2nR5tY9pQ3wE6zL4mN7jH1kV0sA8bC9xD2fG5hI=
```

### Method 3: Using PowerShell (Windows)

```powershell
# Generate a random secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Output example:
# Kx9Vm2Tp8Qn3Rw5Lz7Hj4Nb1Yc6Dg0Fa
```

## 🌍 Environment-Specific Secrets

### Current Workflow Configuration

Our GitHub Actions workflow uses environment variables with fallbacks:

```yaml
env:
  NODE_ENV: test
  JWT_SECRET: ${{ secrets.JWT_SECRET_TEST || 'pgats-ci-test-secret-key-2024' }}
  PORT: 3000
  GRAPHQL_PORT: 4000
  LOG_LEVEL: error
```

**How it works:**
- If `JWT_SECRET_TEST` secret exists → Uses the secret
- If `JWT_SECRET_TEST` is not set → Falls back to default value
- This allows the pipeline to work even without secrets (for learning)

### Future: Multiple Environments

When you add staging/production, create environment-specific workflows:

```yaml
# .github/workflows/production.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Links to GitHub Environment
    
    env:
      NODE_ENV: production
      JWT_SECRET: ${{ secrets.JWT_SECRET_PROD }}  # No fallback!
      DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}
```

## 🛡️ Security Best Practices

### ✅ DO's

1. **Use different secrets for each environment**
   - Never reuse production secrets in testing
   - Generate unique secrets for dev/staging/prod

2. **Generate strong secrets**
   - Minimum 32 characters
   - Use cryptographically random values
   - Include letters, numbers, and special characters

3. **Rotate secrets regularly**
   - Change secrets every 90 days
   - Rotate immediately if exposed
   - Keep old secrets for 24h during rotation

4. **Use descriptive names**
   - `JWT_SECRET_PROD` not `SECRET1`
   - Include environment in name
   - Follow consistent naming convention

5. **Document what each secret is for**
   - Maintain this documentation
   - Include in team onboarding
   - Update when secrets change

### ❌ DON'Ts

1. **Never commit secrets to Git**
   - Not even in old commits
   - Not even in .env.example with "fake" values
   - Use `.gitignore` for `.env` files

2. **Don't share secrets in chat/email**
   - Use secure secret management tools
   - Share access to GitHub, not the values
   - Rotate if accidentally shared

3. **Don't use weak secrets**
   - No "password123" or "secret"
   - No dictionary words
   - No predictable patterns

4. **Don't reuse secrets across projects**
   - Each project needs unique secrets
   - Breach in one doesn't affect others

## 🔧 Updating Secrets in Workflow

### Current Implementation

```yaml
# .github/workflows/nodejs.yml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET_TEST || 'pgats-ci-test-secret-key-2024' }}
```

**Benefits:**
- ✅ Works without secrets (educational projects)
- ✅ Security warning in logs when using defaults
- ✅ Easy to upgrade by just adding the secret

### Production Implementation (Future)

```yaml
# .github/workflows/production.yml
env:
  # ❌ No fallback! Must fail if secret is missing
  JWT_SECRET: ${{ secrets.JWT_SECRET_PROD }}
  DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}
```

**Benefits:**
- ✅ Fails fast if secrets are missing
- ✅ Prevents accidental deployments with defaults
- ✅ Forces explicit configuration

## 🐛 Troubleshooting

### Secret Not Found Error

**Problem:** Workflow fails with "secret not found"

**Solution:**
1. Check secret name spelling (case-sensitive)
2. Verify secret exists in repository settings
3. Check if you have permission to view secrets
4. Use fallback value for non-critical secrets

### Secret Value Not Working

**Problem:** Secret exists but authentication fails

**Solution:**
1. Check for extra spaces in secret value
2. Verify secret hasn't expired
3. Ensure secret is valid for the environment
4. Check if secret needs special character escaping

### Secret Not Updating

**Problem:** Changed secret but workflow uses old value

**Solution:**
1. Re-run the workflow (secrets are cached)
2. Check if you saved the secret update
3. Verify workflow is using correct secret name
4. Clear GitHub Actions cache if needed

### Logs Showing Secret Hints

**Problem:** Logs partially show secret information

**Solution:**
1. GitHub automatically masks exact values
2. If pattern is visible, rotate the secret
3. Avoid echoing secrets in workflow steps
4. Use `secrets.` only in `env:` blocks

## 📚 Additional Resources

### GitHub Documentation
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Using Secrets in Workflows](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### Security Tools
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Git-secrets](https://github.com/awslabs/git-secrets) - Prevent committing secrets
- [Trufflehog](https://github.com/trufflesecurity/trufflehog) - Find exposed secrets

### Best Practices Guides
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)

## 🎓 Educational vs Production

### Current Project (Educational)

**Approach:** Secrets with fallbacks
```yaml
JWT_SECRET: ${{ secrets.JWT_SECRET_TEST || 'default-value' }}
```

**Why:**
- Easy for students to run
- No setup required for learning
- Still demonstrates proper practices
- Can be upgraded later

### Production Projects

**Approach:** Required secrets, no fallbacks
```yaml
JWT_SECRET: ${{ secrets.JWT_SECRET_PROD }}
```

**Why:**
- Fails if not configured correctly
- No accidental use of defaults
- Enforces security from day one
- Audit trail of secret usage

## ✅ Quick Setup Checklist

For this project, follow these steps:

- [ ] Generate a secure JWT secret using Node.js/OpenSSL
- [ ] Go to GitHub Repository Settings → Secrets → Actions
- [ ] Create `JWT_SECRET_TEST` secret with generated value
- [ ] Commit and push (workflow will use the secret)
- [ ] Verify in Actions tab that secret is being used
- [ ] Check logs for security warning (should disappear)

**That's it!** Your CI/CD pipeline is now using secure secrets. 🎉

---

**Last Updated:** October 2024  
**Maintained by:** PGATS-02 API Team


