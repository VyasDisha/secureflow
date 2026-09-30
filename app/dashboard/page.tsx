import { redirect } from "next/navigation";
import { getCurrentUser } from "../../src/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "60px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Protected Dashboard</h1>

      <p>
        Welcome, <strong>{user.name}</strong>
      </p>

      <p>
        Email: <strong>{user.email}</strong>
      </p>

      <p>
        Role: <strong>{user.role.name}</strong>
      </p>

      <p>
        User ID: <strong>{user.id}</strong>
      </p>
    </main>
  );
}