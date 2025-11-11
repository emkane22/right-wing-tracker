import { useState, useEffect } from 'react';

interface Person {
  id: string;
  name: string;
  role: string | null;
  jurisdiction: string | null;
  actor_type: string | null;
  active_since: string | null;
  notes: string | null;
  affiliations: string | null;
}

export function usePeople(search?: string) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPeople() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (search) {
          params.set('search', search);
        }
        const response = await fetch(`/api/people?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch people');
        }
        const data = await response.json();
        setPeople(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchPeople();
  }, [search]);

  return { people, loading, error };
}

