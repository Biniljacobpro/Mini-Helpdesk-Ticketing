import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import dns from 'dns';
import { promisify } from 'util';
import User from '../models/User.js';

const resolveMx = promisify(dns.resolveMx);

// Validate email with simple regex and DNS MX lookup
async function validateEmail(email) {
  // 1. Simple and effective regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: "Invalid email format" };
  }

  // 2. Check for invalid characters in local part (only allow letters, numbers, dots, underscores, hyphens)
  const localPart = email.split('@')[0];
  if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
    return { valid: false, reason: "Invalid email format" };
  }

  // 3. Additional syntax validation with validator library
  if (!validator.isEmail(email)) {
    return { valid: false, reason: "Invalid email format" };
  }

  // Extract domain
  const domain = email.split('@')[1];

  try {
    // 4. MX Record Lookup - verifies domain has mail servers
    const addresses = await resolveMx(domain);
    
    if (addresses && addresses.length > 0) {
      return { valid: true, reason: "Valid email with active mail server" };
    }
  } catch (err) {
    return { valid: false, reason: "Domain has no mail server or does not exist" };
  }

  return { valid: false, reason: "Email validation failed" };
}

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Validate email with DNS MX lookup
    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one uppercase letter' 
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one number' 
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one special character' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
