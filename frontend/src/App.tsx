import { useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate, useParams } from "react-router";
import "./App.css";
import { startCrawl } from "./api";
import { GraphView } from "./components/GraphView";
import { ScanMenu } from "./components/ScanMenu";
import { UrlForm } from "./components/UrlForm";
import type { CrawlRequest } from "./types";

function App() {
	return (
		<BrowserRouter>
			<ScanMenu />
			<Routes>
				<Route path="/" element={<StartPage />} />
				<Route path="/graph/:scanId" element={<GraphPage />} />
			</Routes>
		</BrowserRouter>
	);
}

function StartPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(request: CrawlRequest) {
		setError(null);
		setIsLoading(true);

		try {
			const crawlResponse = await startCrawl(request);
			navigate(`/graph/${crawlResponse.scan_id}`);
		} catch (caughtError) {
			setError(
				caughtError instanceof Error ? caughtError.message : "Something went wrong",
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<main className="start-page">
			<div className="wordmark">WRW</div>

			<section className="start-panel" aria-labelledby="page-title">
				<h1 id="page-title">Website Random Walker</h1>

				<UrlForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
			</section>

			<footer className="footer-credit">built by @oleks4ndr</footer>
		</main>
	);
}

function GraphPage() {
	const { scanId } = useParams();
	const navigate = useNavigate();

	return (
		<main className="graph-page">
			<div className="wordmark" onClick={() => navigate("/")}>
				WRW
			</div>
			<section className="graph-panel" aria-labelledby="graph-title">
				<h1 id="graph-title">Graph</h1>
				<p className="scan-id">scan_id: {scanId}</p>
				{scanId ? (
					<GraphView scanId={scanId} />
				) : (
					<p className="error-text">Missing scan ID.</p>
				)}
			</section>
		</main>
	);
}

export default App;
