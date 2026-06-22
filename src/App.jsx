import Layout from "./pages/Layout";
import { AuthProvider } from "./hooks/useAuth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import POS from "./pages/POSScreen";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/pos" element={<POS />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
