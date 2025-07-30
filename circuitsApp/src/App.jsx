import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Admin from "./components/Admin";
import Circuits from "./components/Circuits";
import Reports from "./components/Reports";
import "./App.css";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="admin" element={<Admin />} />
					<Route path="circuits" element={<Circuits />} />
					<Route path="reports" element={<Reports />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
	