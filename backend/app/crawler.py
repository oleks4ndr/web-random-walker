from collections import deque

import requests
from bs4 import BeautifulSoup

from .config import (
    DEFAULT_MAX_DEPTH,
    DEFAULT_MAX_PAGES,
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
)
from .utils import extract_internal_url, normalize_start_url


def crawl_site(
    url: str,
    max_pages: int = DEFAULT_MAX_PAGES,
    max_depth: int = DEFAULT_MAX_DEPTH,
    timeout: int = DEFAULT_REQUEST_TIMEOUT_SECONDS,
) -> dict:
    root_url = normalize_start_url(url)
    queue = deque([(root_url, 0)])
    queued = {root_url}
    crawled = set()
    pages = []

    session = requests.Session()
    headers = {"User-Agent": "WebsiteNavigabilityAnalyzer/0.1"}

    while queue and len(pages) < max_pages:
        current_url, depth = queue.popleft()

        if current_url in crawled or depth > max_depth:
            continue

        crawled.add(current_url)
        page = fetch_page(session, current_url, root_url, depth, timeout, headers)
        pages.append(page)

        if depth >= max_depth:
            continue

        for link in page["links"]:
            target_url = link["url"]
            if target_url not in crawled and target_url not in queued:
                queue.append((target_url, depth + 1))
                queued.add(target_url)

    return {
        "root_url": root_url,
        "pages": pages,
    }


def fetch_page(
    session: requests.Session,
    url: str,
    root_url: str,
    depth: int,
    timeout: int,
    headers: dict,
) -> dict:
    page = {
        "url": url,
        "title": None,
        "depth": depth,
        "status_code": None,
        "links": [],
    }

    try:
        response = session.get(url, timeout=timeout, headers=headers)
    except requests.RequestException:
        return page

    page["status_code"] = response.status_code

    content_type = response.headers.get("content-type", "")
    if "text/html" not in content_type:
        return page

    soup = BeautifulSoup(response.text, "html.parser")
    if soup.title and soup.title.string:
        page["title"] = soup.title.string.strip()

    seen_links = set()
    for anchor in soup.find_all("a", href=True):
        target_url = extract_internal_url(anchor["href"], url, root_url)
        if target_url is None or target_url in seen_links:
            continue

        seen_links.add(target_url)
        page["links"].append(
            {
                "url": target_url,
                "anchor_text": anchor.get_text(" ", strip=True) or None,
            }
        )

    return page
