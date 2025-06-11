import { ReactNode } from 'react';
import type { RcFile as OriRcFile } from 'rc-upload/lib/interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyElement = any;

export interface IPage<T> {
  content: T[];
  pageable: IPageable;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  sort: ISort;
  last: boolean;
  first: boolean;
  empty: boolean;
  totalUnseen?: number;
}

export interface ISort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

export interface IPageable {
  sort: ISort;
  offset: number;
  pageSize: number;
  pageNumber: number;
  unpaged: boolean;
  paged: boolean;
}

export interface IParamsRequest {
  page: number;
  size: number;
  q?: string;
  status?: string;
  filters?: string[];
}

//dùng để check quyền các button
export enum ActionsTypeEnum {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT_EXCEL = 'EXPORT_EXCEL',
  RECREATE_ORDER = 'RECREATE_ORDER',
}

export interface IFieldErrorsItem {
  field: string;
  detail: string;
}

export interface IErrorResponse {
  detail: string;
  message: string;
  error?: string;
  path?: string;
  status: number;
  title: string;
  type: string;
  code?: string;
  errors: IFieldErrorsItem[];
}

//dùng để check status trả ra từ api
export enum ACTION_MODE_ENUM {
  CREATE = 'CREATE',
  EDIT = 'UPDATE',
  VIEW = 'READ',
  Delete = 'DELETE',
}

export interface MenuItem {
  key: string;
  icon?: ReactNode;
  label: string;
  uri?: string;
  parentId?: string;
  hasChild?: boolean;
  actions?: string[];
}

export interface MenuObjectItem {
  code: string;
  name: string;
  uri: string;
  items: MenuObjectItem[];
  actions: ActionsTypeEnum[];
}

export interface IResCatalogService<T> {
  data: T[];
  status: {
    code: string;
    message: string;
    responseTime: string;
    displayMessage: string;
    properties: AnyElement;
  };
}

export type CommonError = {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  data: AnyElement;
  errors: FieldErrorsType[];
  //trường hợp 404
  error?: string;
};

export interface FieldErrorsType {
  field: string;
  detail: string;
}

export interface RcFile extends OriRcFile {
  readonly lastModifiedDate: Date;
}

export type PDFFile = string | File | null;

export type IOption = {
  label: string;
  value: number | string;
};

export type ParamsOptionType = {
  PRODUCT_PRODUCT_UOM: IOption[];
};

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  sendDate: string;
  seen: boolean;
}

export interface DataNotify {
  data: NotificationItem[];
  totalNotSeen: number;
}

export interface IParamItem {
  label: string;
  value: string;
}

export interface IAllParamResponse {
  CLIENT_TYPE: IParamItem[];
  GENDER: IParamItem[];
  SALE_ORDER_STATUS: IParamItem[];
  SALE_ORDER_APPROVAL_STATUS: IParamItem[];
  PRODUCT_CATEGORY_CATEGORY_TYPE: IParamItem[];
}

export interface IUserInfo {
  username?: string;
  gender?: string;
  dateOfBirth?: string;
  idCardNo?: string;
  code?: string;
  fullname?: string;
  phoneNumber?: string;
  type?: string;
  organization?: string;
  position?: string;
  needChangePassword?: boolean;
  createdDate?: string;
  id: string;
  groups: AnyElement[];
  roles: AnyElement[];
  groupOptions?: AnyElement[];
  roleOptions?: AnyElement[];
  departments: AnyElement[];
}

export type UserCatalogResponse = {
  data: IPage<IUserInfo>;
};

export type GetALLData = {
  id: string;
  code: string;
  name: string;
  username: string;
  fullname: string;
  status: 0 | 1;
};

export type AllUserType =
  | { isPartner: true; clientIdentity: string }
  | { isPartner: false };
export interface ICriteriaItem {
  id: number;
  type: string;
  code: string;
  name: string;
  dataType: string | null;
  value: string;
  status: string;
}

export interface ExportRequest {
  uri: string;
  params: Record<string, string>;
  filename?: string;
}

export interface IOptionProductCategory {
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate?: AnyElement;
  id: number;
  tableName: string;
  columnName: string;
  code: string;
  value: string;
  valueType?: AnyElement;
  refId?: AnyElement;
  status: number;
}

export interface INotification {
  id: string;
  title: string;
  content: string;
  sendDate: string;
  seen: boolean;
  uriRef: string;
  props: string;
  clientId: string;
  clientCode: string;
  receiverId: string;
  receiverPreferredUsername: string;
}

export interface INotificationParams {
  page?: number;
  limit?: number;
  lastNotificationId?: string;
  seen?: boolean;
}

export interface IPageNotification {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface IConfigParam {
  id: number;
  type: string;
  code: string;
  name: string;
  dataType: string;
  value: string;
  status: number;
  statusOnline: number;
  channel: number;
}
