import { useState, useEffect } from "react";

// Helper function to check if a date is within the next 6 months
const isExpirationSoon = (dateString) => {
	if (!dateString) return false;

	const expirationDate = new Date(dateString);
	const today = new Date();

	// Add 6 months to today's date
	const sixMonthsLater = new Date(today);
	sixMonthsLater.setMonth(today.getMonth() + 6);

	// Check if the expiration date is between today and 6 months from today
	return expirationDate >= today && expirationDate <= sixMonthsLater;
};

// Helper function to check if a date is in the past (expired)
const isExpired = (dateString) => {
	if (!dateString) return false;

	const expirationDate = new Date(dateString);
	const today = new Date();

	// Check if the expiration date is before today
	return expirationDate < today;
};

const CircuitDetailModal = ({ circuit, onClose }) => (
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
			overflow: "auto",
		}}
	>
		<div
			style={{
				backgroundColor: "#2c3e50",
				padding: "20px",
				borderRadius: "8px",
				width: "500px",
				maxWidth: "90%",
				maxHeight: "90vh",
				overflowY: "auto",
				boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
				color: "#ffffff",
			}}
		>
			<h2
				style={{
					marginBottom: "20px",
					color: "#fff",
					borderBottom: "2px solid #3498db",
				}}
			>
				Circuit Details
			</h2>
			<div
				style={{
					marginBottom: "15px",
					backgroundColor: "#34495e",
					padding: "15px",
					borderRadius: "6px",
					border: "1px solid #3498db",
				}}
			>
				<p style={detailRowStyle}>
					<strong>Site:</strong> {circuit.site.name}
				</p>
				<p style={detailRowStyle}>
					<strong>Site Address:</strong> {circuit.site.address || "N/A"}
				</p>
				<p style={detailRowStyle}>
					<strong>Provider:</strong> {circuit.provider.name}
				</p>
				<p style={detailRowStyle}>
					<strong>Contact Number:</strong>{" "}
					{circuit.provider.contactNumber || "N/A"}
				</p>
				<p style={detailRowStyle}>
					<strong>Circuit Type:</strong>{" "}
					<span
						style={{
							padding: "4px 8px",
							borderRadius: "4px",
							fontSize: "12px",
							fontWeight: "bold",
							backgroundColor:
								circuit.circuitType === "Fiber"
									? "#3B82F6" // Blue for Fiber Circuit
									: circuit.circuitType === "Tower"
									? "#8B5CF6" // Purple for Tower
									: "#94A3B8", // Gray for other types
							color: "white",
						}}
					>
						{circuit.circuitType || "Unknown"}
					</span>
				</p>
				<p style={detailRowStyle}>
					<strong>Status:</strong>{" "}
					<span
						style={{
							padding: "4px 8px",
							borderRadius: "4px",
							fontSize: "12px",
							fontWeight: "bold",
							backgroundColor:
								circuit.status === "Active"
									? "#10B981" // Green for Active
									: circuit.status === "Inactive"
									? "#EF4444" // Red for Inactive
									: "#F59E0B", // Yellow for Pending or other status
							color: "white",
						}}
					>
						{circuit.status || "Pending"}
					</span>
				</p>
				<p style={detailRowStyle}>
					<strong>Account Number:</strong> {circuit.accountNumber || "N/A"}
				</p>
				<p style={detailRowStyle}>
					<strong>Circuit ID:</strong> {circuit.circuitId || "N/A"}
				</p>
				<p style={detailRowStyle}>
					<strong>Bandwidth:</strong> {circuit.circuitBandwidth || "N/A"}
				</p>
				<p style={detailRowStyle}>
					<strong>Monthly Cost:</strong> ${circuit.monthlyCost || "0.00"}
				</p>
				<p style={detailRowStyle}>
					<strong>Installation Date:</strong>{" "}
					{circuit.installationDate || "N/A"}
				</p>
				<p
					style={{
						...detailRowStyle,
						backgroundColor: isExpired(circuit.expirationDate)
							? "#FEE2E2" // Light red for expired
							: isExpirationSoon(circuit.expirationDate)
							? "#FEF3C7" // Yellow for expiring soon
							: "transparent",
						padding:
							isExpired(circuit.expirationDate) ||
							isExpirationSoon(circuit.expirationDate)
								? "8px 5px"
								: "8px 0",
						borderRadius:
							isExpired(circuit.expirationDate) ||
							isExpirationSoon(circuit.expirationDate)
								? "4px"
								: "0",
					}}
				>
					<strong
						style={{
							color: isExpired(circuit.expirationDate)
								? "#B91C1C" // Dark red for expired
								: isExpirationSoon(circuit.expirationDate)
								? "#B45309" // Amber for expiring soon
								: "inherit",
						}}
					>
						Expiration Date:
					</strong>{" "}
					<span
						style={{
							color: isExpired(circuit.expirationDate)
								? "#B91C1C" // Dark red for expired
								: isExpirationSoon(circuit.expirationDate)
								? "#B45309" // Amber for expiring soon
								: "inherit",
							fontWeight:
								isExpired(circuit.expirationDate) ||
								isExpirationSoon(circuit.expirationDate)
									? "bold"
									: "normal",
						}}
					>
						{circuit.expirationDate || "N/A"}
					</span>
					{isExpired(circuit.expirationDate) && (
						<span
							style={{ marginLeft: "5px", fontSize: "12px", color: "#B91C1C" }}
						>
							(Expired)
						</span>
					)}
					{!isExpired(circuit.expirationDate) &&
						isExpirationSoon(circuit.expirationDate) && (
							<span
								style={{
									marginLeft: "5px",
									fontSize: "12px",
									color: "#B45309",
								}}
							>
								(Expires soon)
							</span>
						)}
				</p>
			</div>
			<div style={{ display: "flex", justifyContent: "flex-end" }}>
				<button
					onClick={onClose}
					style={{ ...buttonStyle, backgroundColor: "#3498db" }}
				>
					Close
				</button>
			</div>
		</div>
	</div>
);

