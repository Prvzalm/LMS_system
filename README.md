# LMS System (Next.js + Express + MongoDB)

This repository is a starter full-stack LMS built with:

- Frontend: Next.js, TailwindCSS, shadcn/ui, Framer Motion
- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JWT (starter) — can be swapped with NextAuth
- Payments: Placeholder for Stripe/Razorpay integration
- Video hosting: Placeholder for Vimeo / Cloudinary / S3

Getting started (Windows - cmd.exe):

1. Create a `.env` files in both `backend` and `frontend` with the variables described below.
2. Install dependencies and run both apps.

In separate terminals:

    cd backend
    npm install
    npm run dev

    cd ..\frontend
    npm install
    npm run dev

Environment variables (examples)

backend/.env

    PORT=4000
    MONGO_URI=mongodb://localhost:27017/lms_dev
    JWT_SECRET=change_this_secret
    STRIPE_SECRET=sk_test_...

# Cloudinary (set to your Cloudinary URL)

# Example format (do NOT commit this to version control):

# CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# e.g. CLOUDINARY_URL=cloudinary://329687167698281:SSG_bmveXeOsyavgPQ7hPSX5GF4@dxuqfitzl

frontend/.env.local

    NEXT_PUBLIC_API_URL=http://localhost:4000/api

Notes on next steps and integration

- Payment: Implement Stripe or Razorpay in `backend/src/routes/courses.js` purchase flow and use webhooks to call the `/confirm` endpoint.
- Video hosting: Upload videos to Vimeo/Cloudinary/S3 and store secure playback URLs in `Course.lessons[].videoUrl`. Use signed URLs or Vimeo private videos to prevent hotlinking.

Admin upload usage

- The admin UI uses a server-side upload endpoint at `POST /api/admin/upload` which accepts multipart form-data (file). The endpoint is protected; include an Authorization header with `Bearer <JWT>` of an admin user.
- Provide `CLOUDINARY_URL` in `backend/.env` and restart the backend. Uploaded media will be stored in Cloudinary and the API will return `secure_url` for use in course thumbnails and lessons.
- Protect videos: Backend `GET /courses/:courseId/lessons/:index/video` returns a signed URL only if the user has purchased the course (see `ensureEnrolled` middleware).

Cloudinary integration

- To enable Cloudinary signed URLs set the following environment variables in `backend/.env`:

  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET

- Example `backend/.env` addition:

  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret

Seeding dev admin + demo courses

- To create a development admin and demo courses use the admin seed endpoint. Start the backend, then call POST /api/admin/seed with header `x-seed-key` set to the value of `SEED_KEY` in `backend/.env`.
- Example `backend/.env` addition:

  SEED_KEY=some_dev_seed_key

- Sample curl (replace with a REST client):

  curl -X POST http://localhost:4000/api/admin/seed -H "x-seed-key: some_dev_seed_key"

Admin login (development)

- The seeding process creates an admin user with the email `admin@example.com` and password `password` by default. You can log in via POST `/api/auth/admin-login` to get a JWT for admin endpoints.

Example:

curl -X POST http://localhost:4000/api/auth/admin-login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}'

UI & Animations

- The frontend uses TailwindCSS and Framer Motion for smooth interactions. I added motion animations to the header, course cards, and admin dashboard. For more advanced components use `shadcn/ui` or your design system of choice.

Admin uploads (Cloudinary)

- The backend exposes a development admin upload endpoint at POST `/api/admin/upload` which accepts multipart/form-data with a `file` field and optional `resourceType` (`image` or `video`). It requires an admin JWT.

- Example using curl (replace token):

  curl -X POST http://localhost:4000/api/admin/upload -H "Authorization: Bearer <ADMIN_TOKEN>" -F "file=@./thumbnail.jpg" -F "resourceType=image"

The endpoint uploads to the `lms` folder in your Cloudinary account and returns the `secure_url` to store in the course document.

Next steps you can ask me to implement:

- End-to-end Stripe payment integration (I can implement server payment intent creation, webhook verification and frontend checkout). I will need Stripe test keys to fully test, or I can keep a stubbed flow.
- Implement Cloudinary signed streaming (I added a helper; we can configure private delivery and signed URLs).
- Polish UI with `shadcn/ui` components and a design pass mirroring Udemy/Coursera (I can implement layout, hero, course cards, and checkout flow UI).
- Add automated tests and seed scripts.

Stripe integration notes

- Backend env (add to `backend/.env`):

  STRIPE*SECRET=sk_test*...
  STRIPE*WEBHOOK_SECRET=whsec*...

- Frontend env (add to `frontend/.env.local`):

  NEXT*PUBLIC_STRIPE_PUB=pk_test*...

This scaffold provides a working developer flow. Replace placeholder keys and complete payment/video provider implementations before production use.

What's included

- Basic Express API with User, Course, Order models
- JWT auth routes (signup/login)
- Course CRUD and protected video access middleware
- Next.js frontend with homepage, course detail, auth pages, and dashboard stub

Notes

- Payment and video hosting integrations are left as stubs to plug your keys (Stripe/Vimeo/S3).
- Admin UI is scaffolded under `/admin` in the frontend and middleware in backend.
