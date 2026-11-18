import { useEffect, useState } from 'react';
import { searchPlaces } from '../lib/geocoding';

/** Busca endereços reais (OpenStreetMap) com debounce e cancelamento. */
export function usePlaceSearch(query) {
  const [state, setState] = useState({ results: [], loading: false });

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setState({ results: [], loading: false });
      return undefined;
    }
    setState((s) => ({ ...s, loading: true }));
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(q, controller.signal)
        .then((results) => setState({ results, loading: false }))
        .catch((error) => {
          if (error.name !== 'AbortError') setState({ results: [], loading: false });
        });
    }, 450);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return state;
}
