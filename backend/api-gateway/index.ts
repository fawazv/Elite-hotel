import express from 'express'
import cors from 'cors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { createStream } from 'rotating-file-stream'
import path from 'path'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import hpp from 'hpp'
import {
  generalLimiter,
  authLimiter,
  writeLimiter,
  readLimiter,
  speedLimiter,
} from './middleware/rateLimiter'
import {
  helmetConfig,
  sanitizeInput,
  validateRequestSize,
  logSecurityHeaders,
} from './middleware/security'

dotenv.config()

const app = express()

// Create a stream for writing access logs
const accessLogStream = createStream('access.log', {
  interval: '1d',
  path: path.join(__dirname, 'logs'),
})

// Use Morgan middleware to log HTTP requests
app.use(morgan('combined', { stream: accessLogStream }))

// Console logging for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Parse cookies
app.use(cookieParser())

// Security: Helmet for security headers
app.use(helmetConfig)

// Security: Log security headers in development
if (process.env.NODE_ENV === 'development') {
  app.use(logSecurityHeaders)
}

// Security: Parse JSON with size limits
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

// Security: Sanitize input to prevent NoSQL injection
app.use(sanitizeInput)

// Security: Validate request size
app.use(validateRequestSize)

// Security: HTTP Parameter Pollution protection
app.use(hpp())

// Performance: Response compression
app.use(
  compression({
    level: 6, // Balance between compression ratio and CPU usage
    threshold: 1024, // Only compress responses larger than 1KB
  })
)

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173']

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
)

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Apply general rate limiting and speed limiting to all routes
app.use(generalLimiter)
app.use(speedLimiter)

// Service targets
const targets = {
  auth: process.env.AUTH_API_BASE_URL,
  user: process.env.USER_API_BASE_URL,
  room: process.env.ROOM_API_BASE_URL,
  guest: process.env.GUEST_API_BASE_URL,
  reservation: process.env.RESERVATION_API_BASE_URL,
  housekeeping: process.env.HOUSEKEEPING_API_BASE_URL,
  communication: process.env.COMMUNICATION_API_BASE_URL,
  payment: process.env.PAYMENT_API_BASE_URL,
}

// Proxy configuration with timeout
const proxyConfig = {
  changeOrigin: true,
  timeout: 30000, // 30 seconds
  proxyTimeout: 30000,
  onError: (err: any, req: any, res: any) => {
    console.error(`Proxy error for ${req.url}:`, err.message)
    res.status(502).json({
      success: false,
      message: 'Service temporarily unavailable',
    })
  },
  onProxyReq: (proxyReq: any, req: any) => {
    // Add request ID for tracing
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    proxyReq.setHeader('X-Request-ID', requestId)
  },
}

// Auth routes with strict rate limiting
app.use(
  '/auth/login',
  authLimiter,
  createProxyMiddleware({
    target: targets.auth,
    pathRewrite: { '^/auth/login': '/signin' },
    ...proxyConfig,
  })
)

app.use(
  '/auth/register',
  authLimiter,
  createProxyMiddleware({
    target: targets.auth,
    pathRewrite: { '^/auth/register': '/signup' },
    ...proxyConfig,
  })
)

app.use(
  '/auth',
  createProxyMiddleware({
    target: targets.auth,
    ...proxyConfig,
  })
)

// User routes with read/write limiting
app.use(
  '/user',
  readLimiter,
  writeLimiter,
  createProxyMiddleware({
    target: targets.user,
    ...proxyConfig,
  })
)

// Room routes with read/write limiting
app.use(
  '/room',
  readLimiter,
  writeLimiter,
  createProxyMiddleware({
    target: targets.room,
    ...proxyConfig,
  })
)

// Guest routes with read/write limiting
app.use(
  '/guest',
  readLimiter,
  writeLimiter,
  createProxyMiddleware({
    target: targets.guest,
    ...proxyConfig,
  })
)

// Reservation routes with read/write limiting
app.use(
  '/reservation',
  readLimiter,
  writeLimiter,
  createProxyMiddleware({
    target: targets.reservation,
    ...proxyConfig,
  })
)

// Housekeeping routes with read/write limiting
app.use(
  '/housekeeping',
  readLimiter,
  writeLimiter,
  createProxyMiddleware({
    target: targets.housekeeping,
    ...proxyConfig,
  })
)

// Communication routes (videochat + chatbot) with read limiting
app.use(
  '/videochat',
  readLimiter,
  createProxyMiddleware({
    target: targets.communication,
    pathRewrite: { '^/videochat': '/api/videochat' },
    ...proxyConfig,
  })
)

app.use(
  '/chat',
  readLimiter,
  createProxyMiddleware({
    target: targets.communication,
    pathRewrite: { '^/chat': '/api/chat' },
    ...proxyConfig,
  })
)

// Payment routes with write limiting
app.use(
  '/payment',
  writeLimiter,
  createProxyMiddleware({
    target: targets.payment,
    pathRewrite: { '^/payment': '/api/payments' },
    ...proxyConfig,
  })
)

// Catch-all 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  })
})

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Gateway error:', err)
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message

  res.status(err.status || 500).json({
    success: false,
    message,
  })
})

const port = process.env.GATEWAY_PORT || 3000
app.listen(port, () => {
  console.log(`🚀 API Gateway running on http://localhost:${port}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔒 Security: Helmet, Rate Limiting, Input Sanitization enabled`)
  console.log(`⚡ Performance: Compression, Request Timeouts enabled`)
})
