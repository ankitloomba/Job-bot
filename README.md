# JobFitPro — Authentication Foundation

## Current flow
Sign Up → verification email → Login → Setup Account → Dashboard.

Sign up requires name, email, phone, password and confirm password. Passwords are bcrypt-hashed. Verification links expire after 24 hours and are one-time use. Credentials login is blocked until email verification is complete.

## Required environment variables
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- RESEND_API_KEY
- EMAIL_FROM (must be a sender/domain authorized in Resend)

Google OAuth is intentionally not required for this first milestone.

## Run
`npm install`
`npx prisma generate`
`npx prisma db push`
`npm run dev`
