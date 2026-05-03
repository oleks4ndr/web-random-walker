import "./RandomWalkControls.css";
import { useState } from "react";
import { runRandomWalk } from "../api";
import type { GraphNode, RandomWalkResponse } from "../types";

type RandomWalkControlsProps = {
	scanId: string;
	rootUrl: string;
	nodes: GraphNode[];
	onWalkComplete: (result: RandomWalkResponse) => void;
};

export function RandomWalkControls({
	scanId,
	rootUrl,
	nodes,
	onWalkComplete,
}: RandomWalkControlsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [walkCount, setWalkCount] = useState(1000);
	const [stepsPerWalk, setStepsPerWalk] = useState(30);
	const [startUrl, setStartUrl] = useState(rootUrl);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const defaultStartUrl = nodes.some((node) => node.url === rootUrl)
		? rootUrl
		: nodes[0]?.url || rootUrl;
	const selectedStartUrl = nodes.some((node) => node.url === startUrl)
		? startUrl
		: defaultStartUrl;

	async function handleStartWalk() {
		const isValidStartUrl = nodes.some((node) => node.url === selectedStartUrl);
		if (!isValidStartUrl) {
			setError("Start URL must be one of the graph nodes.");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const result = await runRandomWalk(scanId, {
				walk_count: walkCount,
				steps_per_walk: stepsPerWalk,
				start_url: selectedStartUrl,
			});
			onWalkComplete(result);
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Failed to run random walk",
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="random-walk-controls">
			<button
				className="random-walk-toggle"
				type="button"
				onClick={() => setIsOpen((currentValue) => !currentValue)}
				aria-expanded={isOpen}>
				Random Walk Controls
				<span aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
			</button>

			{isOpen && (
				<div className="random-walk-fields">
					<label>
						Walk count
						<input
							type="number"
							min="1"
							max="100000"
							value={walkCount}
							onChange={(event) => setWalkCount(Number(event.target.value))}
						/>
					</label>

					<label>
						Steps per walk
						<input
							type="number"
							min="1"
							max="10000"
							value={stepsPerWalk}
							onChange={(event) => setStepsPerWalk(Number(event.target.value))}
						/>
					</label>

					<label>
						Start URL
						<select
							value={selectedStartUrl}
							onChange={(event) => setStartUrl(event.target.value)}>
							{nodes.map((node) => (
								<option key={node.url} value={node.url}>
									{node.title || shortUrl(node.url)}
								</option>
							))}
						</select>
					</label>

					<button
						className="start-walk-button"
						type="button"
						onClick={handleStartWalk}
						disabled={isLoading}>
						{isLoading ? "Walking..." : "Start Walk"}
					</button>

					{error && <p className="error-text">{error}</p>}
				</div>
			)}
		</div>
	);
}

function shortUrl(url: string): string {
	return url
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/$/, "");
}
