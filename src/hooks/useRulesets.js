import { useQuery, useMutation, useQueryClient } from 'react-query';
import { rulesetService } from '../services/rulesets.js';

export const useRulesets = (params = {}) => {
  return useQuery(['rulesets', params], () => rulesetService.getRulesets(params), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRuleset = (id) => {
  return useQuery(['ruleset', id], () => rulesetService.getRuleset(id), {
    enabled: !!id,
  });
};

export const useCreateRuleset = () => {
  const queryClient = useQueryClient();
  
  return useMutation(rulesetService.createRuleset, {
    onSuccess: () => {
      queryClient.invalidateQueries(['rulesets']);
    },
  });
};

export const useUpdateRuleset = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }) => rulesetService.updateRuleset(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['rulesets']);
        queryClient.invalidateQueries(['ruleset', variables.id]);
      },
    }
  );
};

export const useDeleteRuleset = () => {
  const queryClient = useQueryClient();
  
  return useMutation(rulesetService.deleteRuleset, {
    onSuccess: () => {
      queryClient.invalidateQueries(['rulesets']);
    },
  });
};

export const useEvaluateRuleset = () => {
  return useMutation(rulesetService.evaluateRuleset);
};
