import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  collection: string;
  emptyMessage: string;
  children: (items: T[]) => ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, collection, emptyMessage, children }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getJson<Record<string, T[]>>(endpoint)
      .then((response) => {
        const records = response[collection];
        if (!Array.isArray(records)) throw new Error('Invalid API response');
        if (active) setItems(records);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [collection, endpoint]);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>
    {loading ? <p role="status">Loading {title.toLowerCase()}...</p>
      : error ? <p role="alert">Unable to load {title.toLowerCase()}.</p>
        : items.length === 0 ? <p role="status">{emptyMessage}</p>
          : children(items)}
  </div></section>;
}
