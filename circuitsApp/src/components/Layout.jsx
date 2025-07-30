import { Link, Outlet } from "react-router-dom";
import AccessLogo from "../images/Access.png";

function Layout() {
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
					<Link to="/admin">Admin</Link>
					<Link to="/circuits">Circuits</Link>
					<Link to="/reports">Reports</Link>
				</div>
			</nav>
			<Outlet />
		</div>
	);
}

export default Layout;
