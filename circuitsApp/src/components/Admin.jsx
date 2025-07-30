import { useState, useEffect } from "react";

function Admin() {
	const [selectedItem, setSelectedItem] = useState("");
	const [sites, setSites] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchSites = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/sites");
			const data = await response.json();
			setSites(data);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load sites");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (id) => {
		console.log("Edit site:", id);
	};

	const handleDelete = (id) => {
		console.log("Delete site:", id);
	};

	const renderContent = () => {
		if (loading) return <div>Loading...</div>;
		if (error) return <div style={{ color: "red" }}>{error}</div>;
		if (selectedItem !== "Sites") return <h1>Admin Page</h1>;

		return (
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr style={{ backgroundColor: "#f8f9fa" }}>
						<th style={headerStyle}>ID</th>
						<th style={headerStyle}>Name</th>
						<th style={headerStyle}>Address</th>
						<th style={headerStyle}>City</th>
						<th style={headerStyle}>State</th>
						<th style={headerStyle}>Zip Code</th>
						<th style={headerStyle}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{sites.map((site) => (
						<tr key={site.id} style={{ borderBottom: "1px solid #dee2e6" }}>
							<td style={cellStyle}>{site.id}</td>
							<td style={cellStyle}>{site.name}</td>
							<td style={cellStyle}>{site.address}</td>
							<td style={cellStyle}>{site.city}</td>
							<td style={cellStyle}>{site.state}</td>
							<td style={cellStyle}>{site.zipCode}</td>
							<td style={cellStyle}>
								<button
									onClick={() => handleEdit(site.id)}
									style={{
										...buttonStyle,
										backgroundColor: "#4299e1",
									}}
								>
									Edit
								</button>
								<button
									onClick={() => handleDelete(site.id)}
									style={{
										...buttonStyle,
										backgroundColor: "#f56565",
									}}
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	};

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
							backgroundColor:
								selectedItem === "Sites" ? "#34495e" : "transparent",
						}}
						onClick={() => {
							setSelectedItem("Sites");
							fetchSites();
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
				{renderContent()}
			</div>
		</div>
	);
}

const headerStyle = {
	padding: "12px",
	textAlign: "left",
	borderBottom: "2px solid #dee2e6",
};

const cellStyle = {
	padding: "12px",
};

const buttonStyle = {
	padding: "6px 12px",
	margin: "0 4px",
	border: "none",
	borderRadius: "4px",
	color: "white",
	cursor: "pointer",
};

export default Admin;
