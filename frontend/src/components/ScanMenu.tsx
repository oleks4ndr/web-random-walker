import "./ScanMenu.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getScans } from "../api";
import type { ScanSummary } from "../types";

export function ScanMenu() {
	const navigate = useNavigate();
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const [scans, setScans] = useState<ScanSummary[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function openMenu() {
		setIsOpen(true);
		setIsLoading(true);
		setError(null);

		try {
			const scanList = await getScans();
			setScans(scanList);
		} catch (caughtError) {
			setError(
				caughtError instanceof Error ? caughtError.message : "Failed to load scans",
			);
		} finally {
			setIsLoading(false);
		}
	}

	function closeMenu() {
		setIsOpen(false);
	}

	function goToScan(scanId: string) {
		setIsOpen(false);
		navigate(`/graph/${scanId}`);
	}

	function goToNewExploration() {
		setIsOpen(false);
		if (location.pathname !== "/") {
			navigate("/");
		}
	}

	if (!isOpen) {
		return (
			<button className="menu-button" type="button" onClick={openMenu} aria-label="Open scan history">
				<span />
				<span />
				<span />
			</button>
		);
	}

	return (
		<aside className="scan-menu" aria-label="Explored websites">
			<header className="scan-menu-header">
				<button type="button" className="scan-menu-close" onClick={closeMenu} aria-label="Close scan history">
					×
				</button>
				<h2>Explored Websites</h2>
			</header>

			<div className="scan-menu-list">
				{isLoading && <p className="scan-menu-message">Loading...</p>}
				{error && <p className="scan-menu-error">{error}</p>}
				{!isLoading && !error && scans.length === 0 && (
					<p className="scan-menu-message">No explorations yet</p>
				)}
				{!isLoading &&
					!error &&
					scans.map((scan) => (
						<button
							key={scan.scan_id}
							type="button"
							className="scan-card"
							onClick={() => goToScan(scan.scan_id)}>
							<span className="scan-card-url">{shortUrl(scan.root_url)}</span>
							<span className="scan-card-meta">
								{scan.pages_crawled} pages / {scan.links_found} links / {formatDate(scan.created_at)}
							</span>
						</button>
					))}
			</div>

			<button type="button" className="new-exploration-button" onClick={goToNewExploration}>
				+ New Exploration
			</button>
		</aside>
	);
}

function shortUrl(url: string): string {
	return url
		.replace(/^https?:\/\//, "")
		.replace(/\/$/, "");
}

function formatDate(value: string): string {
	if (!value) {
		return "unknown date";
	}

	return new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
