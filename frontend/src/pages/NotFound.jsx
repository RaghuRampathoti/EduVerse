import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold mt-4">Page not found</h1>
      <p className="text-sm text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/login" className="mt-6">
        <Button>Back to Login</Button>
      </Link>
    </div>
  );
}
