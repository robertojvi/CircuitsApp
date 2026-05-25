import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AccessLogo from "../images/Access.png";

export const getApiErrorMessage = async (response, fallbackMessage) => {
	try {
		const contentType = response.headers.get("content-type") || "";

		if (contentType.includes("application/json")) {
			const data = await response.json();
			const message =
				data?.message ||
				data?.error ||
				data?.details ||
				(Array.isArray(data?.errors) ? data.errors.join(", ") : null);

			if (message) {
				return `${fallbackMessage}: ${message}`;
			}
		} else {
			const message = (await response.text()).trim();
			if (message) {
				return `${fallbackMessage}: ${message}`;
			}
		}
	} catch (error) {
		console.error("Error parsing API error response:", error);
	}

	return fallbackMessage;
};

const parseDateInputValue = (value) => {
	if (!value) return null;

	const [year, month, day] = value.split("-").map(Number);
	if ([year, month, day].some(Number.isNaN)) return null;

	return new Date(year, month - 1, day);
};

const formatDateForInput = (date) => {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const addYearsFromToday = (years) => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	today.setFullYear(today.getFullYear() + years);
	return formatDateForInput(today);
};

const inferRenewalTerm = (renewalCircuitExpirationDate) => {
	if (!renewalCircuitExpirationDate) return "other";

	const matchingTerm = [1, 2, 3].find(
		(termYears) =>
			addYearsFromToday(termYears) === renewalCircuitExpirationDate,
	);

	return matchingTerm ? String(matchingTerm) : "other";
};

const roundCurrency = (value) => {
	if (!Number.isFinite(value)) return null;
	return Math.round(value * 100) / 100;
};

const getStartOfNextMonth = (date) => {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

	return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

const calculateRoundedUpMonths = (startDate, endDate) => {
	if (!(startDate instanceof Date) || !(endDate instanceof Date)) return null;
	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return null;
	}
	if (endDate <= startDate) return 0;

	let months =
		(endDate.getFullYear() - startDate.getFullYear()) * 12 +
		(endDate.getMonth() - startDate.getMonth());

	const adjusted = new Date(startDate);
	adjusted.setMonth(adjusted.getMonth() + months);

	if (adjusted < endDate) {
		months += 1;
	}

	return months;
};

