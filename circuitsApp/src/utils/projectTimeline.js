// Date helpers, US holiday calculation, and project completion-date math
// for the Project Management > Timeline tab.

export const parseDateInputValue = (value) => {
	if (!value) return null;

	const [year, month, day] = value.split("-").map(Number);

	if ([year, month, day].some(Number.isNaN)) {
		return null;
	}

	return new Date(Date.UTC(year, month - 1, day));
};

export const formatDateInputValue = (date) => {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toISOString().slice(0, 10);
};

const addDays = (date, amount) => {
	const result = new Date(date.getTime());
	result.setUTCDate(result.getUTCDate() + amount);
	return result;
};

// Returns the date (UTC) of the nth occurrence of `weekday` (0=Sun..6=Sat) in `month` (0-indexed).
const getNthWeekdayOfMonth = (year, month, weekday, n) => {
	const first = new Date(Date.UTC(year, month, 1));
	const firstWeekday = first.getUTCDay();
	const offset = (weekday - firstWeekday + 7) % 7;
	const day = 1 + offset + (n - 1) * 7;
	return new Date(Date.UTC(year, month, day));
};

// Returns the date (UTC) of the last occurrence of `weekday` (0=Sun..6=Sat) in `month` (0-indexed).
const getLastWeekdayOfMonth = (year, month, weekday) => {
	const last = new Date(Date.UTC(year, month + 1, 0));
	const lastWeekday = last.getUTCDay();
	const offset = (lastWeekday - weekday + 7) % 7;
	return addDays(last, -offset);
};

// Computes the standard US federal holidays for a given year.
export const getUSHolidays = (year) => {
	const holidays = [
		{ date: new Date(Date.UTC(year, 0, 1)), name: "New Year's Day" },
		{ date: getNthWeekdayOfMonth(year, 0, 1, 3), name: "Martin Luther King Jr. Day" },
		{ date: getNthWeekdayOfMonth(year, 1, 1, 3), name: "Presidents' Day" },
		{ date: getLastWeekdayOfMonth(year, 4, 1), name: "Memorial Day" },
		{ date: new Date(Date.UTC(year, 5, 19)), name: "Juneteenth" },
		{ date: new Date(Date.UTC(year, 6, 4)), name: "Independence Day" },
		{ date: getNthWeekdayOfMonth(year, 8, 1, 1), name: "Labor Day" },
		{ date: getNthWeekdayOfMonth(year, 9, 1, 2), name: "Columbus Day" },
		{ date: new Date(Date.UTC(year, 10, 11)), name: "Veterans Day" },
		{ date: getNthWeekdayOfMonth(year, 10, 4, 4), name: "Thanksgiving Day" },
		{ date: new Date(Date.UTC(year, 11, 25)), name: "Christmas Day" },
	];

	return holidays.map((holiday) => ({
		date: formatDateInputValue(holiday.date),
		name: holiday.name,
	}));
};

// Mon-Fri are always default work days; Saturday only counts on a 6-day week; Sunday never does.
export const isDefaultWorkDay = (date, workingDaysPerWeek) => {
	const day = date.getUTCDay();
	if (day === 0) return false;
	if (day === 6) return workingDaysPerWeek === 6;
	return true;
};

export const buildOverridesMap = (workDayOverrides = []) => {
	const map = new Map();
	for (const override of workDayOverrides) {
		if (override?.date) {
			map.set(override.date, !!override.isWorkDay);
		}
	}
	return map;
};

// Determines whether `date` is a work day, given per-date overrides (which always win) and
// the computed holiday list for that date's year.
export const isWorkDay = (date, workingDaysPerWeek, overridesMap, holidays) => {
	const dateStr = formatDateInputValue(date);

	if (overridesMap?.has(dateStr)) {
		return !!overridesMap.get(dateStr);
	}

	if (!isDefaultWorkDay(date, workingDaysPerWeek)) {
		return false;
	}

	return !holidays.some((holiday) => holiday.date === dateStr);
};

