import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
	saveTimeline,
	addDelay,
	deleteDelay,
	saveWorkDayOverride,
	deleteWorkDayOverride,
} from "../../utils/projectManagementApi";
import { calculateCompletionDate, buildOverridesMap, isWorkDay, getUSHolidays } from "../../utils/projectTimeline";
import ProjectCalendar from "./ProjectCalendar";

const todayString = () => new Date().toISOString().slice(0, 10);

function Timeline({ siteId, projectData, canEdit, onRefresh }) {
	const { token } = useAuth();
	const { theme } = useTheme();

	const timeline = projectData?.timeline;
	const delays = useMemo(() => projectData?.delays || [], [projectData?.delays]);
	const workDayOverrides = useMemo(
		() => projectData?.workDayOverrides || [],
		[projectData?.workDayOverrides],
	);
	const daysToComplete = projectData?.scopeOfWork?.daysToComplete || 0;

	const [startDate, setStartDate] = useState(timeline?.constructionStartDate || "");
	const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(
		timeline?.workingDaysPerWeek || 5,
	);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [delayDays, setDelayDays] = useState("");
	const [delayReason, setDelayReason] = useState("");
	const [delayDate, setDelayDate] = useState(todayString());

	useEffect(() => {
		setStartDate(timeline?.constructionStartDate || "");
		setWorkingDaysPerWeek(timeline?.workingDaysPerWeek || 5);
	}, [timeline]);

	const totalDelayDays = useMemo(
		() => delays.reduce((sum, delay) => sum + (Number(delay.numberOfDays) || 0), 0),
		[delays],
	);

	const originalCompletionDate = useMemo(
		() =>
			calculateCompletionDate({
				startDate,
				totalDays: daysToComplete,
				workingDaysPerWeek,
				workDayOverrides,
			}),
		[startDate, daysToComplete, workingDaysPerWeek, workDayOverrides],
	);

	const currentCompletionDate = useMemo(
		() =>
			calculateCompletionDate({
				startDate,
				totalDays: daysToComplete + totalDelayDays,
				workingDaysPerWeek,
				workDayOverrides,
			}),
		[startDate, daysToComplete, totalDelayDays, workingDaysPerWeek, workDayOverrides],
	);

	const handleSaveTimeline = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			await saveTimeline(token, siteId, {
				constructionStartDate: startDate || null,
				workingDaysPerWeek: Number(workingDaysPerWeek),
			});
			setSuccess("Timeline saved.");
			await onRefresh();
		} catch (err) {
			console.error("Error saving timeline:", err);
			setError(err.message || "Failed to save timeline");
		} finally {
			setSaving(false);
		}
	};

	const handleAddDelay = async (e) => {
		e.preventDefault();
		if (!delayDays || Number(delayDays) <= 0) return;

		setSaving(true);
		setError("");
		setSuccess("");

		try {
			await addDelay(token, siteId, {
				numberOfDays: Number(delayDays),
				reason: delayReason,
				dateRecorded: delayDate,
			});
			setDelayDays("");
			setDelayReason("");
			setDelayDate(todayString());
			await onRefresh();
		} catch (err) {
			console.error("Error adding delay:", err);
			setError(err.message || "Failed to add delay");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteDelay = async (delayId) => {
		setSaving(true);
		setError("");

		try {
			await deleteDelay(token, delayId);
			await onRefresh();
		} catch (err) {
			console.error("Error deleting delay:", err);
			setError(err.message || "Failed to delete delay");
		} finally {
			setSaving(false);
		}
	};

	const handleToggleWorkDay = async (dateStr) => {
		if (!canEdit) return;

		setError("");

		const overridesMap = buildOverridesMap(workDayOverrides);
		const year = Number(dateStr.slice(0, 4));
		const holidays = getUSHolidays(year);
		const dateObj = new Date(`${dateStr}T00:00:00Z`);
		const currentIsWorkDay = isWorkDay(dateObj, Number(workingDaysPerWeek), overridesMap, holidays);
		const existingOverride = workDayOverrides.find((override) => override.date === dateStr);

		try {
			if (existingOverride) {
				await deleteWorkDayOverride(token, existingOverride.id);
			} else {
				await saveWorkDayOverride(token, siteId, {
					date: dateStr,
					isWorkDay: !currentIsWorkDay,
				});
			}
			await onRefresh();
		} catch (err) {
			console.error("Error updating work day override:", err);
			setError(err.message || "Failed to update calendar day");
		}
	};

	const inputStyle = {
		padding: "8px 12px",
		borderRadius: "4px",
		fontSize: "var(--font-size-base)",
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
		color: theme === "light" ? "#1a1a1a" : "#ecf0f1",
		border: `1px solid ${theme === "light" ? "#bdbdbd" : "var(--color-border)"}`,
	};

	const cardStyle = {
		padding: "var(--spacing-lg)",
		borderRadius: "var(--radius-lg)",
		border: "1px solid var(--color-border-light)",
		boxShadow: "var(--shadow-sm)",
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
		marginBottom: "var(--spacing-lg)",
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
			<h1 style={{ marginBottom: "var(--spacing-md)" }}>Timeline</h1>

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

			<div style={cardStyle}>
				<form
					onSubmit={handleSaveTimeline}
					style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-lg)", alignItems: "flex-end" }}
				>
					<label style={{ fontWeight: "600" }}>
						<div style={{ marginBottom: "4px" }}>Construction Start Date</div>
						<input
							type="date"
							value={startDate}
							disabled={!canEdit}
							onChange={(e) => setStartDate(e.target.value)}
							style={inputStyle}
						/>
					</label>

					<label style={{ fontWeight: "600" }}>
						<div style={{ marginBottom: "4px" }}>Working Days per Week</div>
						<select
							value={workingDaysPerWeek}
							disabled={!canEdit}
							onChange={(e) => setWorkingDaysPerWeek(Number(e.target.value))}
							style={inputStyle}
						>
							<option value={5}>5 (Mon-Fri)</option>
							<option value={6}>6 (Mon-Sat)</option>
						</select>
					</label>

					{canEdit && (
						<button type="submit" className="btn btn-primary" disabled={saving}>
							{saving ? "Saving..." : "Save"}
						</button>
					)}

					<div style={{ marginLeft: "auto", display: "flex", gap: "var(--spacing-xl)" }}>
						<div>
							<div style={{ fontSize: "var(--font-size-sm)", opacity: 0.8 }}>
								Days to Complete (from Scope of Work)
							</div>
							<div style={{ fontWeight: "700", fontSize: "var(--font-size-lg)" }}>
								{daysToComplete || 0}
							</div>
						</div>
						<div>
							<div style={{ fontSize: "var(--font-size-sm)", opacity: 0.8 }}>
								Original Completion Date
							</div>
							<div style={{ fontWeight: "700", fontSize: "var(--font-size-lg)" }}>
								{originalCompletionDate || "N/A"}
							</div>
						</div>
						<div>
							<div style={{ fontSize: "var(--font-size-sm)", opacity: 0.8 }}>
								Current Completion Date
							</div>
							<div style={{ fontWeight: "700", fontSize: "var(--font-size-lg)", color: "var(--color-primary)" }}>
								{currentCompletionDate || "N/A"}
							</div>
						</div>
					</div>
				</form>
			</div>

			<div style={cardStyle}>
				<h2 style={{ marginBottom: "var(--spacing-md)" }}>Delays</h2>

				{canEdit && (
					<form
						onSubmit={handleAddDelay}
						style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-md)", alignItems: "flex-end", marginBottom: "var(--spacing-lg)" }}
					>
						<label style={{ fontWeight: "600" }}>
							<div style={{ marginBottom: "4px" }}>Number of Days</div>
							<input
								type="number"
								min="1"
								step="1"
								value={delayDays}
								onChange={(e) => setDelayDays(e.target.value)}
								style={{ ...inputStyle, width: "120px" }}
							/>
						</label>
						<label style={{ fontWeight: "600", flex: "1 1 240px" }}>
							<div style={{ marginBottom: "4px" }}>Reason</div>
							<input
								type="text"
								value={delayReason}
								onChange={(e) => setDelayReason(e.target.value)}
								style={{ ...inputStyle, width: "100%" }}
							/>
						</label>
						<label style={{ fontWeight: "600" }}>
							<div style={{ marginBottom: "4px" }}>Date</div>
							<input
								type="date"
								value={delayDate}
								onChange={(e) => setDelayDate(e.target.value)}
								style={inputStyle}
							/>
						</label>
						<button type="submit" className="btn btn-primary" disabled={saving}>
							Add Delay
						</button>
					</form>
				)}

				{delays.length === 0 ? (
					<p>No delays recorded.</p>
				) : (
					<div
						style={{
							width: "100%",
							overflowX: "auto",
							borderRadius: "var(--radius-lg)",
							border: "1px solid var(--color-border-light)",
						}}
					>
						<table style={{ width: "100%", borderCollapse: "collapse" }}>
							<thead
								style={{
									backgroundColor: "var(--color-table-header-bg)",
									borderBottom: "3px solid var(--color-primary)",
								}}
							>
								<tr>
									<th style={tableHeaderStyle}>Date Recorded</th>
									<th style={tableHeaderStyle}>Days</th>
									<th style={tableHeaderStyle}>Reason</th>
									{canEdit && <th style={tableHeaderStyle}></th>}
								</tr>
							</thead>
							<tbody>
								{delays.map((delay) => (
									<tr
										key={delay.id}
										style={{
											borderBottom: `1px solid ${theme === "light" ? "#dee2e6" : "var(--color-border)"}`,
										}}
									>
										<td style={tableCellStyle}>{delay.dateRecorded}</td>
										<td style={tableCellStyle}>{delay.numberOfDays}</td>
										<td style={tableCellStyle}>{delay.reason}</td>
										{canEdit && (
											<td style={tableCellStyle}>
												<button
													onClick={() => handleDeleteDelay(delay.id)}
													className="btn btn-ghost"
													style={{ fontSize: "12px", padding: "4px 8px" }}
												>
													🗑️
												</button>
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<div style={cardStyle}>
				<h2 style={{ marginBottom: "var(--spacing-md)" }}>Project Calendar</h2>
				<ProjectCalendar
					startDate={startDate}
					workingDaysPerWeek={Number(workingDaysPerWeek)}
					workDayOverrides={workDayOverrides}
					completionDate={currentCompletionDate}
					canEdit={canEdit}
					onToggleWorkDay={handleToggleWorkDay}
				/>
			</div>
		</div>
	);
}

export default Timeline;
