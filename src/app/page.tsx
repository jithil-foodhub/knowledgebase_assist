'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Red Hero Section */}
      <div className="bg-[#d82d27] relative overflow-hidden">
        {/* Header */}
        <header className="relative z-10 w-full">
          <div className="max-w-6xl mx-auto px-6 py-5">
            <h1 className="text-xl font-bold text-white">
              FOODHUB <span className="font-normal">KNOWLEDGE</span>
            </h1>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Your complete guide to ordering, operations, and more
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Quick answers from our knowledge base — when you need information, we've got you covered.
            </p>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <div className="absolute top-20 right-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-32 w-24 h-24 border-4 border-white rounded-full"></div>
        </div>
      </div>

      {/* White Content Section */}
      <main className="flex-1 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              SELECT WHAT YOU NEED
            </h3>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Knowledge Base Card */}
            <Link href="/knowledge-base">
              <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#d82d27] hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-[#d82d27]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#d82d27]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    {/* Text */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[#d82d27] transition-colors">
                        Knowledge Base
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">Manage content sources</p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#d82d27] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Query Assistant Card */}
            <Link href="/conversation">
              <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#d82d27] hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-[#d82d27]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#d82d27]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Text */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[#d82d27] transition-colors">
                        Query Assistant
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">Ask questions instantly</p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#d82d27] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Foodhub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
