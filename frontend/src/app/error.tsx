"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Error icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#ffdad6] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#ba1a1a"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#131b2e] mb-3">
          Something went wrong
        </h1>
        <p className="text-[#464555] text-sm leading-relaxed mb-2">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-[#777587] text-xs mb-8">
            Error ID: <code className="font-mono">{error.digest}</code>
          </p>
        )}

        <button
          onClick={reset}
          className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-sm font-medium rounded-lg transition-colors duration-150 active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
