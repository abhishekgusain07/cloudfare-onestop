import React from 'react';

const FeatureShowcase = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-pink-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="relative text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sparkles w-4 h-4 inline-block mr-2"
              aria-hidden="true"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
              <path d="M20 3v4"></path>
              <path d="M22 5h-4"></path>
              <path d="M4 17v2"></path>
              <path d="M5 18H3"></path>
            </svg>
            Powerful Tools
          </span>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Features That Make You Shine</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All the tools you need to create, edit, and publish short-form videos that engage your audience.
          </p>
        </div>

        <div className="space-y-24">
          {/* Section 1: Connect All Your Accounts */}
          <section className="relative flex flex-col md:flex-row items-center gap-10 md:gap-16 bg-gradient-to-br from-red-50 to-white p-8 md:p-16 rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-red-100 opacity-20 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="flex-1 z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-600 p-3 rounded-xl shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-link2 lucide-link-2 w-6 h-6"
                    aria-hidden="true"
                  >
                    <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                    <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                    <line x1="8" x2="16" y1="12" y2="12"></line>
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Connect All Your Accounts</h2>
              </div>
              <p className="text-gray-600 text-base md:text-lg">
                Run multiple brands or clients with ease — all posts in one dashboard.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check text-red-500 w-5 h-5 mr-2"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  Youtube, TikTok, Instagram
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check text-red-500 w-5 h-5 mr-2"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  Unified analytics
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check text-red-500 w-5 h-5 mr-2"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  Client access levels
                </li>
              </ul>
            </div>
            <div className="flex-1 max-w-md w-full z-10">
              <div className="bg-white border border-red-200 rounded-2xl shadow-md p-6">
                {/* Consider replacing with Next.js Image if applicable, or adjust path for standard React */}
                <img
                  alt="Social Media Platforms"
                  fetchPriority="high"
                  width="600"
                  height="600"
                  decoding="async"
                  data-nimg="1"
                  className="w-full object-contain"
                  style={{ color: 'transparent' }}
                  srcSet="/_next/image?url=%2FPlattforms.png&w=640&q=75 1x, /_next/image?url=%2FPlattforms.png&w=1200&q=75 2x"
                  src="/_next/image?url=%2FPlattforms.png&w=1200&q=75"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Instant AI Video Generator */}
          <section className="relative flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16 bg-gradient-to-br from-blue-50 to-white p-8 md:p-16 rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-100 opacity-20 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="flex-1 z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-wand-sparkles w-6 h-6"
                    aria-hidden="true"
                  >
                    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path>
                    <path d="m14 7 3 3"></path>
                    <path d="M5 6v4"></path>
                    <path d="M19 14v4"></path>
                    <path d="M10 2v2"></path>
                    <path d="M7 8H3"></path>
                    <path d="M21 16h-4"></path>
                    <path d="M11 3H9"></path>
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Instant AI Video Generator</h2>
              </div>
              <p className="text-gray-600 text-base md:text-lg">
                Paste any YouTube link — our AI finds viral moments, adds captions, music, and generates ready-to-post Shorts.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check text-blue-500 w-5 h-5 mr-2"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  One-click scheduling
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check text-blue-500 w-5 h-5 mr-2"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  No editing skills needed
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check text-blue-500 w-5 h-5 mr-2"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  Perfect for any content
                </li>
              </ul>
            </div>
            <div className="flex-1 max-w-md w-full z-10">
              <div className="bg-white border border-blue-200 rounded-2xl shadow-md p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 place-items-center">
                <div className="flex flex-col items-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-youtube w-8 h-8 text-red-500 mb-1"
                    aria-hidden="true"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17Z"></path>
                    <path d="m10 15 5-3-5-3z"></path>
                  </svg>
                  <span className="text-sm text-gray-700">Paste Link</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sparkles w-8 h-8 text-blue-500 mb-1 animate-pulse"
                    aria-hidden="true"
                  >
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                    <path d="M20 3v4"></path>
                    <path d="M22 5h-4"></path>
                    <path d="M4 17v2"></path>
                    <path d="M5 18H3"></path>
                  </svg>
                  <span className="text-sm text-gray-700">AI Analyzes</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-wand-sparkles w-8 h-8 text-indigo-500 mb-1"
                    aria-hidden="true"
                  >
                    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path>
                    <path d="m14 7 3 3"></path>
                    <path d="M5 6v4"></path>
                    <path d="M19 14v4"></path>
                    <path d="M10 2v2"></path>
                    <path d="M7 8H3"></path>
                    <path d="M21 16h-4"></path>
                    <path d="M11 3H9"></path>
                  </svg>
                  <span className="text-sm text-gray-700">Captions</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-calendar w-8 h-8 text-purple-500 mb-1"
                    aria-hidden="true"
                  >
                    <path d="M8 2v4"></path>
                    <path d="M16 2v4"></path>
                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                    <path d="M3 10h18"></path>
                  </svg>
                  <span className="text-sm text-gray-700">Schedule</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: One-Click AI Scheduler */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-white p-10 md:p-16 shadow-2xl border border-purple-100">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-100 opacity-20 rounded-full blur-3xl pointer-events-none z-0"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-xl shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-calendar-check w-6 h-6"
                      aria-hidden="true"
                    >
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                      <path d="m9 16 2 2 4-4"></path>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">One-Click AI Scheduler</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Let AI batch and schedule your content across platforms — no guessing, no manual setup. Just upload and go.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700 text-base">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-purple-500 w-5 h-5 mr-2"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    AI picks the best times for max engagement
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-purple-500 w-5 h-5 mr-2"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    Cross-post to Shorts, Reels &amp; TikTok
                  </li>
                  <li className="flex items-center text-gray-700 text-base">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-check text-purple-500 w-5 h-5 mr-2"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                    Schedule a full month in under a minute
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="relative bg-white border border-purple-200 rounded-2xl shadow-lg p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-youtube w-6 h-6 text-red-500"
                        aria-hidden="true"
                      >
                        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17Z"></path>
                        <path d="m10 15 5-3-5-3z"></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-instagram w-6 h-6 text-pink-500"
                        aria-hidden="true"
                      >
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-clock3 lucide-clock-3 w-6 h-6 text-black"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16.5 12"></polyline>
                      </svg>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-sparkles w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                        <path d="M20 3v4"></path>
                        <path d="M22 5h-4"></path>
                        <path d="M4 17v2"></path>
                        <path d="M5 18H3"></path>
                      </svg>
                      AI Optimized Times
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm text-gray-800">
                      <span>🎬 "Best Moments"</span>
                      <span className="text-gray-500">Mon · 10:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-800">
                      <span>🎤 "Mic Drop"</span>
                      <span className="text-gray-500">Wed · 2:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-800">
                      <span>💥 "Quick Wins"</span>
                      <span className="text-gray-500">Fri · 6:00 PM</span>
                    </div>
                  </div>
                  <a
                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-xl shadow-md transition-all duration-200 text-center"
                    href="/signup"
                  >
                    🚀 Schedule All with AI
                  </a>
                  <p className="text-center text-xs text-gray-500">
                    Posts optimized for max reach &amp; engagement
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;