function Circuits() {
	const [selectedMenu, setSelectedMenu] = useState("Circuit Information");
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showCircuitDetail, setShowCircuitDetail] = useState(false);
	const [selectedCircuit, setSelectedCircuit] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: "ascending",
	});

	useEffect(() => {
		if (selectedMenu === "Circuit Information") {
			fetchCircuits();
		}
	}, [selectedMenu]);

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

	const filteredCircuits = circuits.filter(
		(circuit) =>
			circuit.site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(circuit.site.siteType &&
				circuit.site.siteType
					.toLowerCase()
					.includes(searchTerm.toLowerCase())) ||
			circuit.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			circuit.circuitBandwidth
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			circuit.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			circuit.circuitId.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const onSort = (key) => {
		let direction = "ascending";
		if (sortConfig.key === key && sortConfig.direction === "ascending") {
			direction = "descending";
		}
		setSortConfig({ key, direction });
	};

	const getSortedCircuits = (circuits) => {
		if (!sortConfig.key) return circuits;

		return [...circuits].sort((a, b) => {
			let aValue = sortConfig.key.split(".").reduce((obj, key) => obj[key], a);
			let bValue = sortConfig.key.split(".").reduce((obj, key) => obj[key], b);

			if (typeof aValue === "string") {
				aValue = aValue.toLowerCase();
				bValue = bValue.toLowerCase();
			}

			if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
			if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
			return 0;
		});
	};

	const getSortableHeaderStyle = (key) => ({
		...headerStyle,
		cursor: "pointer",
		position: "relative",
		paddingRight: "20px",
		backgroundColor: sortConfig.key === key ? "#34495e" : "#2c3e50",
		"&:after": {
			content:
				sortConfig.key === key
					? `"${sortConfig.direction === "ascending" ? "↑" : "↓"}"`
					: '""',
			position: "absolute",
			right: "5px",
		},
	});

	const renderContent = () => {
		if (loading) return <div>Loading...</div>;
		if (error) return <div style={{ color: "red" }}>{error}</div>;

		if (selectedMenu === "Circuit Information") {
			const sortedCircuits = getSortedCircuits(filteredCircuits);
			return (
				<div>
					<div style={{ marginBottom: "20px" }}>
						<input
							type="text"
							placeholder="Search circuits..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							style={{
								width: "100%",
								padding: "8px 12px",
								fontSize: "16px",
								border: "1px solid #3498db",
								borderRadius: "4px",
								backgroundColor: "#34495e",
								color: "#ffffff",
								outline: "none",
								"::placeholder": {
									color: "#95a5a6",
								},
							}}
						/>
					</div>
					<table style={{ width: "100%", borderCollapse: "collapse" }}>
						<thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
							<tr style={{ backgroundColor: "#2c3e50" }}>
								<th
									onClick={() => onSort("site.name")}
									style={getSortableHeaderStyle("site.name")}
								>
									Site
								</th>
								<th
									onClick={() => onSort("site.siteType")}
									style={getSortableHeaderStyle("site.siteType")}
								>
									Site Type
								</th>
								<th
									onClick={() => onSort("provider.name")}
									style={getSortableHeaderStyle("provider.name")}
								>
									Provider
								</th>
								<th
									onClick={() => onSort("circuitType")}
									style={getSortableHeaderStyle("circuitType")}
								>
									Circuit Type
								</th>
								<th
									onClick={() => onSort("circuitBandwidth")}
									style={getSortableHeaderStyle("circuitBandwidth")}
								>
									Bandwidth
								</th>
								<th
									onClick={() => onSort("status")}
									style={getSortableHeaderStyle("status")}
								>
									Status
								</th>
								<th
									onClick={() => onSort("monthlyCost")}
									style={getSortableHeaderStyle("monthlyCost")}
								>
									Monthly Cost
								</th>
								<th style={headerStyle}>Details</th>
							</tr>
						</thead>
						<tbody>
							{sortedCircuits.map((circuit) => (
								<tr
									key={circuit.id}
									style={{ borderBottom: "1px solid #dee2e6" }}
								>
									<td style={cellStyle}>{circuit.site.name}</td>
									<td style={cellStyle}>
										<span
											style={{
												padding: "4px 8px",
												borderRadius: "4px",
												fontSize: "12px",
												fontWeight: "bold",
												backgroundColor:
													circuit.site.siteType === "MHC"
														? "#3B82F6" // Blue for MHC
														: circuit.site.siteType === "RV"
														? "#10B981" // Green for RV
														: circuit.site.siteType === "Hybrid"
														? "#8B5CF6" // Purple for Hybrid
														: "#94A3B8", // Gray for other types
												color: "white",
											}}
										>
											{circuit.site.siteType || "Unknown"}
										</span>
									</td>
									<td style={cellStyle}>{circuit.provider.name}</td>
									<td style={cellStyle}>
										<span
											style={{
												padding: "4px 8px",
												borderRadius: "4px",
												fontSize: "12px",
												fontWeight: "bold",
												backgroundColor:
													circuit.circuitType === "Fiber"
														? "#3B82F6" // Blue for Fiber Circuit
														: circuit.circuitType === "Tower"
														? "#8B5CF6" // Purple for Tower
														: "#94A3B8", // Gray for other types
												color: "white",
											}}
										>
											{circuit.circuitType || "Unknown"}
										</span>
									</td>
									<td style={cellStyle}>{circuit.circuitBandwidth}</td>
									<td style={cellStyle}>
										<span
											style={{
												padding: "4px 8px",
												borderRadius: "4px",
												fontSize: "12px",
												fontWeight: "bold",
												backgroundColor:
													circuit.status === "Active"
														? "#10B981" // Green for Active
														: circuit.status === "Inactive"
														? "#EF4444" // Red for Inactive
														: "#F59E0B", // Yellow for Pending or other status
												color: "white",
											}}
										>
											{circuit.status || "Pending"}
										</span>
									</td>
									<td style={cellStyle}>${circuit.monthlyCost}</td>
									<td style={cellStyle}>
										<button
											onClick={() => {
												setSelectedCircuit(circuit);
												setShowCircuitDetail(true);
											}}
											style={iconButtonStyle}
										>
											ℹ️
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		return <h1>{selectedMenu}</h1>;
	};

	const responsiveTableContainer = {
		width: "100%",
		overflowX: "auto",
		maxHeight: "80vh",
		position: "relative",
	};

	const responsiveNavStyle = {
		width: "150px",
		minHeight: "calc(100vh - 50px)",
		backgroundColor: "#2c3e50",
		padding: "20px",
		position: "fixed",
		left: 0,
		top: "50px",
		zIndex: 999,
		"@media (max-width: 768px)": {
			width: "100%",
			position: "static",
			minHeight: "auto",
		},
	};

	const responsiveContentStyle = {
		marginLeft: "150px",
		padding: "20px",
		flex: 1,
		"@media (max-width: 768px)": {
			marginLeft: 0,
		},
	};

	return (
		<div
			style={{
				paddingTop: "50px",
				display: "flex",
				width: "100%",
				flexDirection: "column",
			}}
		>
			<nav style={responsiveNavStyle}>
				<ul
					style={{
						listStyle: "none",
						padding: 0,
						color: "#ecf0f1",
						fontSize: "16px",
					}}
				>
					{["Circuit Information"].map((item) => (
						<li
							key={item}
							style={{
								marginBottom: "15px",
								padding: "10px",
								cursor: "pointer",
								backgroundColor:
									selectedMenu === item ? "#34495e" : "transparent",
							}}
							onClick={() => setSelectedMenu(item)}
						>
							{item}
						</li>
					))}
				</ul>
			</nav>
			<div style={responsiveContentStyle}>
				<div style={responsiveTableContainer}>{renderContent()}</div>
				{showCircuitDetail && selectedCircuit && (
					<CircuitDetailModal
						circuit={selectedCircuit}
						onClose={() => {
							setShowCircuitDetail(false);
							setSelectedCircuit(null);
						}}
					/>
				)}
			</div>
		</div>
	);
}

const headerStyle = {
	padding: "12px",
	textAlign: "left",
	color: "white",
	fontWeight: "600",
	backgroundColor: "#2c3e50",
	boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Add shadow to visually separate fixed header
};

const cellStyle = {
	padding: "12px",
};

const buttonStyle = {
	padding: "6px 12px",
	border: "none",
	borderRadius: "4px",
	backgroundColor: "#9CA3AF",
	color: "white",
	cursor: "pointer",
};

const iconButtonStyle = {
	padding: "4px 8px",
	border: "none",
	borderRadius: "4px",
	backgroundColor: "transparent",
	cursor: "pointer",
	fontSize: "20px",
};

const detailRowStyle = {
	padding: "8px 0",
	borderBottom: "1px solid #edf2f7",
	fontSize: "14px",
	lineHeight: "1.5",
};

export default Circuits;
