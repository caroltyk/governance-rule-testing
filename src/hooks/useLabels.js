import { useQuery } from 'react-query';
import { rulesetService } from '../services/rulesets.js';

export const useLabels = (params = {}) => {
  return useQuery(['labels', params], () => rulesetService.getLabels(params), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLabel = (id) => {
  return useQuery(['label', id], () => rulesetService.getLabel(id), {
    enabled: !!id,
  });
};
