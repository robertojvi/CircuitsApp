import { useState, useEffect } from "react";

function Admin() {
	const [selectedItem, setSelectedItem] = useState("");
	const [sites, setSites] = useState([]);
	const [providers, setProviders] = useState([]); // Add providers state
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

	const fetchProviders = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/providers");
			const data = await response.json();
			setProviders(data);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load providers");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (id, type) => {
		console.log(`Edit ${type}:`, id);
	};

	const handleDelete = (id, type) => {
		console.log(`Delete ${type}:`, id);
	};

	const renderContent = () => {
		if (loading) return <div>Loading...</div>;
		if (error) return <div style={{ color: "red" }}>{error}</div>;

		if (selectedItem === "Sites") {
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
										onClick={() => handleEdit(site.id, "site")}
										style={{
											...buttonStyle,
											backgroundColor: "#4299e1",
										}}
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(site.id, "site")}
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
		}

		if (selectedItem === "Providers") {
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
						{providers.map((provider) => (
							<tr
								key={provider.id}
								style={{ borderBottom: "1px solid #dee2e6" }}
							>
								<td style={cellStyle}>{provider.id}</td>
								<td style={cellStyle}>{provider.name}</td>
								<td style={cellStyle}>{provider.address}</td>
								<td style={cellStyle}>{provider.city}</td>
								<td style={cellStyle}>{provider.state}</td>
								<td style={cellStyle}>{provider.zipCode}</td>
								<td style={cellStyle}>
									<button
										onClick={() => handleEdit(provider.id, "provider")}
										style={{ ...buttonStyle, backgroundColor: "#4299e1" }}
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(provider.id, "provider")}
										style={{ ...buttonStyle, backgroundColor: "#f56565" }}
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			);
		}

		return <h1>Admin Page</h1>;
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
							backgroundColor:
								selectedItem === "Providers" ? "#34495e" : "transparent",
						}}
						onClick={() => {
							setSelectedItem("Providers");
							fetchProviders();
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
