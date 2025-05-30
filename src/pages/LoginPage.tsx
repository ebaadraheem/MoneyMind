import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const GoogleIcon: React.FC = () => (
  <svg
    className="w-5 h-5 mr-3"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.096,44,30.603,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

const LoadingSpinnerIcon: React.FC = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- NEW: Handle Password Reset ---
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email to receive a reset link.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        "Password reset email sent! Check your inbox (and spam folder)."
      );
      setEmail("");
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      if (err.code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else if (err.code === "auth/user-not-found") {
        setError(
          "Failed to send reset email. Ensure the email is correct or try again later."
        );
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setEmail("");
      setLoading(false);
    }
  };
  // ---------------------------------

  const handleAuthAction = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (isForgotPassword) {
      handlePasswordReset();
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-credential":
          setError("Incorrect email or password. Please try again.");
          break;
        case "auth/email-already-in-use":
          setError("This email is already registered. Try logging in.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters long.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        default:
          console.error(
            "Unhandled Firebase Auth Error:",
            err.code,
            err.message
          );
          setError("An unexpected error occurred. Please try again.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in popup closed before completion.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
  };

  const activateForgotPasswordMode = () => {
    setIsForgotPassword(true);
    setIsLogin(false);
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
  };

  const deactivateForgotPasswordMode = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <form
        onSubmit={handleAuthAction}
        className="w-full max-w-sm md:max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-10 space-y-5 text-center"
      >
        <img src="/logo.png" alt="Logo" className="w-20  h-20 mx-auto mb-4" />
        <div className=" space-y-1.5 ">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isForgotPassword
              ? "Reset Password"
              : isLogin
              ? "Welcome Back!"
              : "Create Account"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isForgotPassword
              ? "Enter your email to receive a reset link."
              : isLogin
              ? "Login to your account"
              : "Sign up to get started"}
          </p>
        </div>
        {/* Combined Message Display Area */}
        <div className="text-xs font-semibold h-4 mb-2">
          {" "}
          {error && <p className="text-red-500">{error}</p>}
          {successMessage && <p className="text-green-600">{successMessage}</p>}
        </div>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
        />

        {!isForgotPassword && (
          <>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
            />
            {!isLogin && ( // Confirm password only for sign up
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
              />
            )}
          </>
        )}

        {/* Forgot Password Link - Only in Login mode */}
        {isLogin && !isForgotPassword && (
          <div className="text-right -mt-4 mb-4">
            {" "}
            <button
              type="button"
              onClick={activateForgotPasswordMode}
              className="text-xs cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 hover:underline focus:outline-none bg-transparent border-none p-0"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 cursor-pointer text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <LoadingSpinnerIcon />
          ) : isForgotPassword ? (
            "Send Reset Email"
          ) : isLogin ? (
            "Login"
          ) : (
            "Sign Up"
          )}
        </button>

        {/* Divider and Google Button - Hide in Forgot Password mode */}
        {!isForgotPassword && (
          <>
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300 dark:border-gray-600" />
              <span className="px-3 text-gray-400 text-xs">OR</span>
              <hr className="flex-grow border-gray-300 dark:border-gray-600" />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 cursor-pointer border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-medium flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          </>
        )}

        {/* Toggle Button or Back to Login */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          {" "}
          {isForgotPassword ? (
            <button
              type="button"
              onClick={deactivateForgotPasswordMode}
              className="text-blue-600 dark:text-blue-400 cursor-pointer font-semibold hover:underline ml-1 bg-transparent border-none p-0"
            >
              Back to Login
            </button>
          ) : (
            <>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 dark:text-blue-400 cursor-pointer font-semibold hover:underline ml-1 bg-transparent border-none p-0"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
