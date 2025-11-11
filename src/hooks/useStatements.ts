import { useState, useEffect } from 'react';

interface Statement {
  id: string;
  date: string;
  actor_id: string;
  type: string | null;
  short_quote: string | null;
  topic_ids: string | null;
  source_id: string | null;
  notes: string | null;
  sources?: {
    id: string;
    title: string | null;
    url: string | null;
  } | null;
}

export function useStatements(options?: {
  actorId?: string;
  topicIds?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}) {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStatements() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (options?.actorId) {
          params.set('actor_id', options.actorId);
        }
        if (options?.topicIds) {
          params.set('topic_ids', options.topicIds);
        }
        if (options?.dateFrom) {
          params.set('date_from', options.dateFrom);
        }
        if (options?.dateTo) {
          params.set('date_to', options.dateTo);
        }
        if (options?.limit) {
          params.set('limit', options.limit.toString());
        }
        const response = await fetch(`/api/statements?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch statements');
        }
        const data = await response.json();
        setStatements(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchStatements();
  }, [options?.actorId, options?.topicIds, options?.dateFrom, options?.dateTo, options?.limit]);

  return { statements, loading, error };
}

