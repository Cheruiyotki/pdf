import { toolMap } from "@quickconvert/shared";

export function getTool(slug: string) {
  return toolMap[slug];
}
