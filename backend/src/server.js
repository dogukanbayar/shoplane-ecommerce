const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/database')
const errorHandler = require('./middleware/errorHandler')
const {
  helmetConfig,
  corsOptions,
  mongoSanitize,
  xss,
  hpp,
  limiter,
  apiLimiter,
  authLimiter,
  paymentLimiter
} = require('./middleware/security')

// Load env vars
dotenv.config()

// Connect to database
if (process.env.NODE_ENV !== 'test') connectDB()

const app = express()

// Security middleware
app.use(helmetConfig)
app.use(corsOptions)

// Yapılandırılmış Winston & Morgan Logger Middleware
const morgan = require("morgan");
const logger = require("./utils/logger");

const morganStream = {
  write: (message) => logger.info(message.trim())
};
app.use(morgan(":method :url :status :res[content-length] - :response-time ms", { stream: morganStream }));

// app.use(mongoSanitize)  // TODO: Fix compatibility with Express 5.2.1
// app.use(xss)  // TODO: Fix compatibility with Express 5.2.1
app.use(hpp)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Cookie parser
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// Rate limiting
// app.use('/api/', limiter)
// app.use('/api/auth/', authLimiter)
app.use('/api/payments/', paymentLimiter)

// Socket.io setup
const http = require('http')
const socketIO = require('socket.io')

const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5178'],
    credentials: true
  }
})

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`👤 New user connected: ${socket.id}`)

  socket.on('join-room', (data) => {
    socket.join(data.room)
    console.log(`👤 User ${socket.id} joined room: ${data.room}`)
  })

  socket.on('disconnect', () => {
    console.log(`👤 User ${socket.id} disconnected`)
  })
})

// Make io accessible to routes
app.set('io', io)

// Health check routes
app.use("/api/health", require("./routes/healthRoutes"))

// Swagger API Dokümantasyonu
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("📄 Swagger API Docs: http://localhost:5001/api/docs");


// API Routes (only load routes that exist)
app.use('/api/products', require('./routes/productRoutes'))
// app.use('/api/users', require('./routes/userRoutes'))  // TODO: Fix
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/api/sellers', require('./routes/sellerRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'))
app.use('/api/cart', require('./routes/cartRoutes'))
// app.use('/api/wishlist', require('./routes/wishlistRoutes'))  // TODO: Create
app.use('/api/payments', require('./routes/paymentRoutes'))
app.use('/api/bundles', require('./routes/bundleRoutes'))
app.use('/api/addresses', require('./routes/addressRoutes'))
app.use('/api/favorites', require('./routes/favoriteRoutes'))
app.use('/api/gamification', require('./routes/gamificationRoutes'))
app.use('/api/pre-orders', require('./routes/preOrderRoutes'))
app.use('/api/emails', require('./routes/emailRoutes'))
app.use('/api/experiments', require('./routes/experimentRoutes'))
app.use('/api/analytics', require('./routes/analyticsRoutes'))
app.use('/api/analytics-aggregation', require('./routes/analyticsAggregationRoutes'))
app.use('/api/funnels', require('./routes/funnelRoutes'))
app.use('/api/loyalty', require('./routes/loyaltyRoutes'))
app.use('/api/journeys', require('./routes/journeyRoutes'))
app.use('/api/guest-orders', require('./routes/guestOrderRoutes'))
app.use('/api/gift-cards', require('./routes/giftCardRoutes'))
app.use('/api/gift-wraps', require('./routes/giftWrapRoutes'))
app.use('/api/recommendations', require('./routes/recommendationRoutes'))
app.use('/api/chat', require('./routes/chatRoutes'))
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'))
app.use('/api/influencers', require('./routes/influencerRoutes'))

// Error handler

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-ticaret API çalışıyor! 🚀'
  })
})

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5001

if (process.env.NODE_ENV !== 'test') server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║          🚀 Backend Server Running!                   ║
║          📍 Port: ${PORT}                              ║
║          🌍 Mode: ${process.env.NODE_ENV || 'development'}             ║
║          🗄️  Database: Connected                       ║
╚═══════════════════════════════════════════════════════╝
  `)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Error: ${err.message}`)
  server.close(() => process.exit(1))
})

module.exports = app
