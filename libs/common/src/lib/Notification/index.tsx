import { CommonError } from '../../types';
import { X } from 'lucide-react';
import { Modal } from 'antd';
import delay from 'lodash/delay';
import {
  StyledIconX,
  StyledTextSuccess,
  StyledTitleError,
  StyledTitleSuccess,
  StyledTitleWarning,
} from './styles';

export interface ErrMessage {
  detail: string;
  message?: string;
  title?: string;
}

export const NotificationSuccess = (message: string, timeDelay?: number) => {
  const modalSuccess = Modal.success({
    title: (
      <StyledTitleSuccess>
        <StyledIconX onClick={() => modalSuccess.destroy()}>
          <X size="xl" style={{ color: 'white' }} />
        </StyledIconX>
        <svg
          width="101"
          height="75"
          viewBox="0 0 101 75"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M33.1938 58.0646L74.7104 16.5479L69.1292 11.0646L33.0958 47L16.5479 30.3542L10.9667 35.9354L33.1938 58.0646ZM33.1938 69.1292L0 35.9354L16.5479 19.2896L33.1938 35.9354L69.0313 0L85.8729 16.45L33.1938 69.1292Z"
            fill="#009A00"
            fill-opacity="0.55"
          />
          <path
            d="M48.1938 63.0646L89.7104 21.5479L84.1292 16.0646L48.0958 52L31.5479 35.3542L25.9667 40.9354L48.1938 63.0646ZM48.1938 74.1292L15 40.9354L31.5479 24.2896L48.1938 40.9354L84.0313 5L100.873 21.45L48.1938 74.1292Z"
            fill="white"
          />
        </svg>
        Thành công
      </StyledTitleSuccess>
    ),
    content: <StyledTextSuccess>{message}</StyledTextSuccess>,
    maskClosable: true,
    icon: null,
    footer: null,
    centered: true,
    styles: { content: { padding: 0 } },
  });

  delay(() => {
    modalSuccess.destroy();
  }, timeDelay ?? 2000);

  return modalSuccess;
};

export const NotificationError = (message: string | CommonError) => {
  const modalError = Modal.error({
    title: (
      <StyledTitleError>
        <StyledIconX onClick={() => modalError.destroy()}>
          <X size="xl" style={{ color: 'white' }} />
        </StyledIconX>
        <svg
          width="90"
          height="90"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M41.25 61.875q1.753 0 2.94-1.186 1.185-1.185 1.185-2.939 0-1.753-1.186-2.94-1.185-1.185-2.939-1.185-1.753 0-2.94 1.186-1.185 1.185-1.185 2.939 0 1.753 1.186 2.94 1.185 1.185 2.939 1.185m-4.125-16.5h8.25v-24.75h-8.25zM41.25 82.5q-8.56 0-16.087-3.248-7.53-3.249-13.097-8.818-5.57-5.568-8.818-13.096Q0 49.808 0 41.25q0-8.56 3.248-16.087 3.249-7.53 8.818-13.097 5.568-5.57 13.097-8.818Q32.69 0 41.25 0t16.087 3.248q7.53 3.249 13.097 8.818 5.57 5.568 8.818 13.097Q82.5 32.69 82.5 41.25t-3.248 16.087q-3.249 7.53-8.818 13.097-5.568 5.57-13.096 8.818Q49.808 82.5 41.25 82.5m0-8.25q13.819 0 23.41-9.59t9.59-23.41-9.59-23.41-23.41-9.59-23.41 9.59q-9.59 9.592-9.59 23.41 0 13.819 9.59 23.41 9.592 9.59 23.41 9.59"
            fill="#FB4F4F"
          />
          <path
            d="M48.25 68.875q1.753 0 2.94-1.186 1.185-1.185 1.185-2.939 0-1.753-1.186-2.94-1.185-1.185-2.939-1.185-1.753 0-2.94 1.186-1.185 1.185-1.185 2.939 0 1.753 1.186 2.94 1.185 1.185 2.939 1.185m-4.125-16.5h8.25v-24.75h-8.25zM48.25 89.5q-8.56 0-16.087-3.248-7.53-3.249-13.097-8.818-5.57-5.568-8.818-13.096Q7 56.808 7 48.25q0-8.56 3.248-16.087 3.249-7.53 8.818-13.097 5.568-5.57 13.097-8.818Q39.69 7 48.25 7t16.088 3.248 13.096 8.818 8.818 13.097Q89.5 39.69 89.5 48.25t-3.248 16.088-8.818 13.096-13.096 8.818Q56.808 89.5 48.25 89.5m0-8.25q13.819 0 23.41-9.59t9.59-23.41-9.59-23.41-23.41-9.59-23.41 9.59q-9.59 9.592-9.59 23.41 0 13.819 9.59 23.41 9.592 9.59 23.41 9.59"
            fill="#fff"
          />
        </svg>
        Thất bại
      </StyledTitleError>
    ),
    content: (
      <StyledTextSuccess>
        {typeof message === 'string'
          ? message
          : message?.detail ?? 'Lỗi không xác định'}
      </StyledTextSuccess>
    ),
    maskClosable: true,
    icon: null,
    footer: null,
    centered: true,
    styles: { content: { padding: 0 } },
  });

  delay(() => {
    modalError.destroy();
  }, 2000);

  return modalError;
};

