import { ApiHealthStatus } from "@/components/ApiHealthStatus";

export default function HomePage() {
  return (
    <main>
      <h1>Damaged Code</h1>
      <p>A Rick and Morty coding challenge.</p>
      <ApiHealthStatus />
    </main>
  );
}
