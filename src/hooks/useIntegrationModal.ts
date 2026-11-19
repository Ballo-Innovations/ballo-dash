/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-children-prop */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/toolkit';
import { openModal, closeModal, setModalMode, setIntegrationId } from '@/toolkit/IntegrationModal/reducer';
import { logger } from "@/lib/logger";

export const useIntegrationModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const modalState = useSelector((state: RootState) => state.integrationModal);

  const openIntegrationModal = (mode: 'create' | 'edit' | 'view' = 'view', integrationId?: string) => {
    logger.debug('🔓 Opening integration modal:', { mode, integrationId });
    dispatch(openModal({ mode, integrationId }));
  };

  const closeIntegrationModal = () => {
    logger.debug('🔒 Closing integration modal');
    dispatch(closeModal());
  };

  const setModalModeAction = (mode: 'create' | 'edit' | 'view') => {
    logger.debug('🔄 Setting modal mode:', mode);
    dispatch(setModalMode(mode));
  };

  const setIntegrationIdAction = (id: string) => {
    logger.debug('🆔 Setting integration ID:', id);
    dispatch(setIntegrationId(id));
  };

  logger.debug('🔍 Current modal state:', modalState);

  return {
    // State
    isOpen: modalState.isOpen,
    mode: modalState.mode,
    integrationId: modalState.integrationId,
    
    // Actions
    openIntegrationModal,
    closeIntegrationModal,
    setModalMode: setModalModeAction,
    setIntegrationId: setIntegrationIdAction,
  };
};
