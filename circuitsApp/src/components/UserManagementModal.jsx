import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function UserManagementModal({ onClose }) {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newUser, setNewUser] = useState({
		email: "",
		password: "",
		firstName: "",
		lastName: "",
		role: "USER",
	});
	const [createError, setCreateError] = useState("");
	const [createSuccess, setCreateSuccess] = useState("");
	const { token } = useAuth();
	const { theme } = useTheme();

	// Theme-aware colors
	const themedBg = theme === "light" ? "#ffffff" : "#2c3e50";
	const themedBorder = theme === "light" ? "#e5e7eb" : "#4b6584";
	const themedText = theme === "light" ? "#1e293b" : "#ecf0f1";
	const themedMuted = theme === "light" ? "#64748b" : "#95a5a6";
	const themedInputBg = theme === "light" ? "#ffffff" : "#3a4f63";
	const themedTableBg = theme === "light" ? "#ffffff" : "#1a2332";
	const themedTableBorder = theme === "light" ? "#e5e7eb" : "#4b6584";
	const themedTableHeaderBg = theme === "light" ? "#f8fafc" : "#0f2438";
	const themedTableHeaderText = theme === "light" ? "#1e293b" : "#e2e8f0";
	const themedTableRowHover = theme === "light" ? "#f1f5f9" : "#2c3e50";

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		setError("");
		try {
			const response = await fetch("/api/users", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch users");
			}

			const data = await response.json();
			setUsers(data);
		} catch (err) {
			setError(err.message || "Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateUser = async (e) => {
		e.preventDefault();
		setCreateError("");
		setCreateSuccess("");

		try {
			const response = await fetch("/api/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(newUser),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create user");
			}

			setCreateSuccess("User created successfully!");
			setNewUser({
				email: "",
				password: "",
				firstName: "",
				lastName: "",
				role: "USER",
			});
			setTimeout(() => {
				fetchUsers();
				setShowCreateForm(false);
			}, 1500);
		} catch (err) {
			setCreateError(err.message || "Failed to create user");
		}
	};

	const handleDeleteUser = async (userId) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this user? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/users/${userId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete user");
			}

			fetchUsers();
		} catch (err) {
			setError(err.message || "Failed to delete user");
		}
	};

	const handleUpdateRole = async (userId, newRole) => {
		try {
			const response = await fetch(`/api/users/${userId}/role`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ role: newRole }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update role");
			}

			fetchUsers();
		} catch (err) {
			setError(err.message || "Failed to update role");
		}
	};

	const handleToggleUserStatus = async (userId, shouldDisable) => {
		try {
			const endpoint = shouldDisable ? "disable" : "enable";
			const response = await fetch(`/api/users/${userId}/${endpoint}`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update user status");
			}

			fetchUsers();
		} catch (err) {
			setError(err.message || "Failed to update user status");
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content"
				style={{
					maxWidth: "900px",
					maxHeight: "90vh",
					backgroundColor: themedBg,
					border: `1px solid ${themedBorder}`,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					style={{
						backgroundColor: "var(--color-modal-header-bg)",
						color: "var(--color-modal-header-text)",
						padding: "var(--spacing-xl)",
						borderBottom: "2px solid var(--color-primary)",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
						👥 User Management
					</h2>
					<button
						onClick={onClose}
						style={{
							backgroundColor: "transparent",
							border: "none",
							color: "var(--color-modal-header-text)",
							fontSize: "24px",
							cursor: "pointer",
							padding: 0,
						}}
					>
						×
					</button>
				</div>

				<div style={{ padding: "var(--spacing-xl)" }}>
					{error && (
						<div
							style={{
								backgroundColor: "#fee2e2",
								border: "1px solid #fecaca",
								color: "#7f1d1d",
								padding: "var(--spacing-lg)",
								borderRadius: "4px",
								marginBottom: "var(--spacing-lg)",
							}}
						>
							{error}
						</div>
					)}

					{!showCreateForm ? (
						<button
							onClick={() => setShowCreateForm(true)}
							style={{
								backgroundColor: "#10b981",
								color: "white",
								padding: "10px 20px",
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
								fontWeight: "600",
								marginBottom: "var(--spacing-xl)",
							}}
						>
							+ Create New User
						</button>
					) : (
						<div
							style={{
								backgroundColor: themedBg,
								marginBottom: "var(--spacing-xl)",
								border: `1px solid ${themedBorder}`,
								padding: "var(--spacing-lg)",
								borderRadius: "6px",
							}}
						>
							<h3
								style={{
									marginTop: 0,
									marginBottom: "var(--spacing-lg)",
									color: themedText,
									fontSize: "16px",
								}}
							>
								✨ Create New User
							</h3>

							<form onSubmit={handleCreateUser}>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "var(--spacing-lg)",
										marginBottom: "var(--spacing-lg)",
									}}
								>
									<input
										type="email"
										placeholder="Email"
										value={newUser.email}
										onChange={(e) =>
											setNewUser({ ...newUser, email: e.target.value })
										}
										className="form-input"
										required
									/>
									<input
										type="password"
										placeholder="Password"
										value={newUser.password}
										onChange={(e) =>
											setNewUser({ ...newUser, password: e.target.value })
										}
										className="form-input"
										required
									/>
									<input
										type="text"
										placeholder="First Name"
										value={newUser.firstName}
										onChange={(e) =>
											setNewUser({ ...newUser, firstName: e.target.value })
										}
										className="form-input"
										required
									/>
									<input
										type="text"
										placeholder="Last Name"
										value={newUser.lastName}
										onChange={(e) =>
											setNewUser({ ...newUser, lastName: e.target.value })
										}
										className="form-input"
										required
									/>
									<select
										value={newUser.role}
										onChange={(e) =>
											setNewUser({ ...newUser, role: e.target.value })
										}
										className="form-select"
									>
										<option value="USER">USER</option>
										<option value="NOC">NOC</option>
										<option value="ADMIN">ADMIN</option>
										<option value="SUPER">SUPER</option>
									</select>
								</div>

								{createError && (
									<div
										className="alert alert-error"
										style={{ marginBottom: "var(--spacing-lg)" }}
									>
										{createError}
									</div>
								)}

								{createSuccess && (
									<div
										className="alert alert-success"
										style={{ marginBottom: "var(--spacing-lg)" }}
									>
										{createSuccess}
									</div>
								)}

								<div style={{ display: "flex", gap: "var(--spacing-md)" }}>
									<button type="submit" className="btn btn-success">
										Create User
									</button>
									<button
										type="button"
										onClick={() => setShowCreateForm(false)}
										className="btn btn-secondary"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					)}

					{loading ? (
						<div style={{ textAlign: "center", padding: "var(--spacing-2xl)" }}>
							<p style={{ color: themedMuted }}>⏳ Loading users...</p>
						</div>
					) : (
						<div
							style={{
								overflow: "auto",
								borderRadius: "6px",
								border: `1px solid ${themedTableBorder}`,
							}}
						>
							<table
								style={{
									width: "100%",
									borderCollapse: "collapse",
								}}
							>
								<thead>
									<tr
										style={{
											backgroundColor: themedTableHeaderBg,
											borderBottom: `2px solid ${themedTableBorder}`,
										}}
									>
										<th
											style={{
												padding: "12px",
												color: themedTableHeaderText,
												fontWeight: "600",
												textAlign: "left",
												fontSize: "13px",
											}}
										>
											📧 Email
										</th>
										<th
											style={{
												padding: "12px",
												color: themedTableHeaderText,
												fontWeight: "600",
												textAlign: "left",
												fontSize: "13px",
											}}
										>
											👤 Name
										</th>
										<th
											style={{
												padding: "12px",
												color: themedTableHeaderText,
												fontWeight: "600",
												textAlign: "left",
												fontSize: "13px",
											}}
										>
											🎭 Role
										</th>
										<th
											style={{
												padding: "12px",
												color: themedTableHeaderText,
												fontWeight: "600",
												textAlign: "left",
												fontSize: "13px",
											}}
										>
											✨ Status
										</th>
										<th
											style={{
												padding: "12px",
												color: themedTableHeaderText,
												fontWeight: "600",
												textAlign: "left",
												fontSize: "13px",
											}}
										>
											⚡ Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user) => (
										<tr key={user.id}>
											<td>{user.email}</td>
											<td>
												{user.firstName} {user.lastName}
											</td>
											<td>
												<select
													value={user.role}
													onChange={(e) =>
														handleUpdateRole(user.id, e.target.value)
													}
													className="form-select"
													style={{
														fontSize: "var(--font-size-sm)",
														padding: "var(--spacing-sm) var(--spacing-md)",
													}}
												>
													<option value="USER">USER</option>
													<option value="NOC">NOC</option>
													<option value="ADMIN">ADMIN</option>
													<option value="SUPER">SUPER</option>
												</select>
											</td>
											<td>
												<span
													className={
														user.enabled ? "status-active" : "status-inactive"
													}
												>
													{user.enabled ? "Enabled" : "Disabled"}
												</span>
											</td>
											<td>
												<div
													style={{ display: "flex", gap: "var(--spacing-sm)" }}
												>
													<button
														onClick={() =>
															handleToggleUserStatus(user.id, user.enabled)
														}
														className="btn btn-warning"
														style={{
															fontSize: "var(--font-size-sm)",
															padding: "4px 8px",
														}}
													>
														{user.enabled ? "Disable" : "Enable"}
													</button>
													<button
														onClick={() => handleDeleteUser(user.id)}
														className="btn btn-danger"
														style={{
															fontSize: "var(--font-size-sm)",
															padding: "4px 8px",
														}}
													>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>

							{users.length === 0 && (
								<div
									style={{
										textAlign: "center",
										padding: "var(--spacing-2xl)",
										color: "var(--color-text-muted)",
									}}
								>
									No users found
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default UserManagementModal;
