import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getUpdates, createUpdate, deleteUpdate, deleteUpdateImage } from "../../utils/projectManagementApi";

const todayString = () => new Date().toISOString().slice(0, 10);

function Updates({ siteId, canEdit }) {
	const { token } = useAuth();
	const { theme } = useTheme();

	const [updates, setUpdates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [saving, setSaving] = useState(false);

	const [updateDate, setUpdateDate] = useState(todayString());
	const [text, setText] = useState("");
	const [files, setFiles] = useState([]);

	const fetchUpdates = useCallback(async () => {
		try {
			const data = await getUpdates(token, siteId);
			setUpdates(data || []);
			setError("");
		} catch (err) {
			console.error("Error fetching updates:", err);
			setError(err.message || "Failed to load updates");
		} finally {
			setLoading(false);
		}
	}, [token, siteId]);

	useEffect(() => {
		fetchUpdates();
	}, [fetchUpdates]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			const formData = new FormData();
			formData.append("siteId", siteId);
			formData.append("updateDate", updateDate);
			formData.append("text", text);
			for (const file of files) {
				formData.append("images", file);
			}

			await createUpdate(token, formData);
			setText("");
			setFiles([]);
			setUpdateDate(todayString());
			setSuccess("Update posted.");
			await fetchUpdates();
		} catch (err) {
			console.error("Error posting update:", err);
			setError(err.message || "Failed to post update");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteUpdate = async (id) => {
		setError("");
		try {
			await deleteUpdate(token, id);
			await fetchUpdates();
		} catch (err) {
			console.error("Error deleting update:", err);
			setError(err.message || "Failed to delete update");
		}
	};

	const handleDeleteImage = async (imageId) => {
		setError("");
		try {
			await deleteUpdateImage(token, imageId);
			await fetchUpdates();
		} catch (err) {
			console.error("Error deleting image:", err);
			setError(err.message || "Failed to delete image");
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

	return (
		<div>
			<h1 style={{ marginBottom: "var(--spacing-md)" }}>Updates</h1>

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

			{canEdit && (
				<div style={cardStyle}>
					<form onSubmit={handleSubmit}>
						<div style={{ marginBottom: "var(--spacing-md)" }}>
							<label style={{ fontWeight: "600" }}>
								<div style={{ marginBottom: "4px" }}>Date</div>
								<input
									type="date"
									value={updateDate}
									onChange={(e) => setUpdateDate(e.target.value)}
									style={inputStyle}
								/>
							</label>
						</div>

						<div style={{ marginBottom: "var(--spacing-md)" }}>
							<label style={{ fontWeight: "600" }}>
								<div style={{ marginBottom: "4px" }}>Update Details</div>
								<textarea
									rows={10}
									value={text}
									onChange={(e) => setText(e.target.value)}
									style={{ ...inputStyle, width: "100%", resize: "vertical", fontFamily: "inherit" }}
								/>
							</label>
						</div>

						<div style={{ marginBottom: "var(--spacing-md)" }}>
							<label style={{ fontWeight: "600" }}>
								<div style={{ marginBottom: "4px" }}>Images</div>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={(e) => setFiles(Array.from(e.target.files || []))}
								/>
							</label>
						</div>

						<button type="submit" className="btn btn-primary" disabled={saving}>
							{saving ? "Posting..." : "Post Update"}
						</button>
					</form>
				</div>
			)}

			{loading ? (
				<h1>Loading...</h1>
			) : updates.length === 0 ? (
				<p>No updates posted yet.</p>
			) : (
				updates.map((update) => (
					<div key={update.id} style={cardStyle}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)" }}>
							<div style={{ fontWeight: "700", fontSize: "var(--font-size-lg)" }}>{update.updateDate}</div>
							{canEdit && (
								<button
									onClick={() => handleDeleteUpdate(update.id)}
									className="btn btn-ghost"
									style={{ fontSize: "12px", padding: "4px 8px" }}
								>
									🗑️ Delete
								</button>
							)}
						</div>

						{update.text && (
							<p style={{ whiteSpace: "pre-wrap", marginBottom: "var(--spacing-md)" }}>{update.text}</p>
						)}

						{update.images && update.images.length > 0 && (
							<div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-md)" }}>
								{update.images.map((image) => (
									<div key={image.id} style={{ position: "relative" }}>
										<img
											src={image.imageUrl}
											alt={image.fileName || "Update image"}
											style={{ width: "160px", height: "160px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
										/>
										{canEdit && (
											<button
												onClick={() => handleDeleteImage(image.id)}
												className="btn btn-ghost"
												style={{
													position: "absolute",
													top: "4px",
													right: "4px",
													fontSize: "11px",
													padding: "2px 6px",
													backgroundColor: "rgba(0,0,0,0.6)",
													color: "#fff",
												}}
											>
												✕
											</button>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				))
			)}
		</div>
	);
}

export default Updates;
