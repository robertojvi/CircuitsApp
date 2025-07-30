import { Link } from "react-router-dom";

function Home() {
	return (
		<div style={{ paddingTop: "80px" }}>
			<nav
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					padding: "1rem",
					backgroundColor: "#fff",
					boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
					display: "flex",
					alignItems: "center",
					gap: "2rem",
				}}
			>
				<div className="logo">
					{/* Logo placeholder */}
					<Link to="/">LOGO</Link>
				</div>
				<div style={{ display: "flex", gap: "1rem" }}>
					<Link to="/admin">Admin</Link>
					<Link to="/circuits">Circuits</Link>
					<Link to="/reports">Reports</Link>
				</div>
			</nav>
			<h1>Welcome to the Home Page</h1>
		</div>
	);
}

export default Home;
