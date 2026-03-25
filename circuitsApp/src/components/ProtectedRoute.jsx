import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
	const { isAuthenticated, user, loading } = useAuth();

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<p>Loading...</p>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
		return <Navigate to="/" replace />;
	}

	return children;
};

export default ProtectedRoute;
