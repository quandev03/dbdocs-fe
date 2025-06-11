import { ReactNode } from 'react';
import { ActionsTypeEnum } from './enum';
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
  [key: string]: AnyElement;
};

export interface ILoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
