function Home() {
	return (
		<div
			style={{
				paddingTop: "var(--spacing-3xl)",
				paddingLeft: "var(--spacing-lg)",
				paddingRight: "var(--spacing-lg)",
				paddingBottom: "var(--spacing-lg)",
				width: "100%",
				minHeight: "calc(100vh - 70px)",
				background:
					"linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-light) 100%)",
			}}
		>
			<div
				style={{
					padding: "var(--spacing-2xl)",
					textAlign: "center",
					maxWidth: "800px",
					margin: "0 auto",
					backgroundColor: "white",
					borderRadius: "var(--radius-xl)",
					boxShadow: "var(--shadow-md)",
				}}
			>
				<img
					src="src/images/Access.png"
					alt="Access Parks Logo"
					style={{
						width: "100px",
						maxWidth: "100%",
						marginBottom: "var(--spacing-xl)",
						filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
					}}
				/>
				<h1
					style={{
						fontSize: "var(--font-size-3xl)",
						marginBottom: "var(--spacing-lg)",
						color: "var(--color-dark-bg)",
					}}
				>
					AccessParks Circuits
				</h1>
				<p
					style={{
						fontSize: "var(--font-size-lg)",
						color: "var(--color-text-muted)",
						marginBottom: "var(--spacing-xl)",
					}}
				>
					Welcome to the AccessParks Circuit Management System
				</p>
				<p
					style={{
						fontSize: "var(--font-size-base)",
						color: "var(--color-text-dark)",
						lineHeight: 1.8,
					}}
				>
					Select an option from the top menu to get started.
				</p>
			</div>
		</div>
	);
}

export default Home;
