import { Resend } from "resend";
import { render } from "@react-email/render";
import TransactionCreatedEmail from "../../emails/TransactionCreatedEmail";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(resendApiKey);

type TransactionEmailData = {
  name: string;
  email: string;
  amount: string;
  reference: string;
  status: string;
};

export async function sendTransactionCreatedEmail(
  data: TransactionEmailData,
) {
  const emailHtml = await render(
    TransactionCreatedEmail({
      name: data.name,
      amount: data.amount,
      reference: data.reference,
      status: data.status,
    }),
  );

  return resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ??
      "SecureFlow <onboarding@resend.dev>",
    to: data.email,
    subject: `Transaction Created - ${data.reference}`,
    html: emailHtml,
  });
}