'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
        
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="ChiefBaranda.ng Logo" 
              className="h-16 w-auto"
            />
            <span className="text-2xl font-bold text-gray-900">ChiefBaranda.ng</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href=" " className="hover:text-green-600 transition-colors">
              Categories
            </Link>
            <Link href=" " className="hover:text-green-600 transition-colors">
              How it works
            </Link>
            <Link href=" " className="hover:text-green-600 transition-colors">
              Pre-order
            </Link>
            <Link href=" " className="hover:text-green-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href=" " className="hover:text-green-600 transition-colors">
              Terms & Conditions
            </Link>
            <Link href=" " className="hover:text-green-600 transition-colors">
              Become a seller
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href=" "
              className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href=" "
              className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6h12v12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4 text-sm font-medium text-gray-600">
              <Link href=" " className="hover:text-green-600 transition-colors py-1">
                Categories
              </Link>
              <Link href=" " className="hover:text-green-600 transition-colors py-1">
                How it works
              </Link>
              <Link href=" " className="hover:text-green-600 transition-colors py-1">
                Pre-order
              </Link>
              <Link href=" " className="hover:text-green-600 transition-colors py-1">
                Privacy Policy
              </Link>
              <Link href=" " className="hover:text-green-600 transition-colors py-1">
                Terms & Conditions
              </Link>
              <Link href=" " className="hover:text-green-600 transition-colors py-1">
                Become a seller
              </Link>
            </nav>

            <div className="flex flex-col gap-3 mt-6">
              <Link 
                href=" "
                className="px-6 py-3 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link 
                href=" "
                className="px-6 py-3 text-center text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;