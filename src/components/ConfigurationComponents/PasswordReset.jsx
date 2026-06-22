import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import { auth } from "../../firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  signOut,
} from "firebase/auth";

const PasswordReset = () => {
  const { setLoading, setError, loading } = useStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        try {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          ) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (anonError) {
          console.error("Failed to sign in anonymously:", anonError);
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      toast.dismiss();

      if (!isAuthReady) {
        toast.error("Authentication system not ready. Please wait.");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to reset your password.");
        return;
      }

      if (!oldPassword || !newPassword || !confirmNewPassword) {
        toast.error("Please fill in all password fields.");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        toast.error("New passwords do not match.");
        return;
      }

      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const credential = EmailAuthProvider.credential(
          user.email,
          oldPassword
        );
        await reauthenticateWithCredential(user, credential);

        // 2. Update the password
        await updatePassword(user, newPassword);
        toast.success("Password reset successfully!");

        await signOut(auth);
        // Clear the form
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } catch (firebaseError) {
        let errorMessage = "Failed to reset password. Please try again.";
        console.error("Firebase Password Reset Error:", firebaseError);

        switch (firebaseError.code) {
          case "auth/invalid-credential":
            errorMessage =
              "Invalid credentials provided. Please check your old password.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect old password. Please try again.";
            break;
          case "auth/user-not-found":
            errorMessage = "User not found. Please log in again.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address.";
            break;
          case "auth/requires-recent-login":
            errorMessage =
              "Please log out and log back in to reset your password.";
            break;
          case "auth/weak-password":
            errorMessage =
              "The new password is too weak. Please choose a stronger one.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later.";
            break;
          default:
            errorMessage = firebaseError.message || errorMessage;
        }
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      oldPassword,
      newPassword,
      confirmNewPassword,
      user,
      setLoading,
      setError,
      isAuthReady,
    ]
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto my-8">
      <h2 className="text-2xl max-sm:text-xl font-bold text-blue-900/95 mb-6 text-center flex items-center justify-center">
        <img
          src="/lock.png"
          className="h-7 w-7 max-sm:w-6 max-sm:h-6 mr-2 "
          alt=""
        />
        Reset Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="oldPassword"
            className="block text-sm max-sm:text-xs  font-medium text-gray-700 mb-1"
          >
            Old Password
          </label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm max-sm:text-xs  font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm max-sm:text-xs  font-medium text-gray-700 mb-1"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="mt-1 block max-sm:text-sm w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-900/90 focus:border-blue-900/90 sm:text-sm"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isAuthReady}
          className="w-full px-4 py-2 cursor-pointer text-base font-medium text-white bg-blue-900/80 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordReset;
