"use client"

import { useEffect } from 'react';
import { db } from '@/lib/db';
import { api } from '@/lib/api';
import { useAuthStore, useDocStore } from '@/lib/store';

export function useOfflineSync() {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchDocuments } = useDocStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const syncData = async () => {
      try {
        // 1. Fetch from API
        const remoteDocs = await api.getDocuments();
        
        // 2. Clear and Save to Dexie
        await db.documents.clear();
        await db.documents.bulkAdd(remoteDocs.map((doc: any) => ({
          id: doc.document_id,
          tenant_id: doc.tenant_id,
          filename: doc.filename,
          processing_status: doc.status,
          industry: doc.industry_name,
          category: doc.category_name,
          created_at: doc.created_on,
          updated_at: doc.updated_on || doc.created_on
        })));

        console.log('Offline sync completed successfully.');
      } catch (err) {
        console.error('Offline sync failed:', err);
      }
    };

    // Initial sync
    syncData();

    // Listen for online status
    window.addEventListener('online', syncData);
    
    return () => {
      window.removeEventListener('online', syncData);
    };
  }, [isAuthenticated, user]);

  return null;
}
