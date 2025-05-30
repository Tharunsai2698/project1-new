import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ element: Element, ...rest }) => {
  const isAuthenticated = sessionStorage.getItem("authtoken");
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to Login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the element
  return <Element {...rest} />;
};

export default ProtectedRoute;
