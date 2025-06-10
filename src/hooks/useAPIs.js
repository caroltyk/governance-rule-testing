import { useQuery } from 'react-query';
import { rulesetService } from '../services/rulesets.js';

export const useAPIs = (params = {}) => {
  return useQuery(['apis', params], () => rulesetService.getAPIs(params), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAPI = (id) => {
  return useQuery(['api', id], () => rulesetService.getAPI(id), {
    enabled: !!id,
  });
};
