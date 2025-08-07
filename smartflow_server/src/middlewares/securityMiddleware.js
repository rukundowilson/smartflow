import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { ValidationHelper } from '../../smartflow/src/app/utils/validation.js';

// Rate limiting configuration
export const createRateLimiters = () => {
  // General API rate limiter
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      });
    }
  });

  // Stricter limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
      error: 'Too many login attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Too many login attempts',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      });
    }
  });

  // Limiter for file uploads
  const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 uploads per hour
    message: {
      error: 'Too many file uploads, please try again later.',
      retryAfter: '1 hour'
    }
  });

  return {
    general: generalLimiter,
    auth: authLimiter,
    upload: uploadLimiter
  };
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://smartflow-g5sk.onrender.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// CORS configuration
export const corsConfig = cors({
  origin: [
    'https://smartflow-kappa.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    "https://smartflow-6xzmuaviv-rukundowilsons-projects.vercel.app/"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
});

// Input validation middleware
export const validateInput = (schema) => {
  return async (req, res, next) => {
    try {
      const validationResult = await ValidationHelper.validate(schema, {
        ...req.body,
        ...req.params,
        ...req.query
      });

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors
        });
      }

      // Sanitize inputs
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          if (typeof req.body[key] === 'string') {
            req.body[key] = ValidationHelper.sanitizeInput(req.body[key]);
          }
        });
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal validation error'
      });
    }
  };
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // Log based on status code
    if (res.statusCode >= 400) {
      console.error('❌ Request failed:', logData);
    } else if (res.statusCode >= 300) {
      console.warn('⚠️ Request redirected:', logData);
    } else {
      console.log('✅ Request successful:', logData);
    }
  });

  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('🚨 Unhandled error:', err);

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      error: 'Access forbidden'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};

// Request size limiter
export const requestSizeLimiter = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
      maxSize: `${maxSize / 1024 / 1024}MB`
    });
  }

  next();
};

// SQL injection protection middleware
export const sqlInjectionProtection = (req, res, next) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i;
  
  const checkValue = (value) => {
    if (typeof value === 'string' && sqlPattern.test(value)) {
      throw new Error('Potential SQL injection detected');
    }
  };

  try {
    // Check body
    if (req.body) {
      Object.values(req.body).forEach(checkValue);
    }

    // Check query parameters
    if (req.query) {
      Object.values(req.query).forEach(checkValue);
    }

    // Check URL parameters
    if (req.params) {
      Object.values(req.params).forEach(checkValue);
    }

    next();
  } catch (error) {
    console.warn('🚨 Potential SQL injection attempt:', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('User-Agent')
    });

    res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }
};

// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    // Log slow requests
    if (duration > 1000) { // More than 1 second
      console.warn('🐌 Slow request detected:', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        status: res.statusCode
      });
    }
  });

  next();
};

// Export all middleware
export default {
  createRateLimiters,
  securityHeaders,
  corsConfig,
  validateInput,
  requestLogger,
  errorHandler,
  requestSizeLimiter,
  sqlInjectionProtection,
  performanceMonitor
}; 