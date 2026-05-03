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


def list_scan_summaries() -> list[dict]:
    if not SCANS_DIR.exists():
        return []

    scans = []
    for scan_dir in SCANS_DIR.iterdir():
        if not scan_dir.is_dir():
            continue

        metadata_path = scan_dir / "metadata.json"
        if not metadata_path.exists():
            continue

        with metadata_path.open("r", encoding="utf-8") as file:
            metadata = json.load(file)

        scans.append(
            {
                "scan_id": metadata.get("scan_id", scan_dir.name),
                "root_url": metadata.get("root_url", ""),
                "created_at": metadata.get("created_at", ""),
                "pages_crawled": metadata.get("pages_crawled", 0),
                "links_found": metadata.get("links_found", 0),
            }
        )

    return sorted(scans, key=lambda scan: scan["created_at"], reverse=True)


def scan_exists(scan_id: str) -> bool:
    return (SCANS_DIR / scan_id).exists()


def new_metadata(root_url: str, max_pages: int, max_depth: int) -> dict:
    return {
        "root_url": root_url,
        "max_pages": max_pages,
        "max_depth": max_depth,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
