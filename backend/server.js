import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import prescriptionRoutes from './routes/prescriptionRoutes.js'
import medicineRoutes from './routes/medicineRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import { notFound, errorHandler } from './middleware/error.js'
import { auth } from './middleware/auth.js'
import { Message } from './models/Message.js'

await connectDB()

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL||'*', credentials: true }))
app.use(helmet())
app.use(express.json({limit:'2mb'}))
app.use(morgan('dev'))
app.use(rateLimit({windowMs: 60_000, max: 120}))
app.use('/uploads', express.static('backend/uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/medicines', medicineRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/chat', chatRoutes)


// routes import - maaz
import userRouter from "./routes/users.routes.js";
import groupRouter from "./routes/groups.routes.js";
import postRouter from "./routes/posts.routes.js";
import commentRouter from "./routes/comments.routes.js";

// routes declaration in middleware `use` - maaz
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

app.get('/api/me', auth, (req,res)=> res.json({id:req.user._id,name:req.user.name,role:req.user.role,doctorApproved:req.user.doctorApproved}))

app.use(notFound)
app.use(errorHandler)

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL||'*' } })

io.on('connection', socket => {
  socket.on('join', room => { socket.join(room) })
  socket.on('typing', ({room, user}) => socket.to(room).emit('typing', {user}))
  socket.on('message', async ({room, from, to, body}) => {
    const msg = await Message.create({room,from,to,body})
    io.to(room).emit('message', msg)
  })
})

const port = process.env.PORT || 5000
server.listen(port, ()=> console.log('server_running_'+port))
