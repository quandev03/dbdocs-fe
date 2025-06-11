import { useQueryClient } from '@tanstack/react-query';
import { AnyElement } from '../types';

const useGetDataFromQueryKey = <T>(name: AnyElement[]) => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(name) as T;
};

export default useGetDataFromQueryKey;
