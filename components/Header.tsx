/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
          
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="ChiefBaranda.ng Logo" 
                className="h-16 w-auto"
              />
              <span className="text-2xl font-bold text-gray-900">ChiefBaranda</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-green-600 transition-colors">
                Home
              </Link>
              <Link href="/categories" className="hover:text-green-600 transition-colors">
                Categories
              </Link>
              <Link href="/how-it-works" className="hover:text-green-600 transition-colors">
                How it works
              </Link>
              <Link href="/become-seller" className="hover:text-green-600 transition-colors">
                Become a seller
              </Link>
            </nav>

            {/* Auth Buttons - Desktop */}
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link 
                  href="/signin"
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4 relative">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.firstName}!
                </span>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b"
                    >
                      My Profile
                    </Link>
                    {user?.userType === 'seller' && (
                      <Link
                        href="/my-listings"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b"
                      >
                        My Listings
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

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
                <Link href="/" className="hover:text-green-600 transition-colors py-1">
                  Home
                </Link>
                <Link href="/categories" className="hover:text-green-600 transition-colors py-1">
                  Categories
                </Link>
                <Link href="/how-it-works" className="hover:text-green-600 transition-colors py-1">
                  How it works
                </Link>
                <Link href="/become-seller" className="hover:text-green-600 transition-colors py-1">
                  Become a seller
                </Link>
              </nav>

              {!isAuthenticated ? (
                <div className="flex flex-col gap-3 mt-6">
                  <Link 
                    href="/signin"
                    className="px-6 py-3 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className="px-6 py-3 text-center text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-6">
                  <Link
                    href="/profile"
                    className="px-6 py-3 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 text-center text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;