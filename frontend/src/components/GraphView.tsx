import "@xyflow/react/dist/style.css";
import "./GraphView.css";
import { Background, Controls, MarkerType, MiniMap, ReactFlow } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { getGraph } from "../api";
import type { GraphNode, GraphResponse } from "../types";

type GraphViewProps = {
	scanId: string;
};

type SiteNodeData = {
	label: string;
	url: string;
	title: string | null;
	depth: number;
	status_code: number | null;
};

export function GraphView({ scanId }: GraphViewProps) {
	const [graph, setGraph] = useState<GraphResponse | null>(null);
	const [selectedNode, setSelectedNode] = useState<SiteNodeData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let ignore = false;

		async function loadGraph() {
			try {
				setIsLoading(true);
				setError(null);
				const graphResponse = await getGraph(scanId);
				if (!ignore) {
					setGraph(graphResponse);
				}
			} catch (caughtError) {
				if (!ignore) {
					setError(
						caughtError instanceof Error ? caughtError.message : "Failed to load graph",
					);
				}
			} finally {
				if (!ignore) {
					setIsLoading(false);
				}
			}
		}

		loadGraph();

		return () => {
			ignore = true;
		};
	}, [scanId]);

	const flowData = useMemo(() => {
		if (!graph) {
			return { nodes: [], edges: [] };
		}

		return {
			nodes: layoutNodes(graph.nodes),
			edges: graph.edges.map((edge, index) => ({
				id: `${edge.source}->${edge.target}-${index}`,
				source: edge.source,
				target: edge.target,
				type: "smoothstep",
				markerEnd: {
					type: MarkerType.ArrowClosed,
				},
				style: {
					stroke: "var(--color-main)",
				},
			})),
		};
	}, [graph]);

	if (isLoading) {
		return <p className="status-text">Loading graph...</p>;
	}

	if (error) {
		return <p className="error-text">{error}</p>;
	}

	if (!graph) {
		return <p className="error-text">No graph data found.</p>;
	}

	const defaultEdgeOptions = {
		type: "smoothstep",
	};

	return (
		<div className="graph-view">
			<div className="graph-meta">
				<span>{graph.root_url}</span>
				<span>
					{graph.nodes.length} pages / {graph.edges.length} links
				</span>
			</div>

			<div className="graph-canvas">
				<ReactFlow
					nodes={flowData.nodes}
					edges={flowData.edges}
					fitView
					nodesDraggable={false}
					defaultEdgeOptions={defaultEdgeOptions}
					selectNodesOnDrag={false}
					edgesFocusable={false}
					edgesReconnectable={false}
					nodesConnectable={false}
					onNodeClick={(_, node) => setSelectedNode(node.data as SiteNodeData)}>
					<Background color="rgba(168, 187, 190, 0.18)" gap={28} />
					<MiniMap nodeColor="var(--color-accent-1)" maskColor="rgba(3, 24, 26, 0.72)" />
					<Controls />
				</ReactFlow>
			</div>

			{selectedNode && (
				<aside className="node-details">
					<h2>{selectedNode.title || selectedNode.label}</h2>
					<p>{selectedNode.url}</p>
					<dl>
						<div>
							<dt>Depth</dt>
							<dd>{selectedNode.depth}</dd>
						</div>
						<div>
							<dt>Status</dt>
							<dd>{selectedNode.status_code ?? "unknown"}</dd>
						</div>
					</dl>
				</aside>
			)}
		</div>
	);
}

function layoutNodes(graphNodes: GraphNode[]): Node<SiteNodeData>[] {
	const byDepth = new Map<number, GraphNode[]>();
	const maxRowsPerDepth = 6;
	const nodeXGap = 260;
	const nodeYGap = 120;
	const depthGap = 180;

	for (const node of graphNodes) {
		const depthNodes = byDepth.get(node.depth) ?? [];
		depthNodes.push(node);
		byDepth.set(node.depth, depthNodes);
	}

	const depthStartX = new Map<number, number>();
	let currentX = 0;

	for (const depth of [...byDepth.keys()].sort((a, b) => a - b)) {
		const depthNodes = byDepth.get(depth) ?? [];
		const columns = Math.max(1, Math.ceil(depthNodes.length / maxRowsPerDepth));
		depthStartX.set(depth, currentX);
		currentX += columns * nodeXGap + depthGap;
	}

	return graphNodes.map((node) => {
		const depthNodes = byDepth.get(node.depth) ?? [];
		const depthIndex = depthNodes.findIndex((depthNode) => depthNode.id === node.id);
		const column = Math.floor(depthIndex / maxRowsPerDepth);
		const row = depthIndex % maxRowsPerDepth;
		const startX = depthStartX.get(node.depth) ?? 0;

		return {
			id: node.id,
			position: {
				x: startX + column * nodeXGap,
				y: row * nodeYGap,
			},
			data: {
				label: truncateLabel(node.title || shortUrl(node.url)),
				url: node.url,
				title: node.title,
				depth: node.depth,
				status_code: node.status_code,
			},
			className: "site-node",
		};
	});
}

function shortUrl(url: string): string {
	return url
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/$/, "");
}

function truncateLabel(label: string): string {
	if (label.length <= 30) {
		return label;
	}

	return `${label.slice(0, 29)}…`;
}
