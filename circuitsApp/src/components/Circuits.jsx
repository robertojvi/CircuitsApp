import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

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

const RENEWAL_TERM_PRESET_OPTIONS = [
	"Month to Month",
	"1 Year",
	"Same as Original Term",
];

const parseDateInputValue = (value) => {
	if (!value) return null;

	const [year, month, day] = value.split("-").map(Number);

	if ([year, month, day].some(Number.isNaN)) {
		return null;
	}

	return new Date(Date.UTC(year, month - 1, day));
};

const formatDateInputValue = (date) => {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toISOString().slice(0, 10);
};

const calculateRenewalNoticeDate = (expirationDate, noticeDays) => {
	const parsedExpirationDate = parseDateInputValue(expirationDate);
	const parsedNoticeDays = Number(noticeDays);

	if (
		!parsedExpirationDate ||
		!Number.isFinite(parsedNoticeDays) ||
		parsedNoticeDays < 0
	) {
		return "";
	}

	parsedExpirationDate.setUTCDate(
		parsedExpirationDate.getUTCDate() - parsedNoticeDays,
	);

	return formatDateInputValue(parsedExpirationDate);
};

const getRenewalNoticeDays = (expirationDate, renewalNoticeDate) => {
	const parsedExpirationDate = parseDateInputValue(expirationDate);
	const parsedRenewalNoticeDate = parseDateInputValue(renewalNoticeDate);

	if (!parsedExpirationDate || !parsedRenewalNoticeDate) {
		return null;
	}

	const dayDifference = Math.round(
		(parsedExpirationDate.getTime() - parsedRenewalNoticeDate.getTime()) /
			(1000 * 60 * 60 * 24),
	);

	return dayDifference >= 0 ? dayDifference : null;
};

