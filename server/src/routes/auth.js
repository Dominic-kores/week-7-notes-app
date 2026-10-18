
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/auth.js";

const router = Router();

// Never expose sensitive database fields.
function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

// Sign a JWT valid for 24 hours.
function createToken(user) {
  return jwt.sign(
    {
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: "24h",
      algorithm: "HS256",
    }
  );
}

// POST /api/auth/register
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      // Check if the email has already been registered.
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already registered",
        });
      }

      // bcrypt automatically generates a random salt.
      // Cost factor 12 makes password guessing more expensive.
      const passwordHash = await bcrypt.hash(password, 12);

      // Role defaults to USER in the Prisma schema.
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      const token = createToken(user);

      return res.status(201).json({
        message: "Registration successful",
        token,
        user: safeUser(user),
      });
    } catch (error) {
      // Handles competing requests registering the same email.
      if (error.code === "P2002") {
        return res.status(409).json({
          message: "Email is already registered",
        });
      }

      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Never reveal whether email or password was incorrect.
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // Compare password against stored salted bcrypt hash.
      const validPassword = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const token = createToken(user);

      return res.status(200).json({
        message: "Login successful",
        token,
        user: safeUser(user),
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
// Only accessible when authenticated.
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(401).json({
        message: "User account no longer exists",
      });
    }

    return res.json({
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
