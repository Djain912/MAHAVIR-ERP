# MongoDB Setup Instructions

## You have MongoDB connection error! Choose one option:

### Option 1: Use MongoDB Atlas (Cloud - FREE & EASIEST)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free M0 cluster (takes 3-5 minutes)
4. Click "Connect" -> "Connect your application"
5. Copy the connection string
6. Update your .env file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coca-cola-erp?retryWrites=true&w=majority
   ```
7. Replace username and password with your credentials

### Option 2: Install MongoDB Locally
1. Download MongoDB Community Server:
   https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run automatically as a service
4. Keep your .env as:
   ```
   MONGODB_URI=mongodb://localhost:27017/coca-cola-erp
   ```

### Option 3: Use Docker (if you have Docker installed)
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## After setting up MongoDB:
1. Update the MONGODB_URI in backend/.env
2. Restart the backend server (it will auto-restart with nodemon)
3. Run seed data: `npm run seed` (optional - creates sample data)

## Current Status:
❌ Backend: Running but MongoDB not connected
⏳ Admin Dashboard: Ready to start
⏳ Mobile App: Not started yet
