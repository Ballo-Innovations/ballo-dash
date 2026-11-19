import type { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getLinkedInAccessToken } from "@/lib/linkedin";
import { logger } from "@/lib/logger";

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { organizationId, metric, since, until, datePreset } = req.query;

  if (
    typeof organizationId !== "string" ||
    typeof metric !== "string"
  ) {
    logger.error(`❌ Missing required parameters`);
    return res.status(400).json({ error: "Missing required parameters" });
  }


  try {
    // Get user session to find company ID
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      logger.error("❌ No session or user email found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get company ID from session
    const companyId = session.user.companyId;
    if (!companyId) {
      logger.error("❌ No company ID found in session for user:", session.user.email);
      return res.status(400).json({ error: "Company ID not found in session" });
    }

    // Fetch LinkedIn access token directly from database
    logger.debug("Fetching LinkedIn access token from database...");
    logger.debug("   User Email:", session.user.email);
    logger.debug("   Company ID:", companyId);
    
    const accessToken = await getLinkedInAccessToken(companyId);
    
    if (!accessToken) {
      logger.error("❌ LinkedIn access token not found in database for company:", companyId);
      return res.status(400).json({ error: "LinkedIn access token not found in database" });
    }

    const orgUrn = `urn:li:organization:${organizationId}`;

    // Check if access token is available and has content
    if (!accessToken || accessToken.trim() === '') {
      logger.error("❌ LinkedIn access token is empty or invalid");
      return res.status(400).json({ error: "LinkedIn access token is empty or invalid" });
    }

    logger.debug("✅ LinkedIn access token is available");

    // Log the request details for inspection
    logger.debug("LinkedIn API Request Details:");
    logger.debug("   Organization ID:", organizationId);
    logger.debug("   Metric:", metric);
    logger.debug("   Since:", since);
    logger.debug("   Until:", until);
    logger.debug("   Date Preset:", datePreset);
    logger.debug("   Organization URN:", orgUrn);
    logger.debug("   Access Token Preview:", accessToken.substring(0, 20) + "...");
    
    logger.debug("✅ LinkedIn access token fetched from database successfully");

    let metricData: any = {};

    switch (metric) {
      case "followers":
        // Fetch followers data
        const followersUrl = new URL(`${LINKEDIN_API_BASE}/organizationalEntityFollowerStatistics`);
        followersUrl.searchParams.set('q', 'organizationalEntity');
        followersUrl.searchParams.set('organizationalEntity', orgUrn);
        
        logger.debug("📊 LinkedIn Followers API Request:");
        logger.debug("   URL:", followersUrl.toString());
        logger.debug("   Method: GET");
        logger.debug("   Headers:", {
          Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
          "X-Restli-Protocol-Version": "2.0.0"
        });
        
        const followersRes = await fetch(followersUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        });
        
        if (followersRes.ok) {
          const followersData = await followersRes.json();
          
          // Parse the LinkedIn API response to get total followers
          let totalFollowers = 0;
          if (followersData.elements && followersData.elements.length > 0) {
            const element = followersData.elements[0];
            
            // Sum up followers from all staff count ranges
            if (element.followerCountsByStaffCountRange) {
              element.followerCountsByStaffCountRange.forEach((range: any) => {
                if (range.followerCounts && range.followerCounts.organicFollowerCount) {
                  totalFollowers += range.followerCounts.organicFollowerCount;
                }
              });
            }
            
            // Sum up followers from all seniority levels
            if (element.followerCountsBySeniority) {
              element.followerCountsBySeniority.forEach((seniority: any) => {
                if (seniority.followerCounts && seniority.followerCounts.organicFollowerCount) {
                  // Don't double-count if already counted in staff ranges
                  // This is a fallback if staff ranges don't have data
                }
              });
            }
            
            // Sum up followers from all functions
            if (element.followerCountsByFunction) {
              element.followerCountsByFunction.forEach((func: any) => {
                if (func.followerCounts && func.followerCounts.organicFollowerCount) {
                  // Don't double-count if already counted in staff ranges
                  // This is a fallback if staff ranges don't have data
                }
              });
            }
          }
          
          // Fallback to scraping if API didn't return data
          if (totalFollowers === 0) {
            const followWidgetUrl = `https://www.linkedin.com/pages-extensions/FollowCompany?id=${organizationId}&counter=bottom`;
            
            const htmlRes = await fetch(followWidgetUrl);
            const htmlText = await htmlRes.text();
            const dom = new JSDOM(htmlText);
            const followerDiv = dom.window.document.querySelector(".follower-count");
            const scrapedFollowerCount = followerDiv?.textContent?.trim() || null;
            
            if (scrapedFollowerCount) {
              totalFollowers = parseInt(scrapedFollowerCount.replace(/[^0-9]/g, ""), 10);
            }
          }
          
          metricData = {
            followers: totalFollowers > 0 ? totalFollowers : null
          };
        } else {
          const errorText = await followersRes.text();
          metricData = { error: `Followers API failed: ${followersRes.status}` };
        }
        break;

      case "impressions":
        // Fetch impressions data
        const statsUrl = new URL(`${LINKEDIN_API_BASE}/organizationalEntityShareStatistics`);
        statsUrl.searchParams.set('q', 'organizationalEntity');
        statsUrl.searchParams.set('organizationalEntity', orgUrn);
        
        logger.debug("👁️ LinkedIn Impressions API Request:");
        logger.debug("   URL:", statsUrl.toString());
        logger.debug("   Method: GET");
        logger.debug("   Headers:", {
          Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
          "X-Restli-Protocol-Version": "2.0.0"
        });
        
        const statsRes = await fetch(statsUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        });
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          
          const shareStats = statsData.elements?.[0]?.totalShareStatistics || {};
          
          metricData = {
            impressionCount: shareStats.impressionCount || 0,
            uniqueImpressionsCount: shareStats.uniqueImpressionsCount || 0
          };
        } else {
          const errorText = await statsRes.text();
          metricData = { error: `Impressions API failed: ${statsRes.status}` };
        }
        break;

      case "clicks":
        // Fetch clicks data
        const clicksUrl = new URL(`${LINKEDIN_API_BASE}/organizationalEntityShareStatistics`);
        clicksUrl.searchParams.set('q', 'organizationalEntity');
        clicksUrl.searchParams.set('organizationalEntity', orgUrn);
        
        logger.debug("🖱️ LinkedIn Clicks API Request:");
        logger.debug("   URL:", clicksUrl.toString());
        logger.debug("   Method: GET");
        logger.debug("   Headers:", {
          Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
          "X-Restli-Protocol-Version": "2.0.0"
        });
        
        const clicksRes = await fetch(clicksUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        });
        
        if (clicksRes.ok) {
          const clicksData = await clicksRes.json();
          
          const shareStats = clicksData.elements?.[0]?.totalShareStatistics || {};
          
          metricData = {
            clickCount: shareStats.clickCount || 0
          };
        } else {
          const errorText = await clicksRes.text();
          metricData = { error: `Clicks API failed: ${clicksRes.status}` };
        }
        break;

      case "engagement":
        logger.debug(`\n❤️ Fetching LinkedIn Engagement Data...`);
        // Fetch engagement data
        const engagementUrl = new URL(`${LINKEDIN_API_BASE}/organizationalEntityShareStatistics`);
        engagementUrl.searchParams.set('q', 'organizationalEntity');
        engagementUrl.searchParams.set('organizationalEntity', orgUrn);
        
        logger.debug("❤️ LinkedIn Engagement API Request:");
        logger.debug("   URL:", engagementUrl.toString());
        logger.debug("   Method: GET");
        logger.debug("   Headers:", {
          Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
          "X-Restli-Protocol-Version": "2.0.0"
        });
        
        const engagementRes = await fetch(engagementUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        });
        
        logger.debug(`📡 Engagement API Response Status: ${engagementRes.status}`);
        logger.debug(`📡 Engagement API Response Headers:`, Object.fromEntries(engagementRes.headers.entries()));
        
        if (engagementRes.ok) {
          const engagementData = await engagementRes.json();
          logger.debug(`✅ LinkedIn Engagement API Response:`, JSON.stringify(engagementData, null, 2));
          
          const shareStats = engagementData.elements?.[0]?.totalShareStatistics || {};
          logger.debug(`📊 Extracted share statistics:`, shareStats);
          
          metricData = {
            engagement: shareStats.engagement || 0,
            likeCount: shareStats.likeCount || 0,
            commentCount: shareStats.commentCount || 0,
            shareCount: shareStats.shareCount || 0,
            shareMentionsCount: shareStats.shareMentionsCount || 0,
            commentMentionsCount: shareStats.commentMentionsCount || 0
          };

          
          
          logger.debug(`📊 Final engagement metric data:`, metricData);
        } else {
          const errorText = await engagementRes.text();
          logger.error(`❌ LinkedIn Engagement API Error: ${engagementRes.status} - ${errorText}`);
          metricData = { error: `Engagement API failed: ${engagementRes.status}` };
        }
        break;

      default:
        logger.error(`❌ Unknown metric: ${metric}`);
        throw new Error(`Unknown metric: ${metric}`);
    }

    res.status(200).json(metricData);
  } catch (error) {
    logger.error(`Error fetching LinkedIn metric ${metric}:`, error);
    res.status(500).json({ error: `Failed to fetch metric ${metric}` });
  }
} 