const CircuitRenewalFields = ({ circuit, setCircuit }) => {
	const [renewalTermOption, setRenewalTermOption] = useState("");
	const [renewalTermOther, setRenewalTermOther] = useState("");
	const [renewalNoticeOption, setRenewalNoticeOption] = useState("");
	const [renewalNoticeOtherDays, setRenewalNoticeOtherDays] = useState("");

	useEffect(() => {
		const currentRenewalTerm = circuit.renewalTerm || "";

		if (!currentRenewalTerm) {
			setRenewalTermOption("");
			setRenewalTermOther("");
		} else if (RENEWAL_TERM_PRESET_OPTIONS.includes(currentRenewalTerm)) {
			setRenewalTermOption(currentRenewalTerm);
			setRenewalTermOther("");
		} else {
			setRenewalTermOption("Other");
			setRenewalTermOther(currentRenewalTerm);
		}

		const renewalNoticeDays = getRenewalNoticeDays(
			circuit.expirationDate,
			circuit.renewalNoticeDate,
		);

		if (renewalNoticeDays == null) {
			setRenewalNoticeOption("");
			setRenewalNoticeOtherDays("");
		} else if ([30, 60, 90].includes(renewalNoticeDays)) {
			setRenewalNoticeOption(String(renewalNoticeDays));
			setRenewalNoticeOtherDays("");
		} else {
			setRenewalNoticeOption("Other");
			setRenewalNoticeOtherDays(String(renewalNoticeDays));
		}
	}, [circuit.expirationDate, circuit.renewalNoticeDate, circuit.renewalTerm]);

	const labelStyle = {
		display: "block",
		marginBottom: "5px",
		fontSize: "14px",
		fontWeight: "500",
		color: "#3498db",
		backgroundColor: "#f8f9fa",
		padding: "3px 5px",
		borderRadius: "3px",
	};

	const handleExpirationDateChange = (event) => {
		const expirationDate = event.target.value;
		const noticeDays =
			renewalNoticeOption === "Other"
				? renewalNoticeOtherDays
				: renewalNoticeOption;

		setCircuit({
			...circuit,
			expirationDate,
			renewalNoticeDate: noticeDays
				? calculateRenewalNoticeDate(expirationDate, noticeDays)
				: "",
		});
	};

	const handleRenewalTermOptionChange = (event) => {
		const option = event.target.value;
		setRenewalTermOption(option);

		if (option === "Other") {
			setCircuit({
				...circuit,
				renewalTerm: renewalTermOther || "",
			});
			return;
		}

		setRenewalTermOther("");
		setCircuit({
			...circuit,
			renewalTerm: option,
		});
	};

	const handleRenewalNoticeOptionChange = (event) => {
		const option = event.target.value;
		setRenewalNoticeOption(option);

		setCircuit({
			...circuit,
			renewalNoticeDate: option
				? calculateRenewalNoticeDate(
						circuit.expirationDate,
						option === "Other" ? renewalNoticeOtherDays : option,
					)
				: "",
		});
	};

	return (
		<>
			<div style={{ marginBottom: "15px" }}>
				<label style={labelStyle}>Expiration Date</label>
				<input
					type="date"
					placeholder="Expiration Date"
					value={circuit.expirationDate || ""}
					onChange={handleExpirationDateChange}
					style={inputStyle}
					required
				/>
			</div>
			<div style={{ marginBottom: "15px" }}>
				<label style={labelStyle}>Renewal Term</label>
				<select
					value={renewalTermOption}
					onChange={handleRenewalTermOptionChange}
					style={inputStyle}
				>
					<option value="">Select Renewal Term</option>
					<option value="Month to Month">Month to Month</option>
					<option value="1 Year">1 Year</option>
					<option value="Same as Original Term">Same as Original Term</option>
					<option value="Other">Other</option>
				</select>
			</div>
			{renewalTermOption === "Other" && (
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Enter Renewal Term"
						value={renewalTermOther}
						onChange={(event) => {
							const value = event.target.value;
							setRenewalTermOther(value);
							setCircuit({
								...circuit,
								renewalTerm: value,
							});
						}}
						style={inputStyle}
						required
					/>
				</div>
			)}
			<div style={{ marginBottom: "15px" }}>
				<label style={labelStyle}>Renewal Notice</label>
				<select
					value={renewalNoticeOption}
					onChange={handleRenewalNoticeOptionChange}
					style={inputStyle}
				>
					<option value="">Select Notice Period</option>
					<option value="30">30 days</option>
					<option value="60">60 days</option>
					<option value="90">90 days</option>
					<option value="Other">Other</option>
				</select>
			</div>
			{renewalNoticeOption === "Other" && (
				<div style={{ marginBottom: "15px" }}>
					<input
						type="number"
						placeholder="Enter notice days"
						value={renewalNoticeOtherDays}
						onChange={(event) => {
							const value = event.target.value;
							setRenewalNoticeOtherDays(value);
							setCircuit({
								...circuit,
								renewalNoticeDate: value
									? calculateRenewalNoticeDate(circuit.expirationDate, value)
									: "",
							});
						}}
						style={inputStyle}
						min="0"
						step="1"
						required
					/>
				</div>
			)}
			<div style={{ marginBottom: "15px" }}>
				<label style={labelStyle}>Renewal Notice Date</label>
				<input
					type="date"
					value={circuit.renewalNoticeDate || ""}
					readOnly
					style={{
						...inputStyle,
						backgroundColor: "#f8f9fa",
						cursor: "not-allowed",
					}}
				/>
			</div>
		</>
	);
};

