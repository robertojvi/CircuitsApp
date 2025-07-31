import { useState, useEffect } from "react";

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
			<h2 style={{ marginBottom: "20px" }}>Circuit Details</h2>
			<div style={{ marginBottom: "15px" }}>
				<p>
					<strong>Site:</strong> {circuit.site.name}
				</p>
				<p>
					<strong>Provider:</strong> {circuit.provider.name}
				</p>
				<p>
					<strong>Account Number:</strong> {circuit.accountNumber}
				</p>
				<p>
					<strong>Circuit ID:</strong> {circuit.circuitId}
				</p>
				<p>
					<strong>Bandwidth:</strong> {circuit.circuitBandwidth}
				</p>
				<p>
					<strong>Monthly Cost:</strong> ${circuit.monthlyCost}
				</p>
			</div>
			<div style={{ display: "flex", justifyContent: "flex-end" }}>
				<button onClick={onClose} style={buttonStyle}>
					Close
				</button>
			</div>
		</div>
	</div>
);

function Circuits() {
	const [selectedMenu, setSelectedMenu] = useState("Circuit Status");
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showCircuitDetail, setShowCircuitDetail] = useState(false);
	const [selectedCircuit, setSelectedCircuit] = useState(null);

	useEffect(() => {
		if (selectedMenu === "Circuit Status") {
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

	const renderContent = () => {
		if (loading) return <div>Loading...</div>;
		if (error) return <div style={{ color: "red" }}>{error}</div>;

		if (selectedMenu === "Circuit Status") {
			return (
				<div>
					<table style={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr style={{ backgroundColor: "#2c3e50" }}>
								<th style={headerStyle}>Site</th>
								<th style={headerStyle}>Provider</th>
								<th style={headerStyle}>Bandwidth</th>
								<th style={headerStyle}>Monthly Cost</th>
								<th style={headerStyle}>Details</th>
							</tr>
						</thead>
						<tbody>
							{circuits.map((circuit) => (
								<tr
									key={circuit.id}
									style={{ borderBottom: "1px solid #dee2e6" }}
								>
									<td style={cellStyle}>{circuit.site.name}</td>
									<td style={cellStyle}>{circuit.provider.name}</td>
									<td style={cellStyle}>{circuit.circuitBandwidth}</td>
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
					{[
						"Circuit Status",
						"Circuit Configuration",
						"Circuit Monitoring",
					].map((item) => (
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
			<div style={{ marginLeft: "250px", padding: "20px", flex: 1 }}>
				{renderContent()}
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

export default Circuits;
