import type {
	CrawlRequest,
	CrawlResponse,
	GraphResponse,
	MetricsResponse,
	RandomWalkRequest,
	RandomWalkResponse,
} from "./types";

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

export async function getGraph(scanId: string): Promise<GraphResponse> {
	const response = await fetch(`${API_BASE_URL}/scans/${scanId}/graph`);

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || "Failed to load graph");
	}

	return response.json();
}

export async function getMetrics(scanId: string): Promise<MetricsResponse> {
	const response = await fetch(`${API_BASE_URL}/scans/${scanId}/metrics`);

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || "Failed to load metrics");
	}

	return response.json();
}

export async function runRandomWalk(
	scanId: string,
	request: RandomWalkRequest,
): Promise<RandomWalkResponse> {
	const response = await fetch(`${API_BASE_URL}/scans/${scanId}/random-walk`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || "Failed to run random walk");
	}

	return response.json();
}
