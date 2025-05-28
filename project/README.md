# Moments

A web application for creating and sharing moment boards with photos and text cards.

## Deployment

This project is automatically deployed to Vercel when changes are pushed to the main branch. The deployment process is handled by GitHub Actions.

### Domains
- Production: https://getmoments.net
- Preview: https://moments-beryl.vercel.app

### Environment Variables
The following environment variables are required for deployment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL` 