import type { CrawlRequest, CrawlResponse } from "./types";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function startCrawl(request: CrawlRequest): Promise<CrawlResponse> {
	const response = await fetch(`${API_BASE_URL}/crawl`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || "Failed to start crawl");
	}

	return response.json();
}
