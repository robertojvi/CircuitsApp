import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Validate token on component mount
		if (token) {
			validateToken();
		} else {
			setLoading(false);
		}
	}, []);

	const validateToken = async () => {
		try {
			const response = await fetch("http://localhost:8080/api/auth/validate", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setUser(data);
			} else {
				// Token is invalid, clear it
				clearAuth();
			}
		} catch (error) {
			console.error("Token validation failed:", error);
			clearAuth();
		} finally {
			setLoading(false);
		}
	};

	const login = async (email, password) => {
		try {
			const response = await fetch("http://localhost:8080/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Login failed");
			}

			const data = await response.json();
			setToken(data.token);
			setUser({
				email: data.email,
				firstName: data.firstName,
				lastName: data.lastName,
				role: data.role,
				userId: data.userId,
			});
			localStorage.setItem("token", data.token);
			return data;
		} catch (error) {
			throw error;
		}
	};

	const logout = () => {
		clearAuth();
	};

	const clearAuth = () => {
		setToken(null);
		setUser(null);
		localStorage.removeItem("token");
	};

	const changePassword = async (currentPassword, newPassword) => {
		try {
			const response = await fetch(
				"http://localhost:8080/api/auth/change-password",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						currentPassword,
						newPassword,
					}),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Password change failed");
			}

			return await response.json();
		} catch (error) {
			throw error;
		}
	};

	const value = {
		user,
		token,
		loading,
		login,
		logout,
		changePassword,
		isAuthenticated: !!token,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
