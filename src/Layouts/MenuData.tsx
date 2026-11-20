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
    (integration: any) => integration?.status?.toUpperCase() === "CONNECTED"
  );

  // Generate menu items for each connected platform
  const reportMenuItems = connectedIntegrations.map((integration: any, index: number) => {
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
  });

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

/**
 * Sidebar items. Only real product pages belong here; the template's demo
 * entries were removed with the demo pages (H-07). New modules add their item
 * behind a feature flag (F-10): give it `feature: "listening"` (a FeatureName)
 * and Header hides it while that flag is off.
 */
const menuItems = [
  {
    type: "HASHMENU",
    id: 1,
    label: "Dashboard",
    icon: "ph-duotone ph-gauge",
    dataPage: null,
    link: "/dashboard",
  },
  {
    id: "data",
    label: "Data",
    icon: "ph-duotone ph-database",
    link: "/data",
    dataPage: "w_data",
  },
  {
    id: "statistics",
    label: "Statistics",
    icon: "ph-duotone ph-projector-screen-chart",
    link: "/statistics",
    dataPage: "w_statistics",
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
];

export { menuItems, generateReportMenuItems };
