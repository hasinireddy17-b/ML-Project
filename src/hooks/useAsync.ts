import { useCallback, useEffect, useState, type DependencyList } from 'react';

interface AsyncState<T> {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
}

export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> & {retry: () => void;} {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: undefined, loading: true });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    fn().
    then((data) => alive && setState({ data, error: undefined, loading: false })).
    catch((e: unknown) =>
    alive && setState({ data: undefined, error: e instanceof Error ? e.message : 'Something went wrong.', loading: false })
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, retry };
}