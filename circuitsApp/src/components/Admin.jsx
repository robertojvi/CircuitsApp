function Admin() {
	return (
		<div style={{ paddingTop: "50px", display: "flex", width: "100%" }}>
			<nav
				style={{
					width: "250px",
					minHeight: "calc(100vh - 50px)",
					backgroundColor: "#2c3e50",
					padding: "20px",
					position: "fixed",
					left: 0,
					top: "50px",
					zIndex: 999,
				}}
			>
				<ul
					style={{
						listStyle: "none",
						padding: 0,
						color: "#ecf0f1",
						fontSize: "16px",
					}}
				>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							"&:hover": { backgroundColor: "#34495e" },
						}}
					>
						Sites
					</li>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							"&:hover": { backgroundColor: "#34495e" },
						}}
					>
						Providers
					</li>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							"&:hover": { backgroundColor: "#34495e" },
						}}
					>
						Circuits
					</li>
				</ul>
			</nav>
			<div style={{ marginLeft: "250px", padding: "20px", flex: 1 }}>
				<h1>Admin Page</h1>
			</div>
		</div>
	);
}

export default Admin;
