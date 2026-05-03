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
