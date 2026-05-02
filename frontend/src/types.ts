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