export const NotificationWarning = (message: string) => {
  const modalWarning = Modal.warning({
    title: (
      <StyledTitleWarning>
        <StyledIconX onClick={() => modalWarning.destroy()}>
          <X size="xl" style={{ color: 'white' }} />
        </StyledIconX>
        <svg
          width="90"
          height="90"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M41.25 61.875q1.753 0 2.94-1.186 1.185-1.185 1.185-2.939 0-1.753-1.186-2.94-1.185-1.185-2.939-1.185-1.753 0-2.94 1.186-1.185 1.185-1.185 2.939 0 1.753 1.186 2.94 1.185 1.185 2.939 1.185m-4.125-16.5h8.25v-24.75h-8.25zM41.25 82.5q-8.56 0-16.087-3.248-7.53-3.249-13.097-8.818-5.57-5.568-8.818-13.096Q0 49.808 0 41.25q0-8.56 3.248-16.087 3.249-7.53 8.818-13.097 5.568-5.57 13.097-8.818Q32.69 0 41.25 0t16.087 3.248q7.53 3.249 13.097 8.818 5.57 5.568 8.818 13.097Q82.5 32.69 82.5 41.25t-3.248 16.087q-3.249 7.53-8.818 13.097-5.568 5.57-13.096 8.818Q49.808 82.5 41.25 82.5m0-8.25q13.819 0 23.41-9.59t9.59-23.41-9.59-23.41-23.41-9.59-23.41 9.59q-9.59 9.592-9.59 23.41 0 13.819 9.59 23.41 9.592 9.59 23.41 9.59"
            fill="#FB4F4F"
          />
          <path
            d="M48.25 68.875q1.753 0 2.94-1.186 1.185-1.185 1.185-2.939 0-1.753-1.186-2.94-1.185-1.185-2.939-1.185-1.753 0-2.94 1.186-1.185 1.185-1.185 2.939 0 1.753 1.186 2.94 1.185 1.185 2.939 1.185m-4.125-16.5h8.25v-24.75h-8.25zM48.25 89.5q-8.56 0-16.087-3.248-7.53-3.249-13.097-8.818-5.57-5.568-8.818-13.096Q7 56.808 7 48.25q0-8.56 3.248-16.087 3.249-7.53 8.818-13.097 5.568-5.57 13.097-8.818Q39.69 7 48.25 7t16.088 3.248 13.096 8.818 8.818 13.097Q89.5 39.69 89.5 48.25t-3.248 16.088-8.818 13.096-13.096 8.818Q56.808 89.5 48.25 89.5m0-8.25q13.819 0 23.41-9.59t9.59-23.41-9.59-23.41-23.41-9.59-23.41 9.59q-9.59 9.592-9.59 23.41 0 13.819 9.59 23.41 9.592 9.59 23.41 9.59"
            fill="#fff"
          />
        </svg>
        Cảnh báo
      </StyledTitleWarning>
    ),
    content: <StyledTextSuccess>{message}</StyledTextSuccess>,
    icon: null,
    footer: null,
    centered: true,
    styles: { content: { padding: 0 } },
  });

  delay(() => {
    modalWarning.destroy();
  }, 2000);

  return modalWarning;
};
