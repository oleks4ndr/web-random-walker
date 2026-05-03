import { useState } from "react";
import type { FormEvent } from "react";
import type { CrawlRequest } from "../types";

type UrlFormProps = {
	isLoading: boolean;
	error: string | null;
	onSubmit: (request: CrawlRequest) => void;
};

export function UrlForm({ isLoading, error, onSubmit }: UrlFormProps) {
	const [url, setUrl] = useState("");
	const [maxPages, setMaxPages] = useState(50);
	const [maxDepth, setMaxDepth] = useState(3);
	const [showAdvanced, setShowAdvanced] = useState(false);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		onSubmit({
			url,
			max_pages: maxPages,
			max_depth: maxDepth,
		});
	}

	return (
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
	);
}
