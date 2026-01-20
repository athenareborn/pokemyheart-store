"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-destructive/20">500</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 text-muted-foreground">
          We encountered an unexpected error. Please try again, and if the
          problem persists, contact our support team.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} size="lg">
            Try again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
