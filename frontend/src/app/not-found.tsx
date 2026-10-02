import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Large 404 number */}
        <div className="relative mb-8">
          <span className="text-[160px] font-bold leading-none text-[#eaedff] select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-[#4f46e5] flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#131b2e] mb-3">
          Page not found
        </h1>
        <p className="text-[#464555] text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={ROUTES.dashboard}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#4f46e5] hover:bg-[#3525cd] text-white text-sm font-medium rounded-lg transition-colors duration-150 active:scale-[0.98]"
          >
            Go to Dashboard
          </Link>
          <Link
            href={ROUTES.home}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-[#c7c4d8] hover:bg-[#f2f3ff] text-[#131b2e] text-sm font-medium rounded-lg transition-colors duration-150"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
