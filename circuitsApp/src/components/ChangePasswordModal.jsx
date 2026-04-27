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

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>Change Password</h2>
				</div>

				<form onSubmit={handleSubmit} style={{ padding: "var(--spacing-xl)" }}>
					<div className="form-group">
						<label className="form-label">Current Password</label>
						<input
							type="password"
							placeholder="Enter current password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className="form-input"
							required
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label className="form-label">New Password</label>
						<input
							type="password"
							placeholder="Enter new password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="form-input"
							required
							disabled={loading}
						/>
					</div>

					<div className="form-group">
						<label className="form-label">Confirm New Password</label>
						<input
							type="password"
							placeholder="Confirm new password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
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

					{success && (
						<div
							className="alert alert-success"
							style={{ marginBottom: "var(--spacing-lg)" }}
						>
							{success}
						</div>
					)}

					<div
						style={{
							display: "flex",
							justifyContent: "flex-end",
							gap: "var(--spacing-md)",
						}}
					>
						<button
							type="button"
							onClick={onClose}
							className="btn btn-secondary"
							disabled={loading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn-primary"
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
