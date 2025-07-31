import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

function Reports() {
	const [selectedMenu, setSelectedMenu] = useState("Usage Analytics");
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (selectedMenu === "Usage Analytics") {
			fetchCircuits();
		}
	}, [selectedMenu]);

	const fetchCircuits = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/circuits");
			const data = await response.json();
			setCircuits(data);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load circuits");
		} finally {
			setLoading(false);
		}
	};

	const getBandwidthDistribution = () => {
		const distribution = circuits.reduce((acc, circuit) => {
			acc[circuit.circuitBandwidth] = (acc[circuit.circuitBandwidth] || 0) + 1;
			return acc;
		}, {});

		return {
			labels: Object.keys(distribution),
			datasets: [
				{
					label: "Number of Sites",
					data: Object.values(distribution),
					backgroundColor: "#3498db",
					borderColor: "#2980b9",
					borderWidth: 1,
				},
			],
		};
	};

	const getProviderDistribution = () => {
		const distribution = circuits.reduce((acc, circuit) => {
			acc[circuit.provider.name] = (acc[circuit.provider.name] || 0) + 1;
			return acc;
		}, {});

		return {
			labels: Object.keys(distribution),
			datasets: [
				{
					label: "Sites per Provider",
					data: Object.values(distribution),
					backgroundColor: "#2ecc71",
					borderColor: "#27ae60",
					borderWidth: 1,
				},
			],
		};
	};

	const renderContent = () => {
		if (loading) return <div>Loading...</div>;
		if (error) return <div style={{ color: "red" }}>{error}</div>;

		if (selectedMenu === "Usage Analytics") {
			return (
				<div style={{ padding: "20px" }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "20px",
							marginBottom: "20px",
						}}
					>
						<div>
							<h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>
								Bandwidth Distribution
							</h2>
							<div
								style={{
									backgroundColor: "#f8f9fa",
									padding: "20px",
									borderRadius: "8px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								<Bar
									data={getBandwidthDistribution()}
									options={{
										responsive: true,
										plugins: {
											legend: { position: "top" },
											title: {
												display: true,
												text: "Sites per Bandwidth",
											},
										},
										scales: {
											y: {
												beginAtZero: true,
												ticks: { stepSize: 1 },
											},
										},
									}}
								/>
							</div>
						</div>
						<div>
							<h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>
								Provider Distribution
							</h2>
							<div
								style={{
									backgroundColor: "#f8f9fa",
									padding: "20px",
									borderRadius: "8px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								<Bar
									data={getProviderDistribution()}
									options={{
										responsive: true,
										plugins: {
											legend: { position: "top" },
											title: {
												display: true,
												text: "Sites per Provider",
											},
										},
										scales: {
											y: {
												beginAtZero: true,
												ticks: { stepSize: 1 },
											},
										},
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			);
		}

		return <h1>{selectedMenu}</h1>;
	};

	return (
		<div style={{ paddingTop: "50px", display: "flex", width: "100%" }}>
			<nav
				style={{
					width: "250px",
					minHeight: "calc(100vh - 50px)",
					backgroundColor: "#2c3e50",
					padding: "20px",
					position: "fixed",
					left: 0,
					top: "50px",
					zIndex: 999,
				}}
			>
				<ul
					style={{
						listStyle: "none",
						padding: 0,
						color: "#ecf0f1",
						fontSize: "16px",
					}}
				>
					{["Usage Analytics", "Performance Metrics", "System Logs"].map(
						(item) => (
							<li
								key={item}
								style={{
									marginBottom: "15px",
									padding: "10px",
									cursor: "pointer",
									backgroundColor:
										selectedMenu === item ? "#34495e" : "transparent",
								}}
								onClick={() => setSelectedMenu(item)}
							>
								{item}
							</li>
						)
					)}
				</ul>
			</nav>
			<div style={{ marginLeft: "250px", padding: "20px", flex: 1 }}>
				{renderContent()}
			</div>
		</div>
	);
}

export default Reports;
