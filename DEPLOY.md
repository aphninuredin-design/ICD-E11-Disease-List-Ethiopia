# Deployment Guide

This PWA is deployed on **GitHub Pages** and automatically updates on every push to the `main` branch.

## Automatic Deployment

The project uses GitHub Actions to automatically deploy to GitHub Pages:

- **Trigger:** Any push to `main` branch
- **Workflow:** `.github/workflows/pages.yml`
- **URL:** `https://aphninuredin-design.github.io/ICD-E11-Disease-List-Ethiopia`

### Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Set **Source** to: Deploy from a branch
3. Select **Branch:** main
4. Select **Folder:** / (root)
5. Click **Save**

The site will be live at: `https://aphninuredin-design.github.io/ICD-E11-Disease-List-Ethiopia`

## Manual Deployment

To deploy locally for testing:

1. Use any HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or with Python 2
   python -m SimpleHTTPServer 8000
   
   # Or with Node.js (if installed)
   npx http-server
   ```

2. Open browser to `http://localhost:8000`

## Testing PWA Features

Before deployment:
- ✅ Test offline functionality (DevTools → Network → Offline)
- ✅ Test on mobile/tablet devices
- ✅ Verify "Add to Home Screen" works
- ✅ Check service worker caching (DevTools → Application)
- ✅ Verify manifest.json loads correctly

## Rollback

To rollback to a previous version:

```bash
git revert <commit-hash>
git push origin main
```

GitHub Actions will automatically redeploy with the reverted code.

## Monitoring

Check deployment status:
1. Go to repository
2. Click "Actions" tab
3. View `Deploy to GitHub Pages` workflow runs
4. Check job logs for any errors

---

**Note:** Ensure all files are committed and pushed to `main` branch for deployment to take effect.
