import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { SCOPE_CATEGORIES, PHASE_CATEGORIES, quantityField, daysField, PROGRESS_STATUSES } from "../../utils/projectCategories";
import { saveProgressItems } from "../../utils/projectManagementApi";

const statusToPercent = (status, currentPercent) => {
	if (status === "PENDING") return 0;
	if (status === "COMPLETE") return 100;
	return currentPercent ?? 0;
};

const STATUS_ORDER = { COMPLETE: 0, PARTIAL: 1, PENDING: 2 };

const STATUS_CELL_COLORS = {
	COMPLETE: { backgroundColor: "var(--color-status-success-bg)", color: "var(--color-status-success-text)" },
	PARTIAL: { backgroundColor: "var(--color-status-warning-bg)", color: "var(--color-status-warning-text)" },
	PENDING: { backgroundColor: "var(--color-status-error-bg)", color: "var(--color-status-error-text)" },
};

const buildRows = (scopeOfWork, progressItems) => {
	if (!scopeOfWork) return [];

	const scopeRows = SCOPE_CATEGORIES.filter(({ key }) => {
		const quantity = scopeOfWork[quantityField(key)];
		return Number(quantity) > 0;
	}).map(({ key, name }) => {
		const existing = (progressItems || []).find((item) => item.category === key);

		return {
			category: key,
			name,
			quantity: scopeOfWork[quantityField(key)],
			id: existing?.id ?? null,
			status: existing?.status ?? "PENDING",
			percentComplete: existing?.percentComplete ?? 0,
		};
	});

	const phaseRows = PHASE_CATEGORIES.filter(({ key }) => {
		const days = scopeOfWork[daysField(key)];
		return Number(days) > 0;
	}).map(({ key, name }) => {
		const existing = (progressItems || []).find((item) => item.category === key);
		const days = scopeOfWork[daysField(key)];

		return {
			category: key,
			name,
			quantity: `${days} day${Number(days) === 1 ? "" : "s"}`,
			id: existing?.id ?? null,
			status: existing?.status ?? "PENDING",
			percentComplete: existing?.percentComplete ?? 0,
		};
	});

	return [...scopeRows, ...phaseRows];
};

