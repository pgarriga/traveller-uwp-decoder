---
name: update-badges
description: Update README.md badges when library versions change in package.json
allowed-tools: Read, Edit
---

# Update README Badges

Sync README.md badges with current versions from package.json.

## Steps

1. Read `package.json` and extract versions:
   - `version` field for project version
   - `dependencies.react` for React version
   - `devDependencies.vite` for Vite version
   - `dependencies.tesseract.js` for Tesseract.js version

2. Read `README.md` and update badges to match:

### Badge Format

```markdown
[![Version](https://img.shields.io/badge/Version-{VERSION}-blue?style=flat-square)]
[![React](https://img.shields.io/badge/React-{VERSION}-61DAFB?style=flat-square&logo=react&logoColor=white)]
[![Vite](https://img.shields.io/badge/Vite-{VERSION}-646CFF?style=flat-square&logo=vite&logoColor=white)]
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-{VERSION}-4285F4?style=flat-square&logo=google&logoColor=white)]
```

### Version Extraction Rules

- Remove `^` or `~` prefix from versions
- Use major.minor only (e.g., `19.0.0` → `19.0`)
- Keep project version as-is from `version` field

## Output

1. List current versions from package.json
2. List current badge versions from README.md
3. Update any badges that are out of sync
4. Confirm changes made (or "All badges up to date")
