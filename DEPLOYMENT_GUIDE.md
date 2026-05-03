# Amihub Website Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended - Free)
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd "c:/Users/hetan/OneDrive/Desktop/college startup website final"
   vercel --prod
   ```

4. **Your website will be live at:** `https://amihub.vercel.app`

---

### Option 2: Netlify (Free)
1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   cd "c:/Users/hetan/OneDrive/Desktop/college startup website final"
   netlify deploy --prod --dir=public
   ```

4. **Your website will be live at:** `https://your-site-name.netlify.app`

---

### Option 3: Heroku (Free Tier)
1. **Install Heroku CLI:** Download from [heroku.com](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create Heroku App:**
   ```bash
   cd "c:/Users/hetan/OneDrive/Desktop/college startup website final"
   heroku create amihub
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Initial deploy"
   git push heroku main
   ```

5. **Your website will be live at:** `https://amihub.herokuapp.com`

---

### Option 4: Railway (Free Tier)
1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   cd "c:/Users/hetan/OneDrive/Desktop/college startup website final"
   railway up
   ```

---

### Option 5: GitHub Pages (Static Only)
1. **Create GitHub Repository**
2. **Push your code to GitHub**
3. **Enable GitHub Pages** in repository settings
4. **Select source:** Deploy from branch `main` / folder `/public`

---

## 🔧 Pre-Deployment Checklist

### ✅ Before You Deploy:
- [ ] Update Firebase credentials in `.env.production`
- [ ] Test all features locally
- [ ] Update any hardcoded URLs
- [ ] Optimize images and assets
- [ ] Test responsive design

### 📁 Required Files:
- ✅ `package.json` - Dependencies and scripts
- ✅ `server.js` - Main server file
- ✅ `vercel.json` - Vercel configuration
- ✅ `netlify.toml` - Netlify configuration
- ✅ `Procfile` - Heroku configuration
- ✅ `.env.production` - Production environment variables

---

## 🌐 Custom Domain Setup

### After Deployment:
1. **Buy a domain** (GoDaddy, Namecheap, etc.)
2. **Add DNS records** as per hosting provider instructions
3. **Update domain settings** in hosting dashboard
4. **Wait for propagation** (usually 24-48 hours)

---

## 🔒 Security Notes

### Production Setup:
- **Use environment variables** for all secrets
- **Enable HTTPS** (most hosts provide this automatically)
- **Update Firebase rules** for production
- **Monitor usage** and set up alerts
- **Regular backups** of your data

---

## 📞 Support

### Common Issues:
- **Build Errors:** Check Node.js version compatibility
- **Firebase Connection:** Verify credentials in `.env.production`
- **404 Errors:** Check routing configuration
- **Slow Loading:** Optimize images and enable caching

### Need Help?
- Check hosting provider documentation
- Review error logs in hosting dashboard
- Test locally before deploying

---

## 🎉 You're Ready to Deploy!

Your Amihub website is fully prepared for production hosting with all the necessary configuration files and deployment guides. Choose your preferred hosting option and follow the steps above!
