import { useState, useEffect } from 'react';

interface Topic {
  id: string;
  label: string;
  definition: string | null;
  domain: string | null;
  related_topics: string | null;
}

export function useTopics(search?: string) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (search) {
          params.set('search', search);
        }
        const response = await fetch(`/api/topics?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        const data = await response.json();
        setTopics(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, [search]);

  return { topics, loading, error };
}

