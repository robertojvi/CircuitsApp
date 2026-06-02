import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { RenewalAnalysisModal, getApiErrorMessage } from "./RenewalAnalysis";
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

// Renewal Analysis calculation helpers
const raParseDate = (value) => {
	if (!value) return null;
	const datePart = String(value).split("T")[0];
	const [year, month, day] = datePart.split("-").map(Number);
	if ([year, month, day].some(Number.isNaN)) return null;
	return new Date(year, month - 1, day);
};

const raRoundCurrency = (value) => {
	if (!Number.isFinite(value)) return null;
	return Math.round(value * 100) / 100;
};

const raGetStartOfNextMonth = (date) => {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
	return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

const raCalculateRoundedUpMonths = (startDate, endDate) => {
	if (!(startDate instanceof Date) || !(endDate instanceof Date)) return null;
	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
	if (endDate <= startDate) return 0;
	let months =
		(endDate.getFullYear() - startDate.getFullYear()) * 12 +
		(endDate.getMonth() - startDate.getMonth());
	const adjusted = new Date(startDate);
	adjusted.setMonth(adjusted.getMonth() + months);
	if (adjusted < endDate) months += 1;
	return months;
};

const raBuildRenewalPreview = (circuit) => {
	const currentMrc = Number(circuit.monthlyCost);
	const renewalMrc = Number(circuit.renewalMonthlyCost);
	const customerExpirationDate = raParseDate(circuit.site?.customerContractExpirationDate);
	const renewalCircuitExpirationDate = raParseDate(circuit.renewalCircuitExpirationDate);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const startOfNextMonth = raGetStartOfNextMonth(today);

	const savingsDifference =
		Number.isFinite(currentMrc) && Number.isFinite(renewalMrc)
			? raRoundCurrency(currentMrc - renewalMrc)
			: null;

	const monthsToCustomerContractExpiration = customerExpirationDate
		? raCalculateRoundedUpMonths(startOfNextMonth, customerExpirationDate)
		: null;

	const savingsUntilCustomerContractExpiration =
		savingsDifference != null && monthsToCustomerContractExpiration != null
			? raRoundCurrency(savingsDifference * monthsToCustomerContractExpiration)
			: null;

	const monthsBetweenExpirationDates =
		customerExpirationDate && renewalCircuitExpirationDate
			? raCalculateRoundedUpMonths(customerExpirationDate, renewalCircuitExpirationDate)
			: null;

	const costFromCustomerExpirationToRenewalExpiration =
		Number.isFinite(renewalMrc) && monthsBetweenExpirationDates != null
			? raRoundCurrency(renewalMrc * monthsBetweenExpirationDates)
			: null;

	const totalSavings =
		savingsUntilCustomerContractExpiration != null &&
		costFromCustomerExpirationToRenewalExpiration != null
			? raRoundCurrency(
					savingsUntilCustomerContractExpiration -
						costFromCustomerExpirationToRenewalExpiration,
				)
			: null;

	return {
		savingsDifference,
		monthsToCustomerContractExpiration,
		savingsUntilCustomerContractExpiration,
		costFromCustomerExpirationToRenewalExpiration,
		totalSavings,
	};
};

const raFormatCurrency = (value) => {
	if (value == null || value === "") return "N/A";
	const n = Number(value);
	if (!Number.isFinite(n)) return "N/A";
	return n.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

function Reports() {
	const [selectedMenu, setSelectedMenu] = useState("Circuit Analytics");
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { token, user } = useAuth();
	const navigate = useNavigate();
	const { theme } = useTheme();
	const [raSelectedCircuit, setRaSelectedCircuit] = useState(null);
	const [raShowModal, setRaShowModal] = useState(false);
	const [raSaving, setRaSaving] = useState(false);

	// Theme-aware color palette for charts
	const chartColors = {
		light: {
			primary: "#3498db",
			success: "#27ae60",
			warning: "#f39c12",
			error: "#e74c3c",
			secondary: "#95a5a6",
			containerBg: "var(--color-dark-bg-secondary)",
			textDark: "#2c3e50",
			textLight: "#2c3e50", // Dark text for light backgrounds
			headerText: "#2c3e50", // Headers in light mode use dark text
			dataLabelColor: "var(--color-dark-bg)", // White labels on bars for contrast
			gridColor: "#e8e8e8",
			borderColor: "#bdc3c7",
		},
		dark: {
			primary: "#3498db",
			success: "#2ecc71",
			warning: "#f39c12",
			error: "#e74c3c",
			secondary: "#7f8c8d",
			containerBg: "#2c3e50",
			textDark: "#2c3e50",
			textLight: "#ecf0f1", // Light text for dark backgrounds
			headerText: "#ecf0f1", // Headers in dark mode use light text
			dataLabelColor: "var(--color-dark-bg)", // White labels on bars for contrast
			gridColor: "#34495e",
			borderColor: "#34495e",
		},
	};

	const colors = chartColors[theme] || chartColors.dark;

	// Helper function to get CSS variable value (computed style)
	const getCSSVariableValue = (variableName) => {
		return getComputedStyle(document.documentElement)
			.getPropertyValue(variableName)
			.trim();
	};
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
	const [renewalTermFilter, setRenewalTermFilter] = useState("All");
	const [towerRenewalDays, setTowerRenewalDays] = useState(60); // Default to 60 days
	const [customTowerRenewalDays, setCustomTowerRenewalDays] = useState(""); // For custom days input
	const [towerExpirationStartDate, setTowerExpirationStartDate] = useState("");
	const [towerExpirationEndDate, setTowerExpirationEndDate] = useState("");
	const AGGREGATOR_NA_FILTER = "__NA__";
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
			selectedMenu === "Tower Report" ||
			selectedMenu === "Tower Renewal Notice Report" ||
			selectedMenu === "Tower Expiration Report" ||
			selectedMenu === "New Build Sites Report" ||
			selectedMenu === "Renewal Analysis Report"
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
				aggregatorFilter === "All"
					? true
					: aggregatorFilter === AGGREGATOR_NA_FILTER
						? !circuit.hasAggregator ||
							!String(circuit.aggregatorName || "").trim()
						: circuit.hasAggregator &&
							circuit.aggregatorName === aggregatorFilter;

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
			parts.push(
				aggregatorFilter === AGGREGATOR_NA_FILTER
					? "N/A Aggregator"
					: `${aggregatorFilter} Aggregator`,
			);
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

	const getUniqueRenewalTerms = () => {
		const renewalTerms = new Set();
		circuits.forEach((circuit) => {
			if (circuit.renewalTerm) {
				renewalTerms.add(circuit.renewalTerm);
			}
		});
		return Array.from(renewalTerms).sort((a, b) =>
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
					backgroundColor: colors.primary,
					borderColor: colors.primary,
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
					backgroundColor: colors.success,
					borderColor: colors.success,
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
								return colors.success;
							case "Pending":
								return colors.warning;
							case "Inactive":
								return colors.error;
							default:
								return colors.secondary;
						}
					}),
					borderColor: sortedEntries.map(([key]) => {
						// Darker border colors
						switch (key) {
							case "Active":
								return colors.success;
							case "Pending":
								return colors.warning;
							case "Inactive":
								return colors.error;
							default:
								return colors.secondary;
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

	const getExpiredCircuits = () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return circuits
			.filter((circuit) => {
				if (!circuit.expirationDate) return false;
				const expirationDate = new Date(circuit.expirationDate);
				expirationDate.setHours(0, 0, 0, 0);
				return expirationDate < today;
			})
			.sort((a, b) => new Date(b.expirationDate) - new Date(a.expirationDate));
	};

	const getRenewalNoticeCircuits = () => {
		const hasMeaningfulRenewalTerm = (renewalTerm) => {
			if (!renewalTerm) return false;

			const normalizedTerm = renewalTerm.trim().toLowerCase();
			return (
				normalizedTerm !== "" &&
				normalizedTerm !== "na" &&
				normalizedTerm !== "n/a"
			);
		};

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
				const hasRenewalNoticeDate = Boolean(circuit.renewalNoticeDate);
				const meaningfulRenewalTerm = hasMeaningfulRenewalTerm(
					circuit.renewalTerm,
				);

				if (!hasRenewalNoticeDate && !meaningfulRenewalTerm) return false;

				const renewalTermMatch =
					renewalTermFilter === "All" ||
					circuit.renewalTerm === renewalTermFilter;

				if (!renewalTermMatch) return false;

				if (!hasRenewalNoticeDate) return true;

				if (daysToCheck === null) return true;

				const renewalNoticeDate = new Date(circuit.renewalNoticeDate);
				renewalNoticeDate.setHours(0, 0, 0, 0);

				return renewalNoticeDate >= today && renewalNoticeDate <= endDate;
			})
			.sort((a, b) => {
				if (!a.renewalNoticeDate && !b.renewalNoticeDate) {
					return (a.site?.name || "").localeCompare(b.site?.name || "");
				}

				if (!a.renewalNoticeDate) return 1;
				if (!b.renewalNoticeDate) return -1;

				return new Date(a.renewalNoticeDate) - new Date(b.renewalNoticeDate);
			});
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

	// Function to get sites with newBuild flag set to true
	const getNewBuildSites = () => {
		const sitesMap = new Map();

		// Collect all sites with newBuild = true
		circuits.forEach((circuit) => {
			if (circuit.site && circuit.site.newBuild === true) {
				const siteId = circuit.site.id;
				if (!sitesMap.has(siteId)) {
					sitesMap.set(siteId, {
						id: circuit.site.id,
						name: circuit.site.name,
						customerContractDate: circuit.site.customerContractDate,
						serviceCommencementDate: circuit.site.serviceCommencementDate,
					});
				}
			}
		});

		return Array.from(sitesMap.values()).sort((a, b) =>
			a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
		);
	};

	// Function to calculate days between two dates
	const calculateDaysBetween = (startDateStr, endDateStr) => {
		if (!startDateStr || !endDateStr) return null;

		const startDate = new Date(startDateStr);
		const endDate = new Date(endDateStr);

		const timeDifference = endDate - startDate;
		const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

		return daysDifference;
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
		const excelData = filteredCircuits.map((circuit) => {
			const row = {
				"Venue Name": circuit.site.name,
				"Account #": circuit.accountNumber || "N/A",
				"Circuit ID": circuit.circuitId || "N/A",
				Address: formatSiteAddress(circuit.site),
				"Site Type": circuit.site.siteType || "Unknown",
				Provider: circuit.provider.name,
				Bandwidth: circuit.circuitBandwidth,
				"Circuit Type": circuit.circuitType || "Unknown",
				Status: circuit.status || "Pending",
			};
			if (user?.role !== "NOC") {
				row["Monthly Cost"] = circuit.monthlyCost != null
					? `$${Number(circuit.monthlyCost).toFixed(2)}`
					: "N/A";
			}
			return row;
		});

		// Create workbook and worksheet
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		// Set column widths
		const columnWidths = [
			{ wch: 20 }, // Venue Name
			{ wch: 16 }, // Account #
			{ wch: 20 }, // Circuit ID
			{ wch: 40 }, // Address
			{ wch: 15 }, // Site Type
			{ wch: 15 }, // Provider
			{ wch: 15 }, // Bandwidth
			{ wch: 15 }, // Circuit Type
			{ wch: 12 }, // Status
			...(user?.role !== "NOC" ? [{ wch: 14 }] : []), // Monthly Cost
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

	const getTowerExpirationData = () => {
		const startDate = towerExpirationStartDate ? new Date(towerExpirationStartDate + "T00:00:00") : null;
		const endDate = towerExpirationEndDate ? new Date(towerExpirationEndDate + "T23:59:59") : null;

		const towerRows = [];
		circuits.forEach((circuit) => {
			if (circuit.hasTower !== true) return;
			const numTowers = parseInt(circuit.numberOfTowers) || 0;
			for (let i = 1; i <= numTowers; i++) {
				const towerExpirationDate = circuit[`towerExpirationDate${i}`];
				if (!towerExpirationDate) continue;
				const expDate = new Date(towerExpirationDate);
				if (startDate && expDate < startDate) continue;
				if (endDate && expDate > endDate) continue;
				towerRows.push({
					circuit,
					towerNumber: i,
					towerProvider: circuit[`towerProvider${i}`] || "N/A",
					towerInstallDate: circuit[`towerInstallDate${i}`] || null,
					towerExpirationDate: towerExpirationDate || null,
					towerMonthlyCost: circuit[`towerMonthlyCost${i}`] || "0.00",
					daysUntilExpiration: getDaysUntilExpiration(towerExpirationDate),
				});
			}
		});

		return towerRows.sort((a, b) => {
			if (!a.towerExpirationDate && !b.towerExpirationDate)
				return (a.circuit.site?.name || "").localeCompare(b.circuit.site?.name || "");
			if (!a.towerExpirationDate) return 1;
			if (!b.towerExpirationDate) return -1;
			return new Date(a.towerExpirationDate) - new Date(b.towerExpirationDate);
		});
	};

	const downloadTowerExpirationAsExcel = () => {
		const towerData = getTowerExpirationData();
		if (towerData.length === 0) {
			alert("No towers to export");
			return;
		}

		const excelData = towerData.map((row) => {
			const excelRow = {
				"Venue Name": row.circuit.site?.name || "N/A",
				Address: formatSiteAddress(row.circuit.site),
				"Tower #": row.towerNumber,
				"Tower Provider": row.towerProvider,
				"Install Date": formatDate(row.towerInstallDate),
				"Expiration Date": formatDate(row.towerExpirationDate),
				"Days Until Expiration":
					typeof row.daysUntilExpiration === "number"
						? row.daysUntilExpiration
						: "N/A",
			};
			if (user?.role !== "NOC") {
				excelRow["Monthly Cost"] = `$${parseFloat(row.towerMonthlyCost || 0).toFixed(2)}`;
			}
			return excelRow;
		});

		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);
		worksheet["!cols"] = [
			{ wch: 24 },
			{ wch: 40 },
			{ wch: 10 },
			{ wch: 18 },
			{ wch: 14 },
			{ wch: 16 },
			{ wch: 22 },
			...(user?.role !== "NOC" ? [{ wch: 14 }] : []),
		];
		XLSX.utils.book_append_sheet(workbook, worksheet, "Tower Expiration Report");
		const timestamp = new Date().toISOString().split("T")[0];
		XLSX.writeFile(workbook, `Tower_Expiration_Report_${timestamp}.xlsx`);
	};

	// Theme-aware UI element styles
	const themedErrorStyle = {
		color: theme === "light" ? "#a00000" : "#ff6b6b",
		backgroundColor: theme === "light" ? "#f8d7da" : "#5b2c2c",
		padding: "12px 14px",
		borderRadius: "4px",
		marginBottom: "16px",
		border: `1px solid ${theme === "light" ? "#f5c6cb" : "var(--color-error)"}`,
	};

	const themedLoadingStyle = {
		color: theme === "light" ? "#2c3e50" : "#ecf0f1",
		padding: "12px 14px",
		marginBottom: "16px",
	};

	const themedFilterContainerStyle = {
		marginBottom: "20px",
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-dark-bg)",
		padding: "15px 20px",
		borderRadius: "4px",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		flexWrap: "wrap",
		gap: "10px",
		border: `1px solid ${theme === "light" ? "#e0e0e0" : "var(--color-border)"}`,
	};

	const themedFilterLabelStyle = {
		fontSize: "14px",
		color: theme === "light" ? "#2c3e50" : "inherit",
	};

	const themedSelectStyle = {
		padding: "6px 10px",
		borderRadius: "4px",
		border: `1px solid ${theme === "light" ? "#d0d0d0" : "var(--color-primary)"}`,
		backgroundColor:
			theme === "light" ? "#ffffff" : "var(--color-dark-bg-secondary)",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
		fontSize: "14px",
		cursor: "pointer",
	};

	// Helper function to get towers that need renewal notification
	const getTowerRenewalNoticeData = () => {
		const showAll = towerRenewalDays === "all";
		const daysToCheck = showAll
			? 60 // default threshold used only for "Expiring Soon" badge in All Sites mode
			: customTowerRenewalDays
				? parseInt(customTowerRenewalDays, 10)
				: towerRenewalDays;

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const notificationDate = new Date(today);
		notificationDate.setDate(today.getDate() + daysToCheck);

		// Checks whether a tower's expiration falls within the selected days window
		const isExpiringWithinRange = (expirationDate) => {
			if (!expirationDate) return false;
			const expDate = new Date(expirationDate);
			expDate.setHours(0, 0, 0, 0);
			return expDate >= today && expDate <= notificationDate;
		};

		// Find circuits that have at least one qualifying tower
		const qualifyingCircuitIds = new Set();
		circuits.forEach((circuit) => {
			if (circuit.hasTower) {
				const numTowers = parseInt(circuit.numberOfTowers) || 0;
				for (let i = 1; i <= numTowers; i++) {
					if (showAll || isExpiringWithinRange(circuit[`towerExpirationDate${i}`])) {
						qualifyingCircuitIds.add(circuit.id);
						break;
					}
				}
			}
		});

		// Include ALL towers for qualifying circuits
		const towerRenewalData = [];
		circuits.forEach((circuit) => {
			if (qualifyingCircuitIds.has(circuit.id)) {
				const numTowers = parseInt(circuit.numberOfTowers) || 0;
				for (let i = 1; i <= numTowers; i++) {
					const towerExpirationDate = circuit[`towerExpirationDate${i}`];
					towerRenewalData.push({
						circuit,
						towerNumber: i,
						towerProvider: circuit[`towerProvider${i}`] || "N/A",
						towerInstallDate: circuit[`towerInstallDate${i}`] || "N/A",
						towerExpirationDate: towerExpirationDate,
						towerRenewalNoticeDate: circuit[`towerRenewalNoticeDate${i}`] || null,
						towerMonthlyCost: circuit[`towerMonthlyCost${i}`] || "0.00",
						daysUntilExpiration: getDaysUntilExpiration(towerExpirationDate),
						isQualifying: isExpiringWithinRange(towerExpirationDate),
					});
				}
			}
		});

		// Sort by site name, then tower number
		return towerRenewalData.sort((a, b) => {
			const nameA = a.circuit.site?.name?.toLowerCase() || "";
			const nameB = b.circuit.site?.name?.toLowerCase() || "";
			const nameCompare = nameA.localeCompare(nameB);
			if (nameCompare !== 0) return nameCompare;
			return a.towerNumber - b.towerNumber;
		});
	};

	const downloadTowerRenewalNoticeAsExcel = () => {
		const towerRenewalData = getTowerRenewalNoticeData();

		if (towerRenewalData.length === 0) {
			alert("No towers to export");
			return;
		}

		const excelData = towerRenewalData.map((row) => {
			const excelRow = {
				"Venue Name": row.circuit.site?.name || "N/A",
				Address: formatSiteAddress(row.circuit.site),
				"Tower Number": row.towerNumber,
				"Tower Provider": row.towerProvider,
				"Install Date": formatDate(row.towerInstallDate),
				"Expiration Date": formatDate(row.towerExpirationDate),
				"Renewal Notice Date": formatDate(row.towerRenewalNoticeDate),
				"Days Until Expiration": typeof row.daysUntilExpiration === "number" ? row.daysUntilExpiration : "N/A",
				Status: row.isQualifying ? "Expiring Soon" : "",
			};

			if (user?.role !== "NOC") {
				excelRow["Monthly Cost"] =
					typeof row.towerMonthlyCost === "number"
						? `$${row.towerMonthlyCost.toFixed(2)}`
						: `$${parseFloat(row.towerMonthlyCost || 0).toFixed(2)}`;
			}

			return excelRow;
		});

		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		worksheet["!cols"] = [
			{ wch: 24 },
			{ wch: 40 },
			{ wch: 14 },
			{ wch: 18 },
			{ wch: 14 },
			{ wch: 16 },
			{ wch: 20 },
			{ wch: 20 },
			{ wch: 14 },
			...(user?.role !== "NOC" ? [{ wch: 14 }] : []),
		];

		XLSX.utils.book_append_sheet(workbook, worksheet, "Tower Renewal Notice");

		const timestamp = new Date().toISOString().split("T")[0];
		const filename = `Tower_Renewal_Notice_${timestamp}.xlsx`;

		XLSX.writeFile(workbook, filename);
	};

	const openRenewalModal = (circuit) => {
		setRaSelectedCircuit({
			...circuit,
			site: { ...circuit.site },
			provider: { ...circuit.provider },
		});
		setRaShowModal(true);
	};

	const closeRenewalModal = () => {
		setRaShowModal(false);
		setRaSelectedCircuit(null);
	};

	const saveRenewalAnalysis = async () => {
		if (!raSelectedCircuit) return;
		setRaSaving(true);
		try {
			const response = await fetch("/api/circuits", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(raSelectedCircuit),
			});
			if (!response.ok) {
				throw new Error(
					await getApiErrorMessage(response, "Failed to save renewal analysis"),
				);
			}
			await fetchCircuits();
			const refreshedResponse = await fetch(
				`/api/circuits/${raSelectedCircuit.id}`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (refreshedResponse.ok) {
				const refreshed = await refreshedResponse.json();
				setRaSelectedCircuit({
					...refreshed,
					site: { ...refreshed.site },
					provider: { ...refreshed.provider },
				});
			}
		} catch (saveError) {
			console.error(saveError);
			setError(saveError.message || "Failed to save renewal analysis");
		} finally {
			setRaSaving(false);
		}
	};

	const getRenewalAnalysisCircuits = () =>
		circuits
			.filter(
				(circuit) =>
					circuit.renewalMonthlyCost != null ||
					circuit.renewalCircuitExpirationDate ||
					circuit.site?.customerContractExpirationDate,
			)
			.sort((a, b) =>
				(a.site?.name || "").localeCompare(b.site?.name || "", undefined, {
					sensitivity: "base",
				}),
			);

	const downloadRenewalAnalysisAsExcel = () => {
		const analysisCircuits = getRenewalAnalysisCircuits();
		if (analysisCircuits.length === 0) {
			alert("No renewal analysis data to export");
			return;
		}

		const excelData = analysisCircuits.map((circuit) => {
			const preview = raBuildRenewalPreview(circuit);
			const row = {
				Site: circuit.site?.name || "N/A",
				Provider: circuit.provider?.name || "N/A",
				Bandwidth: circuit.circuitBandwidth || "N/A",
				Aggregator:
					circuit.hasAggregator && circuit.aggregatorName
						? circuit.aggregatorName
						: "N/A",
			};

			if (user?.role !== "NOC") {
				row["Current MRC"] =
					circuit.monthlyCost != null
						? `$${Number(circuit.monthlyCost).toFixed(2)}`
						: "N/A";
				row["Renewal MRC"] =
					circuit.renewalMonthlyCost != null
						? `$${Number(circuit.renewalMonthlyCost).toFixed(2)}`
						: "N/A";
				row["Monthly Savings"] =
					preview.savingsDifference != null
						? `$${preview.savingsDifference.toFixed(2)}`
						: "N/A";
			}

			row["Circuit Expiration"] = formatDate(circuit.expirationDate);
			row["Customer Contract Expiration"] = formatDate(
				circuit.site?.customerContractExpirationDate,
			);
			row["Renewal Circuit Expiration"] = formatDate(
				circuit.renewalCircuitExpirationDate,
			);
			row["Months to Customer Exp."] =
				preview.monthsToCustomerContractExpiration != null
					? preview.monthsToCustomerContractExpiration
					: "N/A";

			if (user?.role !== "NOC") {
				row["Savings to Customer Exp."] =
					preview.savingsUntilCustomerContractExpiration != null
						? `$${preview.savingsUntilCustomerContractExpiration.toFixed(2)}`
						: "N/A";
				row["Cost After Customer Exp."] =
					preview.costFromCustomerExpirationToRenewalExpiration != null
						? `$${preview.costFromCustomerExpirationToRenewalExpiration.toFixed(2)}`
						: "N/A";
				row["Total Savings"] =
					preview.totalSavings != null
						? `$${preview.totalSavings.toFixed(2)}`
						: "N/A";
			}

			return row;
		});

		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		worksheet["!cols"] = [
			{ wch: 24 },
			{ wch: 18 },
			{ wch: 12 },
			{ wch: 18 },
			...(user?.role !== "NOC"
				? [{ wch: 14 }, { wch: 14 }, { wch: 16 }]
				: []),
			{ wch: 20 },
			{ wch: 26 },
			{ wch: 26 },
			{ wch: 22 },
			...(user?.role !== "NOC"
				? [{ wch: 22 }, { wch: 22 }, { wch: 16 }]
				: []),
		];

		XLSX.utils.book_append_sheet(workbook, worksheet, "Renewal Analysis");

		const timestamp = new Date().toISOString().split("T")[0];
		XLSX.writeFile(workbook, `Renewal_Analysis_Report_${timestamp}.xlsx`);
	};

	const renderContent = () => {
		if (loading) return <div style={themedLoadingStyle}>Loading...</div>;
		if (error) return <div style={themedErrorStyle}>{error}</div>;

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
								backgroundColor: "var(--color-warning)",
								color: "var(--color-text-dark)",
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
							backgroundColor:
								theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
							padding: "15px 20px",
							borderRadius: "4px",
							color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "10px",
						}}
					>
						<div>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								Circuit Analytics Dashboard
							</h2>
							<div
								style={{
									fontSize: "14px",
									marginTop: "5px",
									color: theme === "light" ? "#555555" : "inherit",
								}}
							>
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
								<label htmlFor="siteTypeFilter" style={themedFilterLabelStyle}>
									Site Type:
								</label>
								<select
									id="siteTypeFilter"
									value={siteTypeFilter}
									onChange={(e) => setSiteTypeFilter(e.target.value)}
									style={themedSelectStyle}
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
								<label htmlFor="statusFilter" style={themedFilterLabelStyle}>
									Circuit Status:
								</label>
								<select
									id="statusFilter"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									style={themedSelectStyle}
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
								<label
									htmlFor="circuitTypeFilter"
									style={themedFilterLabelStyle}
								>
									Circuit Type:
								</label>
								<select
									id="circuitTypeFilter"
									value={circuitTypeFilter}
									onChange={(e) => setCircuitTypeFilter(e.target.value)}
									style={themedSelectStyle}
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
								<label htmlFor="providerFilter" style={themedFilterLabelStyle}>
									Provider:
								</label>
								<select
									id="providerFilter"
									value={providerFilter}
									onChange={(e) => setProviderFilter(e.target.value)}
									style={themedSelectStyle}
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
								<label
									htmlFor="aggregatorFilter"
									style={themedFilterLabelStyle}
								>
									Aggregator:
								</label>
								<select
									id="aggregatorFilter"
									value={aggregatorFilter}
									onChange={(e) => setAggregatorFilter(e.target.value)}
									style={themedSelectStyle}
								>
									<option value="All">All Aggregators</option>
									<option value={AGGREGATOR_NA_FILTER}>N/A</option>
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
								<label htmlFor="siteStateFilter" style={themedFilterLabelStyle}>
									State:
								</label>
								<select
									id="siteStateFilter"
									value={siteStateFilter}
									onChange={(e) => setSiteStateFilter(e.target.value)}
									style={themedSelectStyle}
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
									color: colors.headerText,
									backgroundColor: colors.containerBg,
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								Bandwidth Distribution
							</h2>
							<div
								style={{
									backgroundColor: colors.containerBg,
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
													color: colors.textLight,
												},
											},
											title: {
												display: true,
												text: `Sites per Bandwidth${getFilterSubtitle()}`,
												font: { size: 14 },
												color: colors.headerText,
											},
											datalabels: {
												display: true,
												color: colors.dataLabelColor,
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
													color: colors.textLight,
												},
												grid: {
													color: colors.gridColor,
												},
											},
											x: {
												ticks: {
													font: { size: 11 },
													color: colors.textLight,
												},
												grid: {
													color: colors.gridColor,
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
									color: colors.headerText,
									backgroundColor: colors.containerBg,
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								Circuit Status Distribution
							</h2>
							<div
								style={{
									backgroundColor: colors.containerBg,
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
											legend: {
												position: "top",
												labels: {
													color: colors.textLight,
													boxWidth: 20,
													font: { size: 12 },
												},
											},
											title: {
												display: true,
												text: `Circuit Status Distribution${getFilterSubtitle()}`,
												font: { size: 14 },
												color: colors.headerText,
											},
											datalabels: {
												display: true,
												color: colors.dataLabelColor,
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
													color: colors.textLight,
												},
												grid: {
													color: colors.gridColor,
												},
											},
											x: {
												ticks: {
													color: colors.textLight,
												},
												grid: {
													color: colors.gridColor,
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
									color: colors.headerText,
									backgroundColor: colors.containerBg,
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								Provider Distribution
							</h2>
							<div
								style={{
									backgroundColor: colors.containerBg,
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
											legend: {
												position: "top",
												labels: {
													color: colors.textLight,
													boxWidth: 20,
													font: { size: 12 },
												},
											},
											title: {
												display: true,
												text: `Sites per Provider${getFilterSubtitle()}`,
												font: { size: 14 },
												color: colors.headerText,
											},
											datalabels: {
												display: true,
												color: colors.textLight,
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
													color: colors.textLight,
												},
												grid: {
													color: colors.gridColor,
												},
											},
											x: {
												ticks: {
													color: colors.textLight,
												},
												grid: {
													color: colors.gridColor,
												},
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
									color: "var(--color-text-light)",
									backgroundColor: "var(--color-dark-bg)",
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
									backgroundColor: "var(--color-success)",
									color: "var(--color-text-light)",
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
									e.target.style.backgroundColor = "var(--color-success)";
								}}
								onMouseLeave={(e) => {
									e.target.style.backgroundColor = "var(--color-success)";
								}}
							>
								📥 Export to Excel
							</button>
						</div>
						<div
							style={{
								backgroundColor: "var(--color-surface)",
								padding: "20px",
								borderRadius: "8px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								margin: "0 auto",
								width: "100%",
								overflowX: "auto",
							}}
						>
							{getFilteredCircuits().length > 0 ? (
								<table style={{ width: "100%", borderCollapse: "collapse" }}>
									<thead>
										<tr
											style={{
												background:
													"linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-dark-bg-secondary) 100%)",
												borderBottom: "3px solid var(--color-primary)",
												color: "var(--color-text-light)",
											}}
										>
											<th style={{ ...tableHeaderStyle, minWidth: "140px" }}>Venue Name</th>
											<th style={tableHeaderStyle}>Account #</th>
											<th style={tableHeaderStyle}>Circuit ID</th>
											<th style={tableHeaderStyle}>Address</th>
											<th style={tableHeaderStyle}>Site Type</th>
											<th style={tableHeaderStyle}>Provider</th>
											<th style={tableHeaderStyle}>Bandwidth</th>
											<th style={tableHeaderStyle}>Circuit Type</th>
											<th style={tableHeaderStyle}>Status</th>
											{user?.role !== "NOC" && (
												<th style={{ ...tableHeaderStyle, minWidth: "130px", whiteSpace: "nowrap" }}>Monthly Cost</th>
											)}
										</tr>
									</thead>
									<tbody>
										{getFilteredCircuits().map((circuit, index) => (
											<tr
												key={circuit.id}
												style={{
													borderBottom: "1px solid var(--color-border-light)",
													backgroundColor:
														index % 2 === 0
															? "var(--color-surface)"
															: "var(--color-surface-light)",
												}}
											>
												<td style={{ ...tableCellStyle, fontWeight: "600" }}>
													{circuit.site.name}
												</td>
												<td style={{ ...tableCellStyle, fontSize: "12px" }}>
													{circuit.accountNumber || "N/A"}
												</td>
												<td style={{ ...tableCellStyle, fontSize: "12px" }}>
													{circuit.circuitId || "N/A"}
												</td>
												<td style={{ ...tableCellStyle, fontSize: "12px" }}>
													{formatSiteAddress(circuit.site)}
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
															color: "var(--color-text-light)",
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
															color: "var(--color-text-light)",
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
															color: "var(--color-text-light)",
														}}
													>
														{circuit.status || "Pending"}
													</span>
												</td>
												{user?.role !== "NOC" && (
													<td style={{ ...tableCellStyle, whiteSpace: "nowrap" }}>
														{circuit.monthlyCost != null
															? `$${Number(circuit.monthlyCost).toFixed(2)}`
															: "N/A"}
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<div
									style={{
										textAlign: "center",
										padding: "30px",
										color:
											theme === "light" ? "#555555" : "var(--color-text-light)",
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
								backgroundColor: "var(--color-warning)",
								color: "var(--color-text-dark)",
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
							backgroundColor:
								theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
							padding: "15px 20px",
							borderRadius: "4px",
							color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "10px",
						}}
					>
						<div>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								Circuit Expiration Report
							</h2>
							<div
								style={{
									fontSize: "14px",
									marginTop: "5px",
									color: theme === "light" ? "#555555" : "inherit",
								}}
							>
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
							<label htmlFor="timeRangeFilter" style={themedFilterLabelStyle}>
								Time Range:
							</label>
							<select
								id="timeRangeFilter"
								value={expirationTimeRange}
								onChange={(e) => {
									setExpirationTimeRange(Number(e.target.value));
									setCustomExpirationMonths(""); // Clear custom when selecting preset
								}}
								style={themedSelectStyle}
							>
								<option value={1}>1 Month</option>
								<option value={3}>3 Months</option>
								<option value={6}>6 Months</option>
								<option value={12}>12 Months</option>
							</select>
							<span
								style={{
									fontSize: "14px",
									color:
										theme === "light" ? "#2c3e50" : "var(--color-text-light)",
								}}
							>
								or
							</span>
							<label htmlFor="customTimeRange" style={themedFilterLabelStyle}>
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
									...themedSelectStyle,
									width: "80px",
								}}
							/>
							<button
								onClick={downloadExpiringCircuitsAsExcel}
								style={{
									padding: "8px 16px",
									border: "none",
									borderRadius: "4px",
									backgroundColor: "var(--color-success)",
									color: "var(--color-text-light)",
									fontSize: "14px",
									fontWeight: "bold",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "6px",
									transition: "background-color 0.3s",
								}}
								onMouseEnter={(e) => {
									e.target.style.backgroundColor = "var(--color-success)";
								}}
								onMouseLeave={(e) => {
									e.target.style.backgroundColor = "var(--color-success)";
								}}
							>
								📥 Download Excel
							</button>
						</div>
					</div>

					<div
						style={{
							backgroundColor: "var(--color-surface)",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							margin: "0 auto",
							maxWidth: "1400px",
							width: "100%",
							overflowX: "auto",
						}}
					>
						{expiringCircuits.length > 0 ? (
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr
										style={{
											background:
												"linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-dark-bg-secondary) 100%)",
											borderBottom: "3px solid var(--color-primary)",
											color: "var(--color-text-light)",
										}}
									>
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
										<th style={{ ...tableHeaderStyle, minWidth: "320px" }}>
											Notes
										</th>
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
													borderBottom: "1px solid var(--color-border-light)",
													backgroundColor:
														index % 2 === 0
															? "var(--color-surface)"
															: "var(--color-surface-light)",
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
															color: "var(--color-text-light)",
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
															color: "var(--color-text-light)",
														}}
													>
														{circuit.status || "Pending"}
													</span>
												</td>
												<td
													style={{
														...tableCellStyle,
														minWidth: "320px",
														whiteSpace: "normal",
														wordBreak: "break-word",
													}}
												>
													{circuit.notes || "N/A"}
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
									color:
										theme === "light" ? "#555555" : "var(--color-text-light)",
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
							backgroundColor: "var(--color-surface)",
							borderRadius: "8px",
							maxWidth: "1000px",
							margin: "30px auto 0",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<h3 style={{ marginTop: "0", color: "var(--color-text-dark)" }}>
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
								color:
									theme === "light" ? "#2c3e50" : "var(--color-text-light)",
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
			const renewalTerms = getUniqueRenewalTerms();
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
								backgroundColor: "var(--color-warning)",
								color: "var(--color-text-dark)",
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
							backgroundColor:
								theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
							padding: "15px 20px",
							borderRadius: "4px",
							color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "10px",
						}}
					>
						<div>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								Renewal Notice Report
							</h2>
							<div
								style={{
									fontSize: "14px",
									marginTop: "5px",
									color: theme === "light" ? "#555555" : "inherit",
								}}
							>
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
								style={themedFilterLabelStyle}
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
								style={themedSelectStyle}
							>
								<option value="All">All</option>
								<option value="30">30 Days</option>
								<option value="60">60 Days</option>
								<option value="90">90 Days</option>
								<option value="180">180 Days</option>
							</select>
							<span
								style={{
									fontSize: "14px",
									color:
										theme === "light" ? "#2c3e50" : "var(--color-text-light)",
								}}
							>
								or
							</span>
							<label
								htmlFor="customRenewalNoticeDays"
								style={themedFilterLabelStyle}
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
									...themedSelectStyle,
									width: "100px",
								}}
							/>
							<label htmlFor="renewalTermFilter" style={themedFilterLabelStyle}>
								Renewal Term:
							</label>
							<select
								id="renewalTermFilter"
								value={renewalTermFilter}
								onChange={(e) => setRenewalTermFilter(e.target.value)}
								style={themedSelectStyle}
							>
								<option value="All">All Terms</option>
								{renewalTerms.map((term) => (
									<option key={term} value={term}>
										{term}
									</option>
								))}
							</select>
							<button
								onClick={downloadRenewalNoticeCircuitsAsExcel}
								style={{
									padding: "8px 16px",
									border: "none",
									borderRadius: "4px",
									backgroundColor: "var(--color-success)",
									color: "var(--color-text-light)",
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
							backgroundColor: "var(--color-surface)",
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
									<tr
										style={{
											background:
												"linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-dark-bg-secondary) 100%)",
											borderBottom: "3px solid var(--color-primary)",
											color: "var(--color-text-light)",
										}}
									>
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
													borderBottom: "1px solid var(--color-border-light)",
													backgroundColor:
														index % 2 === 0
															? "var(--color-surface)"
															: "var(--color-surface-light)",
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
									color:
										theme === "light" ? "#555555" : "var(--color-text-light)",
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
							backgroundColor: "var(--color-surface)",
							borderRadius: "8px",
							maxWidth: "1200px",
							margin: "20px auto 0",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							fontSize: "14px",
							color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
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
				backgroundColor: theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
				color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
				padding: "14px 12px",
				fontWeight: "700",
				fontSize: "15px",
				textAlign: "left",
				borderBottom: "3px solid var(--color-primary)",
			};

			const towerSectionHeaderStyle = {
				backgroundColor:
					theme === "light" ? "#f5f5f5" : "var(--color-dark-bg-secondary)",
				color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
				padding: "10px 12px",
				fontWeight: "600",
				fontSize: "13px",
				textAlign: "left",
				borderLeft: "4px solid var(--color-primary)",
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
								backgroundColor: "var(--color-warning)",
								color: "var(--color-text-dark)",
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
							backgroundColor: "var(--color-surface)",
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
								backgroundColor:
									theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
								color:
									theme === "light" ? "#2c3e50" : "var(--color-text-light)",
								padding: "15px 20px",
								borderRadius: "4px",
								marginBottom: "20px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							}}
						>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								📊 Tower Report
							</h2>
							<div
								style={{
									fontSize: "14px",
									marginTop: "8px",
									color:
										theme === "light" ? "#555555" : "var(--color-text-light)",
								}}
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
											border: "2px solid var(--color-primary)",
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
												backgroundColor:
													theme === "light"
														? "#f0f2f5"
														: "var(--color-dark-bg-secondary)",
												padding: "12px 14px",
												display: "grid",
												gridTemplateColumns:
													"repeat(auto-fit, minmax(200px, 1fr))",
												gap: "12px",
												fontSize: "13px",
												color:
													theme === "light"
														? "#2c3e50"
														: "var(--color-text-light)",
											}}
										>
											<div>
												<span
													style={{
														fontWeight: "600",
														color:
															theme === "light"
																? "#2c3e50"
																: "var(--color-text-light)",
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
														color:
															theme === "light"
																? "#2c3e50"
																: "var(--color-text-light)",
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
														color:
															theme === "light"
																? "#2c3e50"
																: "var(--color-text-light)",
													}}
												>
													Total Towers:{" "}
												</span>
												<span
													style={{
														backgroundColor: "var(--color-primary)",
														color: "var(--color-text-light)",
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
																towerIndex % 2 === 0
																	? "var(--color-dark-bg)"
																	: "var(--color-dark-bg-secondary)",
															transition: "background-color 0.2s ease",
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.backgroundColor =
																"var(--color-primary)";
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.backgroundColor =
																towerIndex % 2 === 0
																	? "var(--color-dark-bg)"
																	: "var(--color-dark-bg-secondary)";
														}}
													>
														<td
															style={{
																...tableCellStyle,
																fontWeight: "700",
																color: "var(--color-primary)",
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
																	? "var(--color-dark-bg)"
																	: isExpirationSoon(row.towerExpirationDate)
																		? "var(--color-dark-bg)"
																		: theme === "light"
																			? "#2c3e50"
																			: "var(--color-text-light)",
																backgroundColor: isExpired(
																	row.towerExpirationDate,
																)
																	? "var(--color-error)"
																	: isExpirationSoon(row.towerExpirationDate)
																		? "var(--color-warning)"
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
																	color: "var(--color-success)",
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
									color:
										theme === "light" ? "#555555" : "var(--color-text-light)",
									fontStyle: "italic",
								}}
							>
								No towers found
							</div>
						)}
					</div>
				</div>
			);
		} else if (selectedMenu === "Tower Renewal Notice Report") {
			const towerRenewalData = getTowerRenewalNoticeData();
			const daysToNotify = customTowerRenewalDays
				? parseInt(customTowerRenewalDays)
				: towerRenewalDays;

			// Group towers by circuit
			const towerSiteGroups = {};
			towerRenewalData.forEach((row) => {
				const circuitId = row.circuit.id;
				if (!towerSiteGroups[circuitId]) {
					towerSiteGroups[circuitId] = { circuit: row.circuit, towers: [] };
				}
				towerSiteGroups[circuitId].towers.push(row);
			});
			const qualifyingCount = towerRenewalData.filter((r) => r.isQualifying).length;
			const siteCount = Object.keys(towerSiteGroups).length;

			const towerRenewalSiteHeaderStyle = {
				backgroundColor: theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
				color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
				padding: "14px 12px",
				fontWeight: "700",
				fontSize: "15px",
				textAlign: "left",
				borderBottom: "3px solid var(--color-primary)",
			};

			const towerRenewalSubHeaderStyle = {
				backgroundColor: theme === "light" ? "#f5f5f5" : "var(--color-dark-bg-secondary)",
				color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
				padding: "10px 12px",
				fontWeight: "600",
				fontSize: "13px",
				textAlign: "left",
				borderLeft: "4px solid var(--color-primary)",
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
								backgroundColor: "var(--color-warning)",
								color: "var(--color-text-dark)",
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
							backgroundColor:
								theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
							padding: "15px 20px",
							borderRadius: "4px",
							color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "10px",
						}}
					>
						<div>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								Tower Renewal Notice Report
							</h2>
							<div
								style={{
									fontSize: "14px",
									marginTop: "5px",
									color: theme === "light" ? "#555555" : "inherit",
								}}
							>
								{towerRenewalDays === "all"
									? `Showing all ${siteCount} site${siteCount !== 1 ? "s" : ""} with towers`
									: `Showing ${qualifyingCount} tower${qualifyingCount !== 1 ? "s" : ""} expiring within the next ${daysToNotify} days across ${siteCount} site${siteCount !== 1 ? "s" : ""}`
								}
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
								htmlFor="towerRenewalDaysFilter"
								style={themedFilterLabelStyle}
							>
								Days Before Expiration:
							</label>
							<select
								id="towerRenewalDaysFilter"
								value={towerRenewalDays}
								onChange={(e) => {
									const value = e.target.value;
									if (value === "other") {
										setTowerRenewalDays("other");
									} else if (value === "all") {
										setTowerRenewalDays("all");
										setCustomTowerRenewalDays("");
									} else {
										setTowerRenewalDays(Number(value));
										setCustomTowerRenewalDays(""); // Clear custom when selecting preset
									}
								}}
								style={themedSelectStyle}
							>
								<option value={60}>60 Days</option>
								<option value={90}>90 Days</option>
								<option value={120}>120 Days</option>
								<option value="other">Other</option>
								<option value="all">All Sites</option>
							</select>
							{towerRenewalDays === "other" && (
								<>
									<label
										htmlFor="customTowerDays"
										style={themedFilterLabelStyle}
									>
										Custom (days):
									</label>
									<input
										id="customTowerDays"
										type="number"
										min="1"
										max="365"
										value={customTowerRenewalDays}
										onChange={(e) => setCustomTowerRenewalDays(e.target.value)}
										placeholder="Enter days"
										style={{
											...themedSelectStyle,
											width: "80px",
										}}
									/>
								</>
							)}
							<button
								onClick={downloadTowerRenewalNoticeAsExcel}
								style={{
									padding: "8px 16px",
									border: "none",
									borderRadius: "4px",
									backgroundColor: "var(--color-success)",
									color: "var(--color-text-light)",
									fontSize: "14px",
									fontWeight: "bold",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "6px",
									transition: "background-color 0.3s",
								}}
								onMouseEnter={(e) => {
									e.target.style.backgroundColor = "var(--color-success)";
								}}
								onMouseLeave={(e) => {
									e.target.style.backgroundColor = "var(--color-success)";
								}}
							>
								📥 Download Excel
							</button>
						</div>
					</div>

					<div
						style={{
							backgroundColor: "var(--color-surface)",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							margin: "0 auto",
							maxWidth: "1400px",
							width: "100%",
							overflowX: "auto",
						}}
					>
						{siteCount > 0 ? (
							<div>
								{Object.values(towerSiteGroups).map((siteGroup, siteIndex) => (
									<div
										key={siteGroup.circuit.id}
										style={{
											marginBottom: "24px",
											borderRadius: "6px",
											overflow: "hidden",
											border: "2px solid var(--color-primary)",
											boxShadow:
												siteIndex % 2 === 0
													? "0 2px 6px rgba(52, 152, 219, 0.15)"
													: "0 2px 6px rgba(52, 73, 94, 0.1)",
										}}
									>
										{/* Site Header */}
										<div style={towerRenewalSiteHeaderStyle}>
											📍 {siteGroup.circuit.site?.name || "N/A"}
										</div>

										{/* Site Details */}
										<div
											style={{
												backgroundColor:
													theme === "light"
														? "#f0f2f5"
														: "var(--color-dark-bg-secondary)",
												padding: "12px 14px",
												display: "grid",
												gridTemplateColumns:
													"repeat(auto-fit, minmax(200px, 1fr))",
												gap: "12px",
												fontSize: "13px",
												color:
													theme === "light"
														? "#2c3e50"
														: "var(--color-text-light)",
											}}
										>
											<div>
												<span style={{ fontWeight: "600" }}>Address: </span>
												<span>{formatSiteAddress(siteGroup.circuit.site)}</span>
											</div>
											<div>
												<span style={{ fontWeight: "600" }}>Provider: </span>
												<span>{siteGroup.circuit.provider?.name || "N/A"}</span>
											</div>
											<div>
												<span style={{ fontWeight: "600" }}>Total Towers: </span>
												<span
													style={{
														backgroundColor: "var(--color-primary)",
														color: "var(--color-text-light)",
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
										<table style={{ width: "100%", borderCollapse: "collapse" }}>
											<thead>
												<tr style={towerRenewalSubHeaderStyle}>
													<td style={{ ...towerRenewalSubHeaderStyle, minWidth: "70px" }}>Tower #</td>
													<td style={{ ...towerRenewalSubHeaderStyle, minWidth: "120px" }}>Provider</td>
													<td style={{ ...towerRenewalSubHeaderStyle, minWidth: "120px" }}>Install Date</td>
													<td style={{ ...towerRenewalSubHeaderStyle, minWidth: "130px" }}>Expiration Date</td>
													<td style={{ ...towerRenewalSubHeaderStyle, minWidth: "150px" }}>Renewal Notice Date</td>
													<td style={{ ...towerRenewalSubHeaderStyle, minWidth: "130px" }}>Days Until Expiration</td>
													{user?.role !== "NOC" && (
														<td style={{ ...towerRenewalSubHeaderStyle, minWidth: "110px" }}>Monthly Cost</td>
													)}
												</tr>
											</thead>
											<tbody>
												{siteGroup.towers.map((row, towerIndex) => {
													const daysValue = row.daysUntilExpiration;
													let urgencyColor = "#10B981";
													if (typeof daysValue === "number") {
														if (daysValue <= 7) urgencyColor = "#EF4444";
														else if (daysValue <= 14) urgencyColor = "#F59E0B";
														else if (daysValue <= 30) urgencyColor = "#FBBF24";
													}

													return (
														<tr
															key={`${row.circuit.id}-tower-${row.towerNumber}`}
															style={{
																borderBottom:
																	towerIndex < siteGroup.towers.length - 1
																		? "1px solid #dee2e6"
																		: "none",
																backgroundColor: row.isQualifying
																	? theme === "light"
																		? "#fffbeb"
																		: "rgba(245, 158, 11, 0.08)"
																	: towerIndex % 2 === 0
																		? "var(--color-dark-bg)"
																		: "var(--color-dark-bg-secondary)",
															}}
														>
															<td
																style={{
																	...tableCellStyle,
																	fontWeight: "700",
																	color: "var(--color-primary)",
																	fontSize: "15px",
																}}
															>
																Tower {row.towerNumber}
																{row.isQualifying && (
																	<span
																		style={{
																			marginLeft: "6px",
																			fontSize: "11px",
																			fontWeight: "bold",
																			backgroundColor: "#f59e0b",
																			color: "#fff",
																			padding: "2px 6px",
																			borderRadius: "4px",
																		}}
																	>
																		Expiring Soon
																	</span>
																)}
															</td>
															<td style={{ ...tableCellStyle, fontWeight: "500" }}>
																{row.towerProvider}
															</td>
															<td style={tableCellStyle}>
																{formatDate(row.towerInstallDate)}
															</td>
															<td style={tableCellStyle}>
																{formatDate(row.towerExpirationDate)}
															</td>
															<td
																style={{
																	...tableCellStyle,
																	fontWeight: "600",
																	color: row.towerRenewalNoticeDate ? "#1d4ed8" : "inherit",
																}}
															>
																{row.towerRenewalNoticeDate
																	? formatDate(row.towerRenewalNoticeDate)
																	: "N/A"}
															</td>
															<td style={tableCellStyle}>
																{row.isQualifying ? (
																	<span
																		style={{
																			padding: "4px 8px",
																			borderRadius: "4px",
																			fontSize: "12px",
																			fontWeight: "bold",
																			backgroundColor: urgencyColor,
																			color: "var(--color-text-light)",
																		}}
																	>
																		{daysValue} {daysValue === 1 ? "day" : "days"}
																	</span>
																) : (
																	<span style={{ color: "inherit", fontSize: "13px" }}>
																		{typeof daysValue === "number" ? `${daysValue} days` : "N/A"}
																	</span>
																)}
															</td>
															{user?.role !== "NOC" && (
																<td
																	style={{
																		...tableCellStyle,
																		fontWeight: "600",
																		color: "var(--color-success)",
																	}}
																>
																	${parseFloat(row.towerMonthlyCost || 0).toFixed(2)}
																</td>
															)}
														</tr>
													);
												})}
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
									color:
										theme === "light" ? "#555555" : "var(--color-text-light)",
									fontStyle: "italic",
								}}
							>
								{towerRenewalDays === "all"
									? "No sites with towers found"
									: `Great news! No towers are expiring within the next ${daysToNotify} days`
								}
							</div>
						)}
					</div>
				</div>
			);
		} else if (selectedMenu === "New Build Sites Report") {
			const newBuildSites = getNewBuildSites();

			// Calculate days between dates for each site
			const sitesWithDaysDifference = newBuildSites.map((site) => {
				const daysDiff = calculateDaysBetween(
					site.customerContractDate,
					site.serviceCommencementDate,
				);
				return {
					...site,
					daysDifference: daysDiff,
				};
			});

			// Calculate average days
			const validDays = sitesWithDaysDifference
				.filter((site) => site.daysDifference !== null)
				.map((site) => site.daysDifference);
			const averageDays =
				validDays.length > 0
					? (
							validDays.reduce((sum, days) => sum + days, 0) / validDays.length
						).toFixed(1)
					: 0;

			return (
				<div style={{ width: "100%" }}>
					<div
						style={{
							marginBottom: "20px",
							backgroundColor:
								theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
							padding: "15px 20px",
							borderRadius: "4px",
							color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
						}}
					>
						<div>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								New Build Sites Report
							</h2>
							<p
								style={{
									margin: "8px 0 0 0",
									fontSize: "14px",
									opacity: "0.7",
								}}
							>
								Showing {sitesWithDaysDifference.length} site
								{sitesWithDaysDifference.length !== 1 ? "s" : ""}
							</p>
						</div>
					</div>

					<div
						style={{
							backgroundColor: "var(--color-surface)",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							margin: "0 auto",
							maxWidth: "1400px",
							width: "100%",
							overflowX: "auto",
						}}
					>
						{sitesWithDaysDifference.length > 0 ? (
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr
										style={{
											background:
												"linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-dark-bg-secondary) 100%)",
											borderBottom: "3px solid var(--color-primary)",
											color: "var(--color-text-light)",
										}}
									>
										<th style={tableHeaderStyle}>Site Name</th>
										<th style={tableHeaderStyle}>Customer Contract Date</th>
										<th style={tableHeaderStyle}>Service Commencement Date</th>
										<th style={tableHeaderStyle}>Days Between</th>
									</tr>
								</thead>
								<tbody>
									{sitesWithDaysDifference.map((site, index) => {
										return (
											<tr
												key={site.id}
												style={{
													borderBottom: "1px solid var(--color-border-light)",
													backgroundColor:
														index % 2 === 0
															? "var(--color-surface)"
															: "var(--color-surface-light)",
												}}
											>
												<td style={{ ...tableCellStyle, fontWeight: "600" }}>
													{site.name || "N/A"}
												</td>
												<td style={tableCellStyle}>
													{formatDate(site.customerContractDate)}
												</td>
												<td style={tableCellStyle}>
													{formatDate(site.serviceCommencementDate)}
												</td>
												<td
													style={{
														...tableCellStyle,
														fontWeight: "600",
														color: "#1d4ed8",
														textAlign: "center",
													}}
												>
													{site.daysDifference !== null
														? site.daysDifference
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
									color:
										theme === "light" ? "#555555" : "var(--color-text-light)",
									fontStyle: "italic",
								}}
							>
								No sites with newBuild flag selected
							</div>
						)}
					</div>

					<div
						style={{
							marginTop: "20px",
							padding: "15px 20px",
							backgroundColor: "var(--color-surface)",
							borderRadius: "8px",
							maxWidth: "1400px",
							margin: "20px auto 0",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<div
							style={{
								padding: "15px",
								backgroundColor: theme === "light" ? "#f0f8ff" : "#1a3a52",
								borderLeft: "4px solid var(--color-primary)",
								borderRadius: "4px",
								color:
									theme === "light" ? "#2c3e50" : "var(--color-text-light)",
							}}
						>
							<strong>Average Days Between Dates:</strong> {averageDays} days
						</div>
					</div>
				</div>
			);
		} else if (selectedMenu === "New Build Sites Report") {
			const newBuildSites = getNewBuildSites();

			// Calculate days between dates for each site
			const sitesWithDaysDifference = newBuildSites.map((site) => {
				const daysDiff = calculateDaysBetween(
					site.customerContractDate,
					site.serviceCommencementDate,
				);
				return {
					...site,
					daysDifference: daysDiff,
				};
			});

			// Calculate average days
			const validDays = sitesWithDaysDifference
				.filter((site) => site.daysDifference !== null)
				.map((site) => site.daysDifference);
			const averageDays =
				validDays.length > 0
					? (
							validDays.reduce((sum, days) => sum + days, 0) / validDays.length
						).toFixed(1)
					: 0;

			return (
				<div style={{ width: "100%" }}>
					<div
						style={{
							marginBottom: "20px",
							backgroundColor:
								theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
							padding: "15px 20px",
							borderRadius: "4px",
							color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
						}}
					>
						<div>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								New Build Sites Report
							</h2>
							<p
								style={{
									margin: "8px 0 0 0",
									fontSize: "14px",
									opacity: "0.7",
								}}
							>
								Showing {sitesWithDaysDifference.length} site
								{sitesWithDaysDifference.length !== 1 ? "s" : ""}
							</p>
						</div>
					</div>

					<div
						style={{
							backgroundColor: "var(--color-surface)",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							margin: "0 auto",
							maxWidth: "1400px",
							width: "100%",
							overflowX: "auto",
						}}
					>
						{sitesWithDaysDifference.length > 0 ? (
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr
										style={{
											background:
												"linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-dark-bg-secondary) 100%)",
											borderBottom: "3px solid var(--color-primary)",
											color: "var(--color-text-light)",
										}}
									>
										<th style={tableHeaderStyle}>Site Name</th>
										<th style={tableHeaderStyle}>Customer Contract Date</th>
										<th style={tableHeaderStyle}>Service Commencement Date</th>
										<th style={tableHeaderStyle}>Days Between</th>
									</tr>
								</thead>
								<tbody>
									{sitesWithDaysDifference.map((site, index) => {
										return (
											<tr
												key={site.id}
												style={{
													borderBottom: "1px solid var(--color-border-light)",
													backgroundColor:
														index % 2 === 0
															? "var(--color-surface)"
															: "var(--color-surface-light)",
												}}
											>
												<td style={{ ...tableCellStyle, fontWeight: "600" }}>
													{site.name || "N/A"}
												</td>
												<td style={tableCellStyle}>
													{formatDate(site.customerContractDate)}
												</td>
												<td style={tableCellStyle}>
													{formatDate(site.serviceCommencementDate)}
												</td>
												<td
													style={{
														...tableCellStyle,
														fontWeight: "600",
														color: "#1d4ed8",
														textAlign: "center",
													}}
												>
													{site.daysDifference !== null
														? site.daysDifference
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
									color:
										theme === "light" ? "#555555" : "var(--color-text-light)",
									fontStyle: "italic",
								}}
							>
								No sites with newBuild flag selected
							</div>
						)}
					</div>

					<div
						style={{
							marginTop: "20px",
							padding: "15px 20px",
							backgroundColor: "var(--color-surface)",
							borderRadius: "8px",
							maxWidth: "1400px",
							margin: "20px auto 0",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<div
							style={{
								padding: "15px",
								backgroundColor: theme === "light" ? "#f0f8ff" : "#1a3a52",
								borderLeft: "4px solid var(--color-primary)",
								borderRadius: "4px",
								color:
									theme === "light" ? "#2c3e50" : "var(--color-text-light)",
							}}
						>
							<strong>Average Days Between Dates:</strong> {averageDays} days
						</div>
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
								backgroundColor: "var(--color-warning)",
								color: "var(--color-text-dark)",
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
							backgroundColor:
								theme === "light" ? "#f5f5f5" : "var(--color-dark-bg)",
							padding: "15px 20px",
							borderRadius: "4px",
							color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
						}}
					>
						<div>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								Expired Circuits
							</h2>
							<div
								style={{
									fontSize: "14px",
									marginTop: "5px",
									color:
										theme === "light" ? "#555555" : "var(--color-text-light)",
								}}
							>
								Showing {expiredCircuits.length} circuits with expiration dates
								equal to or before today
							</div>
						</div>
					</div>

					<div
						style={{
							backgroundColor: "var(--color-surface)",
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
									<tr
										style={{
											background:
												theme === "light"
													? "#f5f5f5"
													: "linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-dark-bg-secondary) 100%)",
											borderBottom: "3px solid var(--color-primary)",
											color:
												theme === "light"
													? "#2c3e50"
													: "var(--color-text-light)",
										}}
									>
										<th
											style={{
												...tableHeaderStyle,
												cursor: "pointer",
												userSelect: "none",
												backgroundColor:
													theme === "light"
														? expiredCircuitsSortConfig.key === "venueName"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "venueName"
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
													theme === "light"
														? expiredCircuitsSortConfig.key === "siteType"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "siteType"
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
													theme === "light"
														? expiredCircuitsSortConfig.key === "provider"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "provider"
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
													theme === "light"
														? expiredCircuitsSortConfig.key === "aggregator"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "aggregator"
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
													theme === "light"
														? expiredCircuitsSortConfig.key === "circuitType"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "circuitType"
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
													theme === "light"
														? expiredCircuitsSortConfig.key === "bandwidth"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "bandwidth"
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
													theme === "light"
														? expiredCircuitsSortConfig.key === "expirationDate"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "expirationDate"
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
													theme === "light"
														? expiredCircuitsSortConfig.key === "daysExpired"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "daysExpired"
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
													theme === "light"
														? expiredCircuitsSortConfig.key === "status"
															? "#e0e0e0"
															: "#f5f5f5"
														: expiredCircuitsSortConfig.key === "status"
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
														borderBottom: "1px solid var(--color-border-light)",
														backgroundColor:
															index % 2 === 0
																? "var(--color-surface)"
																: "var(--color-surface-light)",
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
																		? "var(--color-primary)"
																		: circuit.site.siteType === "DHC"
																			? "#9b59b6"
																			: "var(--color-text-muted)",
																color: "var(--color-text-light)",
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
																		? "var(--color-success)"
																		: circuit.status === "Pending"
																			? "var(--color-warning)"
																			: circuit.status === "Inactive"
																				? "var(--color-error)"
																				: "var(--color-text-muted)",
																color: "var(--color-text-light)",
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
									color: "var(--color-text-muted)",
									fontSize: "16px",
								}}
							>
								Great news! No circuits have expired yet.
							</div>
						)}
					</div>
				</div>
			);
		} else if (selectedMenu === "Tower Expiration Report") {
			const towerData = getTowerExpirationData();

			return (
				<div style={{ width: "100%" }}>
					{/* Filter bar */}
					<div style={themedFilterContainerStyle}>
						<div>
							<h2
								style={{
									margin: 0,
									fontSize: "18px",
									color: theme === "light" ? "#2c3e50" : "inherit",
								}}
							>
								Tower Expiration Report
							</h2>
							<div
								style={{
									fontSize: "14px",
									marginTop: "5px",
									color: theme === "light" ? "#555555" : "inherit",
								}}
							>
								Showing {towerData.length} tower{towerData.length !== 1 ? "s" : ""}
								{towerExpirationStartDate || towerExpirationEndDate
									? ` within selected date range`
									: " (all dates)"}
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
							<label style={themedFilterLabelStyle}>From:</label>
							<input
								type="date"
								value={towerExpirationStartDate}
								onChange={(e) => setTowerExpirationStartDate(e.target.value)}
								style={themedSelectStyle}
							/>
							<label style={themedFilterLabelStyle}>To:</label>
							<input
								type="date"
								value={towerExpirationEndDate}
								onChange={(e) => setTowerExpirationEndDate(e.target.value)}
								style={themedSelectStyle}
							/>
							{(towerExpirationStartDate || towerExpirationEndDate) && (
								<button
									onClick={() => {
										setTowerExpirationStartDate("");
										setTowerExpirationEndDate("");
									}}
									style={{
										...themedSelectStyle,
										cursor: "pointer",
										backgroundColor:
											theme === "light" ? "#e0e0e0" : "var(--color-dark-bg-secondary)",
									}}
								>
									Clear
								</button>
							)}
							<button
								onClick={downloadTowerExpirationAsExcel}
								style={{
									padding: "8px 16px",
									border: "none",
									borderRadius: "4px",
									backgroundColor: "var(--color-success)",
									color: "var(--color-text-light)",
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

					{/* Table */}
					<div
						style={{
							backgroundColor: "var(--color-surface)",
							padding: "20px",
							borderRadius: "8px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
							margin: "0 auto",
							maxWidth: "1400px",
							width: "100%",
							overflowX: "auto",
						}}
					>
						{towerData.length > 0 ? (
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr
										style={{
											background:
												"linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-dark-bg-secondary) 100%)",
											borderBottom: "3px solid var(--color-primary)",
											color: "var(--color-text-light)",
										}}
									>
										<th style={tableHeaderStyle}>Venue Name</th>
										<th style={tableHeaderStyle}>Address</th>
										<th style={tableHeaderStyle}>Tower #</th>
										<th style={tableHeaderStyle}>Tower Provider</th>
										<th style={tableHeaderStyle}>Install Date</th>
										<th style={tableHeaderStyle}>Expiration Date</th>
										<th style={tableHeaderStyle}>Days Until Expiration</th>
										{user?.role !== "NOC" && (
											<th style={tableHeaderStyle}>Monthly Cost</th>
										)}
									</tr>
								</thead>
								<tbody>
									{towerData.map((row, index) => {
										const daysValue = row.daysUntilExpiration;
										let urgencyColor = null;
										if (typeof daysValue === "number") {
											if (daysValue < 0) urgencyColor = "#EF4444";
											else if (daysValue <= 30) urgencyColor = "#EF4444";
											else if (daysValue <= 60) urgencyColor = "#F59E0B";
											else if (daysValue <= 90) urgencyColor = "#FBBF24";
										}
										return (
											<tr
												key={`${row.circuit.id}-tower-${row.towerNumber}`}
												style={{
													borderBottom: "1px solid var(--color-border-light)",
													backgroundColor:
														index % 2 === 0
															? "var(--color-surface)"
															: "var(--color-surface-light)",
												}}
											>
												<td style={{ ...tableCellStyle, fontWeight: "600" }}>
													{row.circuit.site?.name || "N/A"}
												</td>
												<td style={tableCellStyle}>
													{formatSiteAddress(row.circuit.site)}
												</td>
												<td
													style={{
														...tableCellStyle,
														fontWeight: "700",
														color: "var(--color-primary)",
													}}
												>
													{row.towerNumber}
												</td>
												<td style={tableCellStyle}>{row.towerProvider}</td>
												<td style={tableCellStyle}>
													{formatDate(row.towerInstallDate)}
												</td>
												<td style={{ ...tableCellStyle, fontWeight: "600" }}>
													{formatDate(row.towerExpirationDate)}
												</td>
												<td style={tableCellStyle}>
													{typeof daysValue === "number" ? (
														<span
															style={
																urgencyColor
																	? {
																			padding: "4px 8px",
																			borderRadius: "4px",
																			fontSize: "12px",
																			fontWeight: "bold",
																			backgroundColor: urgencyColor,
																			color: "#fff",
																		}
																	: {}
															}
														>
															{daysValue < 0
																? `${Math.abs(daysValue)} days ago`
																: `${daysValue} day${daysValue === 1 ? "" : "s"}`}
														</span>
													) : (
														"N/A"
													)}
												</td>
												{user?.role !== "NOC" && (
													<td
														style={{
															...tableCellStyle,
															fontWeight: "600",
															color: "var(--color-success)",
														}}
													>
														${parseFloat(row.towerMonthlyCost || 0).toFixed(2)}
													</td>
												)}
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
									color: theme === "light" ? "#555555" : "var(--color-text-light)",
									fontStyle: "italic",
								}}
							>
								{towerExpirationStartDate || towerExpirationEndDate
									? "No towers found in the selected date range"
									: "No tower expiration data available"}
							</div>
						)}
					</div>

					{/* Legend */}
					<div
						style={{
							marginTop: "20px",
							padding: "15px",
							backgroundColor: "var(--color-surface)",
							borderRadius: "8px",
							maxWidth: "1400px",
							margin: "20px auto 0",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<h3 style={{ marginTop: 0, color: "var(--color-text-dark)" }}>
							Color Code Legend
						</h3>
						<div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
							{[
								{ color: "#EF4444", label: "Expired or ≤ 30 days" },
								{ color: "#F59E0B", label: "31 – 60 days" },
								{ color: "#FBBF24", label: "61 – 90 days" },
							].map(({ color, label }) => (
								<div
									key={label}
									style={{ display: "flex", alignItems: "center", gap: "8px" }}
								>
									<div
										style={{
											width: "20px",
											height: "20px",
											backgroundColor: color,
											borderRadius: "4px",
										}}
									/>
									<span
										style={{
											fontSize: "14px",
											color:
												theme === "light" ? "#2c3e50" : "var(--color-text-light)",
										}}
									>
										{label}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			);
		}

		if (selectedMenu === "Renewal Analysis Report") {
			const analysisCircuits = getRenewalAnalysisCircuits();

			const raSummaryStats = (() => {
				if (analysisCircuits.length === 0) return null;
				let monthlySavingsTotal = 0;
				let monthlySavingsCount = 0;
				let totalSavingsTotal = 0;
				let totalSavingsCount = 0;
				analysisCircuits.forEach((c) => {
					const p = raBuildRenewalPreview(c);
					if (p.savingsDifference != null) {
						monthlySavingsTotal += p.savingsDifference;
						monthlySavingsCount++;
					}
					if (p.totalSavings != null) {
						totalSavingsTotal += p.totalSavings;
						totalSavingsCount++;
					}
				});
				return {
					monthlySavingsTotal,
					monthlySavingsCount,
					totalSavingsTotal,
					totalSavingsCount,
				};
			})();

			const raNaStyle = {
				color: theme === "light" ? "#bbb" : "#555",
				fontSize: "12px",
			};

			return (
				<div style={{ width: "100%" }}>
					{/* ── Header ── */}
					<div
						style={{
							marginBottom: "16px",
							backgroundColor:
								theme === "light" ? "#ffffff" : "var(--color-dark-bg)",
							padding: "16px 20px",
							borderRadius: "8px",
							border: `1px solid ${theme === "light" ? "#e0e0e0" : "var(--color-border)"}`,
							boxShadow: "0 2px 6px rgba(0,0,0,0.07)",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "12px",
							color:
								theme === "light" ? "#2c3e50" : "var(--color-text-light)",
						}}
					>
						<div>
							<h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
								Renewal Analysis Report
							</h2>
							<div
								style={{
									fontSize: "13px",
									marginTop: "4px",
									color:
										theme === "light"
											? "#666"
											: "var(--color-text-muted)",
								}}
							>
								{analysisCircuits.length === 0
									? "No circuits with saved renewal data"
									: `${analysisCircuits.length} circuit${analysisCircuits.length !== 1 ? "s" : ""} with saved renewal analysis data`}
							</div>
						</div>
						<div
							style={{
								display: "flex",
								gap: "10px",
								flexWrap: "wrap",
								alignItems: "center",
							}}
						>
							<button
								onClick={() => navigate("/renewal-analysis")}
								style={{
									padding: "8px 16px",
									border: "1px solid var(--color-primary)",
									borderRadius: "6px",
									backgroundColor: "transparent",
									color:
										theme === "light"
											? "var(--color-primary)"
											: "var(--color-text-light)",
									fontSize: "13px",
									fontWeight: "600",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "6px",
								}}
							>
								✏️ Edit in Renewal Analysis
							</button>
							<button
								onClick={downloadRenewalAnalysisAsExcel}
								style={{
									padding: "8px 16px",
									border: "none",
									borderRadius: "6px",
									backgroundColor: "var(--color-success)",
									color: "#fff",
									fontSize: "13px",
									fontWeight: "600",
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

					{/* ── Summary stat cards (NOC-gated) ── */}
					{user?.role !== "NOC" && raSummaryStats && analysisCircuits.length > 0 && (
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
								gap: "12px",
								marginBottom: "16px",
							}}
						>
							{[
								{
									label: "Circuits Analyzed",
									value: String(analysisCircuits.length),
									sub: "with saved data",
									color: "#3B82F6",
								},
								{
									label: "Full Analyses",
									value: String(raSummaryStats.totalSavingsCount),
									sub: "complete calculations",
									color: "#8B5CF6",
								},
								{
									label: "Total Monthly Savings",
									value: raFormatCurrency(raSummaryStats.monthlySavingsTotal),
									sub: `across ${raSummaryStats.monthlySavingsCount} circuits`,
									color:
										raSummaryStats.monthlySavingsTotal >= 0
											? "#10B981"
											: "#EF4444",
								},
								{
									label: "Total Projected Savings",
									value: raFormatCurrency(raSummaryStats.totalSavingsTotal),
									sub: `across ${raSummaryStats.totalSavingsCount} circuits`,
									color:
										raSummaryStats.totalSavingsTotal > 0
											? "#10B981"
											: raSummaryStats.totalSavingsTotal < 0
												? "#EF4444"
												: "#F59E0B",
								},
							].map(({ label, value, sub, color }) => (
								<div
									key={label}
									style={{
										backgroundColor:
											theme === "light"
												? "#ffffff"
												: "var(--color-dark-bg)",
										border: `1px solid ${theme === "light" ? "#e0e0e0" : "var(--color-border)"}`,
										borderLeft: `4px solid ${color}`,
										borderRadius: "8px",
										padding: "14px 16px",
										boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
									}}
								>
									<div
										style={{
											fontSize: "11px",
											fontWeight: "700",
											textTransform: "uppercase",
											letterSpacing: "0.06em",
											color:
												theme === "light"
													? "#888"
													: "var(--color-text-muted)",
											marginBottom: "6px",
										}}
									>
										{label}
									</div>
									<div
										style={{
											fontSize: "20px",
											fontWeight: "700",
											color,
											lineHeight: 1.2,
											fontVariantNumeric: "tabular-nums",
										}}
									>
										{value}
									</div>
									<div
										style={{
											fontSize: "12px",
											color:
												theme === "light"
													? "#999"
													: "var(--color-text-muted)",
											marginTop: "4px",
										}}
									>
										{sub}
									</div>
								</div>
							))}
						</div>
					)}

					{/* ── Cards ── */}
					<div>
						{analysisCircuits.length > 0 ? (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "10px",
								}}
							>
								{analysisCircuits.map((circuit) => {
									const preview = raBuildRenewalPreview(circuit);

									let totalSavingsColor = null;
									if (preview.totalSavings != null) {
										if (preview.totalSavings > 0)
											totalSavingsColor = "#10B981";
										else if (preview.totalSavings < 0)
											totalSavingsColor = "#EF4444";
										else totalSavingsColor = "#F59E0B";
									}

									let monthlySavingsColor = null;
									if (preview.savingsDifference != null) {
										if (preview.savingsDifference > 0)
											monthlySavingsColor = "#10B981";
										else if (preview.savingsDifference < 0)
											monthlySavingsColor = "#EF4444";
									}

									const cardDivider = `1px solid ${theme === "light" ? "#e8ecf0" : "var(--color-border-light)"}`;

									const raField = (label, value, badge = null) => (
										<div>
											<div
												style={{
													fontSize: "10px",
													fontWeight: "700",
													textTransform: "uppercase",
													letterSpacing: "0.07em",
													color:
														theme === "light"
															? "#94a3b8"
															: "var(--color-text-muted)",
													marginBottom: "4px",
												}}
											>
												{label}
											</div>
											{badge ? (
												<span
													style={{
														display: "inline-block",
														padding: "3px 10px",
														borderRadius: "5px",
														fontSize: "13px",
														fontWeight: "700",
														backgroundColor: badge,
														color: "#fff",
														fontVariantNumeric: "tabular-nums",
													}}
												>
													{value}
												</span>
											) : value != null ? (
												<div
													style={{
														fontSize: "14px",
														fontWeight: "500",
														color:
															theme === "light"
																? "#1e293b"
																: "var(--color-text-light)",
														fontVariantNumeric: "tabular-nums",
													}}
												>
													{value}
												</div>
											) : (
												<span style={raNaStyle}>—</span>
											)}
										</div>
									);

									return (
										<div
											key={circuit.id}
											style={{
												backgroundColor:
													theme === "light"
														? "#ffffff"
														: "var(--color-dark-bg-secondary)",
												border: `1px solid ${theme === "light" ? "#e0e0e0" : "var(--color-border)"}`,
												borderRadius: "10px",
												boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
												overflow: "hidden",
											}}
										>
											{/* Card header */}
											<div
												style={{
													padding: "12px 16px",
													backgroundColor:
														theme === "light"
															? "#f8faff"
															: "var(--color-dark-bg)",
													borderBottom: cardDivider,
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													gap: "10px",
													flexWrap: "wrap",
												}}
											>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "8px",
														flexWrap: "wrap",
													}}
												>
													<span
														style={{
															fontSize: "15px",
															fontWeight: "700",
															color:
																theme === "light"
																	? "#1e293b"
																	: "var(--color-text-light)",
														}}
													>
														{circuit.site?.name || "—"}
													</span>
													<span
														style={{
															padding: "2px 8px",
															borderRadius: "4px",
															fontSize: "12px",
															fontWeight: "600",
															backgroundColor:
																theme === "light"
																	? "#dbeafe"
																	: "rgba(59,130,246,0.18)",
															color:
																theme === "light"
																	? "#1d4ed8"
																	: "#93c5fd",
														}}
													>
														{circuit.provider?.name || "N/A"}
													</span>
													<span
														style={{
															padding: "2px 8px",
															borderRadius: "4px",
															fontSize: "12px",
															fontWeight: "600",
															backgroundColor:
																theme === "light"
																	? "#d1fae5"
																	: "rgba(16,185,129,0.18)",
															color:
																theme === "light"
																	? "#065f46"
																	: "#6ee7b7",
														}}
													>
														{circuit.circuitBandwidth || "N/A"}
													</span>
													{circuit.hasAggregator &&
														circuit.aggregatorName && (
															<span
																style={{
																	padding: "2px 8px",
																	borderRadius: "4px",
																	fontSize: "12px",
																	fontWeight: "500",
																	backgroundColor:
																		theme === "light"
																			? "#f1f5f9"
																			: "rgba(100,116,139,0.2)",
																	color:
																		theme === "light"
																			? "#475569"
																			: "#94a3b8",
																}}
															>
																{circuit.aggregatorName}
															</span>
														)}
												</div>
												<button
													type="button"
													onClick={() => openRenewalModal(circuit)}
													style={{
														padding: "5px 14px",
														border: "1px solid var(--color-primary)",
														borderRadius: "6px",
														backgroundColor:
															"rgba(52, 152, 219, 0.1)",
														color:
															theme === "light"
																? "var(--color-primary)"
																: "var(--color-primary-light)",
														cursor: "pointer",
														fontSize: "12px",
														fontWeight: "600",
														whiteSpace: "nowrap",
														display: "inline-flex",
														alignItems: "center",
														gap: "5px",
														flexShrink: 0,
													}}
												>
													✏️ Edit
												</button>
											</div>

											{/* Card body — sections side by side */}
											<div style={{ display: "flex", flexWrap: "wrap" }}>
												{/* Timeline */}
												<div
													style={{
														flex: "1 1 220px",
														padding: "14px 16px",
														borderRight:
															user?.role !== "NOC"
																? cardDivider
																: "none",
													}}
												>
													<div
														style={{
															fontSize: "10px",
															fontWeight: "700",
															textTransform: "uppercase",
															letterSpacing: "0.1em",
															color: "#F59E0B",
															marginBottom: "10px",
														}}
													>
														📅 Timeline
													</div>
													<div
														style={{
															display: "grid",
															gridTemplateColumns:
																"repeat(auto-fit, minmax(130px, 1fr))",
															gap: "12px",
														}}
													>
														{raField(
															"Circuit Expiration",
															circuit.expirationDate
																? formatDate(circuit.expirationDate)
																: null,
														)}
														{raField(
															"Cust. Contract Exp.",
															circuit.site
																?.customerContractExpirationDate
																? formatDate(
																		circuit.site
																			.customerContractExpirationDate,
																	)
																: null,
														)}
														{raField(
															"Renewal Circuit Exp.",
															circuit.renewalCircuitExpirationDate
																? formatDate(
																		circuit.renewalCircuitExpirationDate,
																	)
																: null,
														)}
														{raField(
															"Mo. to Cust. Exp.",
															preview.monthsToCustomerContractExpiration !=
																null
																? `${preview.monthsToCustomerContractExpiration} mo`
																: null,
															preview.monthsToCustomerContractExpiration !=
																null
																? theme === "light"
																	? "#d97706"
																	: "#f59e0b"
																: null,
														)}
													</div>
												</div>

												{/* Pricing (NOC-gated) */}
												{user?.role !== "NOC" && (
													<div
														style={{
															flex: "1 1 200px",
															padding: "14px 16px",
															borderRight: cardDivider,
														}}
													>
														<div
															style={{
																fontSize: "10px",
																fontWeight: "700",
																textTransform: "uppercase",
																letterSpacing: "0.1em",
																color: "#10B981",
																marginBottom: "10px",
															}}
														>
															💰 Pricing
														</div>
														<div
															style={{
																display: "grid",
																gridTemplateColumns:
																	"repeat(3, 1fr)",
																gap: "12px",
															}}
														>
															{raField(
																"Current MRC",
																circuit.monthlyCost != null
																	? raFormatCurrency(
																			circuit.monthlyCost,
																		)
																	: null,
															)}
															{raField(
																"Renewal MRC",
																circuit.renewalMonthlyCost != null
																	? raFormatCurrency(
																			circuit.renewalMonthlyCost,
																		)
																	: null,
															)}
															{raField(
																"Monthly Savings",
																preview.savingsDifference != null
																	? `${preview.savingsDifference > 0 ? "+" : ""}${raFormatCurrency(preview.savingsDifference)}`
																	: null,
																monthlySavingsColor,
															)}
														</div>
													</div>
												)}

												{/* Analysis (NOC-gated) */}
												{user?.role !== "NOC" && (
													<div
														style={{
															flex: "1 1 220px",
															padding: "14px 16px",
														}}
													>
														<div
															style={{
																fontSize: "10px",
																fontWeight: "700",
																textTransform: "uppercase",
																letterSpacing: "0.1em",
																color: "#8B5CF6",
																marginBottom: "10px",
															}}
														>
															📊 Analysis
														</div>
														<div
															style={{
																display: "grid",
																gridTemplateColumns:
																	"repeat(3, 1fr)",
																gap: "12px",
															}}
														>
															{raField(
																"Savings to Cust. Exp.",
																preview.savingsUntilCustomerContractExpiration !=
																	null
																	? raFormatCurrency(
																			preview.savingsUntilCustomerContractExpiration,
																		)
																	: null,
															)}
															{raField(
																"Cost After Cust. Exp.",
																preview.costFromCustomerExpirationToRenewalExpiration !=
																	null
																	? raFormatCurrency(
																			preview.costFromCustomerExpirationToRenewalExpiration,
																		)
																	: null,
															)}
															{raField(
																"Total Savings",
																preview.totalSavings != null
																	? `${preview.totalSavings > 0 ? "+" : ""}${raFormatCurrency(preview.totalSavings)}`
																	: null,
																totalSavingsColor,
															)}
														</div>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div
								style={{
									textAlign: "center",
									padding: "48px 30px",
									backgroundColor:
										theme === "light"
											? "#ffffff"
											: "var(--color-dark-bg-secondary)",
									borderRadius: "10px",
									border: `1px solid ${theme === "light" ? "#e0e0e0" : "var(--color-border)"}`,
									color:
										theme === "light"
											? "#888"
											: "var(--color-text-muted)",
								}}
							>
								<div style={{ fontSize: "40px", marginBottom: "12px" }}>
									📊
								</div>
								<div
									style={{
										fontSize: "16px",
										fontWeight: "600",
										marginBottom: "6px",
										color:
											theme === "light"
												? "#2c3e50"
												: "var(--color-text-light)",
									}}
								>
									No renewal analysis data yet
								</div>
								<div
									style={{ fontSize: "14px", marginBottom: "16px", color: theme === "light" ? "#666" : "var(--color-text-muted)" }}
								>
									Open a circuit in Renewal Analysis to enter renewal
									terms and save the data.
								</div>
								<button
									onClick={() => navigate("/renewal-analysis")}
									style={{
										padding: "8px 18px",
										border: "1px solid var(--color-primary)",
										borderRadius: "6px",
										backgroundColor: "transparent",
										color:
											theme === "light"
												? "var(--color-primary)"
												: "var(--color-primary-light)",
										cursor: "pointer",
										fontSize: "14px",
										fontWeight: "600",
									}}
								>
									✏️ Go to Renewal Analysis
								</button>
							</div>
						)}
					</div>

					{/* ── Legend (NOC-gated) ── */}
					{user?.role !== "NOC" && analysisCircuits.length > 0 && (
						<div
							style={{
								marginTop: "16px",
								padding: "14px 18px",
								backgroundColor:
									theme === "light"
										? "#ffffff"
										: "var(--color-dark-bg)",
								borderRadius: "8px",
								border: `1px solid ${theme === "light" ? "#e0e0e0" : "var(--color-border)"}`,
								boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
								display: "flex",
								flexWrap: "wrap",
								alignItems: "center",
								gap: "20px",
							}}
						>
							<span
								style={{
									fontSize: "11px",
									fontWeight: "700",
									textTransform: "uppercase",
									letterSpacing: "0.06em",
									color:
										theme === "light"
											? "#888"
											: "var(--color-text-muted)",
								}}
							>
								Total Savings
							</span>
							{[
								{
									color: "#10B981",
									label: "Positive — renewal saves money overall",
								},
								{
									color: "#EF4444",
									label: "Negative — renewal costs more overall",
								},
								{ color: "#F59E0B", label: "Break-even" },
							].map(({ color, label }) => (
								<div
									key={label}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									<div
										style={{
											width: "12px",
											height: "12px",
											backgroundColor: color,
											borderRadius: "3px",
											flexShrink: 0,
										}}
									/>
									<span
										style={{
											fontSize: "13px",
											color:
												theme === "light"
													? "#2c3e50"
													: "var(--color-text-light)",
										}}
									>
										{label}
									</span>
								</div>
							))}
						</div>
					)}

					{raShowModal && raSelectedCircuit && (
						<RenewalAnalysisModal
							circuit={raSelectedCircuit}
							onClose={closeRenewalModal}
							onChange={setRaSelectedCircuit}
							onSave={saveRenewalAnalysis}
							saving={raSaving}
						/>
					)}
				</div>
			);
		}

		return <h1>{selectedMenu}</h1>;
	};

	const responsiveChartContainer = {
		width: "96%",
		padding: "var(--spacing-md)",
		"@media (max-width: 768px)": {
			padding: "var(--spacing-sm)",
		},
	};

	const responsiveNavStyle = {
		width: "180px",
		minHeight: "calc(100vh - 70px)",
		backgroundColor: "var(--color-dark-bg)",
		padding: "var(--spacing-lg)",
		zIndex: 999,
		borderRadius: "var(--radius-lg)",
		boxShadow: "var(--shadow-md)",
	};

	const responsiveContentStyle = {
		padding: "var(--spacing-lg)",
		paddingTop: "60px",
		flex: 1,
		minWidth: 0,
	};

	const tableHeaderStyle = {
		padding: "var(--spacing-lg)",
		textAlign: "left",
		borderBottom: `3px solid var(--color-primary)`,
		fontWeight: "700",
		fontSize: "var(--font-size-sm)",
		backgroundColor: "transparent",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
		textTransform: "uppercase",
		letterSpacing: "0.5px",
	};

	const tableCellStyle = {
		padding: "var(--spacing-lg)",
		textAlign: "left",
		fontSize: "var(--font-size-base)",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
		fontWeight: "500",
		backgroundColor: "var(--color-surface)",
	};

	return (
		<div
			className="app-side-page"
			style={{
				width: "100%",
				backgroundColor: "var(--color-surface)",
				minHeight: "100vh",
			}}
		>
			<nav className="app-side-nav" style={responsiveNavStyle}>
				<ul
					style={{
						listStyle: "none",
						padding: 0,
						color: "var(--color-sidebar-text)",
						fontSize: "16px",
					}}
				>
					{[
						"Circuit Analytics",
						"Circuit Expiration Report",
						"Renewal Notice Report",
						"Expired Circuits",
						"Tower Report",
						"Tower Renewal Notice Report",
						"Tower Expiration Report",
						"New Build Sites Report",
						"Renewal Analysis Report",
					].map((item) => (
						<li
							key={item}
							style={{
								marginBottom: "15px",
								padding: "10px",
								cursor: "pointer",
								backgroundColor:
									selectedMenu === item
										? "var(--color-dark-bg-secondary)"
										: "transparent",
								transition: "all var(--transition-fast)",
								borderRadius: "var(--radius-md)",
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
