import { useCallback, useEffect, useState } from "react";

export function useAsyncData(loader, dependencies = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const data = await loader();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, dependencies);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  return {
    ...state,
    reload
  };
}
