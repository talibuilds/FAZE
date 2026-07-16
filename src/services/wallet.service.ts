import prisma from "../db/prisma";

export interface WalletInfo {
  walletBalance: number;
  transactions: {
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    reason: string | null;
    createdAt: Date;
  }[];
}

class WalletService {
  /**
   * Returns the user's current wallet balance and last 20 transactions.
   */
  async getWallet(userId: string): Promise<WalletInfo> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { walletBalance: true },
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        balanceAfter: true,
        reason: true,
        createdAt: true,
      },
    });

    return {
      walletBalance: user.walletBalance,
      transactions,
    };
  }
}

export const walletService = new WalletService();
