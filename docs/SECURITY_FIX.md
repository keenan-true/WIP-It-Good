# Security Alert: Exposed Secret Remediation

## Issue
GitHub detected an OpenVSX Access Token in commit `a4cfd586` in the file:
`.specstory/history/2026-01-07_23-36Z-staff-allocation-and-resource-planner-app-features.md`

## Status
✅ The `.specstory/` directory is already in `.gitignore` 
✅ The file is not in the current working tree
⚠️ The file still exists in git history (commit a4cfd586)

## Immediate Actions Required

### 1. Revoke the Exposed Token
**CRITICAL: Do this first!**

The OpenVSX token found in the git history is now public and should be considered compromised.

1. Go to your OpenVSX account settings
2. Revoke the exposed token immediately
3. Generate a new token if needed
4. Store new tokens only in secure locations (environment variables, secure vaults)

### 2. Remove from Git History

You have two options to remove the sensitive file from git history:

#### Option A: Using git filter-repo (Recommended)

```bash
# Install git-filter-repo if not already installed
# macOS: brew install git-filter-repo
# Or: pip install git-filter-repo

# Remove the file from all history
git filter-repo --path .specstory/history/2026-01-07_23-36Z-staff-allocation-and-resource-planner-app-features.md --invert-paths

# Force push to all branches
git push origin --force --all
git push origin --force --tags
```

#### Option B: Using BFG Repo-Cleaner (Alternative)

```bash
# Install BFG
# macOS: brew install bfg

# Clone a fresh copy of the repo
cd ..
git clone --mirror https://github.com/keenan-true/WIP-It-Good.git

# Run BFG to remove the file
cd WIP-It-Good.git
bfg --delete-files '2026-01-07_23-36Z-staff-allocation-and-resource-planner-app-features.md'

# Clean up and push
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

#### Option C: Rewrite History Manually (Advanced)

```bash
# This will rewrite all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .specstory/history/2026-01-07_23-36Z-staff-allocation-and-resource-planner-app-features.md" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
git push origin --force --tags
```

### 3. Notify Collaborators

If others have cloned this repository:

```bash
# They need to re-clone or rebase their work
git fetch origin
git reset --hard origin/main  # or origin/mvp
```

### 4. Verify Removal

After cleaning, verify the file is gone from history:

```bash
git log --all --full-history -- "*specstory*"
# Should return nothing

# Check current state
git ls-files | grep specstory
# Should return nothing
```

### 5. Close GitHub Alert

1. Go to GitHub → Repository → Security → Secret scanning alerts
2. Once the token is revoked and removed from history, mark the alert as resolved
3. Add a comment explaining the remediation steps taken

## Prevention for Future

### Update .gitignore (Already Done ✓)
The `.gitignore` already contains:
```
# Specstory
.specstory/
```

### Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use .env files** - Keep them in `.gitignore`
3. **Pre-commit hooks** - Consider installing `git-secrets` or `detect-secrets`
4. **Regular scans** - Use tools like `truffleHog` or `gitleaks`

### Install Pre-commit Hook (Optional)

```bash
# Install git-secrets
brew install git-secrets

# Set it up for this repo
git secrets --install
git secrets --register-aws
```

## Questions?

If you need help with any of these steps, let me know. The most critical action is **revoking the exposed token immediately**.

## Verification Checklist

- [ ] Token revoked in OpenVSX account
- [ ] New token generated (if needed) and stored securely
- [ ] File removed from git history using one of the methods above
- [ ] Force pushed to GitHub
- [ ] Verified file no longer in history
- [ ] Collaborators notified to re-clone
- [ ] GitHub security alert marked as resolved
- [ ] Pre-commit hooks installed (optional)

## Timeline

- **Discovery**: January 8, 2026
- **Token Revocation**: [To be completed]
- **History Cleanup**: [To be completed]
- **Alert Closed**: [To be completed]
