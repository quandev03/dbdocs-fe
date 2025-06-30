import httpClient from '../../../services/httpClient';
import axios from 'axios';
import {
  ExportRequest,
  IConfigParam,
  INotification,
  INotificationParams,
  IPage,
} from '../types';
import { LOADER_INIT_KEY } from '../../../constants';
import { baseApiUrl, OidcClientCredentials } from '../../../constants';

export const LayoutService = {
  logout: async (refreshToken: string) => {
    const formReq = new URLSearchParams();
    formReq.append('token', refreshToken);
    localStorage.removeItem(LOADER_INIT_KEY);
    const res = await axios.post<string, void>(
      `/admin-service/private/oauth2/revoke`,
      formReq,
      {
        baseURL: baseApiUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(
            OidcClientCredentials.clientId +
              ':' +
              OidcClientCredentials.clientSecret
          )}`,
        },
      }
    );
    return res;
  },
  getNotification: async (params: INotificationParams) => {
    const res = await httpClient.get<IPage<INotification>>(
      `/notifications`,
      { params }
    );
    if (!res) throw new Error('Oops');
    return res.data;
  },
  readOneNotification: async (id: string) => {
    const res = await httpClient.patch(`/notifications/${id}`);
    return res;
  },
  readAllNotification: async () => {
    const res = await httpClient.patch(`/notifications`);
    return res;
  },
  getParams: async (type: string) => {
    const res = await httpClient.get<IConfigParam[]>(
      `/application-config/get-application-config-active-by-type?type=${type}`
    );
    return res;
  },
  exportExcel: async ({ uri, params }: ExportRequest) => {
    return httpClient.get<Blob>(uri, {
      params,
      responseType: 'blob',
    });
  },
};
