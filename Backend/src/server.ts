
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path";
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import donorProfileRoutes from './routes/donorProfileRoutes'
import beneficiaryRoutes from './routes/beneficiaryRoutes'
import organizerRoutes from './routes/organizerRoutes'
import communityRoutes from './routes/communityRoutes'
import companyRoutes from './routes/companyRoutes'
import donationRoutes from './routes/donationRoutes'
import matchedDonationRoutes from './routes/matchedDonationRoutes';
import communityEvents from './routes/communityEvents';
import communityMembers from './routes/communityMembers';
import adminRoutes from './routes/adminRoutes';
import campaignRoutes from './routes/campaignRoutes';





dotenv.config()

const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())


const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
   process.env.FRONTEND_URL,, 
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//4. routes 
app.use("/api/auth", authRoutes),
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/users", userRoutes),
app.use("/api/donorprofile", donorProfileRoutes),
app.use("/api/beneficiaryprofile", beneficiaryRoutes)
app.use("/api/organizerprofile", organizerRoutes)
app.use("/api/communityprofile", communityRoutes)
app.use("/api/companyprofile", companyRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/matchedDonations', matchedDonationRoutes)
app.use('/api/events', communityEvents)
app.use("/api/communities", communityMembers);
app.use("/api/admin", adminRoutes);
app.use("/api/campaigns",campaignRoutes);







const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(` server is running on port - ${PORT}`)
})
