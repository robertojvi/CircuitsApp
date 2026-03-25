import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

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

	const inputStyle = {
		width: "100%",
		padding: "12px",
		marginBottom: "15px",
		border: "1px solid #ddd",
		borderRadius: "4px",
		fontSize: "14px",
		boxSizing: "border-box",
	};

	const buttonStyle = {
		width: "100%",
		padding: "12px",
		backgroundColor: "#4299E1",
		color: "white",
		border: "none",
		borderRadius: "4px",
		fontSize: "16px",
		fontWeight: "600",
		cursor: "pointer",
		marginTop: "10px",
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				backgroundColor: "#f5f5f5",
				padding: "20px",
			}}
		>
			<div
				style={{
					backgroundColor: "white",
					padding: "40px",
					borderRadius: "8px",
					boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
					width: "100%",
					maxWidth: "400px",
				}}
			>
				<h1
					style={{
						textAlign: "center",
						marginBottom: "30px",
						color: "#2c3e50",
						fontSize: "28px",
					}}
				>
					AccessParks Circuits
				</h1>

				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "5px",
								fontWeight: "500",
								color: "#333",
								fontSize: "14px",
							}}
						>
							Email
						</label>
						<input
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							style={inputStyle}
							required
							disabled={loading}
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "5px",
								fontWeight: "500",
								color: "#333",
								fontSize: "14px",
							}}
						>
							Password
						</label>
						<input
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							style={inputStyle}
							required
							disabled={loading}
						/>
					</div>

					{error && (
						<div
							style={{
								backgroundColor: "#fee",
								color: "#c33",
								padding: "12px",
								borderRadius: "4px",
								marginBottom: "15px",
								fontSize: "14px",
								border: "1px solid #fcc",
							}}
						>
							{error}
						</div>
					)}

					<button
						type="submit"
						style={{
							...buttonStyle,
							opacity: loading ? 0.6 : 1,
							cursor: loading ? "not-allowed" : "pointer",
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