function ConstructionProgress({ siteId, projectData, canEdit, onRefresh }) {
	const { token } = useAuth();
	const { theme } = useTheme();

	const [rows, setRows] = useState(() =>
		buildRows(projectData?.scopeOfWork, projectData?.progressItems),
	);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		setRows(buildRows(projectData?.scopeOfWork, projectData?.progressItems));
	}, [projectData?.scopeOfWork, projectData?.progressItems]);

	const handleStatusChange = (category, status) => {
		setRows((prev) =>
			prev.map((row) =>
				row.category === category
					? { ...row, status, percentComplete: statusToPercent(status, row.percentComplete) }
					: row,
			),
		);
		setSuccess("");
	};

	const handlePercentChange = (category, value) => {
		const numeric = Math.min(100, Math.max(0, Number(value) || 0));
		setRows((prev) =>
			prev.map((row) =>
				row.category === category ? { ...row, percentComplete: numeric } : row,
			),
		);
		setSuccess("");
	};

	const handleSave = async () => {
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			const items = rows.map((row) => ({
				id: row.id,
				siteId,
				category: row.category,
				status: row.status,
				percentComplete: statusToPercent(row.status, row.percentComplete),
			}));

			await saveProgressItems(token, siteId, items);
			setSuccess("Construction progress saved.");
			await onRefresh();
		} catch (err) {
			console.error("Error saving construction progress:", err);
			setError(err.message || "Failed to save construction progress");
		} finally {
			setSaving(false);
		}
	};

	const overallPercent =
		rows.length === 0
			? 0
			: rows.reduce((sum, row) => sum + statusToPercent(row.status, row.percentComplete), 0) /
				rows.length;

	const inputStyle = {
		padding: "8px 12px",
		borderRadius: "4px",
		fontSize: "var(--font-size-base)",
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
		color: theme === "light" ? "#1a1a1a" : "#ecf0f1",
		border: `1px solid ${theme === "light" ? "#bdbdbd" : "var(--color-border)"}`,
	};

	const tableHeaderStyle = {
		padding: "var(--spacing-md)",
		textAlign: "left",
		color: "#ffffff",
		fontWeight: "700",
		fontSize: "var(--font-size-sm)",
		textTransform: "uppercase",
		letterSpacing: "0.5px",
	};

	const tableCellStyle = {
		padding: "var(--spacing-md)",
		color: theme === "light" ? "#2c3e50" : "#ecf0f1",
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
	};

	if (rows.length === 0) {
		return (
			<div>
				<h1 style={{ marginBottom: "var(--spacing-lg)" }}>Construction Progress</h1>
				<p>No scope of work items with a quantity greater than zero yet.</p>
				<p>Add quantities on the Scope of Work tab to track progress here.</p>
			</div>
		);
	}

	return (
		<div>
			<h1 style={{ marginBottom: "var(--spacing-md)" }}>Construction Progress</h1>

			{error && (
				<div style={{ color: "var(--color-danger)", marginBottom: "var(--spacing-md)" }}>
					{error}
				</div>
			)}
			{success && (
				<div style={{ color: "var(--color-success)", marginBottom: "var(--spacing-md)" }}>
					{success}
				</div>
			)}

			<div style={{ marginBottom: "var(--spacing-lg)" }}>
				<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
					<span style={{ fontWeight: "600" }}>Overall Progress</span>
					<span style={{ fontWeight: "600" }}>{overallPercent.toFixed(1)}%</span>
				</div>
				<div
					style={{
						width: "100%",
						height: "16px",
						borderRadius: "8px",
						backgroundColor: theme === "light" ? "#e2e8f0" : "var(--color-dark-bg-secondary)",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							height: "100%",
							width: `${overallPercent}%`,
							backgroundColor: "var(--color-primary)",
							transition: "width var(--transition-fast)",
						}}
					/>
				</div>
			</div>

			<div
				style={{
					width: "100%",
					overflowX: "auto",
					borderRadius: "var(--radius-lg)",
					border: "1px solid var(--color-border-light)",
					boxShadow: "var(--shadow-sm)",
					marginBottom: "var(--spacing-lg)",
				}}
			>
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
					}}
				>
					<thead
						style={{
							backgroundColor: "var(--color-table-header-bg)",
							borderBottom: "3px solid var(--color-primary)",
						}}
					>
						<tr>
							<th style={tableHeaderStyle}>Category</th>
							<th style={tableHeaderStyle}>Quantity</th>
							<th style={tableHeaderStyle}>Status</th>
							<th style={tableHeaderStyle}>% Complete</th>
						</tr>
					</thead>
					<tbody>
						{[...rows]
							.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
							.map((row) => (
							<tr
								key={row.category}
								style={{
									borderBottom: `1px solid ${theme === "light" ? "#dee2e6" : "var(--color-border)"}`,
								}}
							>
								<td style={{ ...tableCellStyle, ...STATUS_CELL_COLORS[row.status], fontWeight: "600" }}>{row.name}</td>
								<td style={tableCellStyle}>{row.quantity}</td>
								<td style={tableCellStyle}>
									<select
										value={row.status}
										disabled={!canEdit}
										onChange={(e) => handleStatusChange(row.category, e.target.value)}
										style={inputStyle}
									>
										{PROGRESS_STATUSES.map((status) => (
											<option key={status.value} value={status.value}>
												{status.label}
											</option>
										))}
									</select>
								</td>
								<td style={tableCellStyle}>
									{row.status === "PARTIAL" ? (
										<input
											type="number"
											min="0"
											max="100"
											step="1"
											value={row.percentComplete}
											disabled={!canEdit}
											onChange={(e) => handlePercentChange(row.category, e.target.value)}
											style={{ ...inputStyle, width: "90px" }}
										/>
									) : (
										`${statusToPercent(row.status, row.percentComplete)}%`
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{canEdit && (
				<button onClick={handleSave} className="btn btn-primary" disabled={saving}>
					{saving ? "Saving..." : "Save"}
				</button>
			)}
		</div>
	);
}

export default ConstructionProgress;
