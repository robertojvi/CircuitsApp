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

const CreateCircuitModal = ({
	onClose,
	onSubmit,
	newCircuit,
	setNewCircuit,
	sites,
	providers,
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
			<h2 style={{ marginBottom: "20px" }}>Create New Circuit</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={newCircuit.site?.id || ""}
						onChange={(e) =>
							setNewCircuit({
								...newCircuit,
								site: { id: Number(e.target.value) },
							})
						}
						style={inputStyle}
						required
					>
						<option value="">Select Site</option>
						{sites.map((site) => (
							<option key={site.id} value={site.id}>
								{site.name}
							</option>
						))}
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={newCircuit.provider?.id || ""}
						onChange={(e) =>
							setNewCircuit({
								...newCircuit,
								provider: { id: Number(e.target.value) },
							})
						}
						style={inputStyle}
						required
					>
						<option value="">Select Provider</option>
						{providers.map((provider) => (
							<option key={provider.id} value={provider.id}>
								{provider.name}
							</option>
						))}
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Account Number"
						value={newCircuit.accountNumber || ""}
						onChange={(e) =>
							setNewCircuit({ ...newCircuit, accountNumber: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Circuit ID"
						value={newCircuit.circuitId || ""}
						onChange={(e) =>
							setNewCircuit({ ...newCircuit, circuitId: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Bandwidth"
						value={newCircuit.circuitBandwidth || ""}
						onChange={(e) =>
							setNewCircuit({ ...newCircuit, circuitBandwidth: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="number"
						placeholder="Monthly Cost"
						value={newCircuit.monthlyCost || ""}
						onChange={(e) =>
							setNewCircuit({
								...newCircuit,
								monthlyCost: Number(e.target.value),
							})
						}
						style={inputStyle}
						required
					/>
				</div>
				<div
					style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
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

const EditSiteModal = ({ onClose, onSubmit, site, setSite }) => (
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
			<h2 style={{ marginBottom: "20px" }}>Edit Site</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Name"
						value={site.name}
						onChange={(e) => setSite({ ...site, name: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Address"
						value={site.address}
						onChange={(e) => setSite({ ...site, address: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="City"
						value={site.city}
						onChange={(e) => setSite({ ...site, city: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="State"
						value={site.state}
						onChange={(e) => setSite({ ...site, state: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Zip Code"
						value={site.zipCode}
						onChange={(e) => setSite({ ...site, zipCode: e.target.value })}
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
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
);

const EditProviderModal = ({ onClose, onSubmit, provider, setProvider }) => (
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
			<h2 style={{ marginBottom: "20px" }}>Edit Provider</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Name"
						value={provider.name}
						onChange={(e) => setProvider({ ...provider, name: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Address"
						value={provider.address}
						onChange={(e) =>
							setProvider({ ...provider, address: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="City"
						value={provider.city}
						onChange={(e) => setProvider({ ...provider, city: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="State"
						value={provider.state}
						onChange={(e) =>
							setProvider({ ...provider, state: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Zip Code"
						value={provider.zipCode}
						onChange={(e) =>
							setProvider({ ...provider, zipCode: e.target.value })
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
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
);

const EditCircuitModal = ({
	onClose,
	onSubmit,
	circuit,
	setCircuit,
	sites,
	providers,
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
			<h2 style={{ marginBottom: "20px" }}>Edit Circuit</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={circuit.site?.id || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, site: { id: Number(e.target.value) } })
						}
						style={inputStyle}
						required
					>
						<option value="">Select Site</option>
						{sites.map((site) => (
							<option key={site.id} value={site.id}>
								{site.name}
							</option>
						))}
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={circuit.provider?.id || ""}
						onChange={(e) =>
							setCircuit({
								...circuit,
								provider: { id: Number(e.target.value) },
							})
						}
						style={inputStyle}
						required
					>
						<option value="">Select Provider</option>
						{providers.map((provider) => (
							<option key={provider.id} value={provider.id}>
								{provider.name}
							</option>
						))}
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Account Number"
						value={circuit.accountNumber || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, accountNumber: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Circuit ID"
						value={circuit.circuitId || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, circuitId: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Bandwidth"
						value={circuit.circuitBandwidth || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, circuitBandwidth: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="number"
						placeholder="Monthly Cost"
						value={circuit.monthlyCost || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, monthlyCost: Number(e.target.value) })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div
					style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
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
						Save
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
	const [showCreateCircuitModal, setShowCreateCircuitModal] = useState(false);
	const [newCircuit, setNewCircuit] = useState({
		site: { id: "" },
		provider: { id: "" },
		accountNumber: "",
		circuitId: "",
		circuitBandwidth: "",
		monthlyCost: "",
	});
	const [showEditSiteModal, setShowEditSiteModal] = useState(false);
	const [selectedSite, setSelectedSite] = useState(null);
	const [showEditProviderModal, setShowEditProviderModal] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState(null);
	const [showEditCircuitModal, setShowEditCircuitModal] = useState(false);
	const [selectedCircuit, setSelectedCircuit] = useState(null);

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

	const createCircuit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch("/api/circuits", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newCircuit),
			});
			if (!response.ok) throw new Error("Failed to create circuit");

			fetchCircuits();
			setShowCreateCircuitModal(false);
			setNewCircuit({
				site: { id: "" },
				provider: { id: "" },
				accountNumber: "",
				circuitId: "",
				circuitBandwidth: "",
				monthlyCost: "",
			});
		} catch (error) {
			console.error("Error creating circuit:", error);
			setError("Failed to create circuit");
		} finally {
			setLoading(false);
		}
	};

	const editSite = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(`/api/sites`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(selectedSite),
			});
			if (!response.ok) throw new Error("Failed to update site");

			fetchSites(); // Refresh the list
			setShowEditSiteModal(false);
			setSelectedSite(null);
		} catch (error) {
			console.error("Error updating site:", error);
			setError("Failed to update site");
		} finally {
			setLoading(false);
		}
	};

	const editProvider = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(`/api/providers`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(selectedProvider),
			});
			if (!response.ok) throw new Error("Failed to update provider");

			fetchProviders();
			setShowEditProviderModal(false);
			setSelectedProvider(null);
		} catch (error) {
			console.error("Error updating provider:", error);
			setError("Failed to update provider");
		} finally {
			setLoading(false);
		}
	};

	const editCircuit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(`/api/circuits`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(selectedCircuit),
			});
			if (!response.ok) throw new Error("Failed to update circuit");

			fetchCircuits();
			setShowEditCircuitModal(false);
			setSelectedCircuit(null);
		} catch (error) {
			console.error("Error updating circuit:", error);
			setError("Failed to update circuit");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (id, type) => {
		if (type === "site") {
			const site = sites.find((s) => s.id === id);
			setSelectedSite(site);
			setShowEditSiteModal(true);
		} else if (type === "provider") {
			const provider = providers.find((p) => p.id === id);
			setSelectedProvider(provider);
			setShowEditProviderModal(true);
		} else if (type === "circuit") {
			const circuit = circuits.find((c) => c.id === id);
			setSelectedCircuit(circuit);
			fetchSites();
			fetchProviders();
			setShowEditCircuitModal(true);
		}
	};

	const handleDelete = async (id, type) => {
		// Check for dependencies before deleting
		if (type === "site" || type === "provider") {
			const isUsed = circuits.some((circuit) => {
				if (type === "site") return circuit.site.id === id;
				if (type === "provider") return circuit.provider.id === id;
			});

			if (isUsed) {
				alert(
					`This ${type} cannot be deleted because it is being used in one or more circuits.`
				);
				return;
			}
		}

		if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
			setLoading(true);
			try {
				const response = await fetch(`/api/${type}s/${id}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error(`Failed to delete ${type}`);
				}

				// Refresh the corresponding list
				switch (type) {
					case "site":
						fetchSites();
						break;
					case "provider":
						fetchProviders();
						break;
					case "circuit":
						fetchCircuits();
						break;
				}
			} catch (error) {
				console.error(`Error deleting ${type}:`, error);
				setError(`Failed to delete ${type}`);
			} finally {
				setLoading(false);
			}
		}
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
				<div>
					<div style={{ marginBottom: "20px" }}>
						<button
							onClick={() => {
								fetchSites();
								fetchProviders();
								setShowCreateCircuitModal(true);
							}}
							style={{
								...buttonStyle,
								backgroundColor: "#10B981",
								padding: "8px 16px",
							}}
						>
							Create New Circuit
						</button>
					</div>
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
				</div>
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
				{showCreateCircuitModal && (
					<CreateCircuitModal
						onClose={() => setShowCreateCircuitModal(false)}
						onSubmit={createCircuit}
						newCircuit={newCircuit}
						setNewCircuit={setNewCircuit}
						sites={sites}
						providers={providers}
					/>
				)}
				{showEditSiteModal && selectedSite && (
					<EditSiteModal
						onClose={() => {
							setShowEditSiteModal(false);
							setSelectedSite(null);
						}}
						onSubmit={editSite}
						site={selectedSite}
						setSite={setSelectedSite}
					/>
				)}
				{showEditProviderModal && selectedProvider && (
					<EditProviderModal
						onClose={() => {
							setShowEditProviderModal(false);
							setSelectedProvider(null);
						}}
						onSubmit={editProvider}
						provider={selectedProvider}
						setProvider={setSelectedProvider}
					/>
				)}
				{showEditCircuitModal && selectedCircuit && (
					<EditCircuitModal
						onClose={() => {
							setShowEditCircuitModal(false);
							setSelectedCircuit(null);
						}}
						onSubmit={editCircuit}
						circuit={selectedCircuit}
						setCircuit={setSelectedCircuit}
						sites={sites}
						providers={providers}
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
	backgroundColor: "#2c3e50", // Dark blue background
	color: "#ffffff", // White text
	fontWeight: "600", // Semi-bold text
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
