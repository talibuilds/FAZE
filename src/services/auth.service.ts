import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma";
import { config } from "../config";
import { AppError } from "../utils/AppError";
import { JwtPayload } from "../middleware/authenticate";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password?: string;
  googleId?: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    walletBalance: number;
    createdAt: Date;
  };
}

class AuthService {
  /**
   * Register a new user.
   * - Hashes password with bcrypt (12 rounds)
   * - Creates user with default walletBalance of 500
   * - Returns JWT + sanitized user (no passwordHash)
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password } = input;

    // Check for existing email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw AppError.conflict("An account with this email already exists", "EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    // Create user and initial transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          walletBalance: 500, // 500 starting credits
        },
      });

      // Initial top-up record
      await tx.transaction.create({
        data: {
          userId: newUser.id,
          type: "credit",
          amount: 500,
          balanceAfter: 500,
          reason: "signup_bonus",
        },
      });

      return newUser;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "register_success",
        metadata: { email },
      },
    });

    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Login with email + password.
   * - Validates credentials
   * - Returns JWT + sanitized user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    if (!password) {
      throw AppError.badRequest("Password is required for standard login");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      await prisma.auditLog.create({
        data: {
          action: "login_failed",
          metadata: { email, reason: "user_not_found_or_no_password" },
        },
      });
      throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "login_failed",
          metadata: { email, reason: "wrong_password" },
        },
      });
      throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "login_success",
      },
    });

    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Google Auth Login/Register
   */
  async googleLogin(input: LoginInput): Promise<AuthResponse> {
    const { email, googleId, name } = input;

    if (!googleId) {
      throw AppError.badRequest("Google ID is required");
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user for Google Auth
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            name: name || "User",
            googleId,
            walletBalance: 500,
          },
        });

        await tx.transaction.create({
          data: {
            userId: newUser.id,
            type: "credit",
            amount: 500,
            balanceAfter: 500,
            reason: "signup_bonus_google",
          },
        });

        return newUser;
      });

      await prisma.auditLog.create({
        data: { userId: user.id, action: "register_success_google", metadata: { email } },
      });
    } else {
      // If user exists but has no googleId, link it
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
      
      await prisma.auditLog.create({
        data: { userId: user.id, action: "login_success_google" },
      });
    }

    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt,
      },
    };
  }

  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
