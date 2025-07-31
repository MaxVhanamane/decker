import { useMemo, useRef } from "react";
import { useParams as useReactRouterParams } from "react-router-dom";

export const useStableParams = <
  T extends Record<string, string> = Record<string, string>
>(): T => {
  const currentParams = useReactRouterParams() as T;
  const paramsRef = useRef<T>({} as T);

  const stableParams = useMemo(() => {
    // Deep comparison to prevent unnecessary re-renders
    const hasChanged =
      JSON.stringify(currentParams) !== JSON.stringify(paramsRef.current);

    if (hasChanged) {
      paramsRef.current = currentParams;
    }

    return paramsRef.current;
  }, [currentParams]);

  return stableParams;
};
