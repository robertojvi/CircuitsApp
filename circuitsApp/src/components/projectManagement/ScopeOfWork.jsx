import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { SCOPE_CATEGORIES, quantityField } from "../../utils/projectCategories";
import { saveScopeOfWork } from "../../utils/projectManagementApi";

const buildFormState = (scopeOfWork) => {
	const form = { daysToComplete: scopeOfWork?.daysToComplete ?? "" };

	for (const { key } of SCOPE_CATEGORIES) {
		form[quantityField(key)] = scopeOfWork?.[quantityField(key)] ?? "";
	}

	return form;
};

function ScopeOfWork({ siteId, projectData, canEdit, onRefresh }) {
	const { token } = useAuth();
	const { theme } = useTheme();

	const [form, setForm] = useState(() => buildFormState(projectData?.scopeOfWork));
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		setForm(buildFormState(projectData?.scopeOfWork));
	}, [projectData?.scopeOfWork]);

	const handleFieldChange = (field, value) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setSuccess("");
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			const dto = {
				daysToComplete:
					form.daysToComplete === "" ? null : Number(form.daysToComplete),
			};

			for (const { key } of SCOPE_CATEGORIES) {
				const qField = quantityField(key);
				dto[qField] = form[qField] === "" ? null : Number(form[qField]);
			}

			await saveScopeOfWork(token, siteId, dto);
			setSuccess("Scope of work saved.");
			await onRefresh();
		} catch (err) {
			console.error("Error saving scope of work:", err);
			setError(err.message || "Failed to save scope of work");
		} finally {
			setSaving(false);
		}
	};

	const inputStyle = {
		padding: "8px 12px",
		borderRadius: "4px",
		fontSize: "var(--font-size-base)",
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
		color: theme === "light" ? "#1a1a1a" : "#ecf0f1",
		border: `1px solid ${theme === "light" ? "#bdbdbd" : "var(--color-border)"}`,
		width: "100%",
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

	return (
		<div>
			<h1 style={{ marginBottom: "var(--spacing-lg)" }}>Scope of Work</h1>

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

			<form onSubmit={handleSave}>
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
							</tr>
						</thead>
						<tbody>
							{SCOPE_CATEGORIES.map(({ key, name }) => (
								<tr
									key={key}
									style={{
										borderBottom: `1px solid ${theme === "light" ? "#dee2e6" : "var(--color-border)"}`,
									}}
								>
									<td style={{ ...tableCellStyle, fontWeight: "600" }}>{name}</td>
									<td style={tableCellStyle}>
										<input
											type="number"
											step="any"
											min="0"
											value={form[quantityField(key)]}
											disabled={!canEdit}
											onChange={(e) => handleFieldChange(quantityField(key), e.target.value)}
											style={inputStyle}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
					<label style={{ fontWeight: "600" }}>
						Days to Complete
						<input
							type="number"
							min="0"
							step="1"
							value={form.daysToComplete}
							disabled={!canEdit}
							onChange={(e) => handleFieldChange("daysToComplete", e.target.value)}
							style={{ ...inputStyle, marginLeft: "var(--spacing-md)", width: "120px", display: "inline-block" }}
						/>
					</label>

					{canEdit && (
						<button type="submit" className="btn btn-primary" disabled={saving}>
							{saving ? "Saving..." : "Save"}
						</button>
					)}
				</div>
			</form>
		</div>
	);
}

export default ScopeOfWork;
