import { Company } from "@/types";
import { logger } from "@/lib/logger";

interface LinkedInOrganizationInfo {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  followerCount?: number;
}

interface LinkedInMetrics {
  followers?: number;
  impressions?: number;
  clicks?: number;
  engagement?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
}

class LinkedInService {
  private static instance: LinkedInService;
  private orgInfo: LinkedInOrganizationInfo | null = null;
  private metrics: Record<string, LinkedInMetrics> = {};
  private isLoading: boolean = false;
  private lastFetch: Record<string, number> = {};
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private constructor() {}

  public static getInstance(): LinkedInService {
    if (!LinkedInService.instance) {
      LinkedInService.instance = new LinkedInService();
    }
    return LinkedInService.instance;
  }

  public async getOrganizationInfo(organizationId: string): Promise<LinkedInOrganizationInfo | null> {
    const cacheKey = `org_${organizationId}`;
    
    if (this.orgInfo && this.isDataFresh(cacheKey)) {
      logger.debug('LinkedInService: Returning cached organization info');
      return this.orgInfo;
    }

    if (this.isLoading) {
      logger.debug('LinkedInService: Request already in progress, waiting...');
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.orgInfo;
    }

    try {
      logger.debug('LinkedInService: Fetching organization info...');
      this.isLoading = true;
      
      const response = await fetch(`/api/data/linkedin/organizationInfo?organizationId=${organizationId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organization info: ${response.status}`);
      }

      const data = await response.json();
      this.orgInfo = data;
      this.lastFetch[cacheKey] = Date.now();
      
      logger.debug('LinkedInService: Organization info stored in cache');
      return this.orgInfo;
    } catch (error) {
      logger.error('❌ LinkedInService: Error fetching organization info:', error);
      return null;
    } finally {
      this.isLoading = false;
    }
  }

  public async getMetrics(organizationId: string, metric: string): Promise<LinkedInMetrics | null> {
    const cacheKey = `metrics_${organizationId}_${metric}`;
    
    if (this.metrics[cacheKey] && this.isDataFresh(cacheKey)) {
      logger.debug(`LinkedInService: Returning cached ${metric} metrics`);
      return this.metrics[cacheKey];
    }

    try {
      logger.debug(`LinkedInService: Fetching ${metric} metrics...`);
      
      const response = await fetch(`/api/data/linkedin/metric?organizationId=${organizationId}&metric=${metric}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${metric} metrics: ${response.status}`);
      }

      const data = await response.json();
      this.metrics[cacheKey] = data;
      this.lastFetch[cacheKey] = Date.now();
      
      logger.debug(`LinkedInService: ${metric} metrics stored in cache`);
      return this.metrics[cacheKey];
    } catch (error) {
      logger.error(`❌ LinkedInService: Error fetching ${metric} metrics:`, error);
      return null;
    }
  }

  public async getMultipleMetrics(organizationId: string, metrics: string[]): Promise<Record<string, LinkedInMetrics>> {
    logger.debug(`LinkedInService: Fetching multiple metrics: ${metrics.join(', ')}`);
    
    const results: Record<string, LinkedInMetrics> = {};
    
    // Fetch metrics in parallel for better performance
    const promises = metrics.map(async (metric) => {
      const data = await this.getMetrics(organizationId, metric);
      if (data) {
        results[metric] = data;
      }
    });
    
    await Promise.all(promises);
    
    return results;
  }

  public async getPosts(organizationId: string): Promise<any[] | null> {
    const cacheKey = `posts_${organizationId}`;
    
    if (this.isDataFresh(cacheKey)) {
      logger.debug('LinkedInService: Returning cached posts');
      return null; // Posts are usually not cached for long
    }

    try {
      logger.debug('LinkedInService: Fetching posts...');
      
      const response = await fetch(`/api/data/linkedin/posts?organizationId=${organizationId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      this.lastFetch[cacheKey] = Date.now();
      
      logger.debug('LinkedInService: Posts fetched successfully');
      return data.posts || [];
    } catch (error) {
      logger.error('❌ LinkedInService: Error fetching posts:', error);
      return null;
    }
  }

  private isDataFresh(cacheKey: string): boolean {
    const lastFetch = this.lastFetch[cacheKey];
    return lastFetch !== undefined && Date.now() - lastFetch < this.CACHE_DURATION;
  }

  public clearCache(): void {
    this.orgInfo = null;
    this.metrics = {};
    this.lastFetch = {};
  }

  public clearMetricCache(organizationId: string, metric?: string): void {
    if (metric) {
      const cacheKey = `metrics_${organizationId}_${metric}`;
      delete this.metrics[cacheKey];
      delete this.lastFetch[cacheKey];
    } else {
      // Clear all metrics for this organization
      Object.keys(this.metrics).forEach(key => {
        if (key.startsWith(`metrics_${organizationId}_`)) {
          delete this.metrics[key];
        }
      });
      Object.keys(this.lastFetch).forEach(key => {
        if (key.startsWith(`metrics_${organizationId}_`)) {
          delete this.lastFetch[key];
        }
      });
    }
  }
}

export const linkedinService = LinkedInService.getInstance();
