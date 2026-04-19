import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Admin from "./components/Admin";
import Circuits from "./components/Circuits";
import Reports from "./components/Reports";
import RenewalAnalysis from "./components/RenewalAnalysis";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Layout />
							</ProtectedRoute>
						}
					>
						<Route index element={<Home />} />
						<Route
							path="admin"
							element={
								<ProtectedRoute requiredRoles={["SUPER", "ADMIN"]}>
									<Admin />
								</ProtectedRoute>
							}
						/>
						<Route
							path="circuits"
							element={
								<ProtectedRoute>
									<Circuits />
								</ProtectedRoute>
							}
						/>
						<Route
							path="reports"
							element={
								<ProtectedRoute>
									<Reports />
								</ProtectedRoute>
							}
						/>
						<Route
							path="renewal-analysis"
							element={
								<ProtectedRoute>
									<RenewalAnalysis />
								</ProtectedRoute>
							}
						/>
					</Route>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
