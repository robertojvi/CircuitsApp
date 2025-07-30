import { useState, useEffect } from "react";

const CreateSiteModal = ({ onClose, onSubmit, newSite, setNewSite }) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1000,
		}}
	>
		<div
			style={{
				backgroundColor: "white",
				padding: "20px",
				borderRadius: "8px",
				width: "400px",
			}}
		>
			<h2 style={{ marginBottom: "20px" }}>Create New Site</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Name"
						value={newSite.name}
						onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Address"
						value={newSite.address}
						onChange={(e) =>
							setNewSite({ ...newSite, address: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="City"
						value={newSite.city}
						onChange={(e) => setNewSite({ ...newSite, city: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="State"
						value={newSite.state}
						onChange={(e) => setNewSite({ ...newSite, state: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Zip Code"
						value={newSite.zipCode}
						onChange={(e) =>
							setNewSite({ ...newSite, zipCode: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{ ...buttonStyle, backgroundColor: "#9CA3AF" }}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{ ...buttonStyle, backgroundColor: "#4299E1" }}
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
);

const CreateProviderModal = ({
	onClose,
	onSubmit,
	newProvider,
	setNewProvider,
}) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1000,
		}}
	>
		<div
			style={{
				backgroundColor: "white",
				padding: "20px",
				borderRadius: "8px",
				width: "400px",
			}}
		>
			<h2 style={{ marginBottom: "20px" }}>Create New Provider</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Name"
						value={newProvider.name}
						onChange={(e) =>
							setNewProvider({ ...newProvider, name: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Address"
						value={newProvider.address}
						onChange={(e) =>
							setNewProvider({ ...newProvider, address: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="City"
						value={newProvider.city}
						onChange={(e) =>
							setNewProvider({ ...newProvider, city: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="State"
						value={newProvider.state}
						onChange={(e) =>
							setNewProvider({ ...newProvider, state: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Zip Code"
						value={newProvider.zipCode}
						onChange={(e) =>
							setNewProvider({ ...newProvider, zipCode: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{ ...buttonStyle, backgroundColor: "#9CA3AF" }}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{ ...buttonStyle, backgroundColor: "#4299E1" }}
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
);

function Admin() {
	const [selectedItem, setSelectedItem] = useState("");
	const [sites, setSites] = useState([]);
	const [providers, setProviders] = useState([]); // Add providers state
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showCreateSiteModal, setShowCreateSiteModal] = useState(false);
	const [newSite, setNewSite] = useState({
		name: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
	});
	const [showCreateProviderModal, setShowCreateProviderModal] = useState(false);
	const [newProvider, setNewProvider] = useState({
		name: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
	});

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

	const fetchCircuits = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/circuits");
			const data = await response.json();
			setCircuits(data);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load circuits");
		} finally {
			setLoading(false);
		}
	};

	const createSite = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch("/api/sites", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newSite),
			});
			if (!response.ok) throw new Error("Failed to create site");

			fetchSites(); // Refresh the list
			setShowCreateSiteModal(false);
			setNewSite({ name: "", address: "", city: "", state: "", zipCode: "" });
		} catch (error) {
			console.error("Error creating site:", error);
			setError("Failed to create site");
		} finally {
			setLoading(false);
		}
	};

	const createProvider = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch("/api/providers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newProvider),
			});
			if (!response.ok) throw new Error("Failed to create provider");

			fetchProviders(); // Refresh the list
			setShowCreateProviderModal(false);
			setNewProvider({
				name: "",
				address: "",
				city: "",
				state: "",
				zipCode: "",
			});
		} catch (error) {
			console.error("Error creating provider:", error);
			setError("Failed to create provider");
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
				<div>
					<div style={{ marginBottom: "20px" }}>
						<button
							onClick={() => setShowCreateSiteModal(true)}
							style={{
								...buttonStyle,
								backgroundColor: "#10B981",
								padding: "8px 16px",
							}}
						>
							Create New Site
						</button>
					</div>
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
				</div>
			);
		}

		if (selectedItem === "Providers") {
			return (
				<div>
					<div style={{ marginBottom: "20px" }}>
						<button
							onClick={() => setShowCreateProviderModal(true)}
							style={{
								...buttonStyle,
								backgroundColor: "#10B981",
								padding: "8px 16px",
							}}
						>
							Create New Provider
						</button>
					</div>
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
				</div>
			);
		}

		if (selectedItem === "Circuits") {
			return (
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr style={{ backgroundColor: "#f8f9fa" }}>
							<th style={headerStyle}>ID</th>
							<th style={headerStyle}>Site</th>
							<th style={headerStyle}>Provider</th>
							<th style={headerStyle}>Account Number</th>
							<th style={headerStyle}>Circuit ID</th>
							<th style={headerStyle}>Bandwidth</th>
							<th style={headerStyle}>Monthly Cost</th>
							<th style={headerStyle}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{circuits.map((circuit) => (
							<tr
								key={circuit.id}
								style={{ borderBottom: "1px solid #dee2e6" }}
							>
								<td style={cellStyle}>{circuit.id}</td>
								<td style={cellStyle}>{circuit.site.name}</td>
								<td style={cellStyle}>{circuit.provider.name}</td>
								<td style={cellStyle}>{circuit.accountNumber}</td>
								<td style={cellStyle}>{circuit.circuitId}</td>
								<td style={cellStyle}>{circuit.circuitBandwidth}</td>
								<td style={cellStyle}>${circuit.monthlyCost}</td>
								<td style={cellStyle}>
									<button
										onClick={() => handleEdit(circuit.id, "circuit")}
										style={{ ...buttonStyle, backgroundColor: "#4299e1" }}
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(circuit.id, "circuit")}
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
							backgroundColor:
								selectedItem === "Circuits" ? "#34495e" : "transparent",
						}}
						onClick={() => {
							setSelectedItem("Circuits");
							fetchCircuits();
						}}
					>
						Circuits
					</li>
				</ul>
			</nav>
			<div style={{ marginLeft: "250px", padding: "20px", flex: 1 }}>
				{renderContent()}
				{showCreateSiteModal && (
					<CreateSiteModal
						onClose={() => setShowCreateSiteModal(false)}
						onSubmit={createSite}
						newSite={newSite}
						setNewSite={setNewSite}
					/>
				)}
				{showCreateProviderModal && (
					<CreateProviderModal
						onClose={() => setShowCreateProviderModal(false)}
						onSubmit={createProvider}
						newProvider={newProvider}
						setNewProvider={setNewProvider}
					/>
				)}
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

const inputStyle = {
	width: "100%",
	padding: "8px",
	border: "1px solid #D1D5DB",
	borderRadius: "4px",
	fontSize: "14px",
};

export default Admin;
