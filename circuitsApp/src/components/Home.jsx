function Home() {
	return (
		<div
			style={{
				paddingTop: "50px",
				width: "100%",
				minHeight: "calc(100vh - 50px)",
			}}
		>
			<div
				style={{
					padding: "20px",
					textAlign: "center",
					maxWidth: "800px",
					margin: "0 auto",
				}}
			>
				<img
					src="src/images/Access.png"
					alt="Access Parks Logo"
					style={{
						width: "100px",
						maxWidth: "100%",
						marginBottom: "20px",
					}}
				/>
				<h1 style={{ fontSize: "calc(1.5rem + 1vw)" }}>AccessParks Circuits</h1>
				<h3 style={{ fontSize: "calc(1rem + 0.5vw)" }}>
					Select an Option from the top Menu
				</h3>
			</div>
		</div>
	);
}

export default Home;
