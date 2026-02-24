import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: JSX.Element;
}


export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // If still loading, show spinner
  if (loading) return <div>Loading...</div>;

  // If not logged in, redirect to home
  if (!user) return <Navigate to="/" replace />;

  // If logged in, render children
  return children;
}