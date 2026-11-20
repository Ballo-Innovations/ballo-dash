import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCompany } from '@/toolkit/Company/reducer';
import { 
  selectIntegrations, 
  selectHasIntegrations, 
  selectIntegrationsLoading, 
  selectIntegrationsError,
  selectIntegrationsIsFetching,
  fetchIntegrations,
  clearIntegrations
} from '@/toolkit/Integrations/reducer';
import { AppDispatch } from '@/toolkit';
import { logger } from "@/lib/logger";

interface UseIntegrationsReturn {
  integrations: any[];
  hasIntegrations: boolean;
  loading: boolean;
  error: string | null;
  refreshIntegrations: () => Promise<void>;
  isInitialized: boolean;
}

export const useIntegrations = (): UseIntegrationsReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const company = useSelector(selectCompany);
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastFetchAttempt = useRef<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get state from Redux store
  const integrations = useSelector(selectIntegrations);
  const hasIntegrations = useSelector(selectHasIntegrations);
  const loading = useSelector(selectIntegrationsLoading);
  const error = useSelector(selectIntegrationsError);
  const isFetching = useSelector(selectIntegrationsIsFetching);
  
  // Check if store is ready (has been hydrated)
  useEffect(() => {
    if (company !== undefined) {
      setIsStoreReady(true);
    }
  }, [company]);
  
  // Memoize cached integrations check to prevent infinite loops
  const hasCachedIntegrations = useMemo(() => {
    return integrations && integrations.length > 0;
  }, [integrations]);
  
  // Cleanup effect - clear stale data when company changes
  useEffect(() => {
    if (isStoreReady && company?.id) {
      // Only clear data if company actually changed AND we don't have cached data
      if (!hasCachedIntegrations) {
        dispatch(clearIntegrations({}));
        setIsInitialized(false);
        logger.debug('🧹 useIntegrations: Company changed, clearing stale data');
      } else {
        // We have cached data, mark as initialized
        setIsInitialized(true);
        logger.debug('✅ useIntegrations: Using cached integrations data');
      }
    }
  }, [company?.id, dispatch, isStoreReady, hasCachedIntegrations]);
  
  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Clear data when component unmounts to prevent memory leaks
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      dispatch(clearIntegrations({}));
      logger.debug('🧹 useIntegrations: Component unmounting, clearing data');
    };
  }, [dispatch]);
  
  // Debug logging - only log when values actually change
  useEffect(() => {
    logger.debug('🔍 useIntegrations hook state:', {
      isStoreReady,
      isInitialized,
      hasCachedIntegrations,
      companyId: company?.id,
      companyName: company?.name,
      integrationsCount: integrations?.length || 0,
      hasIntegrations,
      loading,
      error,
      isFetching
    });
  }, [isStoreReady, isInitialized, hasCachedIntegrations, company?.id, company?.name, integrations?.length, hasIntegrations, loading, error, isFetching]);

  const refreshIntegrations = useCallback(async () => {
    if (company?.id) {
      logger.debug('🔄 useIntegrations: refreshIntegrations called for company:', company.id);
      setIsInitialized(false); // Reset initialization state
      await dispatch(fetchIntegrations(company.id));
      setIsInitialized(true); // Mark as initialized after refresh
    } else {
      logger.warn('⚠️ useIntegrations: Cannot refresh integrations - no company ID');
    }
  }, [company?.id, dispatch]);

  // Debounced fetch function
  const debouncedFetch = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastFetchAttempt.current;
    const minInterval = 1000; // Minimum 1 second between attempts
    
    if (timeSinceLastAttempt < minInterval) {
      logger.debug(`⏳ useIntegrations: Debouncing fetch request (${minInterval - timeSinceLastAttempt}ms remaining)`);
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(() => {
        if (company?.id) {
          logger.debug('🚀 useIntegrations: Debounced fetch executing for company:', company.id);
          dispatch(fetchIntegrations(company.id));
          setIsInitialized(true);
        }
      }, minInterval - timeSinceLastAttempt);
      
      return;
    }
    
    lastFetchAttempt.current = now;
    
    if (company?.id) {
      logger.debug('🚀 useIntegrations: Immediate fetch for company:', company.id);
      dispatch(fetchIntegrations(company.id));
      setIsInitialized(true);
    }
  }, [company?.id, dispatch]);

  useEffect(() => {
    if (!isStoreReady) {
      logger.debug('⏳ useIntegrations: Store not ready yet, waiting...');
      return;
    }
    
    // If we already have cached integrations data, don't fetch again
    if (hasCachedIntegrations && isInitialized) {
      logger.debug('⏳ useIntegrations: Using cached integrations, skipping fetch');
      return;
    }
    
    if (isInitialized) {
      logger.debug('⏳ useIntegrations: Already initialized, skipping...');
      return;
    }
    
    // If already fetching, don't start another request
    if (isFetching) {
      logger.debug('⏳ useIntegrations: Already fetching, skipping...');
      return;
    }
    
    logger.debug('🔄 useIntegrations: useEffect triggered, company?.id:', company?.id);
    if (company?.id) {
      debouncedFetch();
    } else {
      logger.warn('⚠️ useIntegrations: No company ID available, skipping integrations fetch');
    }
  }, [company?.id, isStoreReady, isInitialized, hasCachedIntegrations, isFetching, debouncedFetch]);

  return {
    integrations,
    hasIntegrations,
    loading,
    error,
    refreshIntegrations,
    isInitialized
  };
};
