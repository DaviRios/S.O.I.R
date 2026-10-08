import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CaseContentDTO } from '../../../services/cases.service';
import {
  deleteCase,
  listCases,
  publishCase,
  toggleCase,
  unpublishCase,
} from '../../../services/cases.service';

export function useCases() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['cases'],
    queryFn: ({ signal }) => listCases(undefined, signal),
  });

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ['cases'] });
  }

  async function toggleActive(item: CaseContentDTO) {
    await toggleCase(item.id);
    await invalidate();
  }

  async function togglePublication(item: CaseContentDTO) {
    if (item.isPublished) await unpublishCase(item.id);
    else await publishCase(item.id);
    await invalidate();
  }

  async function remove(item: CaseContentDTO) {
    await deleteCase(item.id);
    await invalidate();
  }

  return {
    cases: query.data ?? [],
    isPending: query.isPending,
    invalidate,
    remove,
    toggleActive,
    togglePublication,
  };
}
