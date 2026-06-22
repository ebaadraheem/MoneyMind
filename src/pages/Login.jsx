import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import useStore from "../store/useStore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setLoading = useStore((state) => state.setLoading);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);

      let message = "Login failed. Please try again.";

      switch (error.code) {
        case "auth/user-not-found":
          message = "No user found with this email. Please register first.";
          break;
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-disabled":
          message =
            "Invalid credentials. Please check your email and password.";
          break;
        case "auth/too-many-requests":
          message = "Too many failed login attempts. Try again later.";
          break;
        default:
          message = `Login failed: ${error.message}`;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.form
        key="login"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <div>
          <img
            src="/user.png"
            alt="POS Logo"
            className="w-32 h-32 mx-auto mb-6"
          />
        </div>
        <h2 className="text-2xl font-bold text-blue-900/80 mb-6 text-center">
          SnapMart
        </h2>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-blue-900/80 text-sm font-bold mb-2"
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border w-full py-2 px-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-blue-900/80 text-sm font-bold mb-2"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border  w-full py-2 px-3 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-900/80 hover:bg-blue-900/95 cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          >
            Sign In
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default Login;
