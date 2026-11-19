import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getLinkedInAccessToken } from "@/lib/linkedin";
import { logger } from "@/lib/logger";

const LINKEDIN_API_BASE = "https://api.linkedin.com/v2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const rawOrgId = req.query.organizationId;
  const organizationId = Array.isArray(rawOrgId) ? rawOrgId[0] : rawOrgId;

  logger.debug(`\n=== 🏢 LinkedIn Organization Info API Call ===`);
  logger.debug(`📋 Request Parameters:`);
  logger.debug(`   organizationId: ${organizationId}`);

  if (!organizationId) {
    logger.error(`❌ Missing organizationId parameter`);
    return res.status(400).json({ error: "Missing organizationId" });
  }

  try {
    // Get user session to find company ID
    const session = await getServerSession(req, res, authOptions);
    logger.debug("LinkedIn Organization Info API - Session check");
    logger.debug("   Session exists:", !!session);
    logger.debug("   User email:", session?.user?.email);
    logger.debug("   Company ID:", session?.user?.companyId);
    
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

    logger.debug("✅ Retrieved LinkedIn access token from database for company:", companyId);

    logger.debug(`🏢 Fetching organization info for ID: ${organizationId}`);
    
    // Fetch Organization Info
    const infoUrl = `${LINKEDIN_API_BASE}/organizations/${organizationId}`;
    logger.debug(`🌐 Organization Info API URL: ${infoUrl}`);
    
    const infoRes = await fetch(infoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });
    
    logger.debug(`📡 Organization Info API Response Status: ${infoRes.status}`);
    logger.debug(`📡 Organization Info API Response Headers:`, Object.fromEntries(infoRes.headers.entries()));
    
    if (infoRes.ok) {
      const orgInfoData = await infoRes.json();
      logger.debug(`✅ LinkedIn Organization Info API Response:`, JSON.stringify(orgInfoData, null, 2));
      
      const responseData = {
        id: organizationId,
        name: orgInfoData.localizedName || orgInfoData.name || "Unknown",
        localizedName: orgInfoData.localizedName,
        originalName: orgInfoData.name,
        description: orgInfoData.description,
        websiteUrl: orgInfoData.websiteUrl,
        logoUrl: orgInfoData.logoV2?.original?.url,
        industry: orgInfoData.industry,
        companyType: orgInfoData.companyType,
        foundedYear: orgInfoData.foundedYear,
        staffCountRange: orgInfoData.staffCountRange,
        specialties: orgInfoData.specialties,
        locations: orgInfoData.locations
      };
      
      logger.debug(`📊 Final organization info data:`, responseData);
      logger.debug(`📤 Sending organization info response:`, responseData);
      logger.debug(`=== ✅ LinkedIn Organization Info API Call Complete ===\n`);
      
      res.status(200).json(responseData);
    } else {
      const errorText = await infoRes.text();
      logger.error(`❌ LinkedIn Organization Info API Error: ${infoRes.status} - ${errorText}`);
      logger.debug(`=== ❌ LinkedIn Organization Info API Call Failed ===\n`);
      res.status(infoRes.status).json({ 
        error: "Failed to fetch organization info",
        details: errorText
      });
    }
  } catch (error: any) {
    logger.error(`\n💥 LinkedIn Organization Info API Error:`, error);
    logger.debug(`=== ❌ LinkedIn Organization Info API Call Failed ===\n`);
    res.status(500).json({
      error: "Failed to fetch LinkedIn organization info",
      details: error.message,
    });
  }
} 