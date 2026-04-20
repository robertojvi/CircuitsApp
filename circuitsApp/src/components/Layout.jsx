import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import AccessLogo from "../images/Access.png";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";
import UserManagementModal from "./UserManagementModal";

function Layout() {
	const location = useLocation();
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [showUserManagementModal, setShowUserManagementModal] = useState(false);
	const usesSideNavigationLayout = ["/circuits", "/reports", "/admin"].some(
		(path) => location.pathname.startsWith(path),
	);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const getLinkStyle = (path) => ({
		padding: "8px 16px",
		borderRadius: "4px",
		textDecoration: "none",
		color: "#333",
		backgroundColor: location.pathname === path ? "#e2e8f0" : "transparent",
	});

	return (
		<div>
			<nav
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					padding: "0.5rem",
					height: "50px",
					backgroundColor: "#fff",
					boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					zIndex: 1000,
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "2rem",
					}}
				>
					<div
						className="logo"
						style={{
							display: "flex",
							alignItems: "center",
							height: "100%",
							padding: "5px 0",
						}}
					>
						<Link
							to="/"
							style={{
								display: "flex",
								alignItems: "center",
							}}
						>
							<img
								src={AccessLogo}
								alt="Access Logo"
								style={{
									height: "30px",
									objectFit: "contain",
								}}
							/>
						</Link>
					</div>
					<div style={{ display: "flex", gap: "1rem" }}>
						<Link to="/circuits" style={getLinkStyle("/circuits")}>
							Circuits
						</Link>
						{user && (user.role === "SUPER" || user.role === "ADMIN") && (
							<Link
								to="/renewal-analysis"
								style={getLinkStyle("/renewal-analysis")}
							>
								Renewal Analysis
							</Link>
						)}
						<Link to="/reports" style={getLinkStyle("/reports")}>
							Reports
						</Link>
						{user && (user.role === "SUPER" || user.role === "ADMIN") && (
							<Link to="/admin" style={getLinkStyle("/admin")}>
								Admin
							</Link>
						)}
					</div>
				</div>

				{user && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "1rem",
							marginRight: "1rem",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
							}}
						>
							<span
								style={{
									color: "#333",
									fontSize: "14px",
									fontWeight: "500",
								}}
							>
								{user.firstName} {user.lastName}
							</span>
							<span
								style={{
									backgroundColor: "#e2e8f0",
									padding: "2px 8px",
									borderRadius: "4px",
									fontSize: "12px",
									color: "#2c3e50",
									fontWeight: "600",
								}}
							>
								{user.role}
							</span>
						</div>

						<div
							style={{
								display: "flex",
								gap: "0.5rem",
								borderLeft: "1px solid #ddd",
								paddingLeft: "1rem",
							}}
						>
							<button
								onClick={() => setShowPasswordModal(true)}
								style={{
									padding: "4px 8px",
									backgroundColor: "#f0f0f0",
									border: "1px solid #ddd",
									borderRadius: "4px",
									fontSize: "12px",
									cursor: "pointer",
									color: "#333",
								}}
							>
								Change Password
							</button>

							{user.role === "SUPER" && (
								<button
									onClick={() => setShowUserManagementModal(true)}
									style={{
										padding: "4px 8px",
										backgroundColor: "#f0f0f0",
										border: "1px solid #ddd",
										borderRadius: "4px",
										fontSize: "12px",
										cursor: "pointer",
										color: "#333",
									}}
								>
									Manage Users
								</button>
							)}

							<button
								onClick={handleLogout}
								style={{
									padding: "4px 8px",
									backgroundColor: "#e74c3c",
									color: "white",
									border: "none",
									borderRadius: "4px",
									fontSize: "12px",
									cursor: "pointer",
								}}
							>
								Logout
							</button>
						</div>
					</div>
				)}
			</nav>

			{showPasswordModal && (
				<ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
			)}

			{showUserManagementModal && (
				<UserManagementModal
					onClose={() => setShowUserManagementModal(false)}
				/>
			)}

			<div
				className={usesSideNavigationLayout ? undefined : "app-page-container"}
			>
				<Outlet />
			</div>
		</div>
	);
}

export default Layout;
