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
			const response = await fetch("http://localhost:8080/api/users", {
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
			const response = await fetch("http://localhost:8080/api/users", {
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
			const response = await fetch(
				`http://localhost:8080/api/users/${userId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

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
			const response = await fetch(
				`http://localhost:8080/api/users/${userId}/role`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ role: newRole }),
				},
			);

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
			const response = await fetch(
				`http://localhost:8080/api/users/${userId}/${endpoint}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update user status");
			}

			fetchUsers();
		} catch (err) {
			setError(err.message || "Failed to update user status");
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
				padding: "20px",
			}}
		>
			<div
				style={{
					backgroundColor: "white",
					borderRadius: "8px",
					width: "90%",
					maxWidth: "900px",
					maxHeight: "90vh",
					overflow: "auto",
				}}
			>
				<div
					style={{
						backgroundColor: "#2c3e50",
						color: "white",
						padding: "20px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						borderTopLeftRadius: "8px",
						borderTopRightRadius: "8px",
					}}
				>
					<h2 style={{ margin: 0 }}>User Management</h2>
					<button
						onClick={onClose}
						style={{
							backgroundColor: "transparent",
							border: "none",
							color: "white",
							fontSize: "24px",
							cursor: "pointer",
						}}
					>
						×
					</button>
				</div>

				<div style={{ padding: "20px" }}>
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

					{!showCreateForm ? (
						<button
							onClick={() => setShowCreateForm(true)}
							style={{
								...buttonStyle,
								marginBottom: "20px",
								backgroundColor: "#27ae60",
							}}
						>
							Create New User
						</button>
					) : (
						<div
							style={{
								backgroundColor: "#f9f9f9",
								padding: "20px",
								borderRadius: "8px",
								marginBottom: "20px",
								border: "1px solid #eee",
							}}
						>
							<h3
								style={{
									marginTop: 0,
									marginBottom: "15px",
									color: "#2c3e50",
								}}
							>
								Create New User
							</h3>

							<form onSubmit={handleCreateUser}>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "15px",
									}}
								>
									<input
										type="email"
										placeholder="Email"
										value={newUser.email}
										onChange={(e) =>
											setNewUser({ ...newUser, email: e.target.value })
										}
										style={inputStyle}
										required
									/>
									<input
										type="password"
										placeholder="Password"
										value={newUser.password}
										onChange={(e) =>
											setNewUser({ ...newUser, password: e.target.value })
										}
										style={inputStyle}
										required
									/>
									<input
										type="text"
										placeholder="First Name"
										value={newUser.firstName}
										onChange={(e) =>
											setNewUser({ ...newUser, firstName: e.target.value })
										}
										style={inputStyle}
										required
									/>
									<input
										type="text"
										placeholder="Last Name"
										value={newUser.lastName}
										onChange={(e) =>
											setNewUser({ ...newUser, lastName: e.target.value })
										}
										style={inputStyle}
										required
									/>
									<select
										value={newUser.role}
										onChange={(e) =>
											setNewUser({ ...newUser, role: e.target.value })
										}
										style={inputStyle}
									>
										<option value="USER">USER</option>
										<option value="ADMIN">ADMIN</option>
										<option value="SUPER">SUPER</option>
									</select>
								</div>

								{createError && (
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
										{createError}
									</div>
								)}

								{createSuccess && (
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
										{createSuccess}
									</div>
								)}

								<div
									style={{
										display: "flex",
										gap: "10px",
										marginTop: "15px",
									}}
								>
									<button
										type="submit"
										style={{
											...buttonStyle,
											backgroundColor: "#27ae60",
										}}
									>
										Create User
									</button>
									<button
										type="button"
										onClick={() => setShowCreateForm(false)}
										style={{
											...buttonStyle,
											backgroundColor: "#9CA3AF",
										}}
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					)}

					{loading ? (
						<p style={{ textAlign: "center", color: "#666" }}>
							Loading users...
						</p>
					) : (
						<div style={{ overflowX: "auto" }}>
							<table
								style={{
									width: "100%",
									borderCollapse: "collapse",
									fontSize: "14px",
								}}
							>
								<thead>
									<tr
										style={{
											backgroundColor: "#f5f5f5",
											borderBottom: "2px solid #ddd",
										}}
									>
										<th
											style={{
												padding: "12px",
												textAlign: "left",
												fontWeight: "600",
											}}
										>
											Email
										</th>
										<th
											style={{
												padding: "12px",
												textAlign: "left",
												fontWeight: "600",
											}}
										>
											Name
										</th>
										<th
											style={{
												padding: "12px",
												textAlign: "left",
												fontWeight: "600",
											}}
										>
											Role
										</th>
										<th
											style={{
												padding: "12px",
												textAlign: "left",
												fontWeight: "600",
											}}
										>
											Status
										</th>
										<th
											style={{
												padding: "12px",
												textAlign: "left",
												fontWeight: "600",
											}}
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user) => (
										<tr
											key={user.id}
											style={{
												borderBottom: "1px solid #eee",
												backgroundColor: user.enabled
													? "transparent"
													: "#f9f9f9",
											}}
										>
											<td style={{ padding: "12px" }}>{user.email}</td>
											<td style={{ padding: "12px" }}>
												{user.firstName} {user.lastName}
											</td>
											<td style={{ padding: "12px" }}>
												<select
													value={user.role}
													onChange={(e) =>
														handleUpdateRole(user.id, e.target.value)
													}
													style={{
														padding: "4px 8px",
														borderRadius: "4px",
														border: "1px solid #ddd",
														fontSize: "12px",
													}}
												>
													<option value="USER">USER</option>
													<option value="ADMIN">ADMIN</option>
													<option value="SUPER">SUPER</option>
												</select>
											</td>
											<td style={{ padding: "12px" }}>
												<span
													style={{
														backgroundColor: user.enabled
															? "#d4edda"
															: "#f8d7da",
														color: user.enabled ? "#155724" : "#721c24",
														padding: "4px 8px",
														borderRadius: "4px",
														fontSize: "12px",
														fontWeight: "500",
													}}
												>
													{user.enabled ? "Enabled" : "Disabled"}
												</span>
											</td>
											<td style={{ padding: "12px" }}>
												<div
													style={{
														display: "flex",
														gap: "5px",
													}}
												>
													<button
														onClick={() =>
															handleToggleUserStatus(user.id, user.enabled)
														}
														style={{
															padding: "4px 8px",
															backgroundColor: user.enabled
																? "#ffc107"
																: "#28a745",
															color: "white",
															border: "none",
															borderRadius: "4px",
															fontSize: "12px",
															cursor: "pointer",
														}}
													>
														{user.enabled ? "Disable" : "Enable"}
													</button>
													<button
														onClick={() => handleDeleteUser(user.id)}
														style={{
															padding: "4px 8px",
															backgroundColor: "#dc3545",
															color: "white",
															border: "none",
															borderRadius: "4px",
															fontSize: "12px",
															cursor: "pointer",
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
								<p
									style={{
										textAlign: "center",
										color: "#666",
										padding: "20px",
									}}
								>
									No users found
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default UserManagementModal;
