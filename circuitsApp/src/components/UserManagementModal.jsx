import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

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
				style={{ maxWidth: "900px", maxHeight: "90vh" }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<h2>User Management</h2>
					<button
						onClick={onClose}
						style={{
							backgroundColor: "transparent",
							border: "none",
							color: "white",
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
							className="alert alert-error"
							style={{ marginBottom: "var(--spacing-lg)" }}
						>
							{error}
						</div>
					)}

					{!showCreateForm ? (
						<button
							onClick={() => setShowCreateForm(true)}
							className="btn btn-success"
							style={{ marginBottom: "var(--spacing-xl)" }}
						>
							Create New User
						</button>
					) : (
						<div
							className="card"
							style={{
								backgroundColor: "var(--color-surface-light)",
								marginBottom: "var(--spacing-xl)",
								border: "1px solid var(--color-border-light)",
							}}
						>
							<h3 style={{ marginTop: 0, marginBottom: "var(--spacing-lg)" }}>
								Create New User
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
							<p style={{ color: "var(--color-text-muted)" }}>
								Loading users...
							</p>
						</div>
					) : (
						<div className="table-container">
							<table className="table">
								<thead>
									<tr>
										<th>Email</th>
										<th>Name</th>
										<th>Role</th>
										<th>Status</th>
										<th>Actions</th>
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
