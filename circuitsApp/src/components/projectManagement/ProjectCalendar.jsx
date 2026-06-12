import { useMemo, useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { parseDateInputValue, getDayInfo, buildOverridesMap } from "../../utils/projectTimeline";

const MONTH_NAMES = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

function ProjectCalendar({ startDate, workingDaysPerWeek, workDayOverrides, completionDate, canEdit, onToggleWorkDay }) {
	const { theme } = useTheme();

	const initialMonth = useMemo(() => {
		const parsed = parseDateInputValue(startDate);
		return startOfMonth(parsed || new Date());
	}, [startDate]);

	const [viewMonth, setViewMonth] = useState(initialMonth);

	useEffect(() => {
		setViewMonth(initialMonth);
	}, [initialMonth]);

	const overridesMap = useMemo(() => buildOverridesMap(workDayOverrides), [workDayOverrides]);
	const holidaysByYear = {};

	const goToPrevMonth = () => {
		setViewMonth((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)));
	};

	const goToNextMonth = () => {
		setViewMonth((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)));
	};

	const year = viewMonth.getUTCFullYear();
	const month = viewMonth.getUTCMonth();
	const firstWeekday = viewMonth.getUTCDay();
	const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

	const cells = [];
	for (let i = 0; i < firstWeekday; i++) {
		cells.push(null);
	}
	for (let day = 1; day <= daysInMonth; day++) {
		cells.push(new Date(Date.UTC(year, month, day)));
	}

	const dayCellBase = {
		minHeight: "72px",
		borderRadius: "var(--radius-md)",
		padding: "6px",
		fontSize: "12px",
		display: "flex",
		flexDirection: "column",
		gap: "4px",
		border: `1px solid ${theme === "light" ? "#e2e8f0" : "var(--color-border)"}`,
	};

	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-md)" }}>
				<button onClick={goToPrevMonth} className="btn btn-ghost" style={{ fontSize: "13px", padding: "4px 10px" }}>
					&larr; Prev
				</button>
				<div style={{ fontWeight: "700", fontSize: "var(--font-size-lg)" }}>
					{MONTH_NAMES[month]} {year}
				</div>
				<button onClick={goToNextMonth} className="btn btn-ghost" style={{ fontSize: "13px", padding: "4px 10px" }}>
					Next &rarr;
				</button>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
				{WEEKDAY_NAMES.map((name) => (
					<div key={name} style={{ textAlign: "center", fontWeight: "700", fontSize: "12px", opacity: 0.8 }}>
						{name}
					</div>
				))}
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
				{cells.map((date, index) => {
					if (!date) {
						return <div key={`empty-${index}`} style={dayCellBase} />;
					}

					const info = getDayInfo(date, { workingDaysPerWeek, overridesMap, holidaysByYear });
					const isCompletionDay = info.dateStr === completionDate;

					let backgroundColor;
					if (info.isWorkDay) {
						backgroundColor = theme === "light" ? "#dcfce7" : "#14532d";
					} else {
						backgroundColor = theme === "light" ? "#f1f5f9" : "var(--color-dark-bg-secondary)";
					}

					const cellStyle = {
						...dayCellBase,
						backgroundColor,
						cursor: canEdit ? "pointer" : "default",
						border: isCompletionDay
							? "2px solid var(--color-primary)"
							: info.isOverridden
								? `2px dashed ${theme === "light" ? "#d97706" : "#fbbf24"}`
								: dayCellBase.border,
					};

					return (
						<div
							key={info.dateStr}
							style={cellStyle}
							title={info.holidayName || undefined}
							onClick={() => canEdit && onToggleWorkDay(info.dateStr)}
						>
							<div style={{ fontWeight: "700" }}>{date.getUTCDate()}</div>
							{info.isHoliday && (
								<div style={{ fontSize: "10px", color: theme === "light" ? "#92400e" : "#fbbf24" }}>
									{info.holidayName}
								</div>
							)}
							{isCompletionDay && (
								<div style={{ fontSize: "10px", fontWeight: "700", color: "var(--color-primary)" }}>
									Completion
								</div>
							)}
						</div>
					);
				})}
			</div>

			<div style={{ display: "flex", gap: "var(--spacing-lg)", marginTop: "var(--spacing-md)", flexWrap: "wrap", fontSize: "12px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span style={{ width: "14px", height: "14px", borderRadius: "3px", display: "inline-block", backgroundColor: theme === "light" ? "#dcfce7" : "#14532d" }} />
					Work day
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span style={{ width: "14px", height: "14px", borderRadius: "3px", display: "inline-block", backgroundColor: theme === "light" ? "#f1f5f9" : "var(--color-dark-bg-secondary)" }} />
					Non-work day
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span style={{ width: "14px", height: "14px", borderRadius: "3px", display: "inline-block", border: `2px dashed ${theme === "light" ? "#d97706" : "#fbbf24"}` }} />
					Manually toggled
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span style={{ width: "14px", height: "14px", borderRadius: "3px", display: "inline-block", border: "2px solid var(--color-primary)" }} />
					Project completion
				</div>
				{canEdit && <div>Click a day to toggle it as a work day / non-work day.</div>}
			</div>
		</div>
	);
}

export default ProjectCalendar;
