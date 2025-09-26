import React, { useState, useEffect } from 'react';
// import { useAuth } from '../hooks/useAuth';

export function AuthModal({ isOpen, onClose, initialMode = 'login', signIn, signUp, resetPassword, user }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'reset'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error'); // 'error' | 'success' | 'info'
  // const { user, signIn, signUp, resetPassword } = useAuth();

  // Close modal automatically when user logs in
  useEffect(() => {
    if (user && isOpen) {
      setLoading(false);
      showMessage('Successfully logged in!', 'success');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [user, isOpen, onClose]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
      });
      setMessage('');
    }
  }, [isOpen, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const showMessage = (text, type = 'error') => {
    setMessage(text);
    setMessageType(type);
  };

  const validateForm = () => {
    if (!formData.email) {
      showMessage('Email is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      showMessage('Please enter a valid email address');
      return false;
    }

    if (mode !== 'reset' && !formData.password) {
      showMessage('Password is required');
      return false;
    }

    if (mode === 'register') {
      if (!formData.displayName) {
        showMessage('Display name is required');
        return false;
      }

      if (formData.password.length < 6) {
        showMessage('Password must be at least 6 characters long');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        showMessage('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await signIn({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        
        // Don't show success message here - let useEffect handle it when user state updates
        
      } else if (mode === 'register') {
        const { error } = await signUp({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
        });
        
        if (error) throw error;
        
        showMessage('Account created! Please check your email for verification.', 'success');
        
      } else if (mode === 'reset') {
        const { error } = await resetPassword(formData.email);
        
        if (error) throw error;
        
        showMessage('Password reset email sent! Check your inbox.', 'success');
      }
    } catch (error) {
      showMessage(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {mode === 'login' && '🌿 Welcome Back'}
              {mode === 'register' && '🌱 Join Plant Care'}
              {mode === 'reset' && '🔐 Reset Password'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
              messageType === 'info' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
              'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Display Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="How should we call you?"
                disabled={loading}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          {/* Password (not for reset) */}
          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                disabled={loading}
              />
            </div>
          )}

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter password again"
                disabled={loading}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'login' && 'Signing In...'}
                {mode === 'register' && 'Creating Account...'}
                {mode === 'reset' && 'Sending Email...'}
              </>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'reset' && 'Send Reset Email'}
              </>
            )}
          </button>

          {/* Mode Switch Links */}
          <div className="text-center text-sm space-y-2">
            {mode === 'login' && (
              <>
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className="text-green-600 hover:text-green-700 font-medium"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-gray-600">
                  Forgot your password?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('reset')}
                    className="text-green-600 hover:text-green-700 font-medium"
                    disabled={loading}
                  >
                    Reset it
                  </button>
                </p>
              </>
            )}

            {mode === 'register' && (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-green-600 hover:text-green-700 font-medium"
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'reset' && (
              <p className="text-gray-600">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-green-600 hover:text-green-700 font-medium"
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}