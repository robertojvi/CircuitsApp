// Thin fetch wrappers for the Project Management API (/api/project-management, /api/project-updates).
// Each function takes the auth token plus whatever data it needs and returns parsed JSON,
// throwing an Error with the server's message on failure.

const authHeaders = (token) => ({
	Authorization: `Bearer ${token}`,
});

const jsonHeaders = (token) => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${token}`,
});

const handleResponse = async (response, fallbackMessage) => {
	if (!response.ok) {
		let message = fallbackMessage;
		try {
			const data = await response.json();
			message = data?.error || data?.message || fallbackMessage;
		} catch {
			// response body wasn't JSON - keep fallback message
		}
		throw new Error(message);
	}

	if (response.status === 204) {
		return null;
	}

	return response.json();
};

export const getProjectData = async (token, siteId) => {
	const response = await fetch(`/api/project-management/site/${siteId}`, {
		headers: authHeaders(token),
	});
	return handleResponse(response, "Failed to load project data");
};

export const saveScopeOfWork = async (token, siteId, dto) => {
	const response = await fetch(`/api/project-management/scope/${siteId}`, {
		method: "PUT",
		headers: jsonHeaders(token),
		body: JSON.stringify(dto),
	});
	return handleResponse(response, "Failed to save scope of work");
};

export const saveTimeline = async (token, siteId, dto) => {
	const response = await fetch(`/api/project-management/timeline/${siteId}`, {
		method: "PUT",
		headers: jsonHeaders(token),
		body: JSON.stringify(dto),
	});
	return handleResponse(response, "Failed to save timeline");
};

export const addDelay = async (token, siteId, dto) => {
	const response = await fetch(`/api/project-management/delays/${siteId}`, {
		method: "POST",
		headers: jsonHeaders(token),
		body: JSON.stringify(dto),
	});
	return handleResponse(response, "Failed to add delay");
};

export const deleteDelay = async (token, delayId) => {
	const response = await fetch(`/api/project-management/delays/${delayId}`, {
		method: "DELETE",
		headers: authHeaders(token),
	});
	return handleResponse(response, "Failed to delete delay");
};

export const saveWorkDayOverride = async (token, siteId, dto) => {
	const response = await fetch(`/api/project-management/workday-overrides/${siteId}`, {
		method: "PUT",
		headers: jsonHeaders(token),
		body: JSON.stringify(dto),
	});
	return handleResponse(response, "Failed to save work day override");
};

export const deleteWorkDayOverride = async (token, id) => {
	const response = await fetch(`/api/project-management/workday-overrides/${id}`, {
		method: "DELETE",
		headers: authHeaders(token),
	});
	return handleResponse(response, "Failed to delete work day override");
};

export const saveProgressItems = async (token, siteId, items) => {
	const response = await fetch(`/api/project-management/progress/${siteId}`, {
		method: "PUT",
		headers: jsonHeaders(token),
		body: JSON.stringify(items),
	});
	return handleResponse(response, "Failed to save construction progress");
};

export const getUpdates = async (token, siteId) => {
	const response = await fetch(`/api/project-updates/site/${siteId}`, {
		headers: authHeaders(token),
	});
	return handleResponse(response, "Failed to load updates");
};

export const createUpdate = async (token, formData) => {
	const response = await fetch("/api/project-updates", {
		method: "POST",
		headers: authHeaders(token),
		body: formData,
	});
	return handleResponse(response, "Failed to create update");
};

export const updateUpdate = async (token, id, formData) => {
	const response = await fetch(`/api/project-updates/${id}`, {
		method: "PUT",
		headers: authHeaders(token),
		body: formData,
	});
	return handleResponse(response, "Failed to update entry");
};

export const deleteUpdate = async (token, id) => {
	const response = await fetch(`/api/project-updates/${id}`, {
		method: "DELETE",
		headers: authHeaders(token),
	});
	return handleResponse(response, "Failed to delete update");
};

export const deleteUpdateImage = async (token, imageId) => {
	const response = await fetch(`/api/project-updates/image/${imageId}`, {
		method: "DELETE",
		headers: authHeaders(token),
	});
	return handleResponse(response, "Failed to delete image");
};
