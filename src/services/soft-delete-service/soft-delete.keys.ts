export const softDeleteKeys = {
  all: ['soft-delete'] as const,
  lists: () => [...softDeleteKeys.all, 'list'] as const,
  list: (model: string, filters: string) => [...softDeleteKeys.lists(), model, filters] as const
}