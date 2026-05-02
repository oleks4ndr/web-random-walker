import json
from datetime import datetime, timezone
from uuid import uuid4

from .config import SCANS_DIR


def create_scan_id() -> str:
    return uuid4().hex


def save_scan(
    scan_id: str,
    metadata: dict | None = None,
    graph: dict | None = None,
    metrics: dict | None = None,
    random_walk: dict | None = None,
) -> None:
    if metadata is not None:
        save_scan_file(scan_id, "metadata.json", metadata)
    if graph is not None:
        save_scan_file(scan_id, "graph.json", graph)
    if metrics is not None:
        save_scan_file(scan_id, "metrics.json", metrics)
    if random_walk is not None:
        save_scan_file(scan_id, "random_walk.json", random_walk)


def save_scan_file(scan_id: str, filename: str, data: dict) -> None:
    scan_dir = SCANS_DIR / scan_id
    scan_dir.mkdir(parents=True, exist_ok=True)

    file_path = scan_dir / filename
    with file_path.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


def load_scan_file(scan_id: str, filename: str) -> dict:
    file_path = SCANS_DIR / scan_id / filename
    with file_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def scan_exists(scan_id: str) -> bool:
    return (SCANS_DIR / scan_id).exists()


def new_metadata(root_url: str, max_pages: int, max_depth: int) -> dict:
    return {
        "root_url": root_url,
        "max_pages": max_pages,
        "max_depth": max_depth,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
