import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const getApiErrorMessage = async (response, fallbackMessage) => {
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

const roundCurrency = (value) => {
	if (!Number.isFinite(value)) return null;
	return Math.round(value * 100) / 100;
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

	const savingsDifference =
		Number.isFinite(currentMrc) && Number.isFinite(renewalMrc)
			? roundCurrency(currentMrc - renewalMrc)
			: null;

	const monthsToCustomerContractExpiration = customerExpirationDate
		? calculateRoundedUpMonths(today, customerExpirationDate)
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

	return {
		savingsDifference,
		monthsToCustomerContractExpiration,
		savingsUntilCustomerContractExpiration,
		costFromCustomerExpirationToRenewalExpiration,
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

const RenewalAnalysisModal = ({
	circuit,
	onClose,
	onChange,
	onSave,
	saving,
}) => {
	const preview = useMemo(() => buildRenewalPreview(circuit), [circuit]);
	const isCostComparisonAvailable =
		preview.costFromCustomerExpirationToRenewalExpiration != null &&
		preview.savingsUntilCustomerContractExpiration != null;
	const costComparisonStyle = isCostComparisonAvailable
		? preview.costFromCustomerExpirationToRenewalExpiration <
			preview.savingsUntilCustomerContractExpiration
			? successHighlightStyle
			: dangerHighlightStyle
		: readOnlyInputStyle;
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

	return (
		<div style={overlayStyle}>
			<div style={modalStyle}>
				<div style={modalHeaderStyle}>
					<div>
						<h2 style={{ margin: 0 }}>Renewal Analysis</h2>
						<p style={modalHeaderSubtitleStyle}>
							Review the contract timeline, enter renewal inputs, and compare
							savings against the future renewal cost.
						</p>
					</div>
					<button type="button" onClick={onClose} style={closeButtonStyle}>
						Close
					</button>
				</div>
				<div style={modalBodyStyle}>
					<div style={sectionCardStyle}>
						<div style={sectionHeadingStyle}>Circuit Overview</div>
						<div style={summaryGridStyle}>
							<div>
								<div style={fieldLabelStyle}>Site</div>
								<div style={fieldValueStyle}>{circuit.site?.name || "N/A"}</div>
							</div>
							<div>
								<div style={fieldLabelStyle}>Provider</div>
								<div style={fieldValueStyle}>
									{circuit.provider?.name || "N/A"}
								</div>
							</div>
							<div>
								<div style={fieldLabelStyle}>Bandwidth</div>
								<div style={fieldValueStyle}>
									{circuit.circuitBandwidth || "N/A"}
								</div>
							</div>
							<div>
								<div style={fieldLabelStyle}>Aggregator</div>
								<div style={fieldValueStyle}>
									{circuit.aggregatorName || "N/A"}
								</div>
							</div>
						</div>
					</div>

					<div style={twoColumnLayoutStyle}>
						<div style={sectionCardStyle}>
							<div style={sectionHeadingStyle}>Contract Timeline</div>
							<div style={sectionDescriptionStyle}>
								These dates drive the month-based savings and renewal cost
								calculations.
							</div>
							<div style={sectionGridStyle}>
								<div>
									<div style={fieldLabelStyle}>Site</div>
									<label style={inputLabelStyle}>Circuit Expiration Date</label>
									<input
										type="date"
										value={circuit.expirationDate || ""}
										readOnly
										style={{ ...inputStyle, ...readOnlyInputStyle }}
									/>
								</div>
								<div>
									<label style={inputLabelStyle}>Customer Contract Date</label>
									<input
										type="date"
										value={circuit.site?.customerContractDate || ""}
										onChange={(event) =>
											updateSiteField(
												"customerContractDate",
												event.target.value,
											)
										}
										style={inputStyle}
									/>
								</div>
								<div>
									<label style={inputLabelStyle}>
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
										style={inputStyle}
									/>
								</div>
								<div>
									<label style={inputLabelStyle}>
										Renewal Circuit Expiration Date
									</label>
									<input
										type="date"
										value={circuit.renewalCircuitExpirationDate || ""}
										onChange={(event) =>
											onChange({
												...circuit,
												renewalCircuitExpirationDate: event.target.value,
											})
										}
										style={inputStyle}
									/>
								</div>
							</div>
						</div>

						<div style={sectionCardStyle}>
							<div style={sectionHeadingStyle}>Pricing Inputs</div>
							<div style={sectionDescriptionStyle}>
								Use the current monthly recurring cost and proposed renewal cost
								to calculate projected savings.
							</div>
							<div style={sectionGridStyle}>
								<div>
									<label style={inputLabelStyle}>Current MRC</label>
									<input
										type="text"
										value={formatCurrency(circuit.monthlyCost)}
										readOnly
										style={{ ...inputStyle, ...readOnlyInputStyle }}
									/>
								</div>
								<div>
									<label style={inputLabelStyle}>Renewal MRC</label>
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
										style={inputStyle}
									/>
								</div>
								<div>
									<label style={inputLabelStyle}>Savings Difference</label>
									<input
										type="text"
										value={formatCurrency(preview.savingsDifference)}
										readOnly
										style={{ ...inputStyle, ...readOnlyInputStyle }}
									/>
								</div>
							</div>
						</div>
					</div>

					<div style={sectionCardStyle}>
						<div style={sectionHeadingStyle}>Analysis Results</div>
						<div style={sectionDescriptionStyle}>
							These values are calculated from the dates and pricing entered
							above and saved with the circuit.
						</div>
						<div style={resultsGridStyle}>
							<div style={resultCardStyle}>
								<div style={fieldLabelStyle}>
									Months To Customer Contract Expiration
								</div>
								<div style={resultValueStyle}>
									{preview.monthsToCustomerContractExpiration != null
										? String(preview.monthsToCustomerContractExpiration)
										: "N/A"}
								</div>
							</div>
							<div style={resultCardStyle}>
								<div style={fieldLabelStyle}>
									Savings To Customer Contract Expiration
								</div>
								<div style={resultValueStyle}>
									{formatCurrency(
										preview.savingsUntilCustomerContractExpiration,
									)}
								</div>
							</div>
							<div style={{ ...resultCardStyle, ...costComparisonStyle }}>
								<div style={fieldLabelStyle}>
									Cost From Customer Expiration To Renewal Circuit Expiration
								</div>
								<div style={resultValueStyle}>
									{formatCurrency(
										preview.costFromCustomerExpirationToRenewalExpiration,
									)}
								</div>
							</div>
						</div>
						<div style={analysisSummaryStyle}>{comparisonSummary}</div>
						<div style={timelineSummaryGridStyle}>
							<div style={timelinePillStyle}>
								<span style={timelinePillLabelStyle}>
									Current Circuit Expiration
								</span>
								<span style={timelinePillValueStyle}>
									{formatDate(circuit.expirationDate)}
								</span>
							</div>
							<div style={timelinePillStyle}>
								<span style={timelinePillLabelStyle}>
									Customer Contract Expiration
								</span>
								<span style={timelinePillValueStyle}>
									{formatDate(circuit.site?.customerContractExpirationDate)}
								</span>
							</div>
							<div style={timelinePillStyle}>
								<span style={timelinePillLabelStyle}>
									Renewal Circuit Expiration
								</span>
								<span style={timelinePillValueStyle}>
									{formatDate(circuit.renewalCircuitExpirationDate)}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div style={modalActionsStyle}>
					<button type="button" onClick={onClose} style={secondaryButtonStyle}>
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
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCircuit, setSelectedCircuit] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);

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
		<div
			style={{
				paddingTop: "70px",
				paddingLeft: "20px",
				paddingRight: "20px",
				paddingBottom: "20px",
			}}
		>
			<div style={pageHeaderStyle}>
				<div>
					<h1 style={{ margin: 0, color: "#f8fafc" }}>Renewal Analysis</h1>
					<p style={pageSubtitleStyle}>
						Review current circuit costs, enter renewal terms, and persist
						savings calculations per circuit.
					</p>
				</div>
				<input
					type="text"
					placeholder="Search by site, provider, bandwidth, aggregator, or circuit ID"
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					style={searchInputStyle}
				/>
			</div>

			{loading && <div>Loading...</div>}
			{error && <div style={errorStyle}>{error}</div>}

			{!loading && (
				<div style={tableContainerStyle}>
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
								<tr key={circuit.id} style={tableRowStyle}>
									<td style={tableCellStyle}>{circuit.site?.name || "N/A"}</td>
									<td style={tableCellStyle}>
										{circuit.provider?.name || "N/A"}
									</td>
									<td style={tableCellStyle}>
										{circuit.circuitBandwidth || "N/A"}
									</td>
									<td style={tableCellStyle}>
										{formatCurrency(circuit.monthlyCost)}
									</td>
									<td style={tableCellStyle}>
										{circuit.aggregatorName || "N/A"}
									</td>
									<td style={tableCellStyle}>
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

const pageHeaderStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "flex-start",
	gap: "20px",
	marginBottom: "20px",
	flexWrap: "wrap",
};

const pageSubtitleStyle = {
	marginTop: "8px",
	marginBottom: 0,
	color: "#cbd5e1",
	maxWidth: "720px",
	lineHeight: 1.5,
};

const searchInputStyle = {
	minWidth: "320px",
	maxWidth: "420px",
	width: "100%",
	padding: "10px 12px",
	border: "1px solid #475569",
	borderRadius: "8px",
	fontSize: "14px",
	backgroundColor: "#1e293b",
	color: "#f8fafc",
};

const tableContainerStyle = {
	backgroundColor: "#0f172a",
	borderRadius: "12px",
	boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
	overflowX: "auto",
	border: "1px solid #334155",
};

const tableStyle = {
	width: "100%",
	borderCollapse: "collapse",
};

const tableHeaderRowStyle = {
	backgroundColor: "#1f2937",
};

const headerCellStyle = {
	padding: "14px 16px",
	textAlign: "left",
	color: "#ffffff",
	fontWeight: 600,
	fontSize: "14px",
};

const tableRowStyle = {
	borderBottom: "1px solid #334155",
	backgroundColor: "#0f172a",
};

const tableCellStyle = {
	padding: "14px 16px",
	fontSize: "14px",
	color: "#e2e8f0",
};

const iconButtonStyle = {
	padding: "8px 10px",
	borderRadius: "8px",
	border: "1px solid #60a5fa",
	backgroundColor: "#1e3a8a",
	color: "#dbeafe",
	cursor: "pointer",
	fontSize: "18px",
};

const emptyStateStyle = {
	padding: "24px",
	textAlign: "center",
	color: "#cbd5e1",
};

const overlayStyle = {
	position: "fixed",
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	backgroundColor: "rgba(15, 23, 42, 0.55)",
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
	backgroundColor: "#0f172a",
	color: "#e5eefc",
	borderRadius: "16px",
	border: "1px solid #334155",
	colorScheme: "dark",
	boxShadow: "0 30px 80px rgba(15, 23, 42, 0.3)",
};

const modalHeaderStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	padding: "20px 24px",
	borderBottom: "1px solid #334155",
	position: "sticky",
	top: 0,
	backgroundColor: "#0f172a",
};

const modalHeaderSubtitleStyle = {
	marginTop: "8px",
	marginBottom: 0,
	fontSize: "13px",
	lineHeight: 1.5,
	color: "#94a3b8",
	maxWidth: "560px",
};

const closeButtonStyle = {
	border: "1px solid #475569",
	backgroundColor: "#1e293b",
	borderRadius: "8px",
	padding: "8px 12px",
	color: "#e2e8f0",
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
	backgroundColor: "#111c30",
	border: "1px solid #334155",
	borderRadius: "14px",
	padding: "18px",
	boxShadow: "inset 0 1px 0 rgba(148, 163, 184, 0.06)",
};

const sectionHeadingStyle = {
	fontSize: "15px",
	fontWeight: 700,
	color: "#f8fafc",
	marginBottom: "8px",
};

const sectionDescriptionStyle = {
	fontSize: "13px",
	lineHeight: 1.6,
	color: "#94a3b8",
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
	color: "#94a3b8",
	marginBottom: "6px",
};

const fieldValueStyle = {
	fontSize: "15px",
	color: "#f8fafc",
	fontWeight: 500,
};

const inputLabelStyle = {
	display: "block",
	marginBottom: "6px",
	fontSize: "13px",
	fontWeight: 600,
	color: "#cbd5e1",
};

const inputStyle = {
	width: "100%",
	padding: "10px 12px",
	border: "1px solid #475569",
	borderRadius: "8px",
	fontSize: "14px",
	backgroundColor: "#1e293b",
	color: "#f8fafc",
	boxSizing: "border-box",
};

const readOnlyInputStyle = {
	backgroundColor: "#172033",
	color: "#cbd5e1",
};

const successHighlightStyle = {
	backgroundColor: "#14532d",
	borderColor: "#22c55e",
	color: "#dcfce7",
	fontWeight: 600,
};

const dangerHighlightStyle = {
	backgroundColor: "#7f1d1d",
	borderColor: "#ef4444",
	color: "#fee2e2",
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
	gap: "16px",
	marginBottom: "16px",
};

const resultCardStyle = {
	backgroundColor: "#172033",
	border: "1px solid #334155",
	borderRadius: "12px",
	padding: "16px",
	minHeight: "110px",
	display: "flex",
	flexDirection: "column",
	justifyContent: "space-between",
};

const resultValueStyle = {
	fontSize: "24px",
	fontWeight: 700,
	lineHeight: 1.2,
	color: "inherit",
};

const analysisSummaryStyle = {
	padding: "14px 16px",
	borderRadius: "12px",
	backgroundColor: "#172033",
	border: "1px solid #334155",
	color: "#dbeafe",
	fontSize: "13px",
	lineHeight: 1.6,
	marginBottom: "16px",
};

const timelineSummaryGridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
	gap: "12px",
};

const timelinePillStyle = {
	padding: "14px 16px",
	borderRadius: "12px",
	backgroundColor: "#172033",
	border: "1px solid #334155",
	display: "flex",
	flexDirection: "column",
	gap: "6px",
};

const timelinePillLabelStyle = {
	fontSize: "11px",
	fontWeight: 700,
	textTransform: "uppercase",
	letterSpacing: "0.05em",
	color: "#94a3b8",
};

const timelinePillValueStyle = {
	fontSize: "14px",
	fontWeight: 600,
	color: "#f8fafc",
};

const modalActionsStyle = {
	display: "flex",
	justifyContent: "flex-end",
	gap: "12px",
	padding: "0 24px 24px",
};

const primaryButtonStyle = {
	padding: "10px 16px",
	borderRadius: "8px",
	border: "none",
	backgroundColor: "#2563eb",
	color: "#ffffff",
	fontWeight: 600,
	cursor: "pointer",
};

const secondaryButtonStyle = {
	padding: "10px 16px",
	borderRadius: "8px",
	border: "1px solid #475569",
	backgroundColor: "#1e293b",
	color: "#e2e8f0",
	fontWeight: 600,
	cursor: "pointer",
};

const errorStyle = {
	marginBottom: "16px",
	padding: "12px 14px",
	borderRadius: "8px",
	backgroundColor: "#450a0a",
	color: "#fecaca",
	border: "1px solid #7f1d1d",
};

export default RenewalAnalysis;
