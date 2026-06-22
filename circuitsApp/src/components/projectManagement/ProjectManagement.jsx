import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function ProjectManagement() {
	const { token } = useAuth();
	const { theme } = useTheme();
	const navigate = useNavigate();

	const [sites, setSites] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [sortColumn, setSortColumn] = useState("name");
	const [sortDirection, setSortDirection] = useState("asc");

	const handleSort = (column) => {
		if (sortColumn === column) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	useEffect(() => {
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
			} catch (err) {
				console.error("Error fetching sites:", err);
				setError("Failed to load sites");
			} finally {
				setLoading(false);
			}
		};

		fetchSites();
	}, [token]);

	const filteredSites = sites.filter((site) => {
		const term = searchTerm.toLowerCase();
		return (
			(site.name || "").toLowerCase().includes(term) ||
			(site.address || "").toLowerCase().includes(term) ||
			(site.city || "").toLowerCase().includes(term) ||
			(site.state || "").toLowerCase().includes(term)
		);
	});

	const sortedSites = [...filteredSites].sort((a, b) => {
		const aVal = (a[sortColumn] || "").toString().toLowerCase();
		const bVal = (b[sortColumn] || "").toString().toLowerCase();
		const cmp = aVal.localeCompare(bVal);
		return sortDirection === "asc" ? cmp : -cmp;
	});

	const tableHeaderStyle = {
		padding: "var(--spacing-lg)",
		textAlign: "left",
		color: "#ffffff",
		fontWeight: "700",
		fontSize: "var(--font-size-sm)",
		textTransform: "uppercase",
		letterSpacing: "0.5px",
		boxShadow: "none",
	};

	const sortableHeaderStyle = {
		...tableHeaderStyle,
		cursor: "pointer",
		userSelect: "none",
		whiteSpace: "nowrap",
	};

	const getSortIndicator = (column) => {
		if (sortColumn !== column) return " ↕";
		return sortDirection === "asc" ? " ↑" : " ↓";
	};

	const tableCellStyle = {
		padding: "var(--spacing-lg)",
		color: theme === "light" ? "#2c3e50" : "#ecf0f1",
		fontWeight: "500",
		backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
	};

	if (loading) {
		return <h1>Loading...</h1>;
	}

	return (
		<div>
			<h1 style={{ marginBottom: "var(--spacing-lg)" }}>Project Management</h1>

			{error && (
				<div
					style={{
						color: "var(--color-danger)",
						marginBottom: "var(--spacing-md)",
					}}
				>
					{error}
				</div>
			)}

			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "var(--spacing-md)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				<input
					type="text"
					placeholder="Search sites..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					style={{
						padding: "8px 12px",
						borderRadius: "4px",
						width: "300px",
						fontSize: "var(--font-size-base)",
						backgroundColor: theme === "light" ? "#ffffff" : "var(--color-surface)",
						color: theme === "light" ? "#1a1a1a" : "#ecf0f1",
						border: `1px solid ${theme === "light" ? "#bdbdbd" : "var(--color-border)"}`,
					}}
				/>
				<span
					style={{
						fontSize: "var(--font-size-sm)",
						color: theme === "light" ? "#64748b" : "#95a5a6",
						fontWeight: "500",
					}}
				>
					{filteredSites.length} {filteredSites.length === 1 ? "site" : "sites"}
					{searchTerm && ` matching "${searchTerm}"`}
				</span>
			</div>

			<div
				style={{
					width: "100%",
					overflowX: "auto",
					borderRadius: "var(--radius-lg)",
					border: "1px solid var(--color-border-light)",
					boxShadow: "var(--shadow-sm)",
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
							position: "sticky",
							top: 0,
							zIndex: 1,
							backgroundColor: "var(--color-table-header-bg)",
							borderBottom: "3px solid var(--color-primary)",
						}}
					>
						<tr>
							<th style={sortableHeaderStyle} onClick={() => handleSort("name")}>
								Site Name{getSortIndicator("name")}
							</th>
							<th style={sortableHeaderStyle} onClick={() => handleSort("address")}>
								Address{getSortIndicator("address")}
							</th>
							<th style={sortableHeaderStyle} onClick={() => handleSort("city")}>
								City{getSortIndicator("city")}
							</th>
							<th style={sortableHeaderStyle} onClick={() => handleSort("state")}>
								State{getSortIndicator("state")}
							</th>
							<th style={sortableHeaderStyle} onClick={() => handleSort("siteType")}>
								Site Type{getSortIndicator("siteType")}
							</th>
							<th style={tableHeaderStyle}></th>
						</tr>
					</thead>
					<tbody>
						{sortedSites.map((site) => (
							<tr
								key={site.id}
								style={{
									borderBottom: `1px solid ${theme === "light" ? "#dee2e6" : "var(--color-border)"}`,
								}}
							>
								<td style={tableCellStyle}>{site.name}</td>
								<td style={tableCellStyle}>{site.address}</td>
								<td style={tableCellStyle}>{site.city}</td>
								<td style={tableCellStyle}>{site.state}</td>
								<td style={tableCellStyle}>{site.siteType || "N/A"}</td>
								<td style={tableCellStyle}>
									<button
										onClick={() => navigate(`/project-management/${site.id}`)}
										className="btn btn-primary"
										style={{ fontSize: "13px", padding: "6px 12px" }}
									>
										Manage Project
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default ProjectManagement;
