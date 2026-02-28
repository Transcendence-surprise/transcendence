// Example Protected Route Component
// import { useAuth } from '../hooks/useAuth';
// import { ReactNode } from 'react';

// interface ProtectedRouteProps {
//   children: ReactNode;
//   requiredRole?: string;
//   fallback?: ReactNode;
// }

// export default function ProtectedRoute({
//   children,
//   requiredRole,
//   fallback,
// }: ProtectedRouteProps) {
//   const { user, loading, hasRole } = useAuth();

//   if (loading) {
//     return <div></div>;
//   }

//   if (!user) {
//     return (
//       fallback ?? (
//         <div></div>
//       )
//     );
//   }

//   if (requiredRole && !hasRole(requiredRole)) {
//     return (
//       fallback ?? (
//         <div></div>
//       )
//     );
//   }

//   return <>{children}</>;
// }

// Usage examples:
// <ProtectedRoute>
//   <Dashboard />
// </ProtectedRoute>
//
// <ProtectedRoute requiredRole="admin">
//   <AdminPanel />
// </ProtectedRoute>
