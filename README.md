# SurplusShare

SurplusShare is a MERN stack web application facilitating food sharing and waste reduction, enabling suppliers to post surplus food and receivers to reserve it.

## Local Setup

1. **Clone repository**
2. **Setup Environment Variables**:
   Create `.env` in the `server/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/surplusshare?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```
3. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```
4. **Seed the Database**:
   ```bash
   npm run seed
   ```
   *(To wipe all local data and reset, use `npm run seed:reset`)*
5. **Start backend**:
   ```bash
   npm run dev
   ```
6. **Start frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Populate Demo Data After Deployment

When deploying to platforms like Vercel or Render, **startup scripts time out** and cannot safely populate databases. Therefore:

1. Obtain your production MongoDB Atlas connection string.
2. In your deployment dashboard (e.g. Vercel), configure the `MONGO_URI` environment variable with this string.
3. Locally on your computer, ensure your `server/.env` points to the **Production** `MONGO_URI`.
4. Run the idempotent seed command against the production database:
   ```bash
   cd server
   npm run seed
   ```
5. Verify the inserted documents in your MongoDB Atlas dashboard (Check `users`, `foodlistings`, `reservations`).
6. Refresh the deployed React application. Real demo data will instantly populate!

### Demo Login Credentials

- **Supplier:** demo.supplier@surplusshare.com (Password: `password123`)
- **Receiver:** demo.receiver@surplusshare.com (Password: `password123`)
- **Admin:** demo.admin@surplusshare.com (Password: `password123`)
