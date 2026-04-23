import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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
import * as XLSX from "xlsx";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ChartDataLabels,
);

function Reports() {
	const [selectedMenu, setSelectedMenu] = useState("Circuit Analytics");
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { token, user } = useAuth();
	const [siteTypeFilter, setSiteTypeFilter] = useState("All");
	const [statusFilter, setStatusFilter] = useState("All");
	const [circuitTypeFilter, setCircuitTypeFilter] = useState("All");
	const [providerFilter, setProviderFilter] = useState("All");
	const [aggregatorFilter, setAggregatorFilter] = useState("All");
	const [siteStateFilter, setSiteStateFilter] = useState("All");
	const [expirationTimeRange, setExpirationTimeRange] = useState(6); // Default to 6 months
	const [customExpirationMonths, setCustomExpirationMonths] = useState(""); // For custom month input
	const [renewalNoticeTimeRange, setRenewalNoticeTimeRange] = useState("All");
	const [customRenewalNoticeDays, setCustomRenewalNoticeDays] = useState("");
	const [expiredCircuitsSortConfig, setExpiredCircuitsSortConfig] = useState({
		key: "expirationDate",
		direction: "ascending",
	});

	useEffect(() => {
		if (
			selectedMenu === "Circuit Analytics" ||
			selectedMenu === "Circuit Expiration Report" ||
			selectedMenu === "Renewal Notice Report" ||
			selectedMenu === "Expired Circuits" ||
			selectedMenu === "Tower Report"
		) {
			fetchCircuits();
		}
	}, [selectedMenu]);

	const fetchCircuits = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/circuits", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			setCircuits(data);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load circuits");
		} finally {
			setLoading(false);
		}
	};

	// Filter circuits based on selected site type, status, circuit type, provider, aggregator, and site state
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

			// Provider filter
			const providerMatch =
				providerFilter === "All" ||
				(circuit.provider && circuit.provider.name === providerFilter);

			// Aggregator filter
			const aggregatorMatch =
				aggregatorFilter === "All" ||
				(circuit.hasAggregator && circuit.aggregatorName === aggregatorFilter);

			// Site State filter
			const siteStateMatch =
				siteStateFilter === "All" ||
				(circuit.site && circuit.site.state === siteStateFilter);

			// All filters must match
			return (
				siteTypeMatch &&
				statusMatch &&
				circuitTypeMatch &&
				providerMatch &&
				aggregatorMatch &&
				siteStateMatch
			);
		});

		// Sort the filtered circuits by site name
		return filtered.sort((a, b) =>
			a.site.name.toLowerCase().localeCompare(b.site.name.toLowerCase()),
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

		if (providerFilter !== "All") {
			parts.push(`${providerFilter}`);
		}

		if (aggregatorFilter !== "All") {
			parts.push(`${aggregatorFilter} Aggregator`);
		}

		if (siteStateFilter !== "All") {
			parts.push(`${siteStateFilter}`);
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

		// Add provider if filtered
		if (providerFilter !== "All") {
			label += `(${providerFilter}) `;
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

	// Helper function to get unique providers
	const getUniqueProviders = () => {
		const providers = new Set();
		circuits.forEach((circuit) => {
			if (circuit.provider && circuit.provider.name) {
				providers.add(circuit.provider.name);
			}
		});
		return Array.from(providers).sort((a, b) =>
			a.toLowerCase().localeCompare(b.toLowerCase()),
		);
	};

	// Helper function to get unique aggregators
	const getUniqueAggregators = () => {
		const aggregators = new Set();
		circuits.forEach((circuit) => {
			if (circuit.hasAggregator && circuit.aggregatorName) {
				aggregators.add(circuit.aggregatorName);
			}
		});
		return Array.from(aggregators).sort((a, b) =>
			a.toLowerCase().localeCompare(b.toLowerCase()),
		);
	};

	// Helper function to get unique site states
	const getUniqueSiteStates = () => {
		const states = new Set();
		circuits.forEach((circuit) => {
			if (circuit.site && circuit.site.state) {
				states.add(circuit.site.state);
			}
		});
		return Array.from(states).sort((a, b) =>
			a.toLowerCase().localeCompare(b.toLowerCase()),
		);
	};

	const formatSiteAddress = (site) => {
		if (!site) return "N/A";

		const address = [site.address, site.city, site.state, site.zipCode]
			.filter(Boolean)
			.join(", ");

		return address || "N/A";
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
			a[0].toLowerCase().localeCompare(b[0].toLowerCase()),
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
		// Use custom months if provided, otherwise use the preset time range
		const monthsToCheck = customExpirationMonths
			? parseInt(customExpirationMonths)
			: expirationTimeRange;
		futureDate.setMonth(today.getMonth() + monthsToCheck);

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

	// Function to get circuits that have already expired (expiration date is equal to or before today)
	const getExpiredCircuits = () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return circuits
			.filter((circuit) => {
				// Skip circuits without expiration dates
				if (!circuit.expirationDate) return false;

				// Convert expiration date string to Date object
				const expirationDate = new Date(circuit.expirationDate);
				expirationDate.setHours(0, 0, 0, 0);

				// Check if expiration date is equal to or before today
				return expirationDate <= today;
			})
			.sort((a, b) => {
				// Sort by expiration date (descending - most recent first)
				return new Date(b.expirationDate) - new Date(a.expirationDate);
			});
	};

	const getRenewalNoticeCircuits = () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const daysToCheck = customRenewalNoticeDays
			? parseInt(customRenewalNoticeDays, 10)
			: renewalNoticeTimeRange === "All"
				? null
				: parseInt(renewalNoticeTimeRange, 10);

		const endDate = daysToCheck !== null ? new Date(today) : null;
		if (endDate) {
			endDate.setDate(today.getDate() + daysToCheck);
		}

		return circuits
			.filter((circuit) => {
				if (!circuit.renewalNoticeDate) return false;

				if (daysToCheck === null) return true;

				const renewalNoticeDate = new Date(circuit.renewalNoticeDate);
				renewalNoticeDate.setHours(0, 0, 0, 0);

				return renewalNoticeDate >= today && renewalNoticeDate <= endDate;
			})
			.sort(
				(a, b) => new Date(a.renewalNoticeDate) - new Date(b.renewalNoticeDate),
			);
	};

	// Function to sort expired circuits based on selected column
	const getSortedExpiredCircuits = (circuitsToSort) => {
		let sorted = [...circuitsToSort];

		sorted.sort((a, b) => {
			let aValue, bValue;

			switch (expiredCircuitsSortConfig.key) {
				case "venueName":
					aValue = a.site.name.toLowerCase();
					bValue = b.site.name.toLowerCase();
					break;
				case "siteType":
					aValue = a.site.siteType;
					bValue = b.site.siteType;
					break;
				case "provider":
					aValue = (a.provider?.name || "").toLowerCase();
					bValue = (b.provider?.name || "").toLowerCase();
					break;
				case "aggregator":
					aValue = (a.aggregatorName || "").toLowerCase();
					bValue = (b.aggregatorName || "").toLowerCase();
					break;
				case "circuitType":
					aValue = a.circuitType;
					bValue = b.circuitType;
					break;
				case "bandwidth":
					aValue = parseInt(a.circuitBandwidth) || 0;
					bValue = parseInt(b.circuitBandwidth) || 0;
					break;
				case "expirationDate":
					aValue = new Date(a.expirationDate);
					bValue = new Date(b.expirationDate);
					break;
				case "daysExpired":
					aValue = getDaysUntilExpiration(a.expirationDate);
					bValue = getDaysUntilExpiration(b.expirationDate);
					break;
				case "status":
					aValue = a.status;
					bValue = b.status;
					break;
				default:
					return 0;
			}

			if (typeof aValue === "string") {
				aValue = aValue.toLowerCase();
				bValue = bValue.toLowerCase();
				return expiredCircuitsSortConfig.direction === "ascending"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			} else {
				return expiredCircuitsSortConfig.direction === "ascending"
					? aValue - bValue
					: bValue - aValue;
			}
		});

		return sorted;
	};

	// Function to handle sorting column click
	const handleExpiredCircuitsSortClick = (columnKey) => {
		let newDirection = "ascending";
		if (
			expiredCircuitsSortConfig.key === columnKey &&
			expiredCircuitsSortConfig.direction === "ascending"
		) {
			newDirection = "descending";
		}
		setExpiredCircuitsSortConfig({
			key: columnKey,
			direction: newDirection,
		});
	};

	// Helper function to format dates for display
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		// Extract date components from ISO format (YYYY-MM-DD)
		const datePart = dateString.split("T")[0];
		const [year, month, day] = datePart.split("-");
		// Create date in local timezone to avoid UTC conversion issues
		const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
			0,
		).getDate();
		const fractionalMonth = (daysInMonth - dayOfMonth) / daysInMonth;

		// Round to 1 decimal place
		return Math.max(
			0,
			Math.round((monthsUntilExpiration + fractionalMonth) * 10) / 10,
		);
	};

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

	// Function to download circuit analytics filtered circuits as Excel file
	const downloadCircuitAnalyticsAsExcel = () => {
		const filteredCircuits = getFilteredCircuits();

		if (filteredCircuits.length === 0) {
			alert("No circuits to export");
			return;
		}

		// Prepare data for Excel
		const excelData = filteredCircuits.map((circuit) => ({
			"Venue Name": circuit.site.name,
			"Site Type": circuit.site.siteType || "Unknown",
			Provider: circuit.provider.name,
			Bandwidth: circuit.circuitBandwidth,
			"Circuit Type": circuit.circuitType || "Unknown",
			Status: circuit.status || "Pending",
		}));

		// Create workbook and worksheet
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		// Set column widths
		const columnWidths = [
			{ wch: 25 }, // Venue Name
			{ wch: 15 }, // Site Type
			{ wch: 15 }, // Provider
			{ wch: 15 }, // Bandwidth
			{ wch: 15 }, // Circuit Type
			{ wch: 12 }, // Status
		];
		worksheet["!cols"] = columnWidths;

		// Add worksheet to workbook
		XLSX.utils.book_append_sheet(workbook, worksheet, "Circuit Analytics");

		// Generate filename with timestamp
		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `Circuit_Analytics_${timestamp}.xlsx`;

		// Write file
		XLSX.writeFile(workbook, filename);
	};

	// Function to download expiring circuits as Excel file
	const downloadExpiringCircuitsAsExcel = () => {
		const expiringCircuits = getExpiringCircuits();

		if (expiringCircuits.length === 0) {
			alert("No circuits to export");
			return;
		}

		// Prepare data for Excel
		const excelData = expiringCircuits.map((circuit) => {
			const row = {
				"Venue Name": circuit.site.name,
				Address: [
					circuit.site.address,
					circuit.site.city,
					circuit.site.state,
					circuit.site.zipCode,
				]
					.filter(Boolean)
					.join(", "),
				Provider: circuit.provider.name,
				Aggregator:
					circuit.hasAggregator && circuit.aggregatorName
						? circuit.aggregatorName
						: "N/A",
				Bandwidth: circuit.circuitBandwidth,
			};

			// Only add Monthly Cost if user is not NOC
			if (user?.role !== "NOC") {
				row["Monthly Cost"] = circuit.monthlyCost
					? `$${circuit.monthlyCost.toFixed(2)}`
					: "N/A";
			}

			row["Expiration Date"] = formatDate(circuit.expirationDate);
			row["Months Remaining"] = getMonthsUntilExpiration(
				circuit.expirationDate,
			);
			row["Status"] = circuit.status;

			return row;
		});

		// Create workbook and worksheet
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		// Set column widths
		const maxWidth = 20;
		const columnWidths = [
			{ wch: 20 }, // Venue Name
			{ wch: 40 }, // Address
			{ wch: 15 }, // Provider
			{ wch: 15 }, // Aggregator
			{ wch: 12 }, // Bandwidth
			{ wch: 14 }, // Monthly Cost
			{ wch: 15 }, // Expiration Date
			{ wch: 16 }, // Months Remaining
			{ wch: 12 }, // Status
		];
		worksheet["!cols"] = columnWidths;

		// Add worksheet to workbook
		XLSX.utils.book_append_sheet(workbook, worksheet, "Expiring Circuits");

		// Generate filename with timestamp
		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `Circuit_Expiration_Report_${timestamp}.xlsx`;

		// Write file
		XLSX.writeFile(workbook, filename);
	};

	const downloadRenewalNoticeCircuitsAsExcel = () => {
		const renewalNoticeCircuits = getRenewalNoticeCircuits();

		if (renewalNoticeCircuits.length === 0) {
			alert("No circuits to export");
			return;
		}

		const excelData = renewalNoticeCircuits.map((circuit) => {
			const daysRemaining = getDaysUntilExpiration(circuit.renewalNoticeDate);
			const row = {
				"Venue Name": circuit.site?.name || "N/A",
				Address: formatSiteAddress(circuit.site),
				Provider: circuit.provider?.name || "N/A",
				Aggregator:
					circuit.hasAggregator && circuit.aggregatorName
						? circuit.aggregatorName
						: "N/A",
				Bandwidth: circuit.circuitBandwidth || "N/A",
				"Renewal Term": circuit.renewalTerm || "N/A",
			};

			if (user?.role !== "NOC") {
				row["Monthly Cost"] =
					typeof circuit.monthlyCost === "number"
						? `$${circuit.monthlyCost.toFixed(2)}`
						: "N/A";
			}

			row["Expiration Date"] = formatDate(circuit.expirationDate);
			row["Renewal Notification Date"] = formatDate(circuit.renewalNoticeDate);
			row["Days Remaining"] =
				typeof daysRemaining === "number" ? daysRemaining : "N/A";

			return row;
		});

		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		worksheet["!cols"] = [
			{ wch: 24 },
			{ wch: 40 },
			{ wch: 18 },
			{ wch: 18 },
			{ wch: 14 },
			{ wch: 14 },
			...(user?.role !== "NOC" ? [{ wch: 14 }] : []),
			{ wch: 18 },
			{ wch: 22 },
			{ wch: 16 },
		];

		XLSX.utils.book_append_sheet(workbook, worksheet, "Renewal Notice Report");

		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `Renewal_Notice_Report_${timestamp}.xlsx`;

		XLSX.writeFile(workbook, filename);
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
							display: "flex",
							gap: "15px",
							alignItems: "center",
						}}
					>
						<button
							onClick={() =>
								window.open(
									"https://app.asana.com/1/943649575918213/project/1209991618007270/board/1209993686905714",
									"_blank",
								)
							}
							style={{
								padding: "10px 20px",
								border: "none",
								borderRadius: "4px",
								backgroundColor: "#FFD700",
								color: "black",
								fontSize: "14px",
								fontWeight: "bold",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							📋 AccessParks Circuits
						</button>
					</div>
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
									<option value="Wireless">Wireless</option>
								</select>
							</div>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<label htmlFor="providerFilter" style={{ fontSize: "14px" }}>
									Provider:
								</label>
								<select
									id="providerFilter"
									value={providerFilter}
									onChange={(e) => setProviderFilter(e.target.value)}
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
									<option value="All">All Providers</option>
									{getUniqueProviders().map((provider) => (
										<option key={provider} value={provider}>
											{provider}
										</option>
									))}
								</select>
							</div>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<label htmlFor="aggregatorFilter" style={{ fontSize: "14px" }}>
									Aggregator:
								</label>
								<select
									id="aggregatorFilter"
									value={aggregatorFilter}
									onChange={(e) => setAggregatorFilter(e.target.value)}
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
									<option value="All">All Aggregators</option>
									{getUniqueAggregators().map((aggregator) => (
										<option key={aggregator} value={aggregator}>
											{aggregator}
										</option>
									))}
								</select>
							</div>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<label htmlFor="siteStateFilter" style={{ fontSize: "14px" }}>
									State:
								</label>
								<select
									id="siteStateFilter"
									value={siteStateFilter}
									onChange={(e) => setSiteStateFilter(e.target.value)}
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
									<option value="All">All States</option>
									{getUniqueSiteStates().map((state) => (
										<option key={state} value={state}>
											{state}
										</option>
									))}
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
						<div
							style={{
								marginTop: "40px",
								marginBottom: "20px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								flexWrap: "wrap",
								gap: "15px",
							}}
						>
							<h2
								style={{
									margin: 0,
									color: "#ffffff",
									backgroundColor: "#2c3e50",
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
									flex: 1,
									minWidth: "200px",
								}}
							>
								Circuit List {getFilterSubtitle()}
							</h2>
							<button
								onClick={downloadCircuitAnalyticsAsExcel}
								style={{
									padding: "10px 16px",
									border: "none",
									borderRadius: "4px",
									backgroundColor: "#27ae60",
									color: "white",
									fontSize: "14px",
									fontWeight: "bold",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "6px",
									transition: "background-color 0.3s",
									whiteSpace: "nowrap",
								}}
								onMouseEnter={(e) => {
									e.target.style.backgroundColor = "#229954";
								}}
								onMouseLeave={(e) => {
									e.target.style.backgroundColor = "#27ae60";
								}}
							>
								📥 Export to Excel
							</button>
						</div>
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
							display: "flex",
							gap: "15px",
							alignItems: "center",
						}}
					>
						<button
							onClick={() =>
								window.open(
									"https://app.asana.com/1/943649575918213/project/1209991618007270/board/1209993686905714",
									"_blank",
								)
							}
							style={{
								padding: "10px 20px",
								border: "none",
								borderRadius: "4px",
								backgroundColor: "#FFD700",
								color: "black",
								fontSize: "14px",
								fontWeight: "bold",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							📋 AccessParks Circuits
						</button>
					</div>
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
								next{" "}
								{customExpirationMonths
									? customExpirationMonths
									: expirationTimeRange}{" "}
								{(customExpirationMonths
									? customExpirationMonths
									: expirationTimeRange) === 1
									? "month"
									: "months"}
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
							<label htmlFor="timeRangeFilter" style={{ fontSize: "14px" }}>
								Time Range:
							</label>
							<select
								id="timeRangeFilter"
								value={expirationTimeRange}
								onChange={(e) => {
									setExpirationTimeRange(Number(e.target.value));
									setCustomExpirationMonths(""); // Clear custom when selecting preset
								}}
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
							<span style={{ fontSize: "14px", color: "#ffffff" }}>or</span>
							<label htmlFor="customTimeRange" style={{ fontSize: "14px" }}>
								Custom (months):
							</label>
							<input
								id="customTimeRange"
								type="number"
								min="1"
								max="120"
								value={customExpirationMonths}
								onChange={(e) => setCustomExpirationMonths(e.target.value)}
								placeholder="Enter months"
								style={{
									padding: "6px 10px",
									borderRadius: "4px",
									border: "1px solid #3498db",
									backgroundColor: "#34495e",
									color: "#ffffff",
									fontSize: "14px",
									width: "80px",
								}}
							/>
							<button
								onClick={downloadExpiringCircuitsAsExcel}
								style={{
									padding: "8px 16px",
									border: "none",
									borderRadius: "4px",
									backgroundColor: "#27ae60",
									color: "white",
									fontSize: "14px",
									fontWeight: "bold",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "6px",
									transition: "background-color 0.3s",
								}}
								onMouseEnter={(e) => {
									e.target.style.backgroundColor = "#229954";
								}}
								onMouseLeave={(e) => {
									e.target.style.backgroundColor = "#27ae60";
								}}
							>
								📥 Download Excel
							</button>
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
										<th style={tableHeaderStyle}>Address</th>
										<th style={tableHeaderStyle}>Provider</th>
										<th style={tableHeaderStyle}>Aggregator</th>
										<th style={tableHeaderStyle}>Bandwidth</th>
										{user?.role !== "NOC" && (
											<th style={tableHeaderStyle}>Monthly Cost</th>
										)}
										<th style={tableHeaderStyle}>Expiration Date</th>
										<th style={tableHeaderStyle}>Months Remaining</th>
										<th style={tableHeaderStyle}>Status</th>
									</tr>
								</thead>
								<tbody>
									{expiringCircuits.map((circuit, index) => {
										const monthsUntilExpiration = getMonthsUntilExpiration(
											circuit.expirationDate,
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
													{[
														circuit.site.address,
														circuit.site.city,
														circuit.site.state,
														circuit.site.zipCode,
													]
														.filter(Boolean)
														.join(", ")}
												</td>
												<td style={tableCellStyle}>{circuit.provider.name}</td>
												<td style={tableCellStyle}>
													{circuit.hasAggregator && circuit.aggregatorName
														? circuit.aggregatorName
														: "N/A"}
												</td>
												<td style={tableCellStyle}>
													{circuit.circuitBandwidth}
												</td>
												{user?.role !== "NOC" && (
													<td style={tableCellStyle}>
														$
														{circuit.monthlyCost
															? circuit.monthlyCost.toFixed(2)
															: "N/A"}
													</td>
												)}
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
							{customExpirationMonths
								? customExpirationMonths
								: expirationTimeRange}{" "}
							{(customExpirationMonths
								? customExpirationMonths
								: expirationTimeRange) === 1
								? "month"
								: "months"}
						</div>
					</div>
				</div>
			);
		} else if (selectedMenu === "Renewal Notice Report") {
			const renewalNoticeCircuits = getRenewalNoticeCircuits();
			const renewalNoticeRangeLabel = customRenewalNoticeDays
				? `next ${customRenewalNoticeDays} day${
						customRenewalNoticeDays === "1" ? "" : "s"
					}`
				: renewalNoticeTimeRange === "All"
					? "all renewal notification dates"
					: `next ${renewalNoticeTimeRange} day${
							renewalNoticeTimeRange === "1" ? "" : "s"
						}`;

			return (
				<div style={{ width: "100%" }}>
					<div
						style={{
							marginBottom: "20px",
							display: "flex",
							gap: "15px",
							alignItems: "center",
						}}
					>
						<button
							onClick={() =>
								window.open(
									"https://app.asana.com/1/943649575918213/project/1209991618007270/board/1209993686905714",
									"_blank",
								)
							}
							style={{
								padding: "10px 20px",
								border: "none",
								borderRadius: "4px",
								backgroundColor: "#FFD700",
								color: "black",
								fontSize: "14px",
								fontWeight: "bold",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							📋 AccessParks Circuits
						</button>
					</div>
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
								Renewal Notice Report
							</h2>
							<div style={{ fontSize: "14px", marginTop: "5px" }}>
								Showing {renewalNoticeCircuits.length} circuits for{" "}
								{renewalNoticeRangeLabel}
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
							<label
								htmlFor="renewalNoticeTimeRange"
								style={{ fontSize: "14px" }}
							>
								Date Range:
							</label>
							<select
								id="renewalNoticeTimeRange"
								value={renewalNoticeTimeRange}
								onChange={(e) => {
									setRenewalNoticeTimeRange(e.target.value);
									setCustomRenewalNoticeDays("");
								}}
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
								<option value="All">All</option>
								<option value="30">30 Days</option>
								<option value="60">60 Days</option>
								<option value="90">90 Days</option>
								<option value="180">180 Days</option>
							</select>
							<span style={{ fontSize: "14px", color: "#ffffff" }}>or</span>
							<label
								htmlFor="customRenewalNoticeDays"
								style={{ fontSize: "14px" }}
							>
								Custom (days):
							</label>
							<input
								id="customRenewalNoticeDays"
								type="number"
								min="1"
								max="3650"
								value={customRenewalNoticeDays}
								onChange={(e) => setCustomRenewalNoticeDays(e.target.value)}
								placeholder="Enter days"
								style={{
									padding: "6px 10px",
									borderRadius: "4px",
									border: "1px solid #3498db",
									backgroundColor: "#34495e",
									color: "#ffffff",
									fontSize: "14px",
									width: "100px",
								}}
							/>
							<button
								onClick={downloadRenewalNoticeCircuitsAsExcel}
								style={{
									padding: "8px 16px",
									border: "none",
									borderRadius: "4px",
									backgroundColor: "#27ae60",
									color: "white",
									fontSize: "14px",
									fontWeight: "bold",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "6px",
								}}
							>
								📥 Download Excel
							</button>
						</div>
					</div>

					<div
						style={{
							backgroundColor: "#f0f4f8",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							margin: "0 auto",
							maxWidth: "1200px",
							width: "100%",
							overflowX: "auto",
						}}
					>
						{renewalNoticeCircuits.length > 0 ? (
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
										<th style={tableHeaderStyle}>Venue Name</th>
										<th style={tableHeaderStyle}>Address</th>
										<th style={tableHeaderStyle}>Provider</th>
										<th style={tableHeaderStyle}>Aggregator</th>
										<th style={tableHeaderStyle}>Bandwidth</th>
										<th style={tableHeaderStyle}>Renewal Term</th>
										{user?.role !== "NOC" && (
											<th style={tableHeaderStyle}>Monthly Cost</th>
										)}
										<th style={tableHeaderStyle}>Expiration Date</th>
										<th style={tableHeaderStyle}>Renewal Notification Date</th>
										<th style={tableHeaderStyle}>Days Remaining</th>
									</tr>
								</thead>
								<tbody>
									{renewalNoticeCircuits.map((circuit, index) => {
										const daysRemaining = getDaysUntilExpiration(
											circuit.renewalNoticeDate,
										);

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
													{circuit.site?.name || "N/A"}
												</td>
												<td style={tableCellStyle}>
													{formatSiteAddress(circuit.site)}
												</td>
												<td style={tableCellStyle}>
													{circuit.provider?.name || "N/A"}
												</td>
												<td style={tableCellStyle}>
													{circuit.hasAggregator && circuit.aggregatorName
														? circuit.aggregatorName
														: "N/A"}
												</td>
												<td style={tableCellStyle}>
													{circuit.circuitBandwidth || "N/A"}
												</td>
												<td style={tableCellStyle}>
													{circuit.renewalTerm || "N/A"}
												</td>
												{user?.role !== "NOC" && (
													<td style={tableCellStyle}>
														{typeof circuit.monthlyCost === "number"
															? `$${circuit.monthlyCost.toFixed(2)}`
															: "N/A"}
													</td>
												)}
												<td style={tableCellStyle}>
													{formatDate(circuit.expirationDate)}
												</td>
												<td
													style={{
														...tableCellStyle,
														fontWeight: "600",
														color: "#1d4ed8",
													}}
												>
													{formatDate(circuit.renewalNoticeDate)}
												</td>
												<td
													style={{
														...tableCellStyle,
														fontWeight: "600",
														color:
															typeof daysRemaining === "number" &&
															daysRemaining < 0
																? "#dc2626"
																: "#2c3e50",
													}}
												>
													{typeof daysRemaining === "number"
														? daysRemaining
														: "N/A"}
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
								No circuits match the selected renewal notice date range
							</div>
						)}
					</div>

					<div
						style={{
							marginTop: "20px",
							padding: "15px",
							backgroundColor: "#f0f4f8",
							borderRadius: "8px",
							maxWidth: "1200px",
							margin: "20px auto 0",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							fontSize: "14px",
							color: "#64748B",
						}}
					>
						Note: The filter shows renewal notification dates from today through
						the selected number of days, or all renewal notification dates when
						set to All.
					</div>
				</div>
			);
		} else if (selectedMenu === "Tower Report") {
			const towerCircuits = circuits.filter((c) => c.hasTower);

			// Flatten towers: create one row per tower per circuit
			const towerRows = [];
			towerCircuits.forEach((circuit) => {
				const numTowers = parseInt(circuit.numberOfTowers) || 0;
				if (numTowers > 0) {
					for (let i = 1; i <= numTowers; i++) {
						towerRows.push({
							circuit,
							towerNumber: i,
							towerProvider: circuit[`towerProvider${i}`] || "N/A",
							towerInstallDate: circuit[`towerInstallDate${i}`] || "N/A",
							towerExpirationDate: circuit[`towerExpirationDate${i}`] || "N/A",
							towerMonthlyCost: circuit[`towerMonthlyCost${i}`] || "0.00",
						});
					}
				}
			});

			// Group by circuit for better organization
			const siteGroups = {};
			towerRows.forEach((row) => {
				const circuitId = row.circuit.id;
				if (!siteGroups[circuitId]) {
					siteGroups[circuitId] = {
						circuit: row.circuit,
						towers: [],
					};
				}
				siteGroups[circuitId].towers.push(row);
			});

			// Format site address
			const formatSiteAddress = (site) => {
				if (!site) return "N/A";
				const parts = [];
				if (site.address) parts.push(site.address);
				const cityState = [site.city, site.state].filter(Boolean).join(", ");
				if (cityState)
					parts.push(cityState + (site.zipCode ? ` ${site.zipCode}` : ""));
				return parts.length ? parts.join(", ") : "N/A";
			};

			const siteHeaderStyle = {
				backgroundColor: "#2c3e50",
				color: "white",
				padding: "14px 12px",
				fontWeight: "700",
				fontSize: "15px",
				textAlign: "left",
				borderBottom: "3px solid #3498db",
			};

			const towerSectionHeaderStyle = {
				backgroundColor: "#34495e",
				color: "#ecf0f1",
				padding: "10px 12px",
				fontWeight: "600",
				fontSize: "13px",
				textAlign: "left",
				borderLeft: "4px solid #3498db",
			};

			return (
				<div style={{ width: "100%" }}>
					<div
						style={{
							marginBottom: "20px",
							display: "flex",
							gap: "15px",
							alignItems: "center",
						}}
					>
						<button
							onClick={() =>
								window.open(
									"https://app.asana.com/1/943649575918213/project/1209991618007270/board/1209993686905714",
									"_blank",
								)
							}
							style={{
								padding: "10px 20px",
								border: "none",
								borderRadius: "4px",
								backgroundColor: "#FFD700",
								color: "black",
								fontSize: "14px",
								fontWeight: "bold",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							📋 AccessParks Circuits
						</button>
					</div>
					<div
						style={{
							backgroundColor: "#f0f4f8",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							margin: "0 auto",
							maxWidth: "1400px",
							width: "100%",
							overflowX: "auto",
						}}
					>
						<div
							style={{
								backgroundColor: "#2c3e50",
								color: "#ffffff",
								padding: "15px 20px",
								borderRadius: "4px",
								marginBottom: "20px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							}}
						>
							<h2 style={{ margin: 0, fontSize: "18px" }}>📊 Tower Report</h2>
							<div
								style={{ fontSize: "14px", marginTop: "8px", color: "#ecf0f1" }}
							>
								Showing {towerRows.length} towers from {towerCircuits.length}{" "}
								site
								{towerCircuits.length !== 1 ? "s" : ""}
							</div>
						</div>
						{towerRows.length > 0 ? (
							<div>
								{Object.values(siteGroups).map((siteGroup, siteIndex) => (
									<div
										key={siteGroup.circuit.id}
										style={{
											marginBottom: "24px",
											borderRadius: "6px",
											overflow: "hidden",
											border: "2px solid #3498db",
											boxShadow:
												siteIndex % 2 === 0
													? "0 2px 6px rgba(52, 152, 219, 0.15)"
													: "0 2px 6px rgba(52, 73, 94, 0.1)",
										}}
									>
										{/* Site Header */}
										<div style={siteHeaderStyle}>
											📍 {siteGroup.circuit.site?.name || "N/A"}
										</div>

										{/* Site Details */}
										<div
											style={{
												backgroundColor: "#ecf0f1",
												padding: "12px 14px",
												display: "grid",
												gridTemplateColumns:
													"repeat(auto-fit, minmax(200px, 1fr))",
												gap: "12px",
												fontSize: "13px",
												color: "#2c3e50",
											}}
										>
											<div>
												<span
													style={{
														fontWeight: "600",
														color: "#34495e",
													}}
												>
													Address:{" "}
												</span>
												<span>{formatSiteAddress(siteGroup.circuit.site)}</span>
											</div>
											<div>
												<span
													style={{
														fontWeight: "600",
														color: "#34495e",
													}}
												>
													Provider:{" "}
												</span>
												<span>{siteGroup.circuit.provider?.name || "N/A"}</span>
											</div>
											<div>
												<span
													style={{
														fontWeight: "600",
														color: "#34495e",
													}}
												>
													Total Towers:{" "}
												</span>
												<span
													style={{
														backgroundColor: "#3498db",
														color: "white",
														padding: "2px 8px",
														borderRadius: "4px",
														fontWeight: "bold",
														display: "inline-block",
													}}
												>
													{siteGroup.circuit.numberOfTowers || "N/A"}
												</span>
											</div>
										</div>

										{/* Tower Details Table */}
										<table
											style={{
												width: "100%",
												borderCollapse: "collapse",
											}}
										>
											<thead>
												<tr style={towerSectionHeaderStyle}>
													<td
														style={{
															...towerSectionHeaderStyle,
															flex: 1,
															minWidth: "80px",
														}}
													>
														Tower #
													</td>
													<td
														style={{
															...towerSectionHeaderStyle,
															flex: 1,
															minWidth: "120px",
														}}
													>
														Tower Provider
													</td>
													<td
														style={{
															...towerSectionHeaderStyle,
															flex: 1,
															minWidth: "130px",
														}}
													>
														Installation Date
													</td>
													<td
														style={{
															...towerSectionHeaderStyle,
															flex: 1,
															minWidth: "130px",
														}}
													>
														Expiration Date
													</td>
													{user?.role !== "NOC" && (
														<td
															style={{
																...towerSectionHeaderStyle,
																flex: 1,
																minWidth: "100px",
															}}
														>
															Monthly Cost
														</td>
													)}
												</tr>
											</thead>
											<tbody>
												{siteGroup.towers.map((row, towerIndex) => (
													<tr
														key={`${row.circuit.id}-${row.towerNumber}`}
														style={{
															borderBottom:
																towerIndex < siteGroup.towers.length - 1
																	? "1px solid #dee2e6"
																	: "none",
															backgroundColor:
																towerIndex % 2 === 0 ? "#ffffff" : "#f8f9fa",
															transition: "background-color 0.2s ease",
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.backgroundColor = "#e8f4f8";
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.backgroundColor =
																towerIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";
														}}
													>
														<td
															style={{
																...tableCellStyle,
																fontWeight: "700",
																color: "#3498db",
																fontSize: "15px",
															}}
														>
															Tower {row.towerNumber}
														</td>
														<td
															style={{
																...tableCellStyle,
																fontWeight: "500",
															}}
														>
															{row.towerProvider}
														</td>
														<td style={tableCellStyle}>
															{row.towerInstallDate}
														</td>
														<td
															style={{
																...tableCellStyle,
																color: isExpired(row.towerExpirationDate)
																	? "#ffffff"
																	: isExpirationSoon(row.towerExpirationDate)
																		? "#ffffff"
																		: "#2c3e50",
																backgroundColor: isExpired(
																	row.towerExpirationDate,
																)
																	? "#e74c3c"
																	: isExpirationSoon(row.towerExpirationDate)
																		? "#f39c12"
																		: "transparent",
																fontWeight: isExpired(row.towerExpirationDate)
																	? "700"
																	: isExpirationSoon(row.towerExpirationDate)
																		? "600"
																		: "500",
																padding:
																	isExpired(row.towerExpirationDate) ||
																	isExpirationSoon(row.towerExpirationDate)
																		? "6px 8px"
																		: "12px",
																borderRadius:
																	isExpired(row.towerExpirationDate) ||
																	isExpirationSoon(row.towerExpirationDate)
																		? "4px"
																		: "0px",
															}}
														>
															{row.towerExpirationDate}
														</td>
														{user?.role !== "NOC" && (
															<td
																style={{
																	...tableCellStyle,
																	fontWeight: "600",
																	color: "#27ae60",
																}}
															>
																{typeof row.towerMonthlyCost === "number" ||
																!isNaN(parseFloat(row.towerMonthlyCost))
																	? "$" +
																		parseFloat(row.towerMonthlyCost).toFixed(2)
																	: "$0.00"}
															</td>
														)}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								))}
							</div>
						) : (
							<div
								style={{
									textAlign: "center",
									padding: "30px",
									color: "#64748B",
									fontStyle: "italic",
								}}
							>
								No towers found
							</div>
						)}
					</div>
				</div>
			);
		} else if (selectedMenu === "Expired Circuits") {
			const expiredCircuits = getExpiredCircuits();
			const today = new Date();

			return (
				<div style={{ width: "100%" }}>
					<div
						style={{
							marginBottom: "20px",
							display: "flex",
							gap: "15px",
							alignItems: "center",
						}}
					>
						<button
							onClick={() =>
								window.open(
									"https://app.asana.com/1/943649575918213/project/1209991618007270/board/1209993686905714",
									"_blank",
								)
							}
							style={{
								padding: "10px 20px",
								border: "none",
								borderRadius: "4px",
								backgroundColor: "#FFD700",
								color: "black",
								fontSize: "14px",
								fontWeight: "bold",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							📋 AccessParks Circuits
						</button>
					</div>
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
							<h2 style={{ margin: 0, fontSize: "18px" }}>Expired Circuits</h2>
							<div style={{ fontSize: "14px", marginTop: "5px" }}>
								Showing {expiredCircuits.length} circuits with expiration dates
								equal to or before today
							</div>
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
						{expiredCircuits.length > 0 ? (
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "venueName"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() =>
												handleExpiredCircuitsSortClick("venueName")
											}
											title="Click to sort"
										>
											Venue Name{" "}
											{expiredCircuitsSortConfig.key === "venueName" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "siteType"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() => handleExpiredCircuitsSortClick("siteType")}
											title="Click to sort"
										>
											Site Type{" "}
											{expiredCircuitsSortConfig.key === "siteType" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "provider"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() => handleExpiredCircuitsSortClick("provider")}
											title="Click to sort"
										>
											Provider{" "}
											{expiredCircuitsSortConfig.key === "provider" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "aggregator"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() =>
												handleExpiredCircuitsSortClick("aggregator")
											}
											title="Click to sort"
										>
											Aggregator{" "}
											{expiredCircuitsSortConfig.key === "aggregator" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "circuitType"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() =>
												handleExpiredCircuitsSortClick("circuitType")
											}
											title="Click to sort"
										>
											Circuit Type{" "}
											{expiredCircuitsSortConfig.key === "circuitType" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "bandwidth"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() =>
												handleExpiredCircuitsSortClick("bandwidth")
											}
											title="Click to sort"
										>
											Bandwidth{" "}
											{expiredCircuitsSortConfig.key === "bandwidth" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "expirationDate"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() =>
												handleExpiredCircuitsSortClick("expirationDate")
											}
											title="Click to sort"
										>
											Expiration Date{" "}
											{expiredCircuitsSortConfig.key === "expirationDate" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "daysExpired"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() =>
												handleExpiredCircuitsSortClick("daysExpired")
											}
											title="Click to sort"
										>
											Days Expired{" "}
											{expiredCircuitsSortConfig.key === "daysExpired" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													expiredCircuitsSortConfig.key === "status"
														? "#34495e"
														: "#2c3e50",
											}}
											onClick={() => handleExpiredCircuitsSortClick("status")}
											title="Click to sort"
										>
											Status{" "}
											{expiredCircuitsSortConfig.key === "status" &&
												(expiredCircuitsSortConfig.direction === "ascending"
													? "↑"
													: "↓")}
										</th>
									</tr>
								</thead>
								<tbody>
									{getSortedExpiredCircuits(expiredCircuits).map(
										(circuit, index) => {
											const daysUntilExpiration = getDaysUntilExpiration(
												circuit.expirationDate,
											);
											const daysExpired = Math.abs(daysUntilExpiration);

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
																		? "#3498db"
																		: circuit.site.siteType === "DHC"
																			? "#9b59b6"
																			: "#95a5a6",
																color: "white",
															}}
														>
															{circuit.site.siteType}
														</span>
													</td>
													<td style={tableCellStyle}>
														{circuit.provider?.name || "N/A"}
													</td>
													<td style={tableCellStyle}>
														{circuit.hasAggregator && circuit.aggregatorName
															? circuit.aggregatorName
															: "N/A"}
													</td>
													<td style={tableCellStyle}>{circuit.circuitType}</td>
													<td style={tableCellStyle}>
														{circuit.circuitBandwidth} Mbps
													</td>
													<td style={tableCellStyle}>
														{formatDate(circuit.expirationDate)}
													</td>
													<td
														style={{
															...tableCellStyle,
															color: "#EF4444",
															fontWeight: "bold",
														}}
													>
														{daysExpired} {daysExpired === 1 ? "day" : "days"}
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
																		? "#2ecc71"
																		: circuit.status === "Pending"
																			? "#f39c12"
																			: circuit.status === "Inactive"
																				? "#e74c3c"
																				: "#95a5a6",
																color: "white",
															}}
														>
															{circuit.status}
														</span>
													</td>
												</tr>
											);
										},
									)}
								</tbody>
							</table>
						) : (
							<div
								style={{
									textAlign: "center",
									padding: "40px 20px",
									color: "#7f8c8d",
									fontSize: "16px",
								}}
							>
								Great news! No circuits have expired yet.
							</div>
						)}
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
		zIndex: 999,
	};

	const responsiveContentStyle = {
		padding: "20px",
		flex: 1,
		minWidth: 0,
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
			className="app-side-page"
			style={{
				paddingTop: "50px",
				width: "100%",
			}}
		>
			<nav className="app-side-nav" style={responsiveNavStyle}>
				<ul
					style={{
						listStyle: "none",
						padding: 0,
						color: "#ecf0f1",
						fontSize: "16px",
					}}
				>
					{[
						"Circuit Analytics",
						"Circuit Expiration Report",
						"Renewal Notice Report",
						"Expired Circuits",
						"Tower Report",
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
			<div className="app-side-page-content" style={responsiveContentStyle}>
				<div style={responsiveChartContainer}>{renderContent()}</div>
			</div>
		</div>
	);
}

export default Reports;
