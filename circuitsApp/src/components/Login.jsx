import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AccessLogo from "../images/Access.png";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();
	const { theme } = useTheme();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
			navigate("/");
		} catch (err) {
			setError(err.message || "Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				background:
					theme === "light"
						? "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
						: "linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-dark-bg-secondary) 100%)",
				padding: "var(--spacing-lg)",
			}}
		>
			<div
				className="card"
				style={{
					maxWidth: "420px",
					backgroundColor:
						theme === "light" ? "white" : "var(--color-dark-bg-secondary)",
					color: theme === "light" ? "#1a1a1a" : "#ecf0f1",
					border: `1px solid ${theme === "light" ? "#bdbdbd" : "#4b6584"}`,
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						marginBottom: "var(--spacing-xl)",
					}}
				>
					<img
						src={AccessLogo}
						alt="AccessParks Logo"
						style={{
							height: "80px",
							width: "auto",
							objectFit: "contain",
							filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
						}}
					/>
				</div>

				<h1
					style={{
						textAlign: "center",
						marginBottom: "var(--spacing-2xl)",
						color: theme === "light" ? "#1a1a1a" : "#ecf0f1",
						fontSize: "var(--font-size-2xl)",
					}}
				>
					AccessParks Circuits
				</h1>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label className="form-label">Email</label>
						<input
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="form-input"
							required
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label className="form-label">Password</label>
						<input
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="form-input"
							required
							disabled={loading}
						/>
					</div>

					{error && (
						<div
							className="alert alert-error"
							style={{ marginBottom: "var(--spacing-lg)" }}
						>
							{error}
						</div>
					)}

					<button
						type="submit"
						className="btn btn-primary"
						style={{
							width: "100%",
							padding: "var(--spacing-md) var(--spacing-lg)",
							marginTop: "var(--spacing-md)",
							fontSize: "var(--font-size-base)",
							fontWeight: "600",
						}}
						disabled={loading}
					>
						{loading ? "Logging in..." : "Log In"}
					</button>
				</form>
			</div>
		</div>
	);
}

export default Login;
