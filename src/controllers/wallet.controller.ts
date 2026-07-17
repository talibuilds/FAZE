import { Request, Response } from "express";
import { walletService } from "../services/wallet.service";
import { asyncHandler } from "../utils/asyncHandler";

class WalletController {
  getWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const wallet = await walletService.getWallet(userId);

    res.status(200).json({
      message: "Wallet retrieved successfully",
      data: wallet,
    });
  });
  addBalance = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }
    
    const wallet = await walletService.addBalance(userId, amount);

    res.status(200).json({
      message: "Balance added successfully",
      data: wallet,
    });
  });
}

export const walletController = new WalletController();
