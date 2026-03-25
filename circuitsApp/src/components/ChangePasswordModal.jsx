import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function ChangePasswordModal({ onClose }) {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const { changePassword } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (newPassword !== confirmPassword) {
			setError("New passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			setError("New password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			await changePassword(currentPassword, newPassword);
			setSuccess("Password changed successfully!");
			setTimeout(() => {
				onClose();
			}, 1500);
		} catch (err) {
			setError(err.message || "Failed to change password");
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
		padding: "12px 20px",
		backgroundColor: "#4299E1",
		color: "white",
		border: "none",
		borderRadius: "4px",
		fontSize: "14px",
		fontWeight: "600",
		cursor: "pointer",
	};

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0,0,0,0.5)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				zIndex: 1001,
			}}
		>
			<div
				style={{
					backgroundColor: "white",
					padding: "30px",
					borderRadius: "8px",
					width: "90%",
					maxWidth: "400px",
				}}
			>
				<h2
					style={{
						marginBottom: "20px",
						backgroundColor: "#2c3e50",
						color: "white",
						padding: "10px 20px",
						borderRadius: "4px",
						textAlign: "center",
						margin: "-30px -30px 20px -30px",
					}}
				>
					Change Password
				</h2>

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
							Current Password
						</label>
						<input
							type="password"
							placeholder="Enter current password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
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
							New Password
						</label>
						<input
							type="password"
							placeholder="Enter new password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
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
							Confirm New Password
						</label>
						<input
							type="password"
							placeholder="Confirm new password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
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

					{success && (
						<div
							style={{
								backgroundColor: "#efe",
								color: "#3c3",
								padding: "12px",
								borderRadius: "4px",
								marginBottom: "15px",
								fontSize: "14px",
								border: "1px solid #cfc",
							}}
						>
							{success}
						</div>
					)}

					<div
						style={{
							display: "flex",
							justifyContent: "flex-end",
							gap: "10px",
						}}
					>
						<button
							type="button"
							onClick={onClose}
							style={{
								...buttonStyle,
								backgroundColor: "#9CA3AF",
								opacity: loading ? 0.6 : 1,
								cursor: loading ? "not-allowed" : "pointer",
							}}
							disabled={loading}
						>
							Cancel
						</button>
						<button
							type="submit"
							style={{
								...buttonStyle,
								opacity: loading ? 0.6 : 1,
								cursor: loading ? "not-allowed" : "pointer",
							}}
							disabled={loading}
						>
							{loading ? "Changing..." : "Change Password"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default ChangePasswordModal;
