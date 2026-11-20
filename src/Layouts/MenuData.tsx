// Platform icons mapping
const platformIcons: { [key: string]: string } = {
  FACEBOOK: "ph-duotone ph-facebook-logo",
  INSTAGRAM: "ph-duotone ph-instagram-logo",
  LINKEDIN: "ph-duotone ph-linkedin-logo",
  X: "ph-duotone ph-twitter-logo",
  TIKTOK: "ph-duotone ph-video",
  YOUTUBE: "ph-duotone ph-youtube-logo",
};

// Platform display names
const platformNames: { [key: string]: string } = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  X: "X (Twitter)",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

// Function to generate dynamic report menu items based on integrations
const generateReportMenuItems = (integrations: any[] = []) => {
  if (!integrations || integrations.length === 0) {
    return [];
  }

  // Filter for connected integrations
  const connectedIntegrations = integrations.filter(
    (integration: any) => integration?.status?.toUpperCase() === "CONNECTED",
  );

  // Generate menu items for each connected platform
  const reportMenuItems = connectedIntegrations.map(
    (integration: any, index: number) => {
      const platformType = integration?.type?.toUpperCase();
      const platformSlug = platformType?.toLowerCase();

      return {
        id: `reports-${platformSlug}`,
        label: platformNames[platformType] || `${platformType} Reports`,
        icon: platformIcons[platformType] || "ph-duotone ph-chart-line",
        link: `/reports/${platformSlug}`,
        dataPage: `w_reports_${platformSlug}`,
        parentId: "reports", // Group under main reports menu
        order: index + 1,
      };
    },
  );

  // Add "All Platforms" report if there are multiple integrations
  if (connectedIntegrations.length > 1) {
    reportMenuItems.push({
      id: "reports-all",
      label: "All Platforms Report",
      icon: "ph-duotone ph-chart-pie",
      link: "/reports/all",
      dataPage: "w_reports_all",
      parentId: "reports",
      order: connectedIntegrations.length + 1,
    });
  }

  return reportMenuItems;
};

import type { FeatureName } from "@/lib/feature-flags";
import type { Role } from "@/lib/roles";

export interface MenuEntry {
  id: string;
  label: string;
  icon?: string;
  link?: string;
  dataPage?: string | null;
  type?: "HASHMENU" | "HEADER";
  /** Hidden while this feature flag is off (src/lib/feature-flags.ts). */
  feature?: FeatureName;
  /** Only these roles see the item. Omit for everyone. */
  roles?: Role[];
  submenu?: MenuEntry[];
  parentId?: string;
  order?: number;
}

/**
 * Sidebar (F-10). New modules sit behind their feature flag; Admin is for admins only.
 * The existing social pages (Data, Statistics) live in the Social group.
 */
const menuItems: MenuEntry[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "ph-duotone ph-gauge",
    link: "/dashboard",
    dataPage: null,
  },
  {
    id: "listening",
    label: "Listening",
    icon: "ph-duotone ph-ear",
    link: "/listening",
    feature: "listening",
  },
  {
    id: "media",
    label: "Media",
    icon: "ph-duotone ph-newspaper",
    link: "/media",
    feature: "listening",
  },
  {
    id: "competitors",
    label: "Competitors",
    icon: "ph-duotone ph-users-three",
    link: "/competitors",
    feature: "competitors",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: "ph-duotone ph-megaphone",
    link: "/campaigns",
    feature: "campaigns",
  },
  {
    id: "paid-media",
    label: "Paid Media",
    icon: "ph-duotone ph-currency-circle-dollar",
    link: "/paid-media",
    feature: "paidMedia",
    roles: ["ADMIN", "MANAGER", "MARKETER"],
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: "ph-duotone ph-chat-circle-text",
    link: "/feedback",
    feature: "feedback",
  },
  {
    id: "insights",
    label: "Insights",
    icon: "ph-duotone ph-lightbulb",
    link: "/insights",
    feature: "insights",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "ph-duotone ph-file-text",
    link: "/reports",
    dataPage: "w_reports",
    type: "HASHMENU", // Expandable; submenu filled per connected platform
    submenu: [],
  },
  {
    id: "social",
    label: "Social",
    icon: "ph-duotone ph-share-network",
    type: "HASHMENU",
    submenu: [
      {
        id: "data",
        label: "Data",
        icon: "ph-duotone ph-database",
        link: "/data",
        dataPage: "w_data",
        parentId: "social",
      },
      {
        id: "statistics",
        label: "Statistics",
        icon: "ph-duotone ph-projector-screen-chart",
        link: "/statistics",
        dataPage: "w_statistics",
        parentId: "social",
      },
    ],
  },
  {
    id: "imports",
    label: "Data imports",
    icon: "ph-duotone ph-upload-simple",
    link: "/admin/imports",
    feature: "adminConsole",
    roles: ["ADMIN", "MANAGER", "ANALYST"],
  },
  {
    id: "admin",
    label: "Admin",
    icon: "ph-duotone ph-shield-check",
    link: "/admin",
    feature: "adminConsole",
    roles: ["ADMIN"],
  },
];

/** Items this user may see: flags on, role allowed, and groups that still have something in them. */
export function visibleMenu(
  items: MenuEntry[],
  options: { role: unknown; enabled: (name: FeatureName) => boolean },
): MenuEntry[] {
  const role =
    typeof options.role === "string" ? options.role.toUpperCase() : "";
  return items.flatMap((item) => {
    if (item.feature && !options.enabled(item.feature)) return [];
    if (item.roles && !item.roles.includes(role as Role)) return [];
    if (!item.submenu || item.submenu.length === 0) return [item];
    const submenu = visibleMenu(item.submenu, options);
    if (submenu.length === 0 && !item.link) return [];
    return [{ ...item, submenu }];
  });
}

export { menuItems, generateReportMenuItems };
