import random
from collections import Counter, deque

from .config import DEFAULT_RANDOM_WALK_COUNT, DEFAULT_RANDOM_WALK_STEPS


def calculate_metrics(graph: dict, random_walk_result: dict | None = None) -> dict:
    nodes = graph["nodes"]
    edges = graph["edges"]
    root_url = graph["root_url"]
    node_by_url = {node["url"]: node for node in nodes}
    adjacency = build_adjacency(nodes, edges)
    incoming_count = Counter(edge["target"] for edge in edges)
    distances = shortest_distances(root_url, adjacency)

    reachable_distances = [
        distance
        for url, distance in distances.items()
        if url != root_url and url in node_by_url
    ]

    return {
        "total_pages_crawled": len(nodes),
        "total_internal_links": len(edges),
        "pages_with_no_outgoing_links": [
            node for node in nodes if len(adjacency[node["url"]]) == 0
        ],
        "pages_with_no_incoming_links": [
            node for node in nodes if incoming_count[node["url"]] == 0
        ],
        "most_linked_pages": [
            page_metric(node_by_url[url], count)
            for url, count in incoming_count.most_common(10)
            if url in node_by_url
        ],
        "least_reachable_pages": [
            page_metric(node_by_url[url], distance)
            for url, distance in sorted(
                distances.items(),
                key=lambda item: item[1],
                reverse=True,
            )[:10]
            if url != root_url and url in node_by_url
        ],
        "pages_unreachable_from_homepage": [
            node for node in nodes if node["url"] not in distances
        ],
        "average_clicks_from_homepage": average(reachable_distances),
        "pages_reachable_within_clicks": {
            1: count_reachable_within(distances, root_url, 1),
            2: count_reachable_within(distances, root_url, 2),
            3: count_reachable_within(distances, root_url, 3),
        },
        "dead_end_rate": (
            random_walk_result["dead_end_rate"] if random_walk_result else None
        ),
    }


def run_random_walks(
    graph: dict,
    walk_count: int = DEFAULT_RANDOM_WALK_COUNT,
    steps_per_walk: int = DEFAULT_RANDOM_WALK_STEPS,
    start_url: str | None = None,
) -> dict:
    nodes = graph["nodes"]
    edges = graph["edges"]
    node_by_url = {node["url"]: node for node in nodes}
    adjacency = build_adjacency(nodes, edges)

    start_url = start_url or graph["root_url"]
    if start_url not in node_by_url:
        start_url = graph["root_url"]

    visit_counts = Counter()
    edge_counts = Counter()
    dead_end_hits = 0
    total_steps = walk_count * steps_per_walk

    for _ in range(walk_count):
        current_url = start_url
        visit_counts[current_url] += 1

        for _ in range(steps_per_walk):
            choices = adjacency[current_url]
            if not choices:
                dead_end_hits += 1
                current_url = start_url
                visit_counts[current_url] += 1
                continue

            next_url = random.choice(choices)
            edge_counts[(current_url, next_url)] += 1
            visit_counts[next_url] += 1
            current_url = next_url

    ranked_pages = [
        {
            "url": url,
            "title": node_by_url[url]["title"],
            "visit_count": visit_counts[url],
        }
        for url in node_by_url
    ]

    return {
        "start_url": start_url,
        "walk_count": walk_count,
        "steps_per_walk": steps_per_walk,
        "total_steps": total_steps,
        "dead_end_hits": dead_end_hits,
        "dead_end_rate": dead_end_hits / total_steps if total_steps else 0,
        "most_visited_pages": sorted(
            ranked_pages,
            key=lambda page: page["visit_count"],
            reverse=True,
        )[:10],
        "least_visited_pages": sorted(
            ranked_pages,
            key=lambda page: page["visit_count"],
        )[:10],
        "edge_traversals": [
            {
                "source": source,
                "target": target,
                "traversal_count": count,
            }
            for (source, target), count in edge_counts.most_common()
        ],
    }


def build_adjacency(nodes: list[dict], edges: list[dict]) -> dict:
    adjacency = {node["url"]: [] for node in nodes}
    for edge in edges:
        if edge["source"] in adjacency:
            adjacency[edge["source"]].append(edge["target"])
    return adjacency


def shortest_distances(root_url: str, adjacency: dict) -> dict:
    if root_url not in adjacency:
        return {}

    distances = {root_url: 0}
    queue = deque([root_url])

    while queue:
        current_url = queue.popleft()
        for next_url in adjacency[current_url]:
            if next_url not in distances:
                distances[next_url] = distances[current_url] + 1
                queue.append(next_url)

    return distances


def count_reachable_within(distances: dict, root_url: str, clicks: int) -> int:
    return sum(
        1
        for url, distance in distances.items()
        if url != root_url and distance <= clicks
    )


def page_metric(node: dict, value: int | float) -> dict:
    return {
        "url": node["url"],
        "title": node["title"],
        "value": value,
    }


def average(values: list[int]) -> float | None:
    if not values:
        return None
    return sum(values) / len(values)
