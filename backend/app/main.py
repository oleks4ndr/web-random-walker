from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .analysis import calculate_metrics, run_random_walks
from .crawler import crawl_site
from .graph_builder import build_graph
from .schemas import (
    CrawlRequest,
    CrawlResponse,
    GraphResponse,
    MetricsResponse,
    RandomWalkRequest,
    RandomWalkResponse,
    ScanSummary,
)
from .storage import (
    create_scan_id,
    list_scan_summaries,
    load_scan_file,
    new_metadata,
    save_scan,
    save_scan_file,
)


app = FastAPI(title="Website Navigability Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok"}


@app.post("/crawl", response_model=CrawlResponse)
def crawl(request: CrawlRequest):
    try:
        crawl_result = crawl_site(
            request.url,
            max_pages=request.max_pages,
            max_depth=request.max_depth,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    scan_id = create_scan_id()
    graph = build_graph(crawl_result)
    metrics = calculate_metrics(graph)

    graph["scan_id"] = scan_id
    metrics["scan_id"] = scan_id

    metadata = new_metadata(
        graph["root_url"],
        request.max_pages,
        request.max_depth,
    )
    metadata["scan_id"] = scan_id
    metadata["pages_crawled"] = len(graph["nodes"])
    metadata["links_found"] = len(graph["edges"])

    save_scan(
        scan_id,
        metadata=metadata,
        graph=graph,
        metrics=metrics,
    )

    return {
        "scan_id": scan_id,
        "root_url": graph["root_url"],
        "pages_crawled": len(graph["nodes"]),
        "links_found": len(graph["edges"]),
    }


@app.get("/scans", response_model=list[ScanSummary])
def get_scans():
    return list_scan_summaries()


@app.get("/scans/{scan_id}/graph", response_model=GraphResponse)
def get_graph(scan_id: str):
    return load_file_or_404(scan_id, "graph.json")


@app.get("/scans/{scan_id}/metrics", response_model=MetricsResponse)
def get_metrics(scan_id: str):
    return load_file_or_404(scan_id, "metrics.json")


@app.post("/scans/{scan_id}/random-walk", response_model=RandomWalkResponse)
def random_walk(scan_id: str, request: RandomWalkRequest):
    graph = load_file_or_404(scan_id, "graph.json")
    start_url = request.start_url or graph["root_url"]

    cached_result = load_cached_random_walk(scan_id)
    if cached_result and random_walk_config_matches(
        cached_result,
        request.walk_count,
        request.steps_per_walk,
        start_url,
    ):
        return cached_result

    result = run_random_walks(
        graph,
        walk_count=request.walk_count,
        steps_per_walk=request.steps_per_walk,
        start_url=start_url,
    )
    result["scan_id"] = scan_id

    metrics = calculate_metrics(graph, result)
    metrics["scan_id"] = scan_id

    save_scan_file(scan_id, "random_walk.json", result)
    save_scan_file(scan_id, "metrics.json", metrics)

    return result


def load_cached_random_walk(scan_id: str) -> dict | None:
    try:
        return load_scan_file(scan_id, "random_walk.json")
    except FileNotFoundError:
        return None


def random_walk_config_matches(
    result: dict,
    walk_count: int,
    steps_per_walk: int,
    start_url: str,
) -> bool:
    return (
        result.get("walk_count") == walk_count
        and result.get("steps_per_walk") == steps_per_walk
        and result.get("start_url") == start_url
    )


def load_file_or_404(scan_id: str, filename: str) -> dict:
    try:
        return load_scan_file(scan_id, filename)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="Scan not found") from error
