export type CrawlRequest = {
	url: string;
	max_pages: number;
	max_depth: number;
};

export type CrawlResponse = {
	scan_id: string;
	root_url: string;
	pages_crawled: number;
	links_found: number;
};

export type GraphNode = {
	id: string;
	url: string;
	title: string | null;
	depth: number;
	status_code: number | null;
};

export type GraphEdge = {
	source: string;
	target: string;
	anchor_text: string | null;
};

export type GraphResponse = {
	scan_id: string;
	root_url: string;
	nodes: GraphNode[];
	edges: GraphEdge[];
};

export type RandomWalkRequest = {
	walk_count: number;
	steps_per_walk: number;
	start_url?: string;
};

export type RandomWalkPageResult = {
	url: string;
	title: string | null;
	visit_count: number;
};

export type RandomWalkEdgeResult = {
	source: string;
	target: string;
	traversal_count: number;
};

export type RandomWalkResponse = {
	scan_id: string;
	start_url: string;
	walk_count: number;
	steps_per_walk: number;
	total_steps: number;
	dead_end_hits: number;
	dead_end_rate: number;
	most_visited_pages: RandomWalkPageResult[];
	least_visited_pages: RandomWalkPageResult[];
	edge_traversals: RandomWalkEdgeResult[];
};

export type PageMetric = {
	url: string;
	title: string | null;
	value: number;
};

export type MetricsResponse = {
	scan_id: string;
	total_pages_crawled: number;
	total_internal_links: number;
	pages_with_no_outgoing_links: GraphNode[];
	pages_with_no_incoming_links: GraphNode[];
	most_linked_pages: PageMetric[];
	least_reachable_pages: PageMetric[];
	pages_unreachable_from_homepage: GraphNode[];
	average_clicks_from_homepage: number | null;
	pages_reachable_within_clicks: Record<string, number>;
	dead_end_rate: number | null;
};
