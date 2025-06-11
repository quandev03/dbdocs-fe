import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { LayoutService } from '../services';
import { INotificationParams, IOption } from '../types';
import { downloadFileExcel } from '@/utils/handleFile';

export const useInfinityScrollNotification = (params: INotificationParams) => {
  return useInfiniteQuery({
    queryKey: ['useInfinityScrollNotificationKey', params],
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) => {
      return LayoutService.getNotification({ ...params, page: pageParam });
    },
    select: data => {
      const { pages } = data;
      const result = pages.flatMap(page => page.content);
      return {
        data: result,
        total: pages[0].totalUnseen ?? 0,
      };
    },
    getNextPageParam: lastPage => {
      if (lastPage.last || !lastPage.content || lastPage.content.length === 0) {
        return undefined;
      }
      if (lastPage.content.length > 0 && lastPage.number !== 0) {
        params.lastNotificationId =
          lastPage.content[lastPage.content.length - 1].id;
      }
      return lastPage.number + 1;
    },
    refetchOnWindowFocus: true,
  });
};

export const useReadOneNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: LayoutService.readOneNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['useInfinityScrollNotificationKey'],
      });
    },
  });
};

export const useReadAllNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: LayoutService.readAllNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['useInfinityScrollNotificationKey'],
      });
    },
  });
};

export const useGetParams = (type: string) => {
  const Key = `GET_PARAMS_${type}`;
  return useQuery({
    queryKey: [Key, type],
    queryFn: () => LayoutService.getParams(type),
    select(data) {
      const result: IOption[] = [];
      data.data.map(item =>
        result.push({ label: item.name, value: item.value }),
      );
      return result;
    },
  });
};

export const useExportMutation = () => {
  return useMutation({
    mutationFn: LayoutService.exportExcel,
    onSuccess: (data, { filename }) => downloadFileExcel(data.data, filename),
  });
};
