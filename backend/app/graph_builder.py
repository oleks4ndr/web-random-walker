import networkx as nx


def build_graph(crawl_result: dict) -> dict:
    graph = nx.DiGraph()
    pages = crawl_result["pages"]
    crawled_urls = {page["url"] for page in pages}

    for page in pages:
        graph.add_node(
            page["url"],
            url=page["url"],
            title=page["title"],
            depth=page["depth"],
            status_code=page["status_code"],
        )

    for page in pages:
        source_url = page["url"]
        for link in page["links"]:
            target_url = link["url"]
            if target_url not in crawled_urls:
                continue

            if not graph.has_edge(source_url, target_url):
                graph.add_edge(
                    source_url,
                    target_url,
                    anchor_text=link["anchor_text"],
                )

    return {
        "root_url": crawl_result["root_url"],
        "nodes": [
            {
                "id": url,
                "url": data["url"],
                "title": data["title"],
                "depth": data["depth"],
                "status_code": data["status_code"],
            }
            for url, data in graph.nodes(data=True)
        ],
        "edges": [
            {
                "source": source,
                "target": target,
                "anchor_text": data["anchor_text"],
            }
            for source, target, data in graph.edges(data=True)
        ],
    }
