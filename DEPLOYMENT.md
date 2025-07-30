# 🚀 Deployment Guide for Live Polling Frontend

## Quick Deployment to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI globally**

   ```bash
   npm install -g vercel
   ```

2. **Login to your Vercel account**

   ```bash
   vercel login
   ```

3. **Navigate to your frontend directory**

   ```bash
   cd Frontend/frontend
   ```

4. **Deploy to production**
   ```bash
   npm run deploy
   ```
   or
   ```bash
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `Frontend/frontend` folder as root directory

3. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Root Directory: `Frontend/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Environment Variables

Set these in your Vercel dashboard under Settings > Environment Variables:

```env
VITE_SOCKET_URL=https://your-backend-url.com
VITE_APP_NAME=Live Polling System
NODE_ENV=production
```

## Pre-deployment Checklist

- [ ] Backend server is deployed and accessible
- [ ] Environment variables are configured
- [ ] Build runs successfully locally (`npm run build`)
- [ ] Preview works correctly (`npm run preview`)
- [ ] Socket.IO connection URL is updated for production
- [ ] CORS is configured on backend for your domain

## Post-deployment Steps

1. **Test the deployed application**

   - Verify socket connection works
   - Test both teacher and student flows
   - Check chat functionality
   - Test on different devices/browsers

2. **Monitor performance**
   - Check Vercel Analytics
   - Monitor error logs
   - Test load times

## Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update CORS settings on backend if needed

## Troubleshooting

### Common Issues

1. **Build Fails**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Socket Connection Issues**

   - Verify VITE_SOCKET_URL environment variable
   - Check backend CORS configuration
   - Ensure backend is deployed and accessible

3. **404 Errors on Refresh**
   - Verify `vercel.json` configuration
   - Check SPA routing setup

### Environment-specific Issues

**Development vs Production**

- Socket URL must point to production backend
- Remove development-only features
- Verify all environment variables

## Performance Optimization

The current setup includes:

- Code splitting for vendor libraries
- Asset optimization
- Tree shaking
- Minification

## Security Considerations

- Environment variables are properly prefixed with `VITE_`
- No sensitive data in client-side code
- Backend URL validation
- CORS properly configured

## Monitoring & Analytics

Consider adding:

- Vercel Analytics
- Error tracking (Sentry)
- Performance monitoring
- User analytics

---

**Need help?** Check the main README.md or create an issue in the repository.
