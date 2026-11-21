import Link from "next/link";
import { useRouter } from "next/router";

const TABS = [
  { href: "/listening", label: "Mentions" },
  { href: "/listening/live", label: "Live wall" },
  { href: "/listening/alerts", label: "Alerts" },
];

/** Switches between the Listening views, keeping the shared filters in the URL. */
export function ListeningTabs() {
  const router = useRouter();
  const keep = Object.fromEntries(
    Object.entries(router.query).filter(([k]) =>
      ["period", "from", "to", "brand", "features"].includes(k),
    ),
  ) as Record<string, string>;
  return (
    <ul className="nav nav-tabs mb-3">
      {TABS.map((tab) => (
        <li className="nav-item" key={tab.href}>
          <Link
            href={{ pathname: tab.href, query: keep }}
            className={`nav-link${router.pathname === tab.href ? " active" : ""}`}
            aria-current={router.pathname === tab.href ? "page" : undefined}
          >
            {tab.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
