'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface SignInFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function SignInForm({ onSuccess, onClose }: SignInFormProps) {
  const { signin, error: authError, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setErrors({});
    setLoading(true);

    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email required';
    if (!formData.password) newErrors.password = 'Password required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await signin(formData.email, formData.password);
      onSuccess?.();
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
        <p className="text-gray-500 text-lg">Access your ChiefBaranda account</p>
      </div>

      {authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold text-red-700">Error</p>
            <p className="text-sm text-red-600 mt-0.5">{authError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2.5">
            Email Address
          </label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📧</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                errors.email 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200'
              } focus:outline-none`}
              disabled={loading}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-600 mt-2">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2.5">
            Password
          </label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                errors.password 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200'
              } focus:outline-none`}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lg hover:opacity-70 transition-opacity focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-600 mt-2">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between py-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-green-600" />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block animate-spin">⏳</span>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ✓ Sign In
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

