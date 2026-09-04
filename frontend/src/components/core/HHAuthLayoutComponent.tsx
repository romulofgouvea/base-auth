import React from 'react';
import { HHThemeToggle } from './HHThemeToggleComponent';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const HHAuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden overflow-y-auto bg-brand-primary transition-colors duration-300">
      {/* Decorative SVG geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <svg className="absolute w-[800px] h-[800px] -left-20 -top-20 opacity-20 text-white mix-blend-overlay" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" />
        </svg>
        <svg className="absolute w-[600px] h-[600px] -right-40 top-40 opacity-10 text-white mix-blend-overlay transform rotate-45" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" rx="10" />
        </svg>
        <svg className="absolute w-[400px] h-[400px] left-20 bottom-10 opacity-15 text-white mix-blend-overlay" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" />
        </svg>
      </div>

      <nav className="absolute top-0 w-full px-8 py-6 flex justify-between items-center bg-transparent z-50">
        <div className="flex items-center space-x-2.5 text-white">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M 20 20 L 20 80" />
            <path d="M 50 20 L 50 80" />
            <path d="M 80 20 L 80 80" />
            <path d="M 20 50 L 80 50" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Base Auth</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
            <HHThemeToggle />
          </div>
        </div>
      </nav>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row min-h-[600px] min-h-screen items-center py-12 md:py-0">
        {/* Left Side Text */}
        <div className="hidden md:flex flex-col justify-center w-1/2 h-full p-12 lg:p-20 min-h-[400px]">
          <div className="max-w-xl">
            <h1 className="text-white text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight drop-shadow-md">
              A complete auth system, ready to build on.
            </h1>
            <p className="mt-6 text-teal-50 text-lg lg:text-xl drop-shadow-sm font-medium">
              JWT sessions, roles &amp; permissions, password reset and email verification — out of the box.
            </p>
          </div>
        </div>

        {/* Right Side Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 min-h-[500px]">
          <div className="w-full max-w-md min-w-[320px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
