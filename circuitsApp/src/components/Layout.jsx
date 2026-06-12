import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import AccessLogo from "../images/Access.png";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";
import UserManagementModal from "./UserManagementModal";

function Layout() {
	const location = useLocation();
	const { user, logout } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [showUserManagementModal, setShowUserManagementModal] = useState(false);
	const usesSideNavigationLayout = [
		"/circuits",
		"/reports",
		"/admin",
		"/project-management/",
	].some((path) => location.pathname.startsWith(path));

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const getLinkStyle = (path) => ({
		padding: "8px 16px",
		borderRadius: "4px",
		textDecoration: "none",
		color:
			location.pathname === path
				? "var(--color-primary)"
				: "var(--color-text-dark)",
		backgroundColor:
			location.pathname === path ? "rgba(52, 152, 219, 0.1)" : "transparent",
		fontWeight: location.pathname === path ? "600" : "500",
		transition: "all var(--transition-fast)",
		position: "relative",
	});

	return (
		<div>
			<nav className="navbar">
				<div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
					<div
						style={{ display: "flex", alignItems: "center", height: "100%" }}
					>
						<Link to="/" style={{ display: "flex", alignItems: "center" }}>
							<img src={AccessLogo} alt="Access Logo" className="navbar-logo" />
						</Link>
					</div>
					<div className="navbar-links">
						<Link
							to="/circuits"
							className={`navbar-link ${location.pathname.startsWith("/circuits") ? "active" : ""}`}
						>
							Circuits
						</Link>
						{user && (user.role === "SUPER" || user.role === "ADMIN") && (
							<Link
								to="/renewal-analysis"
								className={`navbar-link ${location.pathname.startsWith("/renewal-analysis") ? "active" : ""}`}
							>
								Renewal Analysis
							</Link>
						)}
						<Link
							to="/reports"
							className={`navbar-link ${location.pathname.startsWith("/reports") ? "active" : ""}`}
						>
							Reports
						</Link>
						<Link
							to="/project-management"
							className={`navbar-link ${location.pathname.startsWith("/project-management") ? "active" : ""}`}
						>
							Project Management
						</Link>
						{user && (user.role === "SUPER" || user.role === "ADMIN") && (
							<Link
								to="/admin"
								className={`navbar-link ${location.pathname.startsWith("/admin") ? "active" : ""}`}
							>
								Admin
							</Link>
						)}
					</div>
				</div>

				{user && (
					<div className="navbar-user">
						<div className="user-info">
							<span className="user-name">
								{user.firstName} {user.lastName}
							</span>
							<span className="user-role">{user.role}</span>
						</div>

						<div style={{ display: "flex", gap: "8px" }}>
							<button
								onClick={toggleTheme}
								className="btn btn-ghost"
								style={{ fontSize: "14px", padding: "4px 10px" }}
								title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
							>
								{theme === "dark" ? "☀️" : "🌙"}
							</button>

							<button style={{ fontSize: "12px", padding: "4px 8px" }}>
								Change Password
							</button>

							{user.role === "SUPER" && (
								<button
									onClick={() => setShowUserManagementModal(true)}
									className="btn btn-ghost"
									style={{ fontSize: "12px", padding: "4px 8px" }}
								>
									Manage Users
								</button>
							)}

							<button
								onClick={handleLogout}
								className="btn btn-danger"
								style={{ fontSize: "12px", padding: "4px 8px" }}
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

			<div style={{ paddingTop: "70px" }}>
				<div
					className={
						usesSideNavigationLayout ? undefined : "app-page-container"
					}
				>
					<Outlet />
				</div>
			</div>
		</div>
	);
}

export default Layout;
