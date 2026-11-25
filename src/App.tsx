import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import WishlistPage from "./pages/WishlistPage";
import EditPage from "./pages/EditPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Lista" element={<WishlistPage />} />
        <Route path="/Edytuj/:token" element={<EditPage />} />
        <Route path="/Admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}