const buildRenewalPreview = (circuit) => {
	const currentMrc = Number(circuit.monthlyCost);
	const renewalMrc = Number(circuit.renewalMonthlyCost);
	const customerExpirationDate = parseDateInputValue(
		circuit.site?.customerContractExpirationDate,
	);
	const renewalCircuitExpirationDate = parseDateInputValue(
		circuit.renewalCircuitExpirationDate,
	);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const startOfNextMonth = getStartOfNextMonth(today);

	const savingsDifference =
		Number.isFinite(currentMrc) && Number.isFinite(renewalMrc)
			? roundCurrency(currentMrc - renewalMrc)
			: null;

	const monthsToCustomerContractExpiration = customerExpirationDate
		? calculateRoundedUpMonths(startOfNextMonth, customerExpirationDate)
		: null;

	const savingsUntilCustomerContractExpiration =
		savingsDifference != null && monthsToCustomerContractExpiration != null
			? roundCurrency(savingsDifference * monthsToCustomerContractExpiration)
			: null;

	const monthsBetweenExpirationDates =
		customerExpirationDate && renewalCircuitExpirationDate
			? calculateRoundedUpMonths(
					customerExpirationDate,
					renewalCircuitExpirationDate,
				)
			: null;

	const costFromCustomerExpirationToRenewalExpiration =
		Number.isFinite(renewalMrc) && monthsBetweenExpirationDates != null
			? roundCurrency(renewalMrc * monthsBetweenExpirationDates)
			: null;

	const totalSavings =
		savingsUntilCustomerContractExpiration != null &&
		costFromCustomerExpirationToRenewalExpiration != null
			? roundCurrency(
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

const formatCurrency = (value) => {
	if (value == null || value === "") return "N/A";
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) return "N/A";
	return numericValue.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

const formatDate = (value) => {
	if (!value) return "N/A";
	const parsedDate = parseDateInputValue(value);
	if (!parsedDate) return "N/A";
	return parsedDate.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export const RenewalAnalysisModal = ({
	circuit,
	onClose,
	onChange,
	onSave,
	saving,
}) => {
	const { theme } = useTheme();
	const [renewalTerm, setRenewalTerm] = useState(() =>
		inferRenewalTerm(circuit.renewalCircuitExpirationDate),
	);

	useEffect(() => {
		setRenewalTerm(inferRenewalTerm(circuit.renewalCircuitExpirationDate));
	}, [circuit.id, circuit.renewalCircuitExpirationDate]);

	const preview = useMemo(() => buildRenewalPreview(circuit), [circuit]);
	const isCostComparisonAvailable =
		preview.costFromCustomerExpirationToRenewalExpiration != null &&
		preview.savingsUntilCustomerContractExpiration != null;

	// Theme-aware modal styles
	const themedModalStyle = {
		...modalStyle,
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-dark-bg)",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
		colorScheme: theme,
	};

	const themedModalHeaderStyle = {
		...modalHeaderStyle,
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-dark-bg)",
		borderBottomColor: "var(--color-primary)",
	};

	const themedCloseButtonStyle = {
		...closeButtonStyle,
		backgroundColor:
			theme === "light" ? "#f8f9fa" : "var(--color-dark-bg-secondary)",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
	};

	const themedSectionCardStyle = {
		...sectionCardStyle,
		backgroundColor:
			theme === "light" ? "#f8f9fa" : "var(--color-dark-bg-secondary)",
		borderColor: theme === "light" ? "#e0e0e0" : "var(--color-border)",
	};

	const themedSectionHeadingStyle = {
		...sectionHeadingStyle,
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
	};

	const themedSectionDescriptionStyle = {
		...sectionDescriptionStyle,
		color: theme === "light" ? "#7f8c8d" : "var(--color-text-muted)",
	};

	const themedFieldLabelStyle = {
		...fieldLabelStyle,
		color: "var(--color-primary-light)",
	};

	const themedFieldValueStyle = {
		...fieldValueStyle,
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
	};

	const themedInputLabelStyle = {
		...inputLabelStyle,
		color: theme === "light" ? "#555555" : "var(--color-label-muted)",
	};

	const themedInputStyle = {
		...inputStyle,
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-dark-bg)",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
		borderColor: theme === "light" ? "#d0d0d0" : "var(--color-border)",
	};

	const themedReadOnlyInputStyle = {
		...readOnlyInputStyle,
		backgroundColor:
			theme === "light" ? "#e8e8e8" : "var(--color-dark-bg-tertiary)",
		color: theme === "light" ? "#555555" : "var(--color-text-light)",
	};

	const themedModalHeaderBrandLabelStyle = {
		...modalHeaderBrandLabelStyle,
		color: theme === "light" ? "#555555" : "var(--color-label-text)",
	};

	const themedModalHeaderSubtitleStyle = {
		...modalHeaderSubtitleStyle,
		color: theme === "light" ? "#7f8c8d" : "var(--color-text-muted)",
	};

	// Theme-aware timeline pill styles
	const themedTimelinePillStyle = {
		...timelinePillStyle,
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-dark-bg)",
		border: `1px solid ${theme === "light" ? "#e0e0e0" : "var(--color-border-light)"}`,
	};

	const themedTimelinePillLabelStyle = {
		...timelinePillLabelStyle,
		color: "var(--color-primary-light)",
	};

	const themedTimelinePillValueStyle = {
		...timelinePillValueStyle,
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
	};

	// Theme-aware button styles
	const themedSecondaryButtonStyle = {
		...secondaryButtonStyle,
		backgroundColor: theme === "light" ? "#f8f9fa" : "var(--color-dark-bg)",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
		border: `1px solid ${theme === "light" ? "#d0d0d0" : "var(--color-border-light)"}`,
	};

	// Theme-aware highlight styles for result cards
	const themedInfoHighlightStyle = {
		...infoHighlightStyle,
		color: theme === "light" ? "#1e40af" : "#dbeafe",
	};

	const themedSuccessHighlightStyle = {
		...successHighlightStyle,
		color: theme === "light" ? "#166534" : "#dcfce7",
	};

	const themedDangerHighlightStyle = {
		...dangerHighlightStyle,
		color: theme === "light" ? "#7f1d1d" : "#fee2e2",
	};

	const themedWarningHighlightStyle = {
		...warningHighlightStyle,
		color: theme === "light" ? "#713f12" : "#fef9c3",
	};

	const themedResultValueStyle = {
		...resultValueStyle,
		color: theme === "light" ? "#1e293b" : "inherit",
	};

	const totalSavingsStyle =
		preview.totalSavings == null
			? themedReadOnlyInputStyle
			: preview.totalSavings > 0
				? themedSuccessHighlightStyle
				: preview.totalSavings < 0
					? themedDangerHighlightStyle
					: themedWarningHighlightStyle;
	const comparisonSummary = !isCostComparisonAvailable
		? "Enter contract expiration and renewal values to compare total savings against the post-contract renewal cost."
		: preview.costFromCustomerExpirationToRenewalExpiration <
			  preview.savingsUntilCustomerContractExpiration
			? "The renewal cost after customer contract expiration is lower than the projected savings before that date."
			: "The renewal cost after customer contract expiration exceeds or matches the projected savings before that date.";

	const updateSiteField = (field, value) => {
		onChange({
			...circuit,
			site: {
				...circuit.site,
				[field]: value,
			},
		});
	};

	const handleRenewalTermChange = (event) => {
		const selectedTerm = event.target.value;
		setRenewalTerm(selectedTerm);

		if (selectedTerm === "other") {
			return;
		}

		onChange({
			...circuit,
			renewalCircuitExpirationDate: addYearsFromToday(Number(selectedTerm)),
		});
	};

	return (
		<div style={overlayStyle}>
			<div style={themedModalStyle}>
				<div style={themedModalHeaderStyle}>
					<div style={modalHeaderContentStyle}>
						<div style={modalHeaderBrandStyle}>
							<img
								src={AccessLogo}
								alt="AccessParks logo"
								style={modalHeaderLogoStyle}
							/>
							<span style={themedModalHeaderBrandLabelStyle}>AccessParks</span>
						</div>
						<div style={modalHeaderTextContainerStyle}>
							<h2 style={{ margin: 0 }}>Renewal Analysis</h2>
							<p style={themedModalHeaderSubtitleStyle}>
								Review the contract timeline, enter renewal inputs, and compare
								savings against the future renewal cost.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						style={themedCloseButtonStyle}
					>
						Close
					</button>
				</div>
				<div style={modalBodyStyle}>
					<div style={themedSectionCardStyle}>
						<div style={themedSectionHeadingStyle}>Circuit Overview</div>
						<div style={summaryGridStyle}>
							<div>
								<div style={themedFieldLabelStyle}>Site</div>
								<div style={themedFieldValueStyle}>
									{circuit.site?.name || "N/A"}
								</div>
							</div>
							<div>
								<div style={themedFieldLabelStyle}>Provider</div>
								<div style={themedFieldValueStyle}>
									{circuit.provider?.name || "N/A"}
								</div>
							</div>
							<div>
								<div style={themedFieldLabelStyle}>Bandwidth</div>
								<div style={themedFieldValueStyle}>
									{circuit.circuitBandwidth || "N/A"}
								</div>
							</div>
							<div>
								<div style={themedFieldLabelStyle}>Aggregator</div>
								<div style={themedFieldValueStyle}>
									{circuit.aggregatorName || "N/A"}
								</div>
							</div>
						</div>
					</div>

					<div style={twoColumnLayoutStyle}>
						<div style={themedSectionCardStyle}>
							<div style={themedSectionHeadingStyle}>Contract Timeline</div>
							<div style={themedSectionDescriptionStyle}>
								These dates drive the month-based savings and renewal cost
								calculations.
							</div>
							<div style={sectionGridStyle}>
								<div>
									<div style={themedFieldLabelStyle}>Site</div>
									<label style={themedInputLabelStyle}>
										Circuit Expiration Date
									</label>
									<input
										type="date"
										value={circuit.expirationDate || ""}
										readOnly
										style={{ ...themedInputStyle, ...themedReadOnlyInputStyle }}
									/>
								</div>
								<div>
									<label style={themedInputLabelStyle}>
										Customer Contract Expiration Date
									</label>
									<input
										type="date"
										value={circuit.site?.customerContractExpirationDate || ""}
										onChange={(event) =>
											updateSiteField(
												"customerContractExpirationDate",
												event.target.value,
											)
										}
										style={themedInputStyle}
									/>
								</div>
								<div>
									<label style={themedInputLabelStyle}>
										Renewal Circuit Expiration Term
									</label>
									<select
										value={renewalTerm}
										onChange={handleRenewalTermChange}
										style={themedInputStyle}
									>
										<option value="1">1 Year</option>
										<option value="2">2 Years</option>
										<option value="3">3 Years</option>
										<option value="other">Other</option>
									</select>
								</div>
								<div>
									<label style={themedInputLabelStyle}>
										Renewal Circuit Expiration Date
									</label>
									<input
										type="date"
										value={circuit.renewalCircuitExpirationDate || ""}
										readOnly={renewalTerm !== "other"}
										disabled={renewalTerm !== "other"}
										onChange={(event) =>
											onChange({
												...circuit,
												renewalCircuitExpirationDate: event.target.value,
											})
										}
										style={
											renewalTerm !== "other"
												? { ...themedInputStyle, ...themedReadOnlyInputStyle }
												: themedInputStyle
										}
									/>
								</div>
							</div>
						</div>

						<div style={themedSectionCardStyle}>
							<div style={themedSectionHeadingStyle}>Pricing Inputs</div>
							<div style={themedSectionDescriptionStyle}>
								Use the current monthly recurring cost and proposed renewal cost
								to calculate projected savings.
							</div>
							<div style={sectionGridStyle}>
								<div>
									<label style={themedInputLabelStyle}>Current MRC</label>
									<input
										type="text"
										value={formatCurrency(circuit.monthlyCost)}
										readOnly
										style={{ ...themedInputStyle, ...themedReadOnlyInputStyle }}
									/>
								</div>
								<div>
									<label style={themedInputLabelStyle}>Renewal MRC</label>
									<input
										type="number"
										min="0"
										step="0.01"
										value={circuit.renewalMonthlyCost ?? ""}
										onChange={(event) =>
											onChange({
												...circuit,
												renewalMonthlyCost:
													event.target.value === ""
														? null
														: Number(event.target.value),
											})
										}
										style={themedInputStyle}
									/>
								</div>
								<div>
									<label style={themedInputLabelStyle}>
										Savings Difference
									</label>
									<input
										type="text"
										value={formatCurrency(preview.savingsDifference)}
										readOnly
										style={{ ...themedInputStyle, ...themedReadOnlyInputStyle }}
									/>
								</div>
							</div>
						</div>
					</div>

					<div style={themedSectionCardStyle}>
						<div style={themedSectionHeadingStyle}>Analysis Results</div>
						<div style={themedSectionDescriptionStyle}>
							These values are calculated from the dates and pricing entered
							above and saved with the circuit.
						</div>
						<div style={resultsGridStyle}>
							<div style={resultCardStyle}>
								<div style={themedFieldLabelStyle}>
									Months To Customer Contract Expiration
								</div>
								<div style={themedResultValueStyle}>
									{preview.monthsToCustomerContractExpiration != null
										? String(preview.monthsToCustomerContractExpiration)
										: "N/A"}
								</div>
							</div>
							<div style={{ ...resultCardStyle, ...themedInfoHighlightStyle }}>
								<div style={themedFieldLabelStyle}>
									Savings To Customer Contract Expiration
								</div>
								<div style={themedResultValueStyle}>
									{formatCurrency(
										preview.savingsUntilCustomerContractExpiration,
									)}
								</div>
							</div>
							<div style={{ ...resultCardStyle, ...costHighlightStyle }}>
								<div style={{ ...themedFieldLabelStyle, ...costTitleStyle }}>
									Cost From Customer Expiration To Renewal Circuit Expiration
								</div>
								<div style={themedResultValueStyle}>
									{formatCurrency(
										preview.costFromCustomerExpirationToRenewalExpiration,
									)}
								</div>
							</div>
							<div
								style={{
									...resultCardStyle,
									...totalSavingsCardStyle,
									...totalSavingsStyle,
								}}
							>
								<div style={themedFieldLabelStyle}>Total Savings</div>
								<div style={themedResultValueStyle}>
									{formatCurrency(preview.totalSavings)}
								</div>
							</div>
						</div>
						<div style={analysisSummaryStyle}>{comparisonSummary}</div>
						<div style={timelineSummaryGridStyle}>
							<div style={themedTimelinePillStyle}>
								<span style={themedTimelinePillLabelStyle}>
									Current Circuit Expiration
								</span>
								<span style={themedTimelinePillValueStyle}>
									{formatDate(circuit.expirationDate)}
								</span>
							</div>
							<div style={themedTimelinePillStyle}>
								<span style={themedTimelinePillLabelStyle}>
									Customer Contract Expiration
								</span>
								<span style={themedTimelinePillValueStyle}>
									{formatDate(circuit.site?.customerContractExpirationDate)}
								</span>
							</div>
							<div style={themedTimelinePillStyle}>
								<span style={themedTimelinePillLabelStyle}>
									Renewal Circuit Expiration
								</span>
								<span style={themedTimelinePillValueStyle}>
									{formatDate(circuit.renewalCircuitExpirationDate)}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div style={modalActionsStyle}>
					<button
						type="button"
						onClick={onClose}
						style={themedSecondaryButtonStyle}
					>
						Cancel
					</button>
					<button type="button" onClick={onSave} style={primaryButtonStyle}>
						{saving ? "Saving..." : "Save Analysis"}
					</button>
				</div>
			</div>
		</div>
	);
};

function RenewalAnalysis() {
	const { token } = useAuth();
	const { theme } = useTheme();
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCircuit, setSelectedCircuit] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);

	// Theme-aware styles
	const themedSearchInputStyle = {
		...searchInputStyle,
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-dark-bg)",
		color: theme === "light" ? "#2c3e50" : "var(--color-text-light)",
		borderColor: theme === "light" ? "#d0d0d0" : "var(--color-primary)",
	};

	const themedSearchPanelStyle = {
		...searchPanelStyle,
		backgroundColor:
			theme === "light" ? "#f8f9fa" : "var(--color-dark-bg-secondary)",
		borderColor: theme === "light" ? "#e0e0e0" : "var(--color-border)",
	};

	const themedStatusMessageStyle = {
		...statusMessageStyle,
		backgroundColor:
			theme === "light" ? "#d1ecf1" : "var(--color-dark-bg-secondary)",
		color: theme === "light" ? "#0c5460" : "var(--color-text-light)",
		borderColor: theme === "light" ? "#bee5eb" : "var(--color-primary)",
	};

	const themedErrorStyle = {
		...errorStyle,
		backgroundColor: theme === "light" ? "#f8d7da" : "#5b2c2c",
		color: theme === "light" ? "#721c24" : "#fecaca",
		borderColor: theme === "light" ? "#f5c6cb" : "var(--color-error)",
	};

	const themedTableContainerStyle = {
		...tableContainerStyle,
		backgroundColor:
			theme === "light" ? "#ffffff" : "var(--color-dark-bg-secondary)",
		borderColor: theme === "light" ? "#e0e0e0" : "var(--color-border)",
	};

	const themedTableRowStyle = {
		...tableRowStyle,
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
		borderBottomColor:
			theme === "light" ? "#e8e8e8" : "var(--color-border-light)",
	};

	const themedTableCellStyle = {
		...tableCellStyle,
		color: theme === "light" ? "#2c3e50" : "var(--color-sidebar-text)",
	};

	useEffect(() => {
		fetchCircuits();
	}, []);

	const fetchCircuits = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/circuits", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error("Failed to load circuits");
			}
			const data = await response.json();
			const sortedData = [...data].sort((a, b) =>
				(a.site?.name || "").localeCompare(b.site?.name || "", undefined, {
					sensitivity: "base",
				}),
			);
			setCircuits(sortedData);
		} catch (fetchError) {
			console.error(fetchError);
			setError("Failed to load renewal analysis data");
		} finally {
			setLoading(false);
		}
	};

	const filteredCircuits = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return circuits;

		return circuits.filter((circuit) =>
			[
				circuit.site?.name,
				circuit.provider?.name,
				circuit.circuitBandwidth,
				circuit.aggregatorName,
				circuit.circuitId,
			]
				.filter(Boolean)
				.some((value) => value.toLowerCase().includes(term)),
		);
	}, [circuits, searchTerm]);

	const openAnalysisModal = (circuit) => {
		setSelectedCircuit({
			...circuit,
			site: { ...circuit.site },
			provider: { ...circuit.provider },
		});
		setShowModal(true);
	};

	const closeAnalysisModal = () => {
		setShowModal(false);
		setSelectedCircuit(null);
	};

	const saveAnalysis = async () => {
		if (!selectedCircuit) return;

		setSaving(true);
		setError(null);
		try {
			const response = await fetch("/api/circuits", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(selectedCircuit),
			});

			if (!response.ok) {
				throw new Error(
					await getApiErrorMessage(response, "Failed to save renewal analysis"),
				);
			}

			await fetchCircuits();

			const refreshedCircuitResponse = await fetch(
				`/api/circuits/${selectedCircuit.id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (refreshedCircuitResponse.ok) {
				const refreshedCircuit = await refreshedCircuitResponse.json();
				setSelectedCircuit({
					...refreshedCircuit,
					site: { ...refreshedCircuit.site },
					provider: { ...refreshedCircuit.provider },
				});
			}
		} catch (saveError) {
			console.error(saveError);
			setError(saveError.message || "Failed to save renewal analysis");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div style={pageShellStyle}>
			<div style={pageHeaderStyle}>
				<div style={headerIntroCardStyle}>
					<div style={headerBrandRowStyle}>
						<img
							src={AccessLogo}
							alt="AccessParks logo"
							style={headerLogoStyle}
						/>
						<span style={headerBrandLabelStyle}>AccessParks</span>
					</div>
					<div style={titleBadgeStyle}>
						<h1 style={titleTextStyle}>Renewal Analysis</h1>
					</div>
					<p style={pageSubtitleStyle}>
						Review current circuit costs, enter renewal terms, and persist
						savings calculations per circuit.
					</p>
				</div>
			</div>

			<div style={searchPanelRowStyle}>
				<div style={themedSearchPanelStyle}>
					<div style={searchPanelLabelStyle}>Find A Circuit</div>
					<input
						type="text"
						placeholder="Search by site, provider, bandwidth, aggregator, or circuit ID"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						style={themedSearchInputStyle}
					/>
				</div>
			</div>

			{loading && (
				<div style={themedStatusMessageStyle}>Loading renewal analysis...</div>
			)}
			{error && <div style={themedErrorStyle}>{error}</div>}
			{!loading && (
				<div style={themedTableContainerStyle}>
					<table style={tableStyle}>
						<thead>
							<tr style={tableHeaderRowStyle}>
								<th style={headerCellStyle}>Site</th>
								<th style={headerCellStyle}>Provider</th>
								<th style={headerCellStyle}>Bandwidth</th>
								<th style={headerCellStyle}>Monthly Cost</th>
								<th style={headerCellStyle}>Aggregator</th>
								<th style={headerCellStyle}>Analysis</th>
							</tr>
						</thead>
						<tbody>
							{filteredCircuits.map((circuit) => (
								<tr key={circuit.id} style={themedTableRowStyle}>
									<td style={themedTableCellStyle}>
										{circuit.site?.name || "N/A"}
									</td>
									<td style={themedTableCellStyle}>
										{circuit.provider?.name || "N/A"}
									</td>
									<td style={themedTableCellStyle}>
										{circuit.circuitBandwidth || "N/A"}
									</td>
									<td style={themedTableCellStyle}>
										{formatCurrency(circuit.monthlyCost)}
									</td>
									<td style={themedTableCellStyle}>
										{circuit.aggregatorName || "N/A"}
									</td>
									<td style={themedTableCellStyle}>
										<button
											type="button"
											onClick={() => openAnalysisModal(circuit)}
											style={iconButtonStyle}
											title="Open renewal analysis"
										>
											📊
										</button>
									</td>
								</tr>
							))}
							{filteredCircuits.length === 0 && (
								<tr>
									<td style={emptyStateStyle} colSpan={6}>
										No circuits matched the current search.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{showModal && selectedCircuit && (
				<RenewalAnalysisModal
					circuit={selectedCircuit}
					onClose={closeAnalysisModal}
					onChange={setSelectedCircuit}
					onSave={saveAnalysis}
					saving={saving}
				/>
			)}
		</div>
	);
}

const pageShellStyle = {
	paddingTop: "60px",
	paddingLeft: "var(--spacing-lg)",
	paddingRight: "var(--spacing-lg)",
	paddingBottom: "var(--spacing-lg)",
	minHeight: "calc(100vh - 60px)",
	backgroundColor: "var(--color-dark-bg)",
	color: "var(--color-text-light)",
};

const pageHeaderStyle = {
	display: "block",
	marginBottom: "var(--spacing-lg)",
};

const headerIntroCardStyle = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	padding: "var(--spacing-md)",
	borderRadius: "var(--radius-xl)",
	backgroundColor: "var(--color-dark-bg-secondary)",
	border: `1px solid var(--color-border-light)`,
	boxShadow: "var(--shadow-lg)",
	width: "100%",
	maxWidth: "none",
	boxSizing: "border-box",
};

const headerBrandRowStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: "var(--spacing-md)",
	marginBottom: "var(--spacing-md)",
};

const headerLogoStyle = {
	height: "38px",
	width: "auto",
	objectFit: "contain",
	filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18))",
};

const headerBrandLabelStyle = {
	fontSize: "var(--font-size-sm)",
	fontWeight: 700,
	letterSpacing: "0.08em",
	color: "var(--color-label-text)",
};

const titleBadgeStyle = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "var(--spacing-md)",
	borderRadius: "var(--radius-lg)",
	backgroundColor: "var(--color-dark-bg)",
	border: `1px solid var(--color-primary)`,
	boxShadow: "var(--shadow-lg)",
};

const titleTextStyle = {
	margin: 0,
	color: "var(--color-navbar-text)",
	fontSize: "clamp(1.8rem, 2vw, 2.4rem)",
	lineHeight: 1.1,
};

const pageSubtitleStyle = {
	marginTop: "8px",
	marginBottom: 0,
	color: "var(--color-label-muted)",
	maxWidth: "720px",
	lineHeight: 1.5,
	textAlign: "center",
};

const searchPanelRowStyle = {
	marginBottom: "20px",
};

const searchPanelStyle = {
	minWidth: "320px",
	maxWidth: "420px",
	width: "100%",
	padding: "14px",
	borderRadius: "16px",
	backgroundColor: "var(--color-dark-bg-secondary)",
	border: "1px solid var(--color-border)",
	boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
};

const searchPanelLabelStyle = {
	fontSize: "11px",
	fontWeight: 700,
	textTransform: "uppercase",
	letterSpacing: "0.08em",
	color: "var(--color-text-muted)",
	marginBottom: "8px",
};

const searchInputStyle = {
	width: "100%",
	padding: "10px 12px",
	border: "1px solid var(--color-primary)",
	borderRadius: "8px",
	fontSize: "14px",
	backgroundColor: "var(--color-dark-bg)",
	color: "var(--color-text-light)",
	boxSizing: "border-box",
};

const tableContainerStyle = {
	backgroundColor: "var(--color-dark-bg-secondary)",
	borderRadius: "12px",
	boxShadow: "0 10px 30px rgba(0, 0, 0, 0.16)",
	overflowX: "auto",
	border: "1px solid var(--color-border)",
};

const tableStyle = {
	width: "100%",
	borderCollapse: "collapse",
};

const tableHeaderRowStyle = {
	backgroundColor: "var(--color-table-header-bg)",
	borderBottom: "3px solid var(--color-primary)",
};

const headerCellStyle = {
	padding: "var(--spacing-lg)",
	textAlign: "left",
	color: "var(--color-table-header-text)",
	fontWeight: 700,
	fontSize: "var(--font-size-sm)",
	textTransform: "uppercase",
	letterSpacing: "0.5px",
};

const tableRowStyle = {
	borderBottom: `1px solid var(--color-border-light)`,
	backgroundColor: "var(--color-surface)",
	transition: "all var(--transition-fast)",
};

const tableCellStyle = {
	padding: "var(--spacing-lg)",
	fontSize: "var(--font-size-base)",
	color: "var(--color-sidebar-text)",
	fontWeight: "500",
};

const iconButtonStyle = {
	padding: "8px 10px",
	borderRadius: "8px",
	border: "1px solid var(--color-primary)",
	backgroundColor: "rgba(52, 152, 219, 0.15)",
	color: "var(--color-primary-light)",
	cursor: "pointer",
	fontSize: "18px",
};

const emptyStateStyle = {
	padding: "24px",
	textAlign: "center",
	color: "var(--color-label-muted)",
};

const statusMessageStyle = {
	marginBottom: "16px",
	padding: "12px 14px",
	borderRadius: "12px",
	backgroundColor: "var(--color-dark-bg-secondary)",
	border: "1px solid var(--color-primary)",
	color: "var(--color-text-light)",
	boxShadow: "0 8px 24px rgba(0, 0, 0, 0.14)",
};

const overlayStyle = {
	position: "fixed",
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	backgroundColor: "rgba(0, 0, 0, 0.55)",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	padding: "20px",
	zIndex: 1200,
};

const modalStyle = {
	width: "100%",
	maxWidth: "960px",
	maxHeight: "90vh",
	overflowY: "auto",
	backgroundColor: "var(--color-dark-bg)",
	color: "var(--color-text-light)",
	borderRadius: "16px",
	border: "1px solid var(--color-border)",
	colorScheme: "dark",
	boxShadow: "0 24px 60px rgba(0, 0, 0, 0.24)",
};

const modalHeaderStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "flex-start",
	padding: "20px 24px",
	borderBottom: "1px solid var(--color-primary)",
	position: "sticky",
	top: 0,
	backgroundColor: "var(--color-dark-bg)",
	gap: "16px",
};

const modalHeaderContentStyle = {
	display: "flex",
	flexDirection: "column",
	gap: "10px",
	flex: "1 1 auto",
};

const modalHeaderBrandStyle = {
	display: "flex",
	alignItems: "center",
	gap: "10px",
};

const modalHeaderLogoStyle = {
	height: "34px",
	width: "auto",
	objectFit: "contain",
	filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))",
};

const modalHeaderBrandLabelStyle = {
	fontSize: "11px",
	fontWeight: 700,
	letterSpacing: "0.08em",
	color: "var(--color-label-text)",
};

const modalHeaderTextContainerStyle = {
	maxWidth: "420px",
};

const modalHeaderSubtitleStyle = {
	marginTop: "8px",
	marginBottom: 0,
	fontSize: "13px",
	lineHeight: 1.5,
	color: "var(--color-text-muted)",
	maxWidth: "420px",
};

const closeButtonStyle = {
	border: "1px solid var(--color-primary)",
	backgroundColor: "var(--color-dark-bg-secondary)",
	borderRadius: "8px",
	padding: "8px 12px",
	color: "var(--color-text-light)",
	cursor: "pointer",
};

const modalSectionStyle = {
	padding: "24px",
	paddingBottom: "12px",
};

const modalBodyStyle = {
	padding: "24px",
	display: "grid",
	gap: "20px",
};

const sectionCardStyle = {
	backgroundColor: "var(--color-dark-bg-secondary)",
	border: "1px solid var(--color-border)",
	borderRadius: "14px",
	padding: "18px",
	boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
};

const sectionHeadingStyle = {
	fontSize: "15px",
	fontWeight: 700,
	color: "var(--color-text-light)",
	marginBottom: "8px",
};

const sectionDescriptionStyle = {
	fontSize: "13px",
	lineHeight: 1.6,
	color: "var(--color-text-muted)",
	marginBottom: "16px",
};

const twoColumnLayoutStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
	gap: "20px",
};

const summaryGridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
	gap: "16px",
};

const formGridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
	gap: "16px",
	padding: "0 24px 16px",
};

const sectionGridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
	gap: "16px",
};

const fieldLabelStyle = {
	fontSize: "12px",
	fontWeight: 600,
	textTransform: "uppercase",
	letterSpacing: "0.04em",
	color: "var(--color-primary-light)",
	marginBottom: "6px",
};

const fieldValueStyle = {
	fontSize: "15px",
	color: "var(--color-text-light)",
	fontWeight: 500,
};

const inputLabelStyle = {
	display: "block",
	marginBottom: "6px",
	fontSize: "13px",
	fontWeight: 600,
	color: "var(--color-label-muted)",
};

const inputStyle = {
	width: "100%",
	padding: "10px 12px",
	border: "1px solid var(--color-border)",
	borderRadius: "8px",
	fontSize: "14px",
	backgroundColor: "var(--color-dark-bg)",
	color: "var(--color-surface-light)",
	boxSizing: "border-box",
};

const readOnlyInputStyle = {
	backgroundColor: "var(--color-dark-bg-tertiary)",
	color: "var(--color-text-light)",
};

const successHighlightStyle = {
	backgroundColor: "var(--color-success-dark-bg)",
	borderColor: "#22c55e",
	color: "#dcfce7",
	fontWeight: 600,
};

const dangerHighlightStyle = {
	backgroundColor: "var(--color-danger-dark-bg)",
	borderColor: "#ef4444",
	color: "#fee2e2",
	fontWeight: 600,
};

const warningHighlightStyle = {
	backgroundColor: "var(--color-warning-dark-bg)",
	borderColor: "#facc15",
	color: "#fef9c3",
	fontWeight: 600,
};

const costHighlightStyle = {
	borderColor: "#eab308",
	color: "var(--color-text-dark)",
	fontWeight: 600,
};

const costTitleStyle = {
	color: "var(--color-text-dark)",
};

const infoHighlightStyle = {
	backgroundColor: "var(--color-info-dark-bg)",
	borderColor: "#3b82f6",
	color: "#dbeafe",
	fontWeight: 600,
};

const calculationNoteStyle = {
	padding: "0 24px 20px",
	color: "#cbd5e1",
	fontSize: "13px",
	lineHeight: 1.7,
};

const resultsGridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
	gap: "var(--spacing-lg)",
	marginBottom: "var(--spacing-lg)",
};

const resultCardStyle = {
	backgroundColor: "var(--color-dark-bg)",
	border: `1px solid var(--color-border-light)`,
	borderRadius: "var(--radius-xl)",
	padding: "var(--spacing-lg)",
	minHeight: "110px",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	textAlign: "center",
	gap: "var(--spacing-md)",
	boxShadow: "var(--shadow-sm)",
	transition: `all var(--transition-base)`,
};

const totalSavingsCardStyle = {
	gridColumn: "1 / -1",
	justifySelf: "center",
	width: "100%",
	maxWidth: "320px",
	alignItems: "center",
	justifyContent: "center",
	textAlign: "center",
	gap: "var(--spacing-md)",
};

const resultValueStyle = {
	fontSize: "24px",
	fontWeight: 700,
	lineHeight: 1.2,
	color: "inherit",
};

const analysisSummaryStyle = {
	padding: "var(--spacing-md)",
	borderRadius: "var(--radius-xl)",
	backgroundColor: "var(--color-dark-bg)",
	border: `1px solid var(--color-primary)`,
	color: "var(--color-label-text)",
	fontSize: "var(--font-size-sm)",
	lineHeight: 1.6,
	marginBottom: "var(--spacing-lg)",
	boxShadow: "var(--shadow-sm)",
};

const timelineSummaryGridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
	gap: "12px",
};

const timelinePillStyle = {
	padding: "var(--spacing-md)",
	borderRadius: "var(--radius-xl)",
	backgroundColor: "var(--color-dark-bg)",
	border: `1px solid var(--color-border-light)`,
	display: "flex",
	flexDirection: "column",
	gap: "var(--spacing-sm)",
	boxShadow: "var(--shadow-sm)",
	transition: `all var(--transition-base)`,
};

const timelinePillLabelStyle = {
	fontSize: "var(--font-size-xs)",
	fontWeight: 700,
	textTransform: "uppercase",
	letterSpacing: "0.05em",
	color: "var(--color-primary-light)",
};

const timelinePillValueStyle = {
	fontSize: "var(--font-size-base)",
	fontWeight: 600,
	color: "var(--color-text-light)",
};

const modalActionsStyle = {
	display: "flex",
	justifyContent: "flex-end",
	gap: "var(--spacing-md)",
	padding: `0 var(--spacing-xl) var(--spacing-xl)`,
};

const primaryButtonStyle = {
	padding: "10px 16px",
	borderRadius: "var(--radius-md)",
	border: "none",
	backgroundColor: "var(--color-primary)",
	color: "var(--color-text-light)",
	fontWeight: "600",
	cursor: "pointer",
	transition: `all var(--transition-base)`,
};

const secondaryButtonStyle = {
	padding: "10px 16px",
	borderRadius: "var(--radius-md)",
	border: `1px solid var(--color-border-light)`,
	backgroundColor: "var(--color-dark-bg)",
	color: "var(--color-text-light)",
	fontWeight: "600",
	cursor: "pointer",
	transition: `all var(--transition-base)`,
};

const errorStyle = {
	marginBottom: "var(--spacing-lg)",
	padding: "var(--spacing-md)",
	borderRadius: "var(--radius-md)",
	backgroundColor: "#5b2c2c",
	color: "#fecaca",
	border: `1px solid var(--color-error)`,
	boxShadow: "var(--shadow-md)",
};

export default RenewalAnalysis;
