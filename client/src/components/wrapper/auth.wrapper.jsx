import { Navigate } from "react-router-dom";


const isLoggedIn = () => {
  return !!localStorage.getItem("accessToken");
};

export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}