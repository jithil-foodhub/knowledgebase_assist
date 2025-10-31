'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h1 className="text-xl font-bold text-gray-900">
            Foodhub <span className="text-foodhub-red">Knowledge</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          {/* Title */}
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
              What would you like to do?
            </h2>
            <div className="w-20 h-0.5 bg-foodhub-red mx-auto"></div>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Knowledge Base Card */}
            <Link href="/knowledge-base">
              <div className="group relative bg-white rounded-3xl p-10 hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 overflow-hidden">
                {/* Top accent */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-foodhub-red via-foodhub-orange to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                
                <div className="relative z-10 text-center space-y-5">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foodhub-red/5 to-foodhub-orange/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-foodhub-red" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-gray-900">Knowledge Base</h3>
                </div>
              </div>
            </Link>

            {/* Query Assistant Card */}
            <Link href="/conversation">
              <div className="group relative bg-white rounded-3xl p-10 hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 overflow-hidden">
                {/* Top accent */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-foodhub-red via-foodhub-orange to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                
                <div className="relative z-10 text-center space-y-5">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foodhub-red/5 to-foodhub-orange/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-foodhub-red" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-gray-900">Query Assistant</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-5 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Foodhub</p>
        </div>
      </footer>
    </div>
  );
}
