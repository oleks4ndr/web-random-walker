import "./MetricsPanel.css";
import type { MetricsResponse, RandomWalkResponse } from "../types";

type MetricsPanelProps = {
	randomWalk: RandomWalkResponse;
	metrics: MetricsResponse | null;
	isLoadingMetrics: boolean;
};

export function MetricsPanel({
	randomWalk,
	metrics,
	isLoadingMetrics,
}: MetricsPanelProps) {
	return (
		<section className="metrics-panel" aria-label="Random walk results">
			<div className="metrics-summary">
				<MetricValue label="Dead-end rate" value={formatPercent(randomWalk.dead_end_rate)} />
				<MetricValue label="Total steps" value={randomWalk.total_steps.toString()} />
				<MetricValue label="Dead-end hits" value={randomWalk.dead_end_hits.toString()} />
			</div>

			<div className="metrics-lists">
				<MetricList
					title="Most visited pages"
					items={randomWalk.most_visited_pages.map((page) => ({
						label: page.title || shortUrl(page.url),
						value: page.visit_count.toString(),
					}))}
				/>
				<MetricList
					title="Least visited pages"
					items={randomWalk.least_visited_pages.map((page) => ({
						label: page.title || shortUrl(page.url),
						value: page.visit_count.toString(),
					}))}
				/>
				<MetricList
					title="Top edge traversals"
					items={randomWalk.edge_traversals.slice(0, 10).map((edge) => ({
						label: `${shortUrl(edge.source)} → ${shortUrl(edge.target)}`,
						value: edge.traversal_count.toString(),
					}))}
				/>
			</div>

			{isLoadingMetrics && <p className="status-text">Loading general metrics...</p>}

			{metrics && (
				<div className="general-metrics">
					<h2>General metrics</h2>
					<div className="metrics-summary">
						<MetricValue
							label="Pages"
							value={metrics.total_pages_crawled.toString()}
						/>
						<MetricValue
							label="Internal links"
							value={metrics.total_internal_links.toString()}
						/>
						<MetricValue
							label="Avg clicks"
							value={
								metrics.average_clicks_from_homepage === null
									? "n/a"
									: metrics.average_clicks_from_homepage.toFixed(2)
							}
						/>
					</div>

					<div className="metrics-summary">
						<MetricValue
							label="Reach <= 1"
							value={(metrics.pages_reachable_within_clicks["1"] ?? 0).toString()}
						/>
						<MetricValue
							label="Reach <= 2"
							value={(metrics.pages_reachable_within_clicks["2"] ?? 0).toString()}
						/>
						<MetricValue
							label="Reach <= 3"
							value={(metrics.pages_reachable_within_clicks["3"] ?? 0).toString()}
						/>
					</div>

					<div className="metrics-lists">
						<MetricList
							title="No outgoing links"
							items={metrics.pages_with_no_outgoing_links.slice(0, 8).map((page) => ({
								label: page.title || shortUrl(page.url),
								value: "",
							}))}
						/>
						<MetricList
							title="No incoming links"
							items={metrics.pages_with_no_incoming_links.slice(0, 8).map((page) => ({
								label: page.title || shortUrl(page.url),
								value: "",
							}))}
						/>
					</div>
				</div>
			)}
		</section>
	);
}

function MetricValue({ label, value }: { label: string; value: string }) {
	return (
		<div className="metric-value">
			<span>{label}</span>
			<strong>{value}</strong>
		</div>
	);
}

function MetricList({
	title,
	items,
}: {
	title: string;
	items: { label: string; value: string }[];
}) {
	return (
		<div className="metric-list">
			<h2>{title}</h2>
			{items.length === 0 ? (
				<p>None</p>
			) : (
				<ol>
					{items.map((item, index) => (
						<li key={`${item.label}-${index}`}>
							<span>{truncateLabel(item.label)}</span>
							{item.value && <strong>{item.value}</strong>}
						</li>
					))}
				</ol>
			)}
		</div>
	);
}

function formatPercent(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

function shortUrl(url: string): string {
	return url
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/$/, "");
}

function truncateLabel(label: string): string {
	if (label.length <= 48) {
		return label;
	}

	return `${label.slice(0, 47)}…`;
}
