# Muslim Space Developer Website

This is a simple, professional landing page for the Muslim Space app that serves as the developer website for App Store and Google Play listings.

## Files Included

- `index.html` - Main landing page
- `app-ads.txt` - AdMob verification file (required for AdMob)
- `README.md` - This file

## Quick Setup & Deployment

### Option 1: GitHub Pages (Free & Easy)

1. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/muslim-space-website.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Your website will be live at:**
   ```
   https://yourusername.github.io/muslim-space-website/
   ```

### Option 2: Netlify (Free & Fast)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd website
   netlify deploy --prod
   ```

3. **Or use Netlify Drop:**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop the `website` folder
   - Your site is live instantly!

### Option 3: Vercel (Free)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd website
   vercel --prod
   ```

### Option 4: Firebase Hosting (Free)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize:**
   ```bash
   cd website
   firebase init hosting
   ```

3. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

## Customization

### Update App Store Links

Edit `index.html` and update the download button links:
- iOS: Replace `https://apps.apple.com/app/muslim-space` with your actual App Store URL
- Android: Replace `https://play.google.com/store/apps/details?id=com.anonymous.Natively` with your actual Play Store URL

### Update Contact Email

Edit the contact section in `index.html`:
```html
<a href="mailto:support@muslimspace.app">support@muslimspace.app</a>
```

### Add Your App Icon

1. Add your app icon as `favicon.png` in the `website` folder
2. The icon will automatically be used

## AdMob Verification

The `app-ads.txt` file is already included and configured. Once you deploy this website:

1. Make sure the domain matches exactly what you entered in AdMob
2. Verify the file is accessible at: `https://yourdomain.com/app-ads.txt`
3. Go to AdMob and click "Verify app" or "Check for updates"

## Adding Privacy Policy & Terms

If you need to add Privacy Policy or Terms of Service pages:

1. Create `privacy.html` and `terms.html` in the `website` folder
2. They're already linked in the footer of `index.html`

## Domain Setup (Optional)

If you want to use a custom domain:

1. **Purchase a domain** (e.g., from Namecheap, Google Domains, etc.)
2. **Point DNS to your hosting:**
   - GitHub Pages: Add CNAME record
   - Netlify/Vercel: Add domain in dashboard
3. **Update AdMob** with your custom domain

## Support

For questions or issues, contact: support@muslimspace.app
