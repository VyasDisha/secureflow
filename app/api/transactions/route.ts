import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/prisma";
import { getCurrentUser } from "../../../src/lib/session";
import { sendTransactionCreatedEmail } from "../../../src/lib/email";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const transactions =
    user.role.name === "ADMIN"
      ? await prisma.transaction.findMany({
          orderBy: {
            createdAt: "desc",
          },
        })
      : await prisma.transaction.findMany({
          where: {
            userId: user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role.name,
    },
    transactions,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (user.role.name === "GUEST") {
    return NextResponse.json(
      { error: "Guests cannot create transactions" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const amount = Number(body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Amount must be a positive number" },
      { status: 400 },
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      reference: `TXN-${crypto.randomUUID()}`,
      userId: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "TRANSACTION_CREATED",
      metadata: {
        reference: transaction.reference,
        amount,
      },
      userId: user.id,
    },
  });
  await sendTransactionCreatedEmail({
  name: user.name,
  email: user.email,
  amount: transaction.amount.toString(),
  reference: transaction.reference,
  status: transaction.status,
});

  return NextResponse.json(
    {
      message: "Transaction created successfully",
      transaction: {
        id: transaction.id,
        amount: transaction.amount.toString(),
        status: transaction.status,
        reference: transaction.reference,
        userId: transaction.userId,
      },
    },
    { status: 201 },
  );
}