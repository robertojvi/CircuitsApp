// Scope of work categories shared between the Scope of Work and Construction Progress tabs.
// `key` must match the camelCase field prefix on ProjectScopeOfWork / ProjectScopeOfWorkDTO
// (e.g. "headend" -> headendQuantity) on the backend.
export const SCOPE_CATEGORIES = [
	{ key: "headend", name: "Headend" },
	{ key: "bnOrDn", name: "BN or DN" },
	{ key: "pointToPoint", name: "Point To Point" },
	{ key: "outdoorIndoorAp", name: "Outdoor/Indoor AP" },
	{ key: "cnOrRn", name: "CN or RN" },
	{ key: "directBurialPolesElectrical", name: "Direct Burial Poles + Electrical" },
	{ key: "poleTestTurnUp", name: "Pole Test and Turn Up" },
	{ key: "directBurialFiber", name: "Direct Burial Fiber" },
	{ key: "conduit", name: "Conduit" },
	{ key: "fiberPull", name: "Fiber Pull" },
	{ key: "breakerDisconnects", name: "Breaker Disconnects" },
	{ key: "cameras", name: "Cameras" },
	{ key: "nemaElectrical", name: "NEMA-Electrical" },
	{ key: "homeInstalls", name: "Home Installs" },
	{ key: "inventory", name: "Inventory" },
	{ key: "vaults", name: "Vaults" },
	{ key: "testing", name: "Testing" },
];

export const quantityField = (key) => `${key}Quantity`;

// Post-construction phases tracked alongside the scope categories.
// `key` must match the camelCase field prefix on ProjectScopeOfWork / ProjectScopeOfWorkDTO
// (e.g. "softLaunch" -> softLaunchDays) on the backend.
export const PHASE_CATEGORIES = [
	{ key: "softLaunch", name: "Soft-Launch" },
	{ key: "goLive", name: "Go-Live" },
];

export const daysField = (key) => `${key}Days`;

export const PROGRESS_STATUSES = [
	{ value: "PENDING", label: "Pending" },
	{ value: "PARTIAL", label: "Partially Complete" },
	{ value: "COMPLETE", label: "Complete" },
];
