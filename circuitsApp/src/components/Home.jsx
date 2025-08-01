function Home() {
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
						Dashboard
					</li>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							"&:hover": { backgroundColor: "#34495e" },
						}}
					>
						Overview
					</li>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							"&:hover": { backgroundColor: "#34495e" },
						}}
					>
						Quick Links
					</li>
				</ul>
			</nav>
			<div
				style={{
					marginLeft: "250px",
					padding: "20px",
					flex: 1,
					textAlign: "center",
				}}
			>
				<img
					src="src/images/Access.png"
					alt="Access Parks Logo"
					style={{
						width: "200px",
						marginBottom: "20px",
					}}
				/>
				<h1>AccessParks Circuits</h1>
				<p>Select an Option from the top Menu</p>
			</div>
		</div>
	);
}

export default Home;
