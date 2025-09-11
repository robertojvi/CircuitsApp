import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ChartDataLabels
);

function Reports() {
	const [selectedMenu, setSelectedMenu] = useState("Circuit Analytics");
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [siteTypeFilter, setSiteTypeFilter] = useState("All");
	const [statusFilter, setStatusFilter] = useState("All");
	const [circuitTypeFilter, setCircuitTypeFilter] = useState("All");
	const [expirationTimeRange, setExpirationTimeRange] = useState(6); // Default to 6 months

	useEffect(() => {
		if (
			selectedMenu === "Circuit Analytics" ||
			selectedMenu === "Circuit Expiration Report"
		) {
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

	// Filter circuits based on selected site type, status, and circuit type
	const getFilteredCircuits = () => {
		let filtered = circuits.filter((circuit) => {
			// Site Type filter
			const siteTypeMatch =
				siteTypeFilter === "All" ||
				(circuit.site && circuit.site.siteType === siteTypeFilter);

			// Status filter
			const statusMatch =
				statusFilter === "All" || circuit.status === statusFilter;

			// Circuit Type filter
			const circuitTypeMatch =
				circuitTypeFilter === "All" ||
				circuit.circuitType === circuitTypeFilter;

			// All filters must match
			return siteTypeMatch && statusMatch && circuitTypeMatch;
		});

		// Sort the filtered circuits by site name
		return filtered.sort((a, b) =>
			a.site.name.toLowerCase().localeCompare(b.site.name.toLowerCase())
		);
	};

	// Helper function to generate filter subtitle text
	const getFilterSubtitle = () => {
		const parts = [];

		if (siteTypeFilter !== "All") {
			parts.push(`${siteTypeFilter} Sites`);
		}

		if (statusFilter !== "All") {
			parts.push(`${statusFilter} Status`);
		}

		if (circuitTypeFilter !== "All") {
			parts.push(`${circuitTypeFilter} Circuits`);
		}

		return parts.length > 0 ? ` (${parts.join(", ")})` : "";
	};

	// Helper function to generate dataset labels
	const getDatasetLabel = (chartType) => {
		let label = "";

		if (chartType === "Bandwidth") {
			label = "Number of ";
		} else if (chartType === "Provider") {
			label = "Sites per ";
		} else if (chartType === "Status") {
			label = "Number of ";
		}

		// Add site type if filtered
		if (siteTypeFilter !== "All") {
			label += `${siteTypeFilter} `;
		}

		// Add status if filtered (but not for the status chart itself)
		if (statusFilter !== "All" && chartType !== "Status") {
			label += `${statusFilter} `;
		}

		// Add circuit type if filtered
		if (circuitTypeFilter !== "All") {
			label += `${circuitTypeFilter} `;
		}

		// Add the main label
		if (chartType === "Bandwidth") {
			label += "Sites";
		} else if (chartType === "Provider") {
			label += "Provider";
		} else if (chartType === "Status") {
			label += "Circuits by Status";
		}

		return label;
	};
	const getBandwidthDistribution = () => {
		const filteredCircuits = getFilteredCircuits();
		const distribution = filteredCircuits.reduce((acc, circuit) => {
			acc[circuit.circuitBandwidth] = (acc[circuit.circuitBandwidth] || 0) + 1;
			return acc;
		}, {});

		// Sort bandwidths by capacity
		const sortedEntries = Object.entries(distribution).sort((a, b) => {
			// Convert bandwidth strings to numbers for comparison
			const getNumericValue = (str) => {
				const num = parseInt(str);
				if (str.toLowerCase().includes("gb")) return num * 1000;
				if (str.toLowerCase().includes("mb")) return num;
				return num;
			};
			return getNumericValue(b[0]) - getNumericValue(a[0]);
		});

		return {
			labels: sortedEntries.map(([key]) => key),
			datasets: [
				{
					label: getDatasetLabel("Bandwidth"),
					data: sortedEntries.map(([, value]) => value),
					backgroundColor: "#3498db",
					borderColor: "#2980b9",
					borderWidth: 1,
				},
			],
		};
	};

	const getProviderDistribution = () => {
		const filteredCircuits = getFilteredCircuits();
		const distribution = filteredCircuits.reduce((acc, circuit) => {
			acc[circuit.provider.name] = (acc[circuit.provider.name] || 0) + 1;
			return acc;
		}, {});

		// Sort providers alphabetically
		const sortedEntries = Object.entries(distribution).sort((a, b) =>
			a[0].toLowerCase().localeCompare(b[0].toLowerCase())
		);

		return {
			labels: sortedEntries.map(([key]) => key),
			datasets: [
				{
					label: getDatasetLabel("Provider"),
					data: sortedEntries.map(([, value]) => value),
					backgroundColor: "#2ecc71",
					borderColor: "#27ae60",
					borderWidth: 1,
				},
			],
		};
	};

	const getStatusDistribution = () => {
		const filteredCircuits = getFilteredCircuits();
		const distribution = filteredCircuits.reduce((acc, circuit) => {
			acc[circuit.status] = (acc[circuit.status] || 0) + 1;
			return acc;
		}, {});

		// Sort statuses in a logical order
		const statusOrder = ["Active", "Pending", "Inactive"];
		const sortedEntries = Object.entries(distribution).sort((a, b) => {
			const indexA = statusOrder.indexOf(a[0]);
			const indexB = statusOrder.indexOf(b[0]);
			return indexA - indexB;
		});

		return {
			labels: sortedEntries.map(([key]) => key),
			datasets: [
				{
					label: getDatasetLabel("Status"),
					data: sortedEntries.map(([, value]) => value),
					backgroundColor: sortedEntries.map(([key]) => {
						// Color-code by status
						switch (key) {
							case "Active":
								return "#2ecc71"; // Green for Active
							case "Pending":
								return "#f39c12"; // Orange for Pending
							case "Inactive":
								return "#e74c3c"; // Red for Inactive
							default:
								return "#95a5a6"; // Gray for other statuses
						}
					}),
					borderColor: sortedEntries.map(([key]) => {
						// Darker border colors
						switch (key) {
							case "Active":
								return "#27ae60"; // Darker green
							case "Pending":
								return "#d35400"; // Darker orange
							case "Inactive":
								return "#c0392b"; // Darker red
							default:
								return "#7f8c8d"; // Darker gray
						}
					}),
					borderWidth: 1,
				},
			],
		};
	};

	// Function to get circuits that expire within the next 6 months
	const getExpiringCircuits = () => {
		const today = new Date();
		const futureDate = new Date();
		futureDate.setMonth(today.getMonth() + expirationTimeRange);

		return circuits
			.filter((circuit) => {
				// Skip circuits without expiration dates
				if (!circuit.expirationDate) return false;

				// Convert expiration date string to Date object
				const expirationDate = new Date(circuit.expirationDate);

				// Check if expiration date is within the selected time range
				return expirationDate >= today && expirationDate <= futureDate;
			})
			.sort((a, b) => {
				// Sort by expiration date (ascending)
				return new Date(a.expirationDate) - new Date(b.expirationDate);
			});
	};

	// Helper function to format dates for display
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Helper function to calculate days until expiration
	const getDaysUntilExpiration = (dateString) => {
		if (!dateString) return "N/A";

		const today = new Date();
		const expirationDate = new Date(dateString);

		// Set both dates to midnight for accurate day calculation
		today.setHours(0, 0, 0, 0);
		expirationDate.setHours(0, 0, 0, 0);

		const diffTime = expirationDate - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays;
	};

	// Helper function to calculate months until expiration
	const getMonthsUntilExpiration = (dateString) => {
		if (!dateString) return "N/A";

		const today = new Date();
		const expirationDate = new Date(dateString);

		// Calculate months between today and expiration date
		const monthsUntilExpiration =
			(expirationDate.getFullYear() - today.getFullYear()) * 12 +
			(expirationDate.getMonth() - today.getMonth());

		// Add fractional month based on day difference
		const dayOfMonth = today.getDate();
		const daysInMonth = new Date(
			today.getFullYear(),
			today.getMonth() + 1,
			0
		).getDate();
		const fractionalMonth = (daysInMonth - dayOfMonth) / daysInMonth;

		// Round to 1 decimal place
		return Math.max(
			0,
			Math.round((monthsUntilExpiration + fractionalMonth) * 10) / 10
		);
	};

	const renderContent = () => {
		if (loading) return <div>Loading...</div>;
		if (error) return <div style={{ color: "red" }}>{error}</div>;

		if (selectedMenu === "Circuit Analytics") {
			return (
				<div style={{ width: "100%" }}>
					<div
						style={{
							marginBottom: "20px",
							backgroundColor: "#2c3e50",
							padding: "15px 20px",
							borderRadius: "4px",
							color: "#ffffff",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "10px",
						}}
					>
						<div>
							<h2 style={{ margin: 0, fontSize: "18px" }}>
								Circuit Analytics Dashboard
							</h2>
							<div style={{ fontSize: "14px", marginTop: "5px" }}>
								Showing {getFilteredCircuits().length} circuits
								{siteTypeFilter !== "All" ? ` for ${siteTypeFilter} sites` : ""}
								{statusFilter !== "All" ? ` with ${statusFilter} status` : ""}
								{circuitTypeFilter !== "All"
									? ` of type ${circuitTypeFilter}`
									: ""}
							</div>
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
								flexWrap: "wrap",
							}}
						>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<label htmlFor="siteTypeFilter" style={{ fontSize: "14px" }}>
									Site Type:
								</label>
								<select
									id="siteTypeFilter"
									value={siteTypeFilter}
									onChange={(e) => setSiteTypeFilter(e.target.value)}
									style={{
										padding: "6px 10px",
										borderRadius: "4px",
										border: "1px solid #3498db",
										backgroundColor: "#34495e",
										color: "#ffffff",
										fontSize: "14px",
										cursor: "pointer",
									}}
								>
									<option value="All">All Sites</option>
									<option value="MHC">MHC</option>
									<option value="RV">RV</option>
									<option value="Hybrid">Hybrid</option>
								</select>
							</div>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<label htmlFor="statusFilter" style={{ fontSize: "14px" }}>
									Circuit Status:
								</label>
								<select
									id="statusFilter"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									style={{
										padding: "6px 10px",
										borderRadius: "4px",
										border: "1px solid #3498db",
										backgroundColor: "#34495e",
										color: "#ffffff",
										fontSize: "14px",
										cursor: "pointer",
									}}
								>
									<option value="All">All Statuses</option>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
									<option value="Pending">Pending</option>
								</select>
							</div>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<label htmlFor="circuitTypeFilter" style={{ fontSize: "14px" }}>
									Circuit Type:
								</label>
								<select
									id="circuitTypeFilter"
									value={circuitTypeFilter}
									onChange={(e) => setCircuitTypeFilter(e.target.value)}
									style={{
										padding: "6px 10px",
										borderRadius: "4px",
										border: "1px solid #3498db",
										backgroundColor: "#34495e",
										color: "#ffffff",
										fontSize: "14px",
										cursor: "pointer",
									}}
								>
									<option value="All">All Types</option>
									<option value="Fiber">Fiber</option>
									<option value="Tower">Tower</option>
								</select>
							</div>
						</div>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "40px",
							width: "100%",
						}}
					>
						<div>
							<h2
								style={{
									marginBottom: "20px",
									color: "#ffffff",
									backgroundColor: "#2c3e50",
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								Bandwidth Distribution
							</h2>
							<div
								style={{
									backgroundColor: "#f8f9fa",
									padding: "20px",
									borderRadius: "8px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
									height: "300px",
									margin: "0 auto",
									maxWidth: "800px",
									width: "100%",
									"@media (max-width: 768px)": {
										padding: "10px",
										height: "250px",
									},
								}}
							>
								<Bar
									data={getBandwidthDistribution()}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: {
												position: "top",
												labels: {
													boxWidth: 20,
													font: { size: 12 },
												},
											},
											title: {
												display: true,
												text: `Sites per Bandwidth${getFilterSubtitle()}`,
												font: { size: 14 },
											},
											datalabels: {
												display: true,
												color: "#2c3e50",
												anchor: "start",
												align: "end",
												offset: -20,
												font: {
													size: 12,
													weight: "bold",
												},
												formatter: (value, context) => {
													return context.dataIndex < context.dataset.data.length
														? value
														: "";
												},
											},
										},
										scales: {
											y: {
												beginAtZero: true,
												ticks: {
													stepSize: 1,
													font: { size: 11 },
												},
											},
											x: {
												ticks: {
													font: { size: 11 },
												},
											},
										},
									}}
								/>
							</div>
						</div>
						<div>
							<h2
								style={{
									marginBottom: "20px",
									color: "#ffffff",
									backgroundColor: "#2c3e50",
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								Circuit Status Distribution
							</h2>
							<div
								style={{
									backgroundColor: "#f8f9fa",
									padding: "20px",
									borderRadius: "8px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
									height: "300px",
									margin: "0 auto",
									maxWidth: "800px",
									width: "100%",
									"@media (max-width: 768px)": {
										padding: "10px",
										height: "250px",
									},
								}}
							>
								<Bar
									data={getStatusDistribution()}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: { position: "top" },
											title: {
												display: true,
												text: `Circuit Status Distribution${getFilterSubtitle()}`,
												font: { size: 14 },
											},
											datalabels: {
												display: true,
												color: "#2c3e50",
												anchor: "start",
												align: "end",
												offset: -20,
												font: {
													size: 12,
													weight: "bold",
												},
												formatter: (value, context) => {
													return context.dataIndex < context.dataset.data.length
														? value
														: "";
												},
											},
										},
										scales: {
											y: {
												beginAtZero: true,
												ticks: { stepSize: 1 },
											},
										},
									}}
								/>
							</div>
						</div>
						<div>
							<h2
								style={{
									marginBottom: "20px",
									color: "#ffffff",
									backgroundColor: "#2c3e50",
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								Provider Distribution
							</h2>
							<div
								style={{
									backgroundColor: "#f8f9fa",
									padding: "20px",
									borderRadius: "8px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
									height: "300px",
									margin: "0 auto",
									maxWidth: "800px",
									width: "100%",
									"@media (max-width: 768px)": {
										padding: "10px",
										height: "250px",
									},
								}}
							>
								<Bar
									data={getProviderDistribution()}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: { position: "top" },
											title: {
												display: true,
												text: `Sites per Provider${getFilterSubtitle()}`,
												font: { size: 14 },
											},
											datalabels: {
												display: true,
												color: "#2c3e50",
												anchor: "start",
												align: "end",
												offset: -20,
												font: {
													size: 12,
													weight: "bold",
												},
												formatter: (value, context) => {
													return context.dataIndex < context.dataset.data.length
														? value
														: "";
												},
											},
										},
										scales: {
											y: {
												beginAtZero: true,
												ticks: { stepSize: 1 },
											},
										},
									}}
								/>
							</div>
						</div>
					</div>

					<div>
						<h2
							style={{
								marginTop: "40px",
								marginBottom: "20px",
								color: "#ffffff",
								backgroundColor: "#2c3e50",
								padding: "10px 20px",
								borderRadius: "4px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							}}
						>
							Circuit List {getFilterSubtitle()}
						</h2>
						<div
							style={{
								backgroundColor: "#f0f4f8",
								padding: "20px",
								borderRadius: "8px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								margin: "0 auto",
								maxWidth: "900px",
								width: "100%",
								overflowX: "auto",
							}}
						>
							{getFilteredCircuits().length > 0 ? (
								<table style={{ width: "100%", borderCollapse: "collapse" }}>
									<thead>
										<tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
											<th style={tableHeaderStyle}>Venue Name</th>
											<th style={tableHeaderStyle}>Site Type</th>
											<th style={tableHeaderStyle}>Provider</th>
											<th style={tableHeaderStyle}>Bandwidth</th>
											<th style={tableHeaderStyle}>Circuit Type</th>
											<th style={tableHeaderStyle}>Status</th>
										</tr>
									</thead>
									<tbody>
										{getFilteredCircuits().map((circuit, index) => (
											<tr
												key={circuit.id}
												style={{
													borderBottom: "1px solid #dee2e6",
													backgroundColor:
														index % 2 === 0 ? "#ffffff" : "#eef2f7",
												}}
											>
												<td style={{ ...tableCellStyle, fontWeight: "600" }}>
													{circuit.site.name}
												</td>
												<td style={tableCellStyle}>
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
												<td style={tableCellStyle}>{circuit.provider.name}</td>
												<td style={tableCellStyle}>
													{circuit.circuitBandwidth}
												</td>
												<td style={tableCellStyle}>
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
												<td style={tableCellStyle}>
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
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<div
									style={{
										textAlign: "center",
										padding: "30px",
										color: "#64748B",
										fontStyle: "italic",
									}}
								>
									No circuits match the selected filters
								</div>
							)}
						</div>
					</div>
				</div>
			);
		} else if (selectedMenu === "Circuit Expiration Report") {
			const expiringCircuits = getExpiringCircuits();
			const today = new Date();

			return (
				<div style={{ width: "100%" }}>
					<div
						style={{
							marginBottom: "20px",
							backgroundColor: "#2c3e50",
							padding: "15px 20px",
							borderRadius: "4px",
							color: "#ffffff",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "10px",
						}}
					>
						<div>
							<h2 style={{ margin: 0, fontSize: "18px" }}>
								Circuit Expiration Report
							</h2>
							<div style={{ fontSize: "14px", marginTop: "5px" }}>
								Showing {expiringCircuits.length} circuits expiring within the
								next {expirationTimeRange}{" "}
								{expirationTimeRange === 1 ? "month" : "months"}
							</div>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							<label htmlFor="timeRangeFilter" style={{ fontSize: "14px" }}>
								Time Range:
							</label>
							<select
								id="timeRangeFilter"
								value={expirationTimeRange}
								onChange={(e) => setExpirationTimeRange(Number(e.target.value))}
								style={{
									padding: "6px 10px",
									borderRadius: "4px",
									border: "1px solid #3498db",
									backgroundColor: "#34495e",
									color: "#ffffff",
									fontSize: "14px",
									cursor: "pointer",
								}}
							>
								<option value={1}>1 Month</option>
								<option value={3}>3 Months</option>
								<option value={6}>6 Months</option>
								<option value={12}>12 Months</option>
							</select>
						</div>
					</div>

					<div
						style={{
							backgroundColor: "#f0f4f8",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							margin: "0 auto",
							maxWidth: "1000px",
							width: "100%",
							overflowX: "auto",
						}}
					>
						{expiringCircuits.length > 0 ? (
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
										<th style={tableHeaderStyle}>Venue Name</th>
										<th style={tableHeaderStyle}>Site Type</th>
										<th style={tableHeaderStyle}>Provider</th>
										<th style={tableHeaderStyle}>Circuit Type</th>
										<th style={tableHeaderStyle}>Bandwidth</th>
										<th style={tableHeaderStyle}>Expiration Date</th>
										<th style={tableHeaderStyle}>Months Remaining</th>
										<th style={tableHeaderStyle}>Status</th>
									</tr>
								</thead>
								<tbody>
									{expiringCircuits.map((circuit, index) => {
										const monthsUntilExpiration = getMonthsUntilExpiration(
											circuit.expirationDate
										);

										// Determine urgency based on time range
										let urgencyColor = "#10B981"; // Default green (12 months)

										// Assign colors based on time range
										if (monthsUntilExpiration <= 1) {
											urgencyColor = "#EF4444"; // Red for 1 month
										} else if (monthsUntilExpiration <= 3) {
											urgencyColor = "#F59E0B"; // Orange for 3 months
										} else if (monthsUntilExpiration <= 6) {
											urgencyColor = "#FBBF24"; // Yellow for 6 months
										}
										// else keep default green for > 6 months (up to 12 months)

										return (
											<tr
												key={circuit.id}
												style={{
													borderBottom: "1px solid #dee2e6",
													backgroundColor:
														index % 2 === 0 ? "#ffffff" : "#eef2f7",
												}}
											>
												<td style={{ ...tableCellStyle, fontWeight: "600" }}>
													{circuit.site.name}
												</td>
												<td style={tableCellStyle}>
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
												<td style={tableCellStyle}>{circuit.provider.name}</td>
												<td style={tableCellStyle}>
													<span
														style={{
															padding: "4px 8px",
															borderRadius: "4px",
															fontSize: "12px",
															fontWeight: "bold",
															backgroundColor:
																circuit.circuitType === "Fiber"
																	? "#3B82F6" // Blue for Fiber
																	: circuit.circuitType === "Tower"
																	? "#8B5CF6" // Purple for Tower
																	: "#94A3B8", // Gray for other types
															color: "white",
														}}
													>
														{circuit.circuitType || "Unknown"}
													</span>
												</td>
												<td style={tableCellStyle}>
													{circuit.circuitBandwidth}
												</td>
												<td style={{ ...tableCellStyle, fontWeight: "500" }}>
													{formatDate(circuit.expirationDate)}
												</td>
												<td style={tableCellStyle}>
													<span
														style={{
															padding: "4px 8px",
															borderRadius: "4px",
															fontSize: "12px",
															fontWeight: "bold",
															backgroundColor: urgencyColor,
															color: "white",
														}}
													>
														{monthsUntilExpiration <= 0
															? "Less than 1 month"
															: monthsUntilExpiration === 1
															? "1 month"
															: `${monthsUntilExpiration} months`}
													</span>
												</td>
												<td style={tableCellStyle}>
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
																	: "#F59E0B", // Yellow for Pending
															color: "white",
														}}
													>
														{circuit.status || "Pending"}
													</span>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						) : (
							<div
								style={{
									textAlign: "center",
									padding: "30px",
									color: "#64748B",
									fontStyle: "italic",
								}}
							>
								No circuits are expiring within the next {selectedTimeRange}{" "}
								{selectedTimeRange === "1" ? "month" : "months"}
							</div>
						)}
					</div>

					<div
						style={{
							marginTop: "30px",
							padding: "15px",
							backgroundColor: "#f0f4f8",
							borderRadius: "8px",
							maxWidth: "1000px",
							margin: "30px auto 0",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<h3 style={{ marginTop: "0", color: "#2c3e50" }}>
							Color Code Legend
						</h3>
						<div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
							<div
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								<div
									style={{
										width: "20px",
										height: "20px",
										backgroundColor: "#EF4444",
										borderRadius: "4px",
									}}
								></div>
								<span>1 Month</span>
							</div>
							<div
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								<div
									style={{
										width: "20px",
										height: "20px",
										backgroundColor: "#F59E0B",
										borderRadius: "4px",
									}}
								></div>
								<span>3 Months</span>
							</div>
							<div
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								<div
									style={{
										width: "20px",
										height: "20px",
										backgroundColor: "#FBBF24",
										borderRadius: "4px",
									}}
								></div>
								<span>6 Months</span>
							</div>
							<div
								style={{ display: "flex", alignItems: "center", gap: "8px" }}
							>
								<div
									style={{
										width: "20px",
										height: "20px",
										backgroundColor: "#10B981",
										borderRadius: "4px",
									}}
								></div>
								<span>12 Months</span>
							</div>
						</div>
						<div
							style={{
								marginTop: "10px",
								fontSize: "14px",
								fontStyle: "italic",
								color: "#64748B",
							}}
						>
							Note: Currently showing circuits expiring within the next{" "}
							{expirationTimeRange}{" "}
							{expirationTimeRange === 1 ? "month" : "months"}
						</div>
					</div>
				</div>
			);
		}

		return <h1>{selectedMenu}</h1>;
	};

	const responsiveChartContainer = {
		width: "96%",
		padding: "15px",
		"@media (max-width: 768px)": {
			padding: "10px",
		},
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
			width: "70%",
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

	const tableHeaderStyle = {
		padding: "12px",
		textAlign: "left",
		borderBottom: "2px solid #dee2e6",
		fontWeight: "600",
		fontSize: "14px",
	};

	const tableCellStyle = {
		padding: "12px",
		textAlign: "left",
		fontSize: "14px",
		color: "#2c3e50", // Dark blue text for better readability
	};

	return (
		<div
			style={{
				paddingTop: "50px",
				display: "flex",
				width: "94%",
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
					{["Circuit Analytics", "Circuit Expiration Report"].map((item) => (
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
				<div style={responsiveChartContainer}>{renderContent()}</div>
			</div>
		</div>
	);
}

export default Reports;