// Returns descriptive info about a single calendar day, for rendering the calendar grid.
export const getDayInfo = (date, { workingDaysPerWeek, overridesMap, holidaysByYear }) => {
	const year = date.getUTCFullYear();
	if (!holidaysByYear[year]) {
		holidaysByYear[year] = getUSHolidays(year);
	}
	const holidays = holidaysByYear[year];
	const dateStr = formatDateInputValue(date);
	const holiday = holidays.find((h) => h.date === dateStr);
	const defaultWorkDay = isDefaultWorkDay(date, workingDaysPerWeek);
	const hasOverride = overridesMap?.has(dateStr);
	const workDay = isWorkDay(date, workingDaysPerWeek, overridesMap, holidays);

	return {
		dateStr,
		isWeekend: date.getUTCDay() === 0 || date.getUTCDay() === 6,
		isHoliday: !!holiday,
		holidayName: holiday?.name || null,
		isOverridden: hasOverride,
		defaultWorkDay,
		isWorkDay: workDay,
	};
};

// Iterates day by day from `startDate`, counting work days until `totalDays` is reached,
// and returns that date as a "YYYY-MM-DD" string (or null if inputs are invalid).
export const calculateCompletionDate = ({
	startDate,
	totalDays,
	workingDaysPerWeek,
	workDayOverrides = [],
}) => {
	const start = parseDateInputValue(startDate);

	if (!start || !Number.isFinite(totalDays) || totalDays <= 0) {
		return null;
	}

	const overridesMap = buildOverridesMap(workDayOverrides);
	const holidaysByYear = {};

	let workDaysCounted = 0;
	let current = start;

	// Safety cap so a pathological input (e.g. all days marked non-work) can't loop forever.
	const maxIterations = totalDays * 10 + 730;

	for (let i = 0; i < maxIterations; i++) {
		const year = current.getUTCFullYear();
		if (!holidaysByYear[year]) {
			holidaysByYear[year] = getUSHolidays(year);
		}

		if (isWorkDay(current, workingDaysPerWeek, overridesMap, holidaysByYear[year])) {
			workDaysCounted++;
			if (workDaysCounted === totalDays) {
				return formatDateInputValue(current);
			}
		}

		current = addDays(current, 1);
	}

	return null;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Returns the percentage of the timeline (from `startDate` to `targetDate`) that has elapsed
// as of today, clamped to [0, 100]. Returns null if either date is invalid or the range is empty.
export const calculateExpectedProgressPercent = ({ startDate, targetDate }) => {
	const start = parseDateInputValue(startDate);
	const target = parseDateInputValue(targetDate);

	if (!start || !target || target <= start) {
		return null;
	}

	const now = new Date();
	const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

	const totalDays = (target.getTime() - start.getTime()) / MS_PER_DAY;
	const elapsedDays = (today.getTime() - start.getTime()) / MS_PER_DAY;

	return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
};

// Computes the [start, end] date range for a phase (e.g. Soft-Launch, Go-Live) that runs for
// `totalDays` business days, starting on the first work day after `afterDate`. Weekends,
// holidays, and non-work-day overrides are skipped both when picking the start day and when
// counting toward `totalDays`. Returns null if inputs are invalid.
export const calculatePhaseRange = ({
	afterDate,
	totalDays,
	workingDaysPerWeek,
	workDayOverrides = [],
}) => {
	const after = parseDateInputValue(afterDate);

	if (!after || !Number.isFinite(totalDays) || totalDays <= 0) {
		return null;
	}

	const overridesMap = buildOverridesMap(workDayOverrides);
	const holidaysByYear = {};

	const maxIterations = totalDays * 10 + 730;
	let current = addDays(after, 1);
	let start = null;
	let workDaysCounted = 0;

	for (let i = 0; i < maxIterations; i++) {
		const year = current.getUTCFullYear();
		if (!holidaysByYear[year]) {
			holidaysByYear[year] = getUSHolidays(year);
		}

		if (isWorkDay(current, workingDaysPerWeek, overridesMap, holidaysByYear[year])) {
			if (!start) {
				start = formatDateInputValue(current);
			}

			workDaysCounted++;
			if (workDaysCounted === totalDays) {
				return { start, end: formatDateInputValue(current) };
			}
		}

		current = addDays(current, 1);
	}

	return null;
};
