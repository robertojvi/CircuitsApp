import { useState, useEffect } from "react";

const CreateSiteModal = ({ onClose, onSubmit, newSite, setNewSite }) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1000,
		}}
	>
		<div
			style={{
				backgroundColor: "white",
				padding: "20px",
				borderRadius: "8px",
				width: "90%",
				maxWidth: "400px",
				margin: "20px",
			}}
		>
			<h2
				style={{
					marginBottom: "20px",
					backgroundColor: "#2c3e50",
					color: "white",
					padding: "10px 20px",
					borderRadius: "4px",
					textAlign: "center",
				}}
			>
				Create New Site
			</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Name"
						value={newSite.name}
						onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={newSite.siteType}
						onChange={(e) =>
							setNewSite({ ...newSite, siteType: e.target.value })
						}
						style={inputStyle}
						required
					>
						<option value="">Select Site Type</option>
						<option value="MHC">MHC</option>
						<option value="RV">RV</option>
						<option value="Hybrid">Hybrid</option>
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Address"
						value={newSite.address}
						onChange={(e) =>
							setNewSite({ ...newSite, address: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="City"
						value={newSite.city}
						onChange={(e) => setNewSite({ ...newSite, city: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="State"
						value={newSite.state}
						onChange={(e) => setNewSite({ ...newSite, state: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Zip Code"
						value={newSite.zipCode}
						onChange={(e) =>
							setNewSite({ ...newSite, zipCode: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div
					style={{
						marginBottom: "20px",
						borderTop: "1px solid #eee",
						paddingTop: "15px",
					}}
				>
					<h3
						style={{
							marginBottom: "15px",
							color: "#2c3e50",
							fontSize: "16px",
						}}
					>
						Primary Contact
					</h3>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="text"
							placeholder="Primary Contact Name"
							value={newSite.primaryName}
							onChange={(e) =>
								setNewSite({ ...newSite, primaryName: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="email"
							placeholder="Primary Contact Email"
							value={newSite.primaryEmail}
							onChange={(e) =>
								setNewSite({ ...newSite, primaryEmail: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="tel"
							placeholder="Primary Contact Phone"
							value={newSite.primaryPhone}
							onChange={(e) =>
								setNewSite({ ...newSite, primaryPhone: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
				</div>
				<div
					style={{
						marginBottom: "20px",
						borderTop: "1px solid #eee",
						paddingTop: "15px",
					}}
				>
					<h3
						style={{
							marginBottom: "15px",
							color: "#2c3e50",
							fontSize: "16px",
						}}
					>
						Secondary Contact
					</h3>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="text"
							placeholder="Secondary Contact Name"
							value={newSite.secondaryName}
							onChange={(e) =>
								setNewSite({ ...newSite, secondaryName: e.target.value })
							}
							style={inputStyle}
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="email"
							placeholder="Secondary Contact Email"
							value={newSite.secondaryEmail}
							onChange={(e) =>
								setNewSite({ ...newSite, secondaryEmail: e.target.value })
							}
							style={inputStyle}
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="tel"
							placeholder="Secondary Contact Phone"
							value={newSite.secondaryPhone}
							onChange={(e) =>
								setNewSite({ ...newSite, secondaryPhone: e.target.value })
							}
							style={inputStyle}
						/>
					</div>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{ ...buttonStyle, backgroundColor: "#9CA3AF" }}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{ ...buttonStyle, backgroundColor: "#4299E1" }}
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
);

const CreateProviderModal = ({
	onClose,
	onSubmit,
	newProvider,
	setNewProvider,
}) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1000,
		}}
	>
		<div
			style={{
				backgroundColor: "white",
				padding: "20px",
				borderRadius: "8px",
				width: "90%",
				maxWidth: "400px",
				margin: "20px",
			}}
		>
			<h2
				style={{
					marginBottom: "20px",
					backgroundColor: "#2c3e50",
					color: "white",
					padding: "10px 20px",
					borderRadius: "4px",
					textAlign: "center",
				}}
			>
				Create New Provider
			</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Name"
						value={newProvider.name}
						onChange={(e) =>
							setNewProvider({ ...newProvider, name: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Address"
						value={newProvider.address}
						onChange={(e) =>
							setNewProvider({ ...newProvider, address: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="City"
						value={newProvider.city}
						onChange={(e) =>
							setNewProvider({ ...newProvider, city: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="State"
						value={newProvider.state}
						onChange={(e) =>
							setNewProvider({ ...newProvider, state: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Zip Code"
						value={newProvider.zipCode}
						onChange={(e) =>
							setNewProvider({ ...newProvider, zipCode: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="tel"
						placeholder="Contact Number"
						value={newProvider.contactNumber}
						onChange={(e) =>
							setNewProvider({ ...newProvider, contactNumber: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{ ...buttonStyle, backgroundColor: "#9CA3AF" }}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{ ...buttonStyle, backgroundColor: "#4299E1" }}
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
);

const CreateCircuitModal = ({
	onClose,
	onSubmit,
	newCircuit,
	setNewCircuit,
	sites,
	providers,
}) => {
	const sortedSites = [...sites].sort((a, b) =>
		a.name.toLowerCase().localeCompare(b.name.toLowerCase())
	);

	const sortedProviders = [...providers].sort((a, b) =>
		a.name.toLowerCase().localeCompare(b.name.toLowerCase())
	);

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0,0,0,0.5)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				zIndex: 1000,
			}}
		>
			<div
				style={{
					backgroundColor: "white",
					padding: "20px",
					borderRadius: "8px",
					width: "90%",
					maxWidth: "400px",
					margin: "20px",
				}}
			>
				<h2
					style={{
						marginBottom: "20px",
						backgroundColor: "#2c3e50",
						color: "white",
						padding: "10px 20px",
						borderRadius: "4px",
						textAlign: "center",
					}}
				>
					Create New Circuit
				</h2>
				<form onSubmit={onSubmit}>
					<div style={{ marginBottom: "15px" }}>
						<select
							value={newCircuit.site?.id || ""}
							onChange={(e) =>
								setNewCircuit({
									...newCircuit,
									site: { id: Number(e.target.value) },
								})
							}
							style={inputStyle}
							required
						>
							<option value="">Select Site</option>
							{sortedSites.map((site) => (
								<option key={site.id} value={site.id}>
									{site.name}
								</option>
							))}
						</select>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<select
							value={newCircuit.provider?.id || ""}
							onChange={(e) =>
								setNewCircuit({
									...newCircuit,
									provider: { id: Number(e.target.value) },
								})
							}
							style={inputStyle}
							required
						>
							<option value="">Select Provider</option>
							{sortedProviders.map((provider) => (
								<option key={provider.id} value={provider.id}>
									{provider.name}
								</option>
							))}
						</select>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="text"
							placeholder="Account Number"
							value={newCircuit.accountNumber || ""}
							onChange={(e) =>
								setNewCircuit({ ...newCircuit, accountNumber: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="text"
							placeholder="Circuit ID"
							value={newCircuit.circuitId || ""}
							onChange={(e) =>
								setNewCircuit({ ...newCircuit, circuitId: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="text"
							placeholder="Bandwidth"
							value={newCircuit.circuitBandwidth || ""}
							onChange={(e) =>
								setNewCircuit({
									...newCircuit,
									circuitBandwidth: e.target.value,
								})
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="number"
							placeholder="Monthly Cost"
							value={newCircuit.monthlyCost || ""}
							onChange={(e) =>
								setNewCircuit({
									...newCircuit,
									monthlyCost: Number(e.target.value),
								})
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "5px",
								fontSize: "14px",
								fontWeight: "500",
								color: "#3498db", // Added blue color for better visibility
								backgroundColor: "#f8f9fa", // Added light background
								padding: "3px 5px",
								borderRadius: "3px",
							}}
						>
							Installation Date
						</label>
						<input
							type="date"
							placeholder="Installation Date"
							value={newCircuit.installationDate || ""}
							onChange={(e) =>
								setNewCircuit({
									...newCircuit,
									installationDate: e.target.value,
								})
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "5px",
								fontSize: "14px",
								fontWeight: "500",
								color: "#3498db", // Added blue color for better visibility
								backgroundColor: "#f8f9fa", // Added light background
								padding: "3px 5px",
								borderRadius: "3px",
							}}
						>
							Expiration Date
						</label>
						<input
							type="date"
							placeholder="Expiration Date"
							value={newCircuit.expirationDate || ""}
							onChange={(e) =>
								setNewCircuit({ ...newCircuit, expirationDate: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<select
							value={newCircuit.status || ""}
							onChange={(e) =>
								setNewCircuit({ ...newCircuit, status: e.target.value })
							}
							style={inputStyle}
							required
						>
							<option value="">Select Status</option>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
							<option value="Pending">Pending</option>
						</select>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<select
							value={newCircuit.circuitType || ""}
							onChange={(e) =>
								setNewCircuit({ ...newCircuit, circuitType: e.target.value })
							}
							style={inputStyle}
							required
						>
							<option value="">Select Circuit Type</option>
							<option value="Fiber">Fiber Circuit</option>
							<option value="Tower">Tower</option>
						</select>
					</div>
					<div
						style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
					>
						<button
							type="button"
							onClick={onClose}
							style={{ ...buttonStyle, backgroundColor: "#9CA3AF" }}
						>
							Cancel
						</button>
						<button
							type="submit"
							style={{ ...buttonStyle, backgroundColor: "#4299E1" }}
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

const EditSiteModal = ({ onClose, onSubmit, site, setSite }) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1000,
		}}
	>
		<div
			style={{
				backgroundColor: "white",
				padding: "20px",
				borderRadius: "8px",
				width: "90%",
				maxWidth: "400px",
				margin: "20px",
			}}
		>
			<h2
				style={{
					marginBottom: "20px",
					backgroundColor: "#2c3e50",
					color: "white",
					padding: "10px 20px",
					borderRadius: "4px",
					textAlign: "center",
				}}
			>
				Edit Site
			</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Name"
						value={site.name}
						onChange={(e) => setSite({ ...site, name: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={site.siteType}
						onChange={(e) => setSite({ ...site, siteType: e.target.value })}
						style={inputStyle}
						required
					>
						<option value="">Select Site Type</option>
						<option value="MHC">MHC</option>
						<option value="RV">RV</option>
						<option value="Hybrid">Hybrid</option>
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Address"
						value={site.address}
						onChange={(e) => setSite({ ...site, address: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="City"
						value={site.city}
						onChange={(e) => setSite({ ...site, city: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="State"
						value={site.state}
						onChange={(e) => setSite({ ...site, state: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Zip Code"
						value={site.zipCode}
						onChange={(e) => setSite({ ...site, zipCode: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div
					style={{
						marginBottom: "20px",
						borderTop: "1px solid #eee",
						paddingTop: "15px",
					}}
				>
					<h3
						style={{
							marginBottom: "15px",
							color: "#2c3e50",
							fontSize: "16px",
						}}
					>
						Primary Contact
					</h3>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="text"
							placeholder="Primary Contact Name"
							value={site.primaryName}
							onChange={(e) =>
								setSite({ ...site, primaryName: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="email"
							placeholder="Primary Contact Email"
							value={site.primaryEmail}
							onChange={(e) =>
								setSite({ ...site, primaryEmail: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="tel"
							placeholder="Primary Contact Phone"
							value={site.primaryPhone}
							onChange={(e) =>
								setSite({ ...site, primaryPhone: e.target.value })
							}
							style={inputStyle}
							required
						/>
					</div>
				</div>
				<div
					style={{
						marginBottom: "20px",
						borderTop: "1px solid #eee",
						paddingTop: "15px",
					}}
				>
					<h3
						style={{
							marginBottom: "15px",
							color: "#2c3e50",
							fontSize: "16px",
						}}
					>
						Secondary Contact
					</h3>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="text"
							placeholder="Secondary Contact Name"
							value={site.secondaryName}
							onChange={(e) =>
								setSite({ ...site, secondaryName: e.target.value })
							}
							style={inputStyle}
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="email"
							placeholder="Secondary Contact Email"
							value={site.secondaryEmail}
							onChange={(e) =>
								setSite({ ...site, secondaryEmail: e.target.value })
							}
							style={inputStyle}
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<input
							type="tel"
							placeholder="Secondary Contact Phone"
							value={site.secondaryPhone}
							onChange={(e) =>
								setSite({ ...site, secondaryPhone: e.target.value })
							}
							style={inputStyle}
						/>
					</div>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{ ...buttonStyle, backgroundColor: "#9CA3AF" }}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{ ...buttonStyle, backgroundColor: "#4299E1" }}
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
);

const EditProviderModal = ({ onClose, onSubmit, provider, setProvider }) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1000,
		}}
	>
		<div
			style={{
				backgroundColor: "white",
				padding: "20px",
				borderRadius: "8px",
				width: "90%",
				maxWidth: "400px",
				margin: "20px",
			}}
		>
			<h2
				style={{
					marginBottom: "20px",
					backgroundColor: "#2c3e50",
					color: "white",
					padding: "10px 20px",
					borderRadius: "4px",
					textAlign: "center",
				}}
			>
				Edit Provider
			</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Name"
						value={provider.name}
						onChange={(e) => setProvider({ ...provider, name: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Address"
						value={provider.address}
						onChange={(e) =>
							setProvider({ ...provider, address: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="City"
						value={provider.city}
						onChange={(e) => setProvider({ ...provider, city: e.target.value })}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="State"
						value={provider.state}
						onChange={(e) =>
							setProvider({ ...provider, state: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Zip Code"
						value={provider.zipCode}
						onChange={(e) =>
							setProvider({ ...provider, zipCode: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="tel"
						placeholder="Contact Number"
						value={provider.contactNumber}
						onChange={(e) =>
							setProvider({ ...provider, contactNumber: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px",
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{ ...buttonStyle, backgroundColor: "#9CA3AF" }}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{ ...buttonStyle, backgroundColor: "#4299E1" }}
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
);

const EditCircuitModal = ({
	onClose,
	onSubmit,
	circuit,
	setCircuit,
	sites,
	providers,
}) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1000,
		}}
	>
		<div
			style={{
				backgroundColor: "white",
				padding: "20px",
				borderRadius: "8px",
				width: "90%",
				maxWidth: "400px",
				margin: "20px",
			}}
		>
			<h2
				style={{
					marginBottom: "20px",
					backgroundColor: "#2c3e50",
					color: "white",
					padding: "10px 20px",
					borderRadius: "4px",
					textAlign: "center",
				}}
			>
				Edit Circuit
			</h2>
			<form onSubmit={onSubmit}>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={circuit.site?.id || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, site: { id: Number(e.target.value) } })
						}
						style={inputStyle}
						required
					>
						<option value="">Select Site</option>
						{sites.map((site) => (
							<option key={site.id} value={site.id}>
								{site.name}
							</option>
						))}
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={circuit.provider?.id || ""}
						onChange={(e) =>
							setCircuit({
								...circuit,
								provider: { id: Number(e.target.value) },
							})
						}
						style={inputStyle}
						required
					>
						<option value="">Select Provider</option>
						{providers.map((provider) => (
							<option key={provider.id} value={provider.id}>
								{provider.name}
							</option>
						))}
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Account Number"
						value={circuit.accountNumber || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, accountNumber: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Circuit ID"
						value={circuit.circuitId || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, circuitId: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="text"
						placeholder="Bandwidth"
						value={circuit.circuitBandwidth || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, circuitBandwidth: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<input
						type="number"
						placeholder="Monthly Cost"
						value={circuit.monthlyCost || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, monthlyCost: Number(e.target.value) })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<label
						style={{
							display: "block",
							marginBottom: "5px",
							fontSize: "14px",
							fontWeight: "500",
							color: "#3498db", // Added blue color for better visibility
							backgroundColor: "#f8f9fa", // Added light background
							padding: "3px 5px",
							borderRadius: "3px",
						}}
					>
						Installation Date
					</label>
					<input
						type="date"
						placeholder="Installation Date"
						value={circuit.installationDate || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, installationDate: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<label
						style={{
							display: "block",
							marginBottom: "5px",
							fontSize: "14px",
							fontWeight: "500",
							color: "#3498db", // Added blue color for better visibility
							backgroundColor: "#f8f9fa", // Added light background
							padding: "3px 5px",
							borderRadius: "3px",
						}}
					>
						Expiration Date
					</label>
					<input
						type="date"
						placeholder="Expiration Date"
						value={circuit.expirationDate || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, expirationDate: e.target.value })
						}
						style={inputStyle}
						required
					/>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={circuit.status || ""}
						onChange={(e) => setCircuit({ ...circuit, status: e.target.value })}
						style={inputStyle}
						required
					>
						<option value="">Select Status</option>
						<option value="Active">Active</option>
						<option value="Inactive">Inactive</option>
						<option value="Pending">Pending</option>
					</select>
				</div>
				<div style={{ marginBottom: "15px" }}>
					<select
						value={circuit.circuitType || ""}
						onChange={(e) =>
							setCircuit({ ...circuit, circuitType: e.target.value })
						}
						style={inputStyle}
						required
					>
						<option value="">Select Circuit Type</option>
						<option value="Primary">Primary</option>
						<option value="Backup">Backup</option>
						<option value="Temporary">Temporary</option>
					</select>
				</div>
				<div
					style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
				>
					<button
						type="button"
						onClick={onClose}
						style={{ ...buttonStyle, backgroundColor: "#9CA3AF" }}
					>
						Cancel
					</button>
					<button
						type="submit"
						style={{ ...buttonStyle, backgroundColor: "#4299E1" }}
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
);

function Admin() {
	const [selectedItem, setSelectedItem] = useState("");
	const [sites, setSites] = useState([]);
	const [providers, setProviders] = useState([]); // Add providers state
	const [circuits, setCircuits] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showCreateSiteModal, setShowCreateSiteModal] = useState(false);
	const [newSite, setNewSite] = useState({
		name: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		siteType: "",
		primaryName: "",
		primaryEmail: "",
		primaryPhone: "",
		secondaryName: "",
		secondaryEmail: "",
		secondaryPhone: "",
	});
	const [showCreateProviderModal, setShowCreateProviderModal] = useState(false);
	const [newProvider, setNewProvider] = useState({
		name: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		contactNumber: "", // Add new field
	});
	const [showCreateCircuitModal, setShowCreateCircuitModal] = useState(false);
	const [newCircuit, setNewCircuit] = useState({
		site: { id: "" },
		provider: { id: "" },
		accountNumber: "",
		circuitId: "",
		circuitBandwidth: "",
		monthlyCost: "",
		installationDate: "",
		expirationDate: "",
		status: "",
		circuitType: "",
	});
	const [showEditSiteModal, setShowEditSiteModal] = useState(false);
	const [selectedSite, setSelectedSite] = useState(null);
	const [showEditProviderModal, setShowEditProviderModal] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState(null);
	const [showEditCircuitModal, setShowEditCircuitModal] = useState(false);
	const [selectedCircuit, setSelectedCircuit] = useState(null);
	const [siteSearch, setSiteSearch] = useState("");
	const [providerSearch, setProviderSearch] = useState("");
	const [circuitSearch, setCircuitSearch] = useState("");
	// Add sort state
	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: "ascending",
	});

	const fetchSites = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/sites");
			const data = await response.json();
			setSites(data);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load sites");
		} finally {
			setLoading(false);
		}
	};

	const fetchProviders = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/providers");
			const data = await response.json();
			setProviders(data);
		} catch (error) {
			console.error("Error:", error);
			setError("Failed to load providers");
		} finally {
			setLoading(false);
		}
	};

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

	const createSite = async (e) => {
		e.preventDefault();
		setLoading(true);

		// Check for duplicate site name
		const isDuplicate = sites.some(
			(site) => site.name.toLowerCase() === newSite.name.toLowerCase()
		);

		if (isDuplicate) {
			alert("A site with this name already exists");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/sites", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newSite),
			});
			if (!response.ok) throw new Error("Failed to create site");

			fetchSites(); // Refresh the list
			setShowCreateSiteModal(false);
			setNewSite({
				name: "",
				address: "",
				city: "",
				state: "",
				zipCode: "",
				siteType: "",
				primaryName: "",
				primaryEmail: "",
				primaryPhone: "",
				secondaryName: "",
				secondaryEmail: "",
				secondaryPhone: "",
			});
		} catch (error) {
			console.error("Error creating site:", error);
			setError("Failed to create site");
		} finally {
			setLoading(false);
		}
	};

	const createProvider = async (e) => {
		e.preventDefault();
		setLoading(true);

		// Check for duplicate provider name
		const isDuplicate = providers.some(
			(provider) =>
				provider.name.toLowerCase() === newProvider.name.toLowerCase()
		);

		if (isDuplicate) {
			alert("A provider with this name already exists");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/providers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newProvider),
			});
			if (!response.ok) throw new Error("Failed to create provider");

			fetchProviders(); // Refresh the list
			setShowCreateProviderModal(false);
			setNewProvider({
				name: "",
				address: "",
				city: "",
				state: "",
				zipCode: "",
				contactNumber: "", // Add new field
			});
		} catch (error) {
			console.error("Error creating provider:", error);
			setError("Failed to create provider");
		} finally {
			setLoading(false);
		}
	};

	const createCircuit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch("/api/circuits", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newCircuit),
			});
			if (!response.ok) throw new Error("Failed to create circuit");

			fetchCircuits();
			setShowCreateCircuitModal(false);
			setNewCircuit({
				site: { id: "" },
				provider: { id: "" },
				accountNumber: "",
				circuitId: "",
				circuitBandwidth: "",
				monthlyCost: "",
				installationDate: "",
				expirationDate: "",
				status: "",
				circuitType: "",
			});
		} catch (error) {
			console.error("Error creating circuit:", error);
			setError("Failed to create circuit");
		} finally {
			setLoading(false);
		}
	};

	const editSite = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(`/api/sites`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(selectedSite),
			});
			if (!response.ok) throw new Error("Failed to update site");

			fetchSites(); // Refresh the list
			setShowEditSiteModal(false);
			setSelectedSite(null);
		} catch (error) {
			console.error("Error updating site:", error);
			setError("Failed to update site");
		} finally {
			setLoading(false);
		}
	};

	const editProvider = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(`/api/providers`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(selectedProvider),
			});
			if (!response.ok) throw new Error("Failed to update provider");

			fetchProviders();
			setShowEditProviderModal(false);
			setSelectedProvider(null);
		} catch (error) {
			console.error("Error updating provider:", error);
			setError("Failed to update provider");
		} finally {
			setLoading(false);
		}
	};

	const editCircuit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(`/api/circuits`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(selectedCircuit),
			});
			if (!response.ok) throw new Error("Failed to update circuit");

			fetchCircuits();
			setShowEditCircuitModal(false);
			setSelectedCircuit(null);
		} catch (error) {
			console.error("Error updating circuit:", error);
			setError("Failed to update circuit");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (id, type) => {
		if (type === "site") {
			const site = sites.find((s) => s.id === id);
			setSelectedSite(site);
			setShowEditSiteModal(true);
		} else if (type === "provider") {
			const provider = providers.find((p) => p.id === id);
			setSelectedProvider(provider);
			setShowEditProviderModal(true);
		} else if (type === "circuit") {
			const circuit = circuits.find((c) => c.id === id);
			setSelectedCircuit(circuit);
			fetchSites();
			fetchProviders();
			setShowEditCircuitModal(true);
		}
	};

	const handleDelete = async (id, type) => {
		if (type === "site" || type === "provider") {
			const isUsed = circuits.some((circuit) => {
				if (type === "site") return circuit.site.id === id;
				if (type === "provider") return circuit.provider.id === id;
			});

			if (isUsed) {
				alert(
					`This ${type} cannot be deleted because it is being used in one or more circuits.`
				);
				return;
			}
		}

		if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
			setLoading(true);
			try {
				const response = await fetch(`/api/${type}s/${id}`, {
					method: "DELETE",
				});

				if (!response.ok) {
					throw new Error(`Failed to delete ${type}`);
				}

				// Refresh the corresponding list
				switch (type) {
					case "site":
						fetchSites();
						break;
					case "provider":
						fetchProviders();
						break;
					case "circuit":
						fetchCircuits();
						break;
				}
			} catch (error) {
				console.error(`Error deleting ${type}:`, error);
				setError(`Failed to delete ${type}`);
			} finally {
				setLoading(false);
			}
		}
	};

	// Add filter functions
	const filteredSites = sites.filter(
		(site) =>
			site.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
			site.address.toLowerCase().includes(siteSearch.toLowerCase()) ||
			site.city.toLowerCase().includes(siteSearch.toLowerCase()) ||
			site.state.toLowerCase().includes(siteSearch.toLowerCase()) ||
			site.zipCode.toLowerCase().includes(siteSearch.toLowerCase())
	);

	const filteredProviders = providers.filter(
		(provider) =>
			provider.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
			provider.address.toLowerCase().includes(providerSearch.toLowerCase()) ||
			provider.city.toLowerCase().includes(providerSearch.toLowerCase()) ||
			provider.state.toLowerCase().includes(providerSearch.toLowerCase()) ||
			provider.zipCode.toLowerCase().includes(providerSearch.toLowerCase())
	);

	const filteredCircuits = circuits.filter(
		(circuit) =>
			circuit.site.name.toLowerCase().includes(circuitSearch.toLowerCase()) ||
			circuit.provider.name
				.toLowerCase()
				.includes(circuitSearch.toLowerCase()) ||
			circuit.accountNumber
				.toLowerCase()
				.includes(circuitSearch.toLowerCase()) ||
			circuit.circuitId.toLowerCase().includes(circuitSearch.toLowerCase()) ||
			circuit.circuitBandwidth
				.toLowerCase()
				.includes(circuitSearch.toLowerCase())
	);

	const searchInputStyle = {
		width: "100%",
		padding: "8px 12px",
		marginBottom: "20px",
		fontSize: "16px",
		border: "1px solid #3498db",
		borderRadius: "4px",
		backgroundColor: "#34495e",
		color: "#ffffff",
		outline: "none",
	};

	// Add sort function
	const onSort = (key) => {
		let direction = "ascending";
		if (sortConfig.key === key && sortConfig.direction === "ascending") {
			direction = "descending";
		}
		setSortConfig({ key, direction });
	};

	// Add sort handler function
	const getSortedItems = (items) => {
		if (!sortConfig.key) return items;

		return [...items].sort((a, b) => {
			let aValue = sortConfig.key.split(".").reduce((obj, key) => obj[key], a);
			let bValue = sortConfig.key.split(".").reduce((obj, key) => obj[key], b);

			if (typeof aValue === "string") {
				aValue = aValue.toLowerCase();
				bValue = bValue.toLowerCase();
			}

			if (aValue < bValue) {
				return sortConfig.direction === "ascending" ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.direction === "ascending" ? 1 : -1;
			}
			return 0;
		});
	};

	// Add sortable header style
	const getSortableHeaderStyle = (key) => ({
		...headerStyle,
		cursor: "pointer",
		userSelect: "none",
		position: "relative",
		paddingRight: "20px",
		"&:after": {
			content:
				sortConfig.key === key
					? sortConfig.direction === "ascending"
						? '"↑"'
						: '"↓"'
					: '""',
			position: "absolute",
			right: "5px",
		},
	});

	// Update the table headers in renderContent
	const renderContent = () => {
		if (loading) return <div>Loading...</div>;
		if (error) return <div style={{ color: "red" }}>{error}</div>;

		if (selectedItem === "Sites") {
			const sortedSites = getSortedItems(filteredSites);
			return (
				<div>
					<div
						style={{
							backgroundColor: "#2c3e50",
							color: "white",
							padding: "10px 20px",
							borderRadius: "4px",
							marginBottom: "20px",
							textAlign: "center",
							fontSize: "16px",
						}}
					>
						Total Sites: {sites.length}
					</div>
					<div style={{ marginBottom: "20px", display: "flex", gap: "20px" }}>
						<input
							type="text"
							placeholder="Search sites..."
							value={siteSearch}
							onChange={(e) => setSiteSearch(e.target.value)}
							style={searchInputStyle}
						/>
						<button
							onClick={() => setShowCreateSiteModal(true)}
							style={{
								...buttonStyle,
								backgroundColor: "#10B981",
								padding: "8px 16px",
							}}
						>
							Create New Site
						</button>
					</div>
					<div style={{ width: "100%", overflowX: "auto" }}>
						<table style={{ width: "100%", borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ backgroundColor: "#2c3e50" }}>
									<th
										onClick={() => onSort("id")}
										style={getSortableHeaderStyle("id")}
									>
										ID
									</th>
									<th
										onClick={() => onSort("name")}
										style={getSortableHeaderStyle("name")}
									>
										Name
									</th>
									<th
										onClick={() => onSort("address")}
										style={getSortableHeaderStyle("address")}
									>
										Address
									</th>
									<th
										onClick={() => onSort("city")}
										style={getSortableHeaderStyle("city")}
									>
										City
									</th>
									<th
										onClick={() => onSort("state")}
										style={getSortableHeaderStyle("state")}
									>
										State
									</th>
									<th
										onClick={() => onSort("zipCode")}
										style={getSortableHeaderStyle("zipCode")}
									>
										Zip Code
									</th>
									<th style={headerStyle}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{sortedSites.map((site) => (
									<tr
										key={site.id}
										style={{ borderBottom: "1px solid #dee2e6" }}
									>
										<td style={cellStyle}>{site.id}</td>
										<td style={cellStyle}>{site.name}</td>
										<td style={cellStyle}>{site.address}</td>
										<td style={cellStyle}>{site.city}</td>
										<td style={cellStyle}>{site.state}</td>
										<td style={cellStyle}>{site.zipCode}</td>
										<td style={cellStyle}>
											<button
												onClick={() => handleEdit(site.id, "site")}
												style={iconButtonStyle}
											>
												✏️
											</button>
											<button
												onClick={() => handleDelete(site.id, "site")}
												style={iconButtonStyle}
											>
												🗑️
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

		if (selectedItem === "Providers") {
			const sortedProviders = getSortedItems(filteredProviders);
			return (
				<div>
					<div
						style={{
							backgroundColor: "#2c3e50",
							color: "white",
							padding: "10px 20px",
							borderRadius: "4px",
							marginBottom: "20px",
							textAlign: "center",
							fontSize: "16px",
						}}
					>
						Total Providers: {providers.length}
					</div>
					<div style={{ marginBottom: "20px", display: "flex", gap: "20px" }}>
						<input
							type="text"
							placeholder="Search providers..."
							value={providerSearch}
							onChange={(e) => setProviderSearch(e.target.value)}
							style={searchInputStyle}
						/>
						<button
							onClick={() => setShowCreateProviderModal(true)}
							style={{
								...buttonStyle,
								backgroundColor: "#10B981",
								padding: "8px 16px",
							}}
						>
							Create New Provider
						</button>
					</div>
					<div style={{ width: "100%", overflowX: "auto" }}>
						<table style={{ width: "100%", borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ backgroundColor: "#2c3e50" }}>
									<th
										onClick={() => onSort("id")}
										style={getSortableHeaderStyle("id")}
									>
										ID
									</th>
									<th
										onClick={() => onSort("name")}
										style={getSortableHeaderStyle("name")}
									>
										Name
									</th>
									<th
										onClick={() => onSort("address")}
										style={getSortableHeaderStyle("address")}
									>
										Address
									</th>
									<th
										onClick={() => onSort("city")}
										style={getSortableHeaderStyle("city")}
									>
										City
									</th>
									<th
										onClick={() => onSort("state")}
										style={getSortableHeaderStyle("state")}
									>
										State
									</th>
									<th
										onClick={() => onSort("zipCode")}
										style={getSortableHeaderStyle("zipCode")}
									>
										Zip Code
									</th>
									<th style={headerStyle}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{sortedProviders.map((provider) => (
									<tr
										key={provider.id}
										style={{ borderBottom: "1px solid #dee2e6" }}
									>
										<td style={cellStyle}>{provider.id}</td>
										<td style={cellStyle}>{provider.name}</td>
										<td style={cellStyle}>{provider.address}</td>
										<td style={cellStyle}>{provider.city}</td>
										<td style={cellStyle}>{provider.state}</td>
										<td style={cellStyle}>{provider.zipCode}</td>
										<td style={cellStyle}>
											<button
												onClick={() => handleEdit(provider.id, "provider")}
												style={iconButtonStyle}
											>
												✏️
											</button>
											<button
												onClick={() => handleDelete(provider.id, "provider")}
												style={iconButtonStyle}
											>
												🗑️
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

		if (selectedItem === "Circuits") {
			const sortedCircuits = getSortedItems(filteredCircuits);
			return (
				<div>
					<div
						style={{
							backgroundColor: "#2c3e50",
							color: "white",
							padding: "10px 20px",
							borderRadius: "4px",
							marginBottom: "20px",
							textAlign: "center",
							fontSize: "16px",
						}}
					>
						Total Circuits: {circuits.length}
					</div>
					<div style={{ marginBottom: "20px", display: "flex", gap: "20px" }}>
						<input
							type="text"
							placeholder="Search circuits..."
							value={circuitSearch}
							onChange={(e) => setCircuitSearch(e.target.value)}
							style={searchInputStyle}
						/>
						<button
							onClick={() => {
								fetchSites();
								fetchProviders();
								setShowCreateCircuitModal(true);
							}}
							style={{
								...buttonStyle,
								backgroundColor: "#10B981",
								padding: "8px 16px",
							}}
						>
							Create New Circuit
						</button>
					</div>
					<div style={{ width: "100%", overflowX: "auto" }}>
						<table style={{ width: "100%", borderCollapse: "collapse" }}>
							<thead>
								<tr style={{ backgroundColor: "#2c3e50" }}>
									<th
										onClick={() => onSort("id")}
										style={getSortableHeaderStyle("id")}
									>
										ID
									</th>
									<th
										onClick={() => onSort("site.name")}
										style={getSortableHeaderStyle("site.name")}
									>
										Site
									</th>
									<th
										onClick={() => onSort("provider.name")}
										style={getSortableHeaderStyle("provider.name")}
									>
										Provider
									</th>
									<th
										onClick={() => onSort("accountNumber")}
										style={getSortableHeaderStyle("accountNumber")}
									>
										Account Number
									</th>
									<th
										onClick={() => onSort("circuitId")}
										style={getSortableHeaderStyle("circuitId")}
									>
										Circuit ID
									</th>
									<th
										onClick={() => onSort("circuitBandwidth")}
										style={getSortableHeaderStyle("circuitBandwidth")}
									>
										Bandwidth
									</th>
									<th
										onClick={() => onSort("monthlyCost")}
										style={getSortableHeaderStyle("monthlyCost")}
									>
										Monthly Cost
									</th>
									<th style={headerStyle}>Actions</th>
								</tr>
							</thead>
							<tbody>
								{sortedCircuits.map((circuit) => (
									<tr
										key={circuit.id}
										style={{ borderBottom: "1px solid #dee2e6" }}
									>
										<td style={cellStyle}>{circuit.id}</td>
										<td style={cellStyle}>{circuit.site.name}</td>
										<td style={cellStyle}>{circuit.provider.name}</td>
										<td style={cellStyle}>{circuit.accountNumber}</td>
										<td style={cellStyle}>{circuit.circuitId}</td>
										<td style={cellStyle}>{circuit.circuitBandwidth}</td>
										<td style={cellStyle}>${circuit.monthlyCost}</td>
										<td style={cellStyle}>
											<button
												onClick={() => handleEdit(circuit.id, "circuit")}
												style={iconButtonStyle}
											>
												✏️
											</button>
											<button
												onClick={() => handleDelete(circuit.id, "circuit")}
												style={iconButtonStyle}
											>
												🗑️
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

		return (
			<div style={{ textAlign: "center", marginTop: "10px" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "20px",
						marginBottom: "20px",
					}}
				>
					<span style={{ fontSize: "36px", color: "#3498db" }}>←</span>
					<img
						src="src/images/Access.png"
						alt="Access Parks Logo"
						style={{
							width: "100px",
							maxWidth: "100%",
						}}
					/>
				</div>
				<h1 style={{ color: "#2c3e50" }}>
					Please select an option from the menu
				</h1>
			</div>
		);
	};

	// Add useEffect to fetch circuits on mount
	useEffect(() => {
		fetchCircuits();
	}, []);

	return (
		<div
			style={{
				paddingTop: "30px",
				display: "flex",
				width: "100%",
				flexDirection: "column",
			}}
		>
			<nav
				style={{
					width: "150px",
					minHeight: "calc(100vh - 50px)",
					backgroundColor: "#2c3e50",
					padding: "20px",
					position: "fixed",
					left: 0,
					top: "50px",
					zIndex: 999,
					"@media (max-width: 768px)": {
						width: "100%",
						position: "static",
						minHeight: "auto",
					},
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
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							backgroundColor:
								selectedItem === "Sites" ? "#34495e" : "transparent",
						}}
						onClick={() => {
							setSelectedItem("Sites");
							fetchSites();
						}}
					>
						Sites
					</li>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							backgroundColor:
								selectedItem === "Providers" ? "#34495e" : "transparent",
						}}
						onClick={() => {
							setSelectedItem("Providers");
							fetchProviders();
						}}
					>
						Providers
					</li>
					<li
						style={{
							marginBottom: "15px",
							padding: "10px",
							cursor: "pointer",
							backgroundColor:
								selectedItem === "Circuits" ? "#34495e" : "transparent",
						}}
						onClick={() => {
							setSelectedItem("Circuits");
							fetchCircuits();
						}}
					>
						Circuits
					</li>
				</ul>
			</nav>
			<div
				style={{
					marginLeft: "150px",
					padding: "20px",
					flex: 1,
					"@media (max-width: 768px)": {
						marginLeft: 0,
					},
				}}
			>
				<div style={{ width: "100%", overflowX: "auto" }}>
					{renderContent()}
				</div>
				{showCreateSiteModal && (
					<CreateSiteModal
						onClose={() => setShowCreateSiteModal(false)}
						onSubmit={createSite}
						newSite={newSite}
						setNewSite={setNewSite}
					/>
				)}
				{showCreateProviderModal && (
					<CreateProviderModal
						onClose={() => setShowCreateProviderModal(false)}
						onSubmit={createProvider}
						newProvider={newProvider}
						setNewProvider={setNewProvider}
					/>
				)}
				{showCreateCircuitModal && (
					<CreateCircuitModal
						onClose={() => setShowCreateCircuitModal(false)}
						onSubmit={createCircuit}
						newCircuit={newCircuit}
						setNewCircuit={setNewCircuit}
						sites={sites}
						providers={providers}
					/>
				)}
				{showEditSiteModal && selectedSite && (
					<EditSiteModal
						onClose={() => {
							setShowEditSiteModal(false);
							setSelectedSite(null);
						}}
						onSubmit={editSite}
						site={selectedSite}
						setSite={setSelectedSite}
					/>
				)}
				{showEditProviderModal && selectedProvider && (
					<EditProviderModal
						onClose={() => {
							setShowEditProviderModal(false);
							setSelectedProvider(null);
						}}
						onSubmit={editProvider}
						provider={selectedProvider}
						setProvider={setSelectedProvider}
					/>
				)}
				{showEditCircuitModal && selectedCircuit && (
					<EditCircuitModal
						onClose={() => {
							setShowEditCircuitModal(false);
							setSelectedCircuit(null);
						}}
						onSubmit={editCircuit}
						circuit={selectedCircuit}
						setCircuit={setSelectedCircuit}
						sites={sites}
						providers={providers}
					/>
				)}
			</div>
		</div>
	);
}

const headerStyle = {
	padding: "12px",
	textAlign: "center",
	borderBottom: "2px solid #dee2e6",
	backgroundColor: "#2c3e50", // Dark blue background
	color: "#ffffff", // White text
	fontWeight: "600", // Semi-bold text
	fontSize: "14px",
};

const cellStyle = {
	padding: "12px",
	fontSize: "13px",
};

const buttonStyle = {
	padding: "6px 12px",
	margin: "0 4px",
	border: "none",
	borderRadius: "4px",
	color: "white",
	cursor: "pointer",
};

const iconButtonStyle = {
	padding: "4px 8px",
	border: "none",
	borderRadius: "4px",
	backgroundColor: "transparent",
	cursor: "pointer",
	fontSize: "20px",
};

const inputStyle = {
	width: "100%",
	padding: "8px",
	border: "1px solid #D1D5DB",
	borderRadius: "4px",
	fontSize: "12px",
};

export default Admin;
