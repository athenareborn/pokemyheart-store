import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
          been moved or doesn&apos;t exist.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
