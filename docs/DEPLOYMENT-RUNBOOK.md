# Launch Day Deployment Runbook

## Pre-Launch (24 hours before)
- [ ] All tests passing on main
- [ ] Landing page live + tested
- [ ] Supabase migrations run successfully
- [ ] Environment variables set in GitHub Secrets
- [ ] Monitoring (Sentry, analytics) configured
- [ ] Discord/support channels ready

## Launch Day (Morning)
- [ ] Create GitHub release (v1.0.0)
- [ ] Deploy Pages (automatic on push to main)
- [ ] Verify Pages deploy green
- [ ] Test landing page on production URL
- [ ] Monitor error logs for 1 hour
- [ ] Send launch announcement

## Post-Launch (First Week)
- [ ] Monitor Sentry for errors
- [ ] Track signups/engagement
- [ ] Be ready for bug fixes
- [ ] Celebrate! 🎉
