"use client";

import { useMemo } from "react";
import { interpolate, useTransform, type MotionValue } from "framer-motion";

/**
 * Équivalent de useTransform(value, input, output), mais calculé en JS à chaque frame.
 * Framer Motion délègue sinon certaines propriétés (opacité, couleurs…) au ViewTimeline natif,
 * dont l'interprétation des offsets diffère (ex. opacité 0,79 au repos au lieu de 1).
 */
export function useScrollMap<T extends number | string>(value: MotionValue<number>, input: number[], output: T[]) {
  const key = `${input.join(",")}|${output.join(",")}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => interpolate(input, output), [key]);
  return useTransform(value, (v) => map(v));
}
