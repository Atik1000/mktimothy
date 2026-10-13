"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUnsubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call for unsubscribing
    // TODO: Wire this up to your actual unsubscribe endpoint
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#E5F5ED] mb-6">
          <svg className="h-8 w-8 text-[#00A859]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 aabbss">Successfully Unsubscribed</h2>
        <p className="text-gray-600 mb-6">
          You have been successfully removed from our mailing list. You will no longer receive newsletter emails from us.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#00A859] hover:bg-[#008f4c] transition-colors shadow-md"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 aabbss">
          Unsubscribe
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We're sorry to see you go. Please confirm your email address below to unsubscribe from our newsletter.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleUnsubscribe}>
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#00A859] focus:border-[#00A859] focus:z-10 sm:text-sm transition-colors"
            placeholder="Email address"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white ${
              isSubmitting || !email ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all`}
          >
            {isSubmitting ? "Processing..." : "Unsubscribe"}
          </button>
        </div>
        <div className="text-center mt-4">
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
            Cancel and return to home
          </Link>
        </div>
      </form>
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-[rgba(0,0,0,0.05)_0px_10px_30px_0px]">
        <Suspense fallback={
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A859]"></div>
          </div>
        }>
          <UnsubscribeForm />
        </Suspense>
      </div>
    </div>
  );
}
