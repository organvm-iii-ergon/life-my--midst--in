'use client';

import { useRouter } from 'next/navigation';
import { NeoCard } from '@in-midst-my-life/design-system';

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <NeoCard variant="obsidian" className="max-w-md w-full p-8 text-center border-gray-800">
        <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-4xl text-gray-500">✕</div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Checkout Cancelled</h1>
        <p className="text-gray-400 mb-8">Your payment was cancelled. No charges were made.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/pricing')}
            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 px-6 rounded-lg transition-all"
          >
            Back to Pricing
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-transparent hover:bg-gray-900 text-gray-400 font-bold py-3 px-6 rounded-lg border border-gray-800 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </NeoCard>
    </div>
  );
}