const CircuitDetailModal = ({ circuit, onClose, user }) => {
	const site = circuit?.site || {};
	const parts = [];
	if (site.address) parts.push(site.address);
	const cityState = [site.city, site.state].filter(Boolean).join(", ");
	if (cityState)
		parts.push(cityState + (site.zipCode ? ` ${site.zipCode}` : ""));
	const siteAddress = parts.length ? parts.join(", ") : "N/A";

	return (
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
						<strong>Site Address:</strong> {siteAddress}
					</p>
					<p style={detailRowStyle}>
						<strong>Provider:</strong> {circuit.provider.name}
					</p>
					<p style={detailRowStyle}>
						<strong>Contact Number:</strong>{" "}
						{circuit.provider.contactNumber || "N/A"}
					</p>
					{circuit.provider.providerEscalationList && (
						<p style={detailRowStyle}>
							<strong>Provider Escalation List:</strong>{" "}
							<a
								href={circuit.provider.providerEscalationList}
								target="_blank"
								rel="noopener noreferrer"
								style={{ color: "#3B82F6", textDecoration: "underline" }}
							>
								Open Escalation List
							</a>
						</p>
					)}
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
						<strong>Has Tower:</strong>{" "}
						<span
							style={{
								padding: "4px 8px",
								borderRadius: "4px",
								fontSize: "12px",
								fontWeight: "bold",
								backgroundColor: circuit.hasTower ? "#10B981" : "#EF4444", // Green for Yes, Red for No
								color: "white",
							}}
						>
							{circuit.hasTower ? "Yes" : "No"}
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
					{user?.role !== "NOC" && (
						<p style={detailRowStyle}>
							<strong>Monthly Cost:</strong>{" "}
							{"$" + (circuit.monthlyCost || "0.00")}
						</p>
					)}
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
								style={{
									marginLeft: "5px",
									fontSize: "12px",
									color: "#B91C1C",
								}}
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
					<p
						style={{
							...detailRowStyle,
							backgroundColor: "#DBEAFE",
							color: "#1D4ED8",
							padding: "8px 10px",
							borderRadius: "4px",
							fontWeight: "600",
						}}
					>
						<strong style={{ color: "#1E3A8A" }}>Renewal Term:</strong>{" "}
						{circuit.renewalTerm || "N/A"}
					</p>
					<p
						style={{
							...detailRowStyle,
							backgroundColor: "#FEF3C7",
							color: "#92400E",
							padding: "8px 10px",
							borderRadius: "4px",
							fontWeight: "600",
						}}
					>
						<strong style={{ color: "#78350F" }}>Renewal Notice Date:</strong>{" "}
						{circuit.renewalNoticeDate || "N/A"}
					</p>
					{circuit.hasAggregator ? (
						<p style={detailRowStyle}>
							<strong>Aggregator:</strong> {circuit.aggregatorName || "N/A"}
						</p>
					) : (
						<p style={detailRowStyle}>
							<strong>Aggregator:</strong> No
						</p>
					)}
					<div style={detailRowStyle}>
						<strong>Notes:</strong>
						<div style={{ marginTop: "4px", whiteSpace: "pre-wrap" }}>
							{circuit.notes || "N/A"}
						</div>
					</div>
					{circuit.hasTower && (
						<div
							style={{
								marginTop: "10px",
								backgroundColor: "#22303a",
								padding: "10px",
								borderRadius: "6px",
								border: "1px solid #3b82f6",
							}}
						>
							<p style={detailRowStyle}>
								<strong>Number of Towers:</strong>{" "}
								{circuit.numberOfTowers || "N/A"}
							</p>
							{circuit.numberOfTowers &&
								parseInt(circuit.numberOfTowers) > 0 &&
								Array.from(
									{ length: parseInt(circuit.numberOfTowers) },
									(_, i) => i + 1,
								).map((towerNum) => (
									<div
										key={towerNum}
										style={{
											marginTop: "12px",
											paddingTop: "12px",
											borderTop: "1px solid #3b82f6",
										}}
									>
										<h4
											style={{
												marginTop: 0,
												marginBottom: "8px",
												color: "#3B82F6",
												fontSize: "13px",
												fontWeight: "600",
											}}
										>
											Tower {towerNum}
										</h4>
										<p style={detailRowStyle}>
											<strong>Provider:</strong>{" "}
											{circuit[`towerProvider${towerNum}`] || "N/A"}
										</p>
										<p style={detailRowStyle}>
											<strong>Installation Date:</strong>{" "}
											{circuit[`towerInstallDate${towerNum}`] || "N/A"}
										</p>
										<p style={detailRowStyle}>
											<strong>Expiration Date:</strong>{" "}
											{circuit[`towerExpirationDate${towerNum}`] || "N/A"}
										</p>
										{user?.role !== "NOC" && (
											<p style={detailRowStyle}>
												<strong>Monthly Cost:</strong>{" "}
												{circuit[`towerMonthlyCost${towerNum}`]
													? "$" +
														parseFloat(
															circuit[`towerMonthlyCost${towerNum}`],
														).toFixed(2)
													: "N/A"}
											</p>
										)}
									</div>
								))}
						</div>
					)}
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
};

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
				width: "90%",
				maxWidth: "400px",
				margin: "20px",
				maxHeight: "90vh",
				overflowY: "auto",
			}}
		>
			<h2
				style={{
					marginBottom: "20px",
					backgroundColor: "#2c3e50",
					color: "white",
					padding: "10px 20px",
					borderRadius: "4px",
					textAlign: "center",
				}}
			>
				Edit Circuit
			</h2>
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
						{[...sites]
							.sort((a, b) =>
								a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
							)
							.map((site) => (
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
						{[...providers]
							.sort((a, b) =>
								a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
							)
							.map((provider) => (
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
				<div style={{ marginBottom: "15px" }}>
					<label
						style={{
							display: "block",
							marginBottom: "5px",
							fontSize: "14px",
							fontWeight: "500",
							color: "#3498db",
							backgroundColor: "#f8f9fa",
							padding: "3px 5px",
							borderRadius: "3px",
						}}
					>
						Installation Date
					</label>
					<input
						type="date"
						placeholder="Installation Date"
						value={circuit.installationDate || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, installationDate: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<CircuitRenewalFields circuit={circuit} setCircuit={setCircuit} />
				<div style={{ marginBottom: "15px" }}>
					<label
						style={{
							display: "block",
							marginBottom: "5px",
							fontSize: "14px",
							fontWeight: "500",
							color: "#3498db",
							backgroundColor: "#f8f9fa",
							padding: "3px 5px",
							borderRadius: "3px",
						}}
					>
						Contract Date
					</label>
					<input
						type="date"
						placeholder="Contract Date"
						value={circuit.circuitContractDate || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, circuitContractDate: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={circuit.status || ""}
						onChange={(e) => setCircuit({ ...circuit, status: e.target.value })}
						style={inputStyle}
						required
					>
						<option value="">Select Status</option>
						<option value="Active">Active</option>
						<option value="Inactive">Inactive</option>
						<option value="Pending">Pending</option>
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={circuit.circuitType || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, circuitType: e.target.value })
						}
						style={inputStyle}
						required
					>
						<option value="">Select Circuit Type</option>
						<option value="Fiber">Fiber Circuit</option>
						<option value="Wireless">Wireless</option>
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							fontSize: "14px",
							fontWeight: "500",
							color: "#3498db",
							backgroundColor: "#f8f9fa",
							padding: "10px",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={circuit.hasTower || false}
							onChange={(e) =>
								setCircuit({ ...circuit, hasTower: e.target.checked })
							}
							style={{
								marginRight: "8px",
								transform: "scale(1.2)",
								cursor: "pointer",
							}}
						/>
						Has Tower
					</label>
				</div>
				{circuit.hasTower && (
					<div
						style={{
							marginBottom: "20px",
							borderTop: "2px solid #3498db",
							paddingTop: "15px",
							backgroundColor: "#f8f9fa",
							padding: "15px",
							borderRadius: "4px",
						}}
					>
						<h3
							style={{
								marginBottom: "15px",
								color: "#2c3e50",
								fontSize: "16px",
								marginTop: 0,
							}}
						>
							Tower Information
						</h3>
						<div style={{ marginBottom: "15px" }}>
							<label
								style={{
									display: "block",
									marginBottom: "5px",
									fontSize: "14px",
									fontWeight: "500",
									color: "#3498db",
								}}
							>
								Number of Towers
							</label>
							<input
								type="number"
								placeholder="Number of Towers"
								value={circuit.numberOfTowers || ""}
								onChange={(e) =>
									setCircuit({
										...circuit,
										numberOfTowers: e.target.value,
									})
								}
								style={inputStyle}
								required
								min="1"
								max="6"
							/>
						</div>
						{circuit.numberOfTowers &&
							parseInt(circuit.numberOfTowers) > 0 &&
							Array.from(
								{ length: parseInt(circuit.numberOfTowers) },
								(_, i) => i + 1,
							).map((towerNum) => (
								<div
									key={towerNum}
									style={{
										marginBottom: "20px",
										borderLeft: "4px solid #3498db",
										paddingLeft: "12px",
										backgroundColor: "#ffffff",
										padding: "12px",
										borderRadius: "4px",
									}}
								>
									<h4
										style={{
											marginTop: 0,
											marginBottom: "10px",
											color: "#2c3e50",
											fontSize: "14px",
											fontWeight: "600",
										}}
									>
										Tower {towerNum}
									</h4>
									<div style={{ marginBottom: "12px" }}>
										<label
											style={{
												display: "block",
												marginBottom: "5px",
												fontSize: "12px",
												fontWeight: "500",
												color: "#3498db",
											}}
										>
											Tower Provider
										</label>
										<input
											type="text"
											placeholder="Tower Provider"
											value={circuit[`towerProvider${towerNum}`] || ""}
											onChange={(e) =>
												setCircuit({
													...circuit,
													[`towerProvider${towerNum}`]: e.target.value,
												})
											}
											style={inputStyle}
											required
										/>
									</div>
									<div style={{ marginBottom: "12px" }}>
										<label
											style={{
												display: "block",
												marginBottom: "5px",
												fontSize: "12px",
												fontWeight: "500",
												color: "#3498db",
											}}
										>
											Installation Date
										</label>
										<input
											type="date"
											placeholder="Tower Installation Date"
											value={circuit[`towerInstallDate${towerNum}`] || ""}
											onChange={(e) =>
												setCircuit({
													...circuit,
													[`towerInstallDate${towerNum}`]: e.target.value,
												})
											}
											style={inputStyle}
											required
										/>
									</div>
									<div style={{ marginBottom: "12px" }}>
										<label
											style={{
												display: "block",
												marginBottom: "5px",
												fontSize: "12px",
												fontWeight: "500",
												color: "#3498db",
											}}
										>
											Expiration Date
										</label>
										<input
											type="date"
											placeholder="Tower Expiration Date"
											value={circuit[`towerExpirationDate${towerNum}`] || ""}
											onChange={(e) =>
												setCircuit({
													...circuit,
													[`towerExpirationDate${towerNum}`]: e.target.value,
												})
											}
											style={inputStyle}
											required
										/>
									</div>
									<div style={{ marginBottom: "12px" }}>
										<label
											style={{
												display: "block",
												marginBottom: "5px",
												fontSize: "12px",
												fontWeight: "500",
												color: "#3498db",
											}}
										>
											Monthly Cost
										</label>
										<input
											type="number"
											placeholder="Tower Monthly Cost"
											value={circuit[`towerMonthlyCost${towerNum}`] || ""}
											onChange={(e) =>
												setCircuit({
													...circuit,
													[`towerMonthlyCost${towerNum}`]: e.target.value,
												})
											}
											style={inputStyle}
											required
										/>
									</div>
								</div>
							))}
					</div>
				)}
				<div style={{ marginBottom: "15px" }}>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							fontSize: "14px",
							fontWeight: "500",
							color: "#3498db",
							backgroundColor: "#f8f9fa",
							padding: "10px",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={circuit.hasAggregator || false}
							onChange={(e) =>
								setCircuit({ ...circuit, hasAggregator: e.target.checked })
							}
							style={{
								marginRight: "8px",
								transform: "scale(1.2)",
								cursor: "pointer",
							}}
						/>
						Has Aggregator
					</label>
				</div>
				{circuit.hasAggregator && (
					<div
						style={{
							marginBottom: "20px",
							borderTop: "2px solid #3498db",
							paddingTop: "15px",
							backgroundColor: "#f8f9fa",
							padding: "15px",
							borderRadius: "4px",
						}}
					>
						<h3
							style={{
								marginBottom: "15px",
								color: "#2c3e50",
								fontSize: "16px",
								marginTop: 0,
							}}
						>
							Aggregator Information
						</h3>
						<div style={{ marginBottom: "15px" }}>
							<label
								style={{
									display: "block",
									marginBottom: "5px",
									fontSize: "14px",
									fontWeight: "500",
									color: "#3498db",
								}}
							>
								Aggregator Name
							</label>
							<input
								type="text"
								placeholder="Aggregator Name"
								value={circuit.aggregatorName || ""}
								onChange={(e) =>
									setCircuit({
										...circuit,
										aggregatorName: e.target.value,
									})
								}
								style={inputStyle}
								required
							/>
						</div>
					</div>
				)}
				<div style={{ marginBottom: "15px" }}>
					<label
						style={{
							display: "block",
							marginBottom: "5px",
							fontSize: "14px",
							fontWeight: "500",
							color: "#3498db",
						}}
					>
						Notes
					</label>
					<textarea
						placeholder="Notes (optional)"
						value={circuit.notes || ""}
						onChange={(e) => setCircuit({ ...circuit, notes: e.target.value })}
						style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
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
	const [showEditCircuitModal, setShowEditCircuitModal] = useState(false);
	const [sites, setSites] = useState([]);
	const [providers, setProviders] = useState([]);
	const { token, user } = useAuth();

	useEffect(() => {
		if (selectedMenu === "Circuit Information") {
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
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setCircuits(data);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load circuits");
		} finally {
			setLoading(false);
		}
	};

	const fetchSites = async () => {
		try {
			const response = await fetch("/api/sites", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setSites(data);
		} catch (error) {
			console.error("Error fetching sites:", error);
		}
	};

	const fetchProviders = async () => {
		try {
			const response = await fetch("/api/providers", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setProviders(data);
		} catch (error) {
			console.error("Error fetching providers:", error);
		}
	};

	const handleEdit = (id) => {
		const circuit = circuits.find((c) => c.id === id);
		setSelectedCircuit(circuit);
		fetchSites();
		fetchProviders();
		setShowEditCircuitModal(true);
	};

	const editCircuit = async (e) => {
		e.preventDefault();
		setLoading(true);
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
					await getApiErrorMessage(response, "Failed to update circuit"),
				);
			}

			fetchCircuits();
			setShowEditCircuitModal(false);
			setSelectedCircuit(null);
		} catch (error) {
			console.error("Error updating circuit:", error);
			setError(error.message || "Failed to update circuit");
		} finally {
			setLoading(false);
		}
	};

	const filteredCircuits = circuits.filter((circuit) => {
		const term = searchTerm.toLowerCase();
		return (
			(circuit.site.name || "").toLowerCase().includes(term) ||
			(circuit.site.siteType || "").toLowerCase().includes(term) ||
			(circuit.provider.name || "").toLowerCase().includes(term) ||
			(circuit.circuitBandwidth || "").toLowerCase().includes(term) ||
			(circuit.accountNumber || "").toLowerCase().includes(term) ||
			(circuit.circuitId || "").toLowerCase().includes(term) ||
			(circuit.aggregatorName || "").toLowerCase().includes(term)
		);
	});

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
			let aValue = sortConfig.key
				.split(".")
				.reduce((obj, key) => obj?.[key], a);
			let bValue = sortConfig.key
				.split(".")
				.reduce((obj, key) => obj?.[key], b);

			// Handle undefined/null values - treat them as coming after non-null values
			if (aValue == null && bValue == null) return 0;
			if (aValue == null) return sortConfig.direction === "ascending" ? 1 : -1;
			if (bValue == null) return sortConfig.direction === "ascending" ? -1 : 1;

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
								...buttonStyle,
								backgroundColor: "#FFD700",
								color: "black",
								padding: "10px 20px",
								fontSize: "14px",
								fontWeight: "bold",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							📋 AccessParks Circuits
						</button>
					</div>
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
								{user?.role !== "NOC" && (
									<th
										onClick={() => onSort("monthlyCost")}
										style={getSortableHeaderStyle("monthlyCost")}
									>
										Monthly Cost
									</th>
								)}
								<th
									onClick={() => onSort("aggregatorName")}
									style={getSortableHeaderStyle("aggregatorName")}
								>
									Aggregator
								</th>
								<th style={headerStyle}>Details</th>
								{(user?.role === "ADMIN" || user?.role === "SUPER") && (
									<th style={headerStyle}>Actions</th>
								)}
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
									{user?.role !== "NOC" && (
										<td style={cellStyle}>${circuit.monthlyCost}</td>
									)}
									<td style={cellStyle}>{circuit.aggregatorName || "N/A"}</td>
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
									{(user?.role === "ADMIN" || user?.role === "SUPER") && (
										<td style={cellStyle}>
											<button
												onClick={() => handleEdit(circuit.id)}
												style={iconButtonStyle}
											>
												✏️
											</button>
										</td>
									)}
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
		zIndex: 999,
	};

	const responsiveContentStyle = {
		padding: "20px",
		flex: 1,
		minWidth: 0,
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
			<div className="app-side-page-content" style={responsiveContentStyle}>
				<div style={responsiveTableContainer}>{renderContent()}</div>
				{showCircuitDetail && selectedCircuit && (
					<CircuitDetailModal
						circuit={selectedCircuit}
						user={user}
						onClose={() => {
							setShowCircuitDetail(false);
							setSelectedCircuit(null);
						}}
					/>
				)}
				{showEditCircuitModal && selectedCircuit && (
					<EditCircuitModal
						circuit={selectedCircuit}
						setCircuit={setSelectedCircuit}
						sites={sites}
						providers={providers}
						onClose={() => {
							setShowEditCircuitModal(false);
							setSelectedCircuit(null);
						}}
						onSubmit={editCircuit}
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

const inputStyle = {
	width: "100%",
	padding: "8px",
	border: "1px solid #D1D5DB",
	borderRadius: "4px",
	fontSize: "12px",
};

export default Circuits;
