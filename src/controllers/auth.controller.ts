import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });

    res.status(201).json({
      message: "Account created successfully",
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  });

  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, googleId, name } = req.body;
    
    if (!email || !googleId) {
      res.status(400).json({ error: { message: "Email and Google ID are required" } });
      return;
    }

    const result = await authService.googleLogin({ email, googleId, name });

    res.status(200).json({
      message: "Google login successful",
      data: result,
    });
  });
}

export const authController = new AuthController();
