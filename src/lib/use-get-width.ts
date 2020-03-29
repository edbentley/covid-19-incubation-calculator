import { useState, useCallback } from "react";

export function useGetWidth(
  updateDep?: any
): [number | null, (node: Element | null) => void] {
  const [width, setWidth] = useState<number | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      if (node === null) return;

      const update = () => setWidth(node.getBoundingClientRect().width);
      update();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = updateDep;

      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    },
    [updateDep]
  );

  return [width, ref];
}
