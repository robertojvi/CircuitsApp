import { Link, Outlet, useLocation } from "react-router-dom";
import AccessLogo from "../images/Access.png";

function Layout() {
	const location = useLocation();

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
					padding: "0.5rem", // Reduced from 1rem
					height: "50px", // Added fixed height
					backgroundColor: "#fff",
					boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
					display: "flex",
					alignItems: "center",
					gap: "2rem",
					zIndex: 1000, // Ensure navbar stays on top
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
					<Link to="/admin" style={getLinkStyle("/admin")}>
						Admin
					</Link>
					<Link to="/circuits" style={getLinkStyle("/circuits")}>
						Circuits
					</Link>
					<Link to="/reports" style={getLinkStyle("/reports")}>
						Reports
					</Link>
				</div>
				<p
					style={{
						color: "#999",
						backgroundColor: "#f5f5f5",
						padding: "8px 12px",
						borderRadius: "4px",
						margin: 0,
					}}
				>
					Dev. By RVI
				</p>
			</nav>
			<Outlet />
		</div>
	);
}

export default Layout;
