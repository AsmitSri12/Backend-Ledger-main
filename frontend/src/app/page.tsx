'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Backend Ledger</h1>
      <p className="text-gray-600 mb-8">Your financial dashboard</p>
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Login
        </Link>
        <Link 
          href="/register" 
          className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium border border-gray-300"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
