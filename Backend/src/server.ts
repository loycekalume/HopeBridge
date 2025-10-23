
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import cors from "cors"
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import donorProfileRoutes from './routes/donorProfileRoutes'






dotenv.config()

const app = express()


app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 

app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    methods: "POST,GET, PUT,PATCH,DELETE",
    credentials: true 
}))


//4. routes 
app.use("/api/auth", authRoutes),
app.use("/api/users", userRoutes),
app.use("/api/donorprofile",donorProfileRoutes)







const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(` server is running on port - ${PORT}`)
})
