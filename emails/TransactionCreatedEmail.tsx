import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type TransactionCreatedEmailProps = {
  name: string;
  amount: string;
  reference: string;
  status: string;
};

export default function TransactionCreatedEmail({
  name,
  amount,
  reference,
  status,
}: TransactionCreatedEmailProps) {
  return (
    <Html>
      <Head />

      <Preview>
        Your transaction {reference} has been created successfully.
      </Preview>

      <Body
        style={{
          backgroundColor: "#f4f4f5",
          fontFamily: "Arial, sans-serif",
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "32px",
            borderRadius: "8px",
          }}
        >
          <Heading>Transaction Created</Heading>

          <Text>
            Hello {name},
          </Text>

          <Text>
            Your transaction has been created successfully.
          </Text>

          <Section>
            <Text>
              <strong>Amount:</strong> ₹{amount}
            </Text>

            <Text>
              <strong>Reference:</strong> {reference}
            </Text>

            <Text>
              <strong>Status:</strong> {status}
            </Text>
          </Section>

          <Text>
            Thank you for using SecureFlow.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}