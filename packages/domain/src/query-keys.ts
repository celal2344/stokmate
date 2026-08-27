export const productQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...productQueryKeys.details(), id] as const,
  stats: () => [...productQueryKeys.all, "stats"] as const
};

export const lookupQueryKeys = {
  all: ["lookups"] as const,
  categories: () => [...lookupQueryKeys.all, "categories"] as const,
  brands: () => [...lookupQueryKeys.all, "brands"] as const
};
