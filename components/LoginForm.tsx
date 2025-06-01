"use client";

import type React from "react";
import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { sendPasswordResetEmail } from "firebase/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading: loginLoading, error: loginError } = useLogin();
  const { register, loading: regLoading, error: regError } = useRegister();
  const [isRegister, setIsRegister] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password validation (registration only)
    if (isRegister && password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    } else {
      setPasswordError("");
    }

    if (isRegister) {
      await register(email, password);
    } else {
      await login(email, password);
    }
  };

  // "Forgot password" handler
  const handleForgotPassword = async () => {
    setResetMessage("");
    if (!email) {
      setResetMessage("Please enter your email above first.");
      return;
    }
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setResetMessage(
        err?.message || "Failed to send password reset email. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">BMSC Connect</h1>
          <p className="text-gray-600 mt-2">
            Stay connected with your loved ones
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
            {isRegister ? "Create Account" : "Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                autoComplete="username"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {passwordError && (
                <div className="text-red-600 mt-1 text-sm">{passwordError}</div>
              )}
            </div>

            {/* Show "Forgot Password?" only in login mode */}
            {!isRegister && (
              <div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:underline text-sm"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Forgot Password?
                </button>
                {resetMessage && (
                  <div className="text-green-600 mt-1 text-sm">
                    {resetMessage}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || regLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading || regLoading
                ? "Loading..."
                : isRegister
                ? "Create Account"
                : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setPasswordError("");
                setResetMessage("");
              }}
              className="w-full text-blue-600 hover:text-blue-700 font-medium py-2"
            >
              {isRegister
                ? "Already have an account? Sign In"
                : "Need an account? Create one"}
            </button>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}
            {regError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {regError}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
