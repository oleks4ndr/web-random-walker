from typing import Optional

from pydantic import BaseModel, Field

from .config import (
    DEFAULT_MAX_DEPTH,
    DEFAULT_MAX_PAGES,
    DEFAULT_RANDOM_WALK_COUNT,
    DEFAULT_RANDOM_WALK_STEPS,
)


class CrawlRequest(BaseModel):
    url: str = Field(..., min_length=1)
    max_pages: int = Field(DEFAULT_MAX_PAGES, ge=1, le=500)
    max_depth: int = Field(DEFAULT_MAX_DEPTH, ge=0, le=20)


class CrawlResponse(BaseModel):
    scan_id: str
    root_url: str
    pages_crawled: int
    links_found: int


class ScanSummary(BaseModel):
    scan_id: str
    root_url: str
    created_at: str
    pages_crawled: int
    links_found: int


class RandomWalkRequest(BaseModel):
    walk_count: int = Field(DEFAULT_RANDOM_WALK_COUNT, ge=1, le=100_000)
    steps_per_walk: int = Field(DEFAULT_RANDOM_WALK_STEPS, ge=1, le=10_000)
    start_url: Optional[str] = None


class PageNode(BaseModel):
    id: str
    url: str
    title: Optional[str] = None
    depth: int
    status_code: Optional[int] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    anchor_text: Optional[str] = None


class GraphResponse(BaseModel):
    scan_id: str
    root_url: str
    nodes: list[PageNode]
    edges: list[GraphEdge]


class PageMetric(BaseModel):
    url: str
    title: Optional[str] = None
    value: float | int


class MetricsResponse(BaseModel):
    scan_id: str
    total_pages_crawled: int
    total_internal_links: int
    pages_with_no_outgoing_links: list[PageNode]
    pages_with_no_incoming_links: list[PageNode]
    most_linked_pages: list[PageMetric]
    least_reachable_pages: list[PageMetric]
    pages_unreachable_from_homepage: list[PageNode]
    average_clicks_from_homepage: Optional[float] = None
    pages_reachable_within_clicks: dict[int, int]
    dead_end_rate: Optional[float] = None


class RandomWalkPageResult(BaseModel):
    url: str
    title: Optional[str] = None
    visit_count: int


class RandomWalkEdgeResult(BaseModel):
    source: str
    target: str
    traversal_count: int


class RandomWalkResponse(BaseModel):
    scan_id: str
    start_url: str
    walk_count: int
    steps_per_walk: int
    total_steps: int
    dead_end_hits: int
    dead_end_rate: float
    most_visited_pages: list[RandomWalkPageResult]
    least_visited_pages: list[RandomWalkPageResult]
    edge_traversals: list[RandomWalkEdgeResult]
