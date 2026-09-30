"use server";

import { prisma } from "../../src/lib/prisma";
import { requireUser } from "../../src/lib/session";

export async function createTransaction(formData: FormData) {
  try {
    const user = await requireUser();

    if (user.role.name === "GUEST") {
      return {
        success: false,
        error: "Guests cannot create transactions.",
      };
    }

    const amountValue = formData.get("amount");

    if (typeof amountValue !== "string") {
      return {
        success: false,
        error: "Amount is required.",
      };
    }

    const amount = Number(amountValue);

    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        success: false,
        error: "Enter a valid positive amount.",
      };
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          amount,
          reference: `TXN-${crypto.randomUUID()}`,
          userId: user.id,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "TRANSACTION_CREATED",
          metadata: {
            reference: created.reference,
            amount,
            createdBy: user.id,
          },
          userId: user.id,
        },
      });

      return created;
    });

    return {
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount.toString(),
        status: transaction.status,
        reference: transaction.reference,
      },
    };
  } catch (error) {
    console.error("Transaction action failed:", error);

    return {
      success: false,
      error: "Unable to create transaction.",
    };
  }
}