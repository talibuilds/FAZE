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
}

export const walletController = new WalletController();
