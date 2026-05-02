from urllib.parse import urljoin, urlsplit, urlunsplit


def normalize_url(raw_url: str, base_url: str | None = None) -> str | None:
    url = raw_url.strip()
    if not url:
        return None

    if url.startswith(("mailto:", "tel:", "javascript:")):
        return None

    if base_url:
        url = urljoin(base_url, url)
    elif "://" not in url:
        url = f"https://{url}"

    parsed = urlsplit(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return None

    scheme = parsed.scheme.lower()
    host = normalize_hostname(parsed.netloc)
    netloc = host
    path = normalize_path(parsed.path)
    return urlunsplit((scheme, netloc, path, parsed.query, ""))


def normalize_start_url(raw_url: str) -> str:
    normalized = normalize_url(raw_url)
    if normalized is None:
        raise ValueError("URL must be an http(s) URL")
    return normalized


def is_internal_url(candidate_url: str, root_url: str) -> bool:
    candidate = normalize_url(candidate_url)
    root = normalize_url(root_url)
    if candidate is None or root is None:
        return False

    candidate_host = urlsplit(candidate).hostname
    root_host = urlsplit(root).hostname
    return candidate_host == root_host


def extract_internal_url(raw_url: str, page_url: str, root_url: str) -> str | None:
    normalized = normalize_url(raw_url, base_url=page_url)
    if normalized is None:
        return None

    return normalized if is_internal_url(normalized, root_url) else None


def normalize_hostname(hostname: str) -> str:
    hostname = hostname.lower().strip("/")
    if hostname.startswith("www."):
        hostname = hostname[4:]

    return f"www.{hostname}"


def normalize_path(path: str) -> str:
    if not path:
        return "/"

    if not path.startswith("/"):
        path = f"/{path}"

    if len(path) > 1:
        path = path.rstrip("/")

    return path
