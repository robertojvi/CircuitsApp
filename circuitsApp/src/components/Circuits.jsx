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
		marginBottom: "8px",
		fontSize: "13px",
		fontWeight: "600",
		color: "#374151",
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
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "16px",
					marginBottom: "16px",
				}}
			>
				<div>
					<label style={labelStyle}>Renewal Notice Date</label>
					<input
						type="date"
						value={circuit.renewalNoticeDate || ""}
						readOnly
						style={{
							...inputStyle,
							backgroundColor: "#f3f4f6",
							cursor: "not-allowed",
							color: "#6b7280",
						}}
					/>
					<p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
						Auto-calculated from expiration date and notice period
					</p>
				</div>
			</div>

			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
			>
				<div>
					<label style={labelStyle}>Renewal Term *</label>
					<select
						value={renewalTermOption}
						onChange={handleRenewalTermOptionChange}
						style={inputStyle}
					>
						<option value="">Select Renewal Term</option>
						<option value="Month to Month">📅 Month to Month</option>
						<option value="1 Year">📅 1 Year</option>
						<option value="Same as Original Term">
							📅 Same as Original Term
						</option>
						<option value="Other">✏️ Other (custom)</option>
					</select>
				</div>
				<div>
					<label style={labelStyle}>Renewal Notice Period *</label>
					<select
						value={renewalNoticeOption}
						onChange={handleRenewalNoticeOptionChange}
						style={inputStyle}
					>
						<option value="">Select Notice Period</option>
						<option value="30">🔔 30 days</option>
						<option value="60">🔔 60 days</option>
						<option value="90">🔔 90 days</option>
						<option value="Other">✏️ Other (custom)</option>
					</select>
				</div>
			</div>

			{renewalTermOption === "Other" && (
				<div style={{ marginTop: "16px" }}>
					<label style={labelStyle}>Custom Renewal Term</label>
					<input
						type="text"
						placeholder="e.g., 2 Years, 3 Years, Bi-annual"
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

			{renewalNoticeOption === "Other" && (
				<div style={{ marginTop: "16px" }}>
					<label style={labelStyle}>Custom Notice Days</label>
					<input
						type="number"
						placeholder="Enter number of days"
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

	const detailLabelStyle = {
		fontSize: "12px",
		fontWeight: "600",
		color: "#6b7280",
		textTransform: "uppercase",
		letterSpacing: "0.5px",
		marginBottom: "4px",
		display: "block",
	};

	const detailValueStyle = {
		fontSize: "14px",
		fontWeight: "500",
		color: "#1e293b",
		wordBreak: "break-word",
	};

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
					backgroundColor: "#f9fafb",
					borderRadius: "8px",
					width: "90%",
					maxWidth: "850px",
					margin: "20px",
					maxHeight: "90vh",
					overflowY: "auto",
					boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div
					style={{
						position: "sticky",
						top: 0,
						backgroundColor: "#1e293b",
						color: "white",
						padding: "20px 24px",
						borderBottom: "2px solid #3b82f6",
						borderRadius: "8px 8px 0 0",
						zIndex: 10,
					}}
				>
					<h2
						style={{
							margin: 0,
							fontSize: "22px",
							fontWeight: "600",
							letterSpacing: "-0.5px",
						}}
					>
						📋 Circuit Details
					</h2>
				</div>

				<div style={{ padding: "24px" }}>
					{/* BASIC INFORMATION SECTION */}
					<div
						style={{
							backgroundColor: "#ffffff",
							padding: "20px",
							borderRadius: "8px",
							marginBottom: "20px",
							border: "1px solid #e5e7eb",
						}}
					>
						<h3
							style={{
								marginTop: 0,
								marginBottom: "16px",
								fontSize: "15px",
								fontWeight: "700",
								color: "#1e293b",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								display: "flex",
								alignItems: "center",
							}}
						>
							🏢 Basic Information
						</h3>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "16px",
							}}
						>
							<div>
								<span style={detailLabelStyle}>Site</span>
								<div style={detailValueStyle}>{circuit.site.name}</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Provider</span>
								<div style={detailValueStyle}>{circuit.provider.name}</div>
							</div>
							<div style={{ gridColumn: "1 / -1" }}>
								<span style={detailLabelStyle}>Site Address</span>
								<div style={detailValueStyle}>{siteAddress}</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Contact Number</span>
								<div style={detailValueStyle}>
									{circuit.provider.contactNumber || "N/A"}
								</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Escalation List</span>
								<div style={detailValueStyle}>
									{circuit.provider.providerEscalationList ? (
										<a
											href={circuit.provider.providerEscalationList}
											target="_blank"
											rel="noopener noreferrer"
											style={{ color: "#3B82F6", textDecoration: "underline" }}
										>
											View List
										</a>
									) : (
										"N/A"
									)}
								</div>
							</div>
						</div>
					</div>

					{/* CIRCUIT INFORMATION SECTION */}
					<div
						style={{
							backgroundColor: "#ffffff",
							padding: "20px",
							borderRadius: "8px",
							marginBottom: "20px",
							border: "1px solid #e5e7eb",
						}}
					>
						<h3
							style={{
								marginTop: 0,
								marginBottom: "16px",
								fontSize: "15px",
								fontWeight: "700",
								color: "#1e293b",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								display: "flex",
								alignItems: "center",
							}}
						>
							📋 Circuit Information
						</h3>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "16px",
							}}
						>
							<div>
								<span style={detailLabelStyle}>Account Number</span>
								<div style={detailValueStyle}>
									{circuit.accountNumber || "N/A"}
								</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Circuit ID</span>
								<div style={detailValueStyle}>{circuit.circuitId || "N/A"}</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Bandwidth</span>
								<div style={detailValueStyle}>
									{circuit.circuitBandwidth || "N/A"}
								</div>
							</div>
							{user?.role !== "NOC" && (
								<div>
									<span style={detailLabelStyle}>Monthly Cost</span>
									<div style={detailValueStyle}>
										{"$" + (circuit.monthlyCost || "0.00")}
									</div>
								</div>
							)}
							<div>
								<span style={detailLabelStyle}>Installation Date</span>
								<div style={detailValueStyle}>
									{circuit.installationDate || "N/A"}
								</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Contract Date</span>
								<div style={detailValueStyle}>
									{circuit.circuitContractDate || "N/A"}
								</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Status</span>
								<div>
									<span
										style={{
											padding: "4px 12px",
											borderRadius: "4px",
											fontSize: "12px",
											fontWeight: "bold",
											backgroundColor:
												circuit.status === "Active"
													? "#d1fae5"
													: circuit.status === "Inactive"
														? "#fee2e2"
														: "#fef3c7",
											color:
												circuit.status === "Active"
													? "#065f46"
													: circuit.status === "Inactive"
														? "#7f1d1d"
														: "#92400e",
										}}
									>
										{circuit.status === "Active"
											? "✅ Active"
											: circuit.status === "Inactive"
												? "❌ Inactive"
												: "⏳ Pending"}
									</span>
								</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Expiration Date</span>
								<div
									style={{
										...detailValueStyle,
										backgroundColor: isExpired(circuit.expirationDate)
											? "#fee2e2"
											: isExpirationSoon(circuit.expirationDate)
												? "#fef3c7"
												: "transparent",
										padding:
											isExpired(circuit.expirationDate) ||
											isExpirationSoon(circuit.expirationDate)
												? "8px 10px"
												: "0",
										borderRadius: "4px",
										color: isExpired(circuit.expirationDate)
											? "#7f1d1d"
											: isExpirationSoon(circuit.expirationDate)
												? "#92400e"
												: "#1e293b",
										fontWeight:
											isExpired(circuit.expirationDate) ||
											isExpirationSoon(circuit.expirationDate)
												? "600"
												: "500",
									}}
								>
									{circuit.expirationDate || "N/A"}
									{isExpired(circuit.expirationDate) && (
										<span
											style={{
												marginLeft: "8px",
												fontSize: "11px",
												color: "#7f1d1d",
											}}
										>
											(Expired)
										</span>
									)}
									{!isExpired(circuit.expirationDate) &&
										isExpirationSoon(circuit.expirationDate) && (
											<span
												style={{
													marginLeft: "8px",
													fontSize: "11px",
													color: "#92400e",
												}}
											>
												(Expires soon)
											</span>
										)}
								</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Circuit Type</span>
								<div>
									<span
										style={{
											padding: "4px 12px",
											borderRadius: "4px",
											fontSize: "12px",
											fontWeight: "bold",
											backgroundColor:
												circuit.circuitType === "Fiber"
													? "#dbeafe"
													: circuit.circuitType === "Wireless"
														? "#dbeafe"
														: "#e5e7eb",
											color:
												circuit.circuitType === "Fiber"
													? "#0c4a6e"
													: circuit.circuitType === "Wireless"
														? "#0c4a6e"
														: "#374151",
										}}
									>
										{circuit.circuitType === "Fiber"
											? "🔌 Fiber"
											: circuit.circuitType === "Wireless"
												? "📡 Wireless"
												: circuit.circuitType || "Unknown"}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* RENEWAL INFORMATION SECTION */}
					<div
						style={{
							backgroundColor: "#eff6ff",
							padding: "20px",
							borderRadius: "8px",
							marginBottom: "20px",
							border: "2px solid #3b82f6",
						}}
					>
						<h3
							style={{
								marginTop: 0,
								marginBottom: "16px",
								fontSize: "15px",
								fontWeight: "700",
								color: "#1e40af",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								display: "flex",
								alignItems: "center",
							}}
						>
							🔄 Renewal Information
						</h3>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "16px",
							}}
						>
							<div>
								<span style={{ ...detailLabelStyle, color: "#1e40af" }}>
									Renewal Term
								</span>
								<div style={{ ...detailValueStyle, color: "#1e40af" }}>
									{circuit.renewalTerm || "N/A"}
								</div>
							</div>
							<div>
								<span style={{ ...detailLabelStyle, color: "#1e40af" }}>
									Renewal Notice Date
								</span>
								<div style={{ ...detailValueStyle, color: "#1e40af" }}>
									{circuit.renewalNoticeDate || "N/A"}
								</div>
							</div>
						</div>
					</div>

					{/* AGGREGATOR & STATUS SECTION */}
					<div
						style={{
							backgroundColor: "#ffffff",
							padding: "20px",
							borderRadius: "8px",
							marginBottom: "20px",
							border: "1px solid #e5e7eb",
						}}
					>
						<h3
							style={{
								marginTop: 0,
								marginBottom: "16px",
								fontSize: "15px",
								fontWeight: "700",
								color: "#1e293b",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								display: "flex",
								alignItems: "center",
							}}
						>
							⚙️ Additional Details
						</h3>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "16px",
							}}
						>
							<div>
								<span style={detailLabelStyle}>Has Tower</span>
								<div>
									<span
										style={{
											padding: "4px 12px",
											borderRadius: "4px",
											fontSize: "12px",
											fontWeight: "bold",
											backgroundColor: circuit.hasTower ? "#d1fae5" : "#fee2e2",
											color: circuit.hasTower ? "#065f46" : "#7f1d1d",
										}}
									>
										{circuit.hasTower ? "✅ Yes" : "❌ No"}
									</span>
								</div>
							</div>
							<div>
								<span style={detailLabelStyle}>Has Aggregator</span>
								<div>
									<span
										style={{
											padding: "4px 12px",
											borderRadius: "4px",
											fontSize: "12px",
											fontWeight: "bold",
											backgroundColor: circuit.hasAggregator
												? "#d1fae5"
												: "#fee2e2",
											color: circuit.hasAggregator ? "#065f46" : "#7f1d1d",
										}}
									>
										{circuit.hasAggregator ? "✅ Yes" : "❌ No"}
									</span>
								</div>
							</div>
							{circuit.hasAggregator && (
								<div style={{ gridColumn: "1 / -1" }}>
									<span style={detailLabelStyle}>Aggregator Name</span>
									<div style={detailValueStyle}>
										{circuit.aggregatorName || "N/A"}
									</div>
								</div>
							)}
							<div style={{ gridColumn: "1 / -1" }}>
								<span style={detailLabelStyle}>Notes</span>
								<div
									style={{
										...detailValueStyle,
										backgroundColor: "#f3f4f6",
										padding: "10px",
										borderRadius: "4px",
										whiteSpace: "pre-wrap",
										minHeight: "60px",
										maxHeight: "120px",
										overflowY: "auto",
										border: "1px solid #e5e7eb",
									}}
								>
									{circuit.notes || "N/A"}
								</div>
							</div>
						</div>
					</div>

					{/* TOWER INFORMATION SECTION */}
					{circuit.hasTower && (
						<div
							style={{
								backgroundColor: "#f3f4f6",
								padding: "20px",
								borderRadius: "8px",
								marginBottom: "20px",
								border: "2px solid #f59e0b",
							}}
						>
							<h3
								style={{
									marginTop: 0,
									marginBottom: "16px",
									fontSize: "15px",
									fontWeight: "700",
									color: "#92400e",
									textTransform: "uppercase",
									letterSpacing: "0.5px",
									display: "flex",
									alignItems: "center",
								}}
							>
								🏗️ Tower Information ({circuit.numberOfTowers || 0} tower
								{parseInt(circuit.numberOfTowers) !== 1 ? "s" : ""})
							</h3>
							{circuit.numberOfTowers &&
								parseInt(circuit.numberOfTowers) > 0 &&
								Array.from(
									{ length: parseInt(circuit.numberOfTowers) },
									(_, i) => i + 1,
								).map((towerNum) => (
									<div
										key={towerNum}
										style={{
											marginBottom: "16px",
											backgroundColor: "#ffffff",
											padding: "16px",
											borderRadius: "6px",
											border: "1px solid #f59e0b",
											borderLeft: "4px solid #f59e0b",
										}}
									>
										<h4
											style={{
												marginTop: 0,
												marginBottom: "12px",
												color: "#92400e",
												fontSize: "13px",
												fontWeight: "700",
											}}
										>
											Tower {towerNum}
										</h4>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 1fr",
												gap: "12px",
											}}
										>
											<div>
												<span style={detailLabelStyle}>Provider</span>
												<div style={detailValueStyle}>
													{circuit[`towerProvider${towerNum}`] || "N/A"}
												</div>
											</div>
											<div>
												<span style={detailLabelStyle}>Installation Date</span>
												<div style={detailValueStyle}>
													{circuit[`towerInstallDate${towerNum}`] || "N/A"}
												</div>
											</div>
											<div>
												<span style={detailLabelStyle}>Expiration Date</span>
												<div style={detailValueStyle}>
													{circuit[`towerExpirationDate${towerNum}`] || "N/A"}
												</div>
											</div>
											{user?.role !== "NOC" && (
												<div>
													<span style={detailLabelStyle}>Monthly Cost</span>
													<div style={detailValueStyle}>
														{circuit[`towerMonthlyCost${towerNum}`]
															? "$" +
																parseFloat(
																	circuit[`towerMonthlyCost${towerNum}`],
																).toFixed(2)
															: "N/A"}
													</div>
												</div>
											)}
										</div>
									</div>
								))}
						</div>
					)}
				</div>

				<div
					style={{
						padding: "0 24px 24px 24px",
						display: "flex",
						justifyContent: "flex-end",
					}}
				>
					<button
						onClick={onClose}
						style={{
							...buttonStyle,
							backgroundColor: "#3b82f6",
							color: "white",
						}}
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
				backgroundColor: "#f9fafb",
				padding: "0",
				borderRadius: "8px",
				width: "90%",
				maxWidth: "750px",
				margin: "20px",
				maxHeight: "90vh",
				overflowY: "auto",
				boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					position: "sticky",
					top: 0,
					backgroundColor: "#1e293b",
					color: "white",
					padding: "20px 24px",
					borderBottom: "2px solid #3b82f6",
					borderRadius: "8px 8px 0 0",
					zIndex: 10,
				}}
			>
				<h2
					style={{
						margin: 0,
						fontSize: "22px",
						fontWeight: "600",
						letterSpacing: "-0.5px",
					}}
				>
					✏️ Edit Circuit
				</h2>
			</div>
			<form onSubmit={onSubmit} style={{ padding: "24px", flex: 1 }}>
				{/* BASIC INFORMATION SECTION */}
				<div
					style={{
						backgroundColor: "#ffffff",
						padding: "20px",
						borderRadius: "8px",
						marginBottom: "20px",
						border: "1px solid #e5e7eb",
					}}
				>
					<h3
						style={{
							marginTop: 0,
							marginBottom: "16px",
							fontSize: "15px",
							fontWeight: "700",
							color: "#1e293b",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							display: "flex",
							alignItems: "center",
						}}
					>
						🏢 Basic Information
					</h3>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "16px",
						}}
					>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Site *
							</label>
							<select
								value={circuit.site?.id || ""}
								onChange={(e) =>
									setCircuit({
										...circuit,
										site: { id: Number(e.target.value) },
									})
								}
								style={{ ...inputStyle, backgroundColor: "#ffffff" }}
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
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Provider *
							</label>
							<select
								value={circuit.provider?.id || ""}
								onChange={(e) =>
									setCircuit({
										...circuit,
										provider: { id: Number(e.target.value) },
									})
								}
								style={{ ...inputStyle, backgroundColor: "#ffffff" }}
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
					</div>
				</div>

				{/* CIRCUIT INFORMATION SECTION */}
				<div
					style={{
						backgroundColor: "#ffffff",
						padding: "20px",
						borderRadius: "8px",
						marginBottom: "20px",
						border: "1px solid #e5e7eb",
					}}
				>
					<h3
						style={{
							marginTop: 0,
							marginBottom: "16px",
							fontSize: "15px",
							fontWeight: "700",
							color: "#1e293b",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							display: "flex",
							alignItems: "center",
						}}
					>
						📋 Circuit Information
					</h3>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "16px",
						}}
					>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Account Number *
							</label>
							<input
								type="text"
								placeholder="Enter Account Number"
								value={circuit.accountNumber || ""}
								onChange={(e) =>
									setCircuit({ ...circuit, accountNumber: e.target.value })
								}
								style={inputStyle}
								required
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Circuit ID *
							</label>
							<input
								type="text"
								placeholder="Enter Circuit ID"
								value={circuit.circuitId || ""}
								onChange={(e) =>
									setCircuit({ ...circuit, circuitId: e.target.value })
								}
								style={inputStyle}
								required
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Bandwidth *
							</label>
							<input
								type="text"
								placeholder="e.g., 1Gbps"
								value={circuit.circuitBandwidth || ""}
								onChange={(e) =>
									setCircuit({ ...circuit, circuitBandwidth: e.target.value })
								}
								style={inputStyle}
								required
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Monthly Cost *
							</label>
							<input
								type="number"
								placeholder="0.00"
								step="0.01"
								value={circuit.monthlyCost || ""}
								onChange={(e) =>
									setCircuit({
										...circuit,
										monthlyCost: Number(e.target.value),
									})
								}
								style={inputStyle}
								required
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Installation Date *
							</label>
							<input
								type="date"
								value={circuit.installationDate || ""}
								onChange={(e) =>
									setCircuit({ ...circuit, installationDate: e.target.value })
								}
								style={inputStyle}
								required
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Contract Date *
							</label>
							<input
								type="date"
								value={circuit.circuitContractDate || ""}
								onChange={(e) =>
									setCircuit({
										...circuit,
										circuitContractDate: e.target.value,
									})
								}
								style={inputStyle}
								required
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Status *
							</label>
							<select
								value={circuit.status || ""}
								onChange={(e) =>
									setCircuit({ ...circuit, status: e.target.value })
								}
								style={inputStyle}
								required
							>
								<option value="">Select Status</option>
								<option value="Active">✅ Active</option>
								<option value="Inactive">❌ Inactive</option>
								<option value="Pending">⏳ Pending</option>
							</select>
						</div>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Expiration Date *
							</label>
							<input
								type="date"
								value={circuit.expirationDate || ""}
								onChange={(e) =>
									setCircuit({ ...circuit, expirationDate: e.target.value })
								}
								style={{
									...inputStyle,
									backgroundColor: isExpired(circuit.expirationDate)
										? "#fee2e2"
										: isExpirationSoon(circuit.expirationDate)
											? "#fef3c7"
											: "#ffffff",
									borderColor: isExpired(circuit.expirationDate)
										? "#dc2626"
										: isExpirationSoon(circuit.expirationDate)
											? "#f59e0b"
											: "#d1d5db",
									color: isExpired(circuit.expirationDate)
										? "#7f1d1d"
										: isExpirationSoon(circuit.expirationDate)
											? "#92400e"
											: "#1f2937",
									fontWeight:
										isExpired(circuit.expirationDate) ||
										isExpirationSoon(circuit.expirationDate)
											? "600"
											: "400",
								}}
								required
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "6px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Circuit Type *
							</label>
							<select
								value={circuit.circuitType || ""}
								onChange={(e) =>
									setCircuit({ ...circuit, circuitType: e.target.value })
								}
								style={inputStyle}
								required
							>
								<option value="">Select Type</option>
								<option value="Fiber">🔌 Fiber Circuit</option>
								<option value="Wireless">📡 Wireless</option>
							</select>
						</div>
					</div>
				</div>

				{/* RENEWAL INFORMATION SECTION */}
				<div
					style={{
						backgroundColor: "#eff6ff",
						padding: "20px",
						borderRadius: "8px",
						marginBottom: "20px",
						border: "2px solid #3b82f6",
					}}
				>
					<h3
						style={{
							marginTop: 0,
							marginBottom: "16px",
							fontSize: "15px",
							fontWeight: "700",
							color: "#1e40af",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							display: "flex",
							alignItems: "center",
						}}
					>
						🔄 Renewal Information
					</h3>
					<CircuitRenewalFields circuit={circuit} setCircuit={setCircuit} />
				</div>

				{/* HAS TOWER SECTION */}
				<div
					style={{
						backgroundColor: "#ffffff",
						padding: "20px",
						borderRadius: "8px",
						marginBottom: "20px",
						border: "1px solid #e5e7eb",
					}}
				>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							fontSize: "14px",
							fontWeight: "600",
							color: "#1e293b",
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
								marginRight: "12px",
								transform: "scale(1.3)",
								cursor: "pointer",
								accentColor: "#3b82f6",
							}}
						/>
						<span>🏗️ Manage Tower Information</span>
					</label>
				</div>

				{circuit.hasTower && (
					<div
						style={{
							backgroundColor: "#f3f4f6",
							padding: "20px",
							borderRadius: "8px",
							marginBottom: "20px",
							border: "2px solid #f59e0b",
						}}
					>
						<h3
							style={{
								marginTop: 0,
								marginBottom: "16px",
								fontSize: "15px",
								fontWeight: "700",
								color: "#92400e",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								display: "flex",
								alignItems: "center",
							}}
						>
							🏗️ Tower Information
						</h3>
						<div style={{ marginBottom: "16px" }}>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Number of Towers *
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
										marginBottom: "16px",
										borderLeft: "4px solid #f59e0b",
										paddingLeft: "16px",
										backgroundColor: "#ffffff",
										padding: "16px",
										borderRadius: "6px",
									}}
								>
									<h4
										style={{
											marginTop: 0,
											marginBottom: "12px",
											color: "#92400e",
											fontSize: "13px",
											fontWeight: "600",
										}}
									>
										Tower {towerNum} Details
									</h4>
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px",
										}}
									>
										<div>
											<label
												style={{
													display: "block",
													marginBottom: "4px",
													fontSize: "12px",
													fontWeight: "600",
													color: "#374151",
												}}
											>
												Provider
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
										<div>
											<label
												style={{
													display: "block",
													marginBottom: "4px",
													fontSize: "12px",
													fontWeight: "600",
													color: "#374151",
												}}
											>
												Installation Date
											</label>
											<input
												type="date"
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
										<div>
											<label
												style={{
													display: "block",
													marginBottom: "4px",
													fontSize: "12px",
													fontWeight: "600",
													color: "#374151",
												}}
											>
												Expiration Date
											</label>
											<input
												type="date"
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
										<div>
											<label
												style={{
													display: "block",
													marginBottom: "4px",
													fontSize: "12px",
													fontWeight: "600",
													color: "#374151",
												}}
											>
												Monthly Cost
											</label>
											<input
												type="number"
												placeholder="0.00"
												step="0.01"
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
								</div>
							))}
					</div>
				)}

				{/* HAS AGGREGATOR SECTION */}
				<div
					style={{
						backgroundColor: "#ffffff",
						padding: "20px",
						borderRadius: "8px",
						marginBottom: "20px",
						border: "1px solid #e5e7eb",
					}}
				>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							fontSize: "14px",
							fontWeight: "600",
							color: "#1e293b",
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
								marginRight: "12px",
								transform: "scale(1.3)",
								cursor: "pointer",
								accentColor: "#3b82f6",
							}}
						/>
						<span>🔗 Has Aggregator</span>
					</label>
				</div>

				{circuit.hasAggregator && (
					<div
						style={{
							backgroundColor: "#f0fdf4",
							padding: "20px",
							borderRadius: "8px",
							marginBottom: "20px",
							border: "2px solid #22c55e",
						}}
					>
						<h3
							style={{
								marginTop: 0,
								marginBottom: "16px",
								fontSize: "15px",
								fontWeight: "700",
								color: "#16a34a",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								display: "flex",
								alignItems: "center",
							}}
						>
							🔗 Aggregator Information
						</h3>
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
									fontSize: "13px",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Aggregator Name *
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

				{/* NOTES SECTION */}
				<div
					style={{
						backgroundColor: "#ffffff",
						padding: "20px",
						borderRadius: "8px",
						marginBottom: "20px",
						border: "1px solid #e5e7eb",
					}}
				>
					<h3
						style={{
							marginTop: 0,
							marginBottom: "12px",
							fontSize: "13px",
							fontWeight: "600",
							color: "#374151",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
						}}
					>
						📝 Additional Notes
					</h3>
					<textarea
						placeholder="Add any additional notes (optional)"
						value={circuit.notes || ""}
						onChange={(e) => setCircuit({ ...circuit, notes: e.target.value })}
						style={{
							...inputStyle,
							minHeight: "100px",
							resize: "vertical",
							fontFamily: "inherit",
						}}
					/>
				</div>

				{/* ACTION BUTTONS */}
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "12px",
						paddingTop: "16px",
						borderTop: "1px solid #e5e7eb",
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{
							...buttonStyle,
							backgroundColor: "#6b7280",
							padding: "10px 20px",
							fontSize: "14px",
							fontWeight: "500",
						}}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{
							...buttonStyle,
							backgroundColor: "#3b82f6",
							padding: "10px 24px",
							fontSize: "14px",
							fontWeight: "500",
						}}
					>
						💾 Save Changes
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
