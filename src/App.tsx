import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

function App() {
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="w-12 max-sm:w-10 max-sm:h-10 h-12 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
        Loading...
      </p>
    </div>
  );

  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <LoadingSpinner />; // loading spinner while checking auth state
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? <ChatPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
