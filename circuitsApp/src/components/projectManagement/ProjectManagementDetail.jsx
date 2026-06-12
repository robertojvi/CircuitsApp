import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProjectData } from "../../utils/projectManagementApi";
import ScopeOfWork from "./ScopeOfWork";
import Timeline from "./Timeline";
import ConstructionProgress from "./ConstructionProgress";
import Updates from "./Updates";

const MENU_ITEMS = [
	"Scope of Work",
	"Timeline",
	"Construction Progress",
	"Updates",
];

function ProjectManagementDetail() {
	const { siteId } = useParams();
	const { token, user } = useAuth();

	const [selectedMenu, setSelectedMenu] = useState(MENU_ITEMS[0]);
	const [site, setSite] = useState(null);
	const [projectData, setProjectData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const canEdit = !!user && (user.role === "SUPER" || user.role === "ADMIN");

	const fetchAll = useCallback(async () => {
		try {
			const [siteResponse, projectDataResult] = await Promise.all([
				fetch(`/api/sites/${siteId}`, {
					headers: { Authorization: `Bearer ${token}` },
				}),
				getProjectData(token, siteId),
			]);

			if (!siteResponse.ok) {
				throw new Error(`HTTP error! status: ${siteResponse.status}`);
			}

			setSite(await siteResponse.json());
			setProjectData(projectDataResult);
			setError("");
		} catch (err) {
			console.error("Error loading project:", err);
			setError(err.message || "Failed to load project");
		} finally {
			setLoading(false);
		}
	}, [siteId, token]);

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	const responsiveNavStyle = {
		width: "220px",
		minHeight: "calc(100vh - 70px)",
		backgroundColor: "var(--color-dark-bg)",
		padding: "var(--spacing-lg)",
		zIndex: 999,
		borderRadius: "var(--radius-lg)",
		boxShadow: "var(--shadow-md)",
	};

	const responsiveContentStyle = {
		padding: "var(--spacing-lg)",
		paddingTop: "60px",
		flex: 1,
		minWidth: 0,
	};

	const renderContent = () => {
		if (loading) {
			return <h1>Loading...</h1>;
		}

		if (error) {
			return (
				<div style={{ color: "var(--color-danger)" }}>{error}</div>
			);
		}

		const sharedProps = {
			siteId: Number(siteId),
			projectData,
			canEdit,
			onRefresh: fetchAll,
		};

		switch (selectedMenu) {
			case "Scope of Work":
				return <ScopeOfWork {...sharedProps} />;
			case "Timeline":
				return <Timeline {...sharedProps} />;
			case "Construction Progress":
				return <ConstructionProgress {...sharedProps} />;
			case "Updates":
				return <Updates {...sharedProps} />;
			default:
				return null;
		}
	};

	return (
		<div
			className="app-side-page"
			style={{
				width: "100%",
				backgroundColor: "var(--color-surface)",
				minHeight: "100vh",
			}}
		>
			<nav className="app-side-nav" style={responsiveNavStyle}>
				<Link
					to="/project-management"
					style={{
						display: "block",
						marginBottom: "var(--spacing-lg)",
						color: "var(--color-sidebar-text)",
						textDecoration: "none",
						fontSize: "14px",
					}}
				>
					&larr; Back to sites
				</Link>
				<div
					style={{
						color: "var(--color-sidebar-text)",
						fontSize: "18px",
						fontWeight: "700",
						marginBottom: "var(--spacing-lg)",
						wordBreak: "break-word",
					}}
				>
					{site?.name || "Project"}
				</div>
				<ul
					style={{
						listStyle: "none",
						padding: 0,
						color: "var(--color-sidebar-text)",
						fontSize: "16px",
					}}
				>
					{MENU_ITEMS.map((item) => (
						<li
							key={item}
							style={{
								marginBottom: "15px",
								padding: "10px",
								cursor: "pointer",
								backgroundColor:
									selectedMenu === item
										? "var(--color-dark-bg-secondary)"
										: "transparent",
								transition: "all var(--transition-fast)",
								borderRadius: "var(--radius-md)",
							}}
							onClick={() => setSelectedMenu(item)}
						>
							{item}
						</li>
					))}
				</ul>
			</nav>
			<div className="app-side-page-content" style={responsiveContentStyle}>
				{renderContent()}
			</div>
		</div>
	);
}

export default ProjectManagementDetail;
