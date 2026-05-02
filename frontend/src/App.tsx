import { useState } from "react";
import type { FormEvent } from "react";
import {
	BrowserRouter,
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from "react-router";
import "./App.css";
import { startCrawl } from "./api";
import type { CrawlResponse } from "./types";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<StartPage />} />
				<Route path="/graph/:scanId" element={<GraphPlaceholderPage />} />
			</Routes>
		</BrowserRouter>
	);
}

function StartPage() {
	const navigate = useNavigate();
	const [url, setUrl] = useState("");
	const [maxPages, setMaxPages] = useState(50);
	const [maxDepth, setMaxDepth] = useState(3);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const crawlResponse = await startCrawl({
				url,
				max_pages: maxPages,
				max_depth: maxDepth,
			});

			navigate(`/graph/${crawlResponse.scan_id}`, {
				state: { crawlResponse },
			});
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
			<button className="menu-button" type="button" aria-label="Open scan history">
				<span />
				<span />
				<span />
			</button>

			<div className="wordmark">WRW</div>

			<section className="start-panel" aria-labelledby="page-title">
				<h1 id="page-title">Website Random Walker</h1>

				<form className="crawl-form" onSubmit={handleSubmit}>
					<label className="url-label" htmlFor="url-input">
						Website URL
					</label>
					<div className="url-row">
						<input
							id="url-input"
							name="url"
							type="text"
							value={url}
							onChange={(event) => setUrl(event.target.value)}
							placeholder="enter or paste a url... (e.g. www.example.com)"
							required
						/>
						<button
							className="submit-button"
							type="submit"
							aria-label="Start crawl"
							disabled={isLoading}>
							{" > "}
						</button>
					</div>

					<button
						className="advanced-toggle"
						type="button"
						onClick={() => setShowAdvanced((isOpen) => !isOpen)}
						aria-expanded={showAdvanced}>
						Advanced Settings
						<span aria-hidden="true">{showAdvanced ? "▲" : "▼"}</span>
					</button>

					{showAdvanced && (
						<div className="advanced-settings">
							<label>
								Max pages
								<input
									type="number"
									min="1"
									max="500"
									value={maxPages}
									onChange={(event) => setMaxPages(Number(event.target.value))}
								/>
							</label>
							<label>
								Max depth
								<input
									type="number"
									min="0"
									max="20"
									value={maxDepth}
									onChange={(event) => setMaxDepth(Number(event.target.value))}
								/>
							</label>
						</div>
					)}

					{isLoading && <p className="status-text">Crawling...</p>}
					{error && <p className="error-text">{error}</p>}
				</form>
			</section>

			<footer className="footer-credit">built by @oleks4ndr</footer>
		</main>
	);
}

function GraphPlaceholderPage() {
	const { scanId } = useParams();
	const location = useLocation();
	const state = location.state as { crawlResponse?: CrawlResponse } | null;

	return (
		<main className="graph-placeholder-page">
			<div className="wordmark">WRW</div>
			<section className="graph-placeholder">
				<h1>Graph</h1>
				<p>scan_id: {scanId}</p>
				<pre>
					{state?.crawlResponse
						? JSON.stringify(state.crawlResponse, null, 2)
						: "No crawl response loaded for this route yet."}
				</pre>
			</section>
		</main>
	);
}

export default App;
