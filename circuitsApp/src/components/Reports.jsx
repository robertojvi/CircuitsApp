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
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ChartDataLabels
);

function Reports() {
	const [selectedMenu, setSelectedMenu] = useState("Circuit Analytics");
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (selectedMenu === "Circuit Analytics") {
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

		// Sort bandwidths by capacity
		const sortedEntries = Object.entries(distribution).sort((a, b) => {
			// Convert bandwidth strings to numbers for comparison
			const getNumericValue = (str) => {
				const num = parseInt(str);
				if (str.toLowerCase().includes("gb")) return num * 1000;
				if (str.toLowerCase().includes("mb")) return num;
				return num;
			};
			return getNumericValue(b[0]) - getNumericValue(a[0]);
		});

		return {
			labels: sortedEntries.map(([key]) => key),
			datasets: [
				{
					label: "Number of Sites",
					data: sortedEntries.map(([, value]) => value),
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

		if (selectedMenu === "Circuit Analytics") {
			return (
				<div style={{ width: "100%" }}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "40px",
							width: "100%",
						}}
					>
						<div>
							<h2
								style={{
									marginBottom: "20px",
									color: "#ffffff",
									backgroundColor: "#2c3e50",
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								Bandwidth Distribution
							</h2>
							<div
								style={{
									backgroundColor: "#f8f9fa",
									padding: "20px",
									borderRadius: "8px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
									height: "300px",
									margin: "0 auto",
									maxWidth: "800px",
									width: "100%",
									"@media (max-width: 768px)": {
										padding: "10px",
										height: "250px",
									},
								}}
							>
								<Bar
									data={getBandwidthDistribution()}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: {
												position: "top",
												labels: {
													boxWidth: 20,
													font: { size: 12 },
												},
											},
											title: {
												display: true,
												text: "Sites per Bandwidth",
												font: { size: 14 },
											},
											datalabels: {
												color: "#2c3e50",
												anchor: "end",
												align: "top",
												offset: 4,
												font: {
													size: 12,
													weight: "bold",
												},
												formatter: (value) => value,
											},
										},
										scales: {
											y: {
												beginAtZero: true,
												ticks: {
													stepSize: 1,
													font: { size: 11 },
												},
											},
											x: {
												ticks: {
													font: { size: 11 },
												},
											},
										},
									}}
								/>
							</div>
						</div>
						<div>
							<h2
								style={{
									marginBottom: "20px",
									color: "#ffffff",
									backgroundColor: "#2c3e50",
									padding: "10px 20px",
									borderRadius: "4px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								Provider Distribution
							</h2>
							<div
								style={{
									backgroundColor: "#f8f9fa",
									padding: "20px",
									borderRadius: "8px",
									boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
									height: "300px",
									margin: "0 auto",
									maxWidth: "800px",
									width: "100%",
									"@media (max-width: 768px)": {
										padding: "10px",
										height: "250px",
									},
								}}
							>
								<Bar
									data={getProviderDistribution()}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: { position: "top" },
											title: {
												display: true,
												text: "Sites per Provider",
											},
											datalabels: {
												color: "#2c3e50",
												anchor: "end",
												align: "top",
												offset: 4,
												font: {
													size: 12,
													weight: "bold",
												},
												formatter: (value) => value,
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

	const responsiveChartContainer = {
		width: "96%",
		padding: "15px",
		"@media (max-width: 768px)": {
			padding: "10px",
		},
	};

	const responsiveNavStyle = {
		width: "150px",
		minHeight: "calc(100vh - 50px)",
		backgroundColor: "#2c3e50",
		padding: "20px",
		position: "fixed",
		left: 0,
		top: "50px",
		zIndex: 999,
		"@media (max-width: 768px)": {
			width: "70%",
			position: "static",
			minHeight: "auto",
		},
	};

	const responsiveContentStyle = {
		marginLeft: "150px",
		padding: "20px",
		flex: 1,
		"@media (max-width: 768px)": {
			marginLeft: 0,
		},
	};

	return (
		<div
			style={{
				paddingTop: "50px",
				display: "flex",
				width: "94%",
				flexDirection: "column",
			}}
		>
			<nav style={responsiveNavStyle}>
				<ul
					style={{
						listStyle: "none",
						padding: 0,
						color: "#ecf0f1",
						fontSize: "16px",
					}}
				>
					{["Circuit Analytics"].map((item) => (
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
					))}
				</ul>
			</nav>
			<div style={responsiveContentStyle}>
				<div style={responsiveChartContainer}>{renderContent()}</div>
			</div>
		</div>
	);
}

export default Reports;
