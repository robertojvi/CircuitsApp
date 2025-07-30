function Reports() {
	return (
		<div style={{ paddingTop: "80px", display: "flex", width: "100%" }}>
			<nav
				style={{
					width: "250px",
					minHeight: "calc(100vh - 80px)",
					backgroundColor: "#2c3e50",
					padding: "20px",
					position: "fixed",
					left: 0,
					top: "80px",
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
						Usage Analytics
					</li>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							"&:hover": { backgroundColor: "#34495e" },
						}}
					>
						Performance Metrics
					</li>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							"&:hover": { backgroundColor: "#34495e" },
						}}
					>
						System Logs
					</li>
				</ul>
			</nav>
			<div style={{ marginLeft: "250px", padding: "20px", flex: 1 }}>
				<h1>Reports Page</h1>
			</div>
		</div>
	);
}

export default Reports;
