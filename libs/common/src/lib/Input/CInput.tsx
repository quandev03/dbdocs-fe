import {
  RegSpecialCharactersExceptHyphenAndUnderscore,
  RegSpecicalChar,
  RegSpecicalCharExceptUnderscore,
} from '../../constants/regex';
import { AnyElement } from '../../types';
import { convertVietnameseToEnglish } from '../../utils';
import { Form, Input, InputProps, InputRef } from 'antd';
import React, { forwardRef, useCallback } from 'react';

interface Props extends InputProps {
  children?: React.ReactElement | React.ReactElement[] | React.ReactNode;
  uppercase?: boolean;
  onlyNumber?: boolean;
  preventNumber?: boolean;
  preventNumber0?: boolean;
  preventSpace?: boolean;
  preventSpecial?: boolean;
  preventSpecialExceptHyphenAndUnderscore?: boolean;
  preventVietnamese?: boolean;
  preventDoubleSpace?: boolean;
  preventSpecialExceptUnderscore?: boolean;
}

export const CInput = forwardRef<InputRef, Props>(
  (
    {
      id,
      children,
      onBlur,
      onChange,
      type,
      uppercase,
      onlyNumber,
      preventNumber,
      preventNumber0,
      preventSpace,
      preventSpecial,
      preventSpecialExceptHyphenAndUnderscore,
      preventVietnamese,
      preventDoubleSpace,
      preventSpecialExceptUnderscore,
      ...rest
    },
    ref
  ) => {
    const form = Form.useFormInstance();
    // check field name of form list yes or no
    const field = id?.includes('_')
      ? id?.split('_').map((i) => (isNaN(+i) ? i : +i))
      : id;
    const handleBlur = useCallback(
      (e: AnyElement) => {
        form?.validateFields([field]);
        if (onBlur) {
          onBlur(e);
        } else {
          if (form) {
            form.setFieldValue(field, e.target.value.trim());
          }
        }
      },
      [field, form, onBlur]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      let value = e.target.value;

      if (preventVietnamese) {
        value = convertVietnameseToEnglish(value);
        form.setFieldValue(field, value);
      }
      if (uppercase) {
        value = value?.toLocaleUpperCase();
        form.setFieldValue(field, value);
      }
      if (onlyNumber) {
        value = value?.replace(/\D/g, '');
        form.setFieldValue(field, value);
      }
      if (preventNumber) {
        value = value?.replace(/\d/g, '');
        form.setFieldValue(field, value);
      }
      if (preventNumber0) {
        value = value.startsWith('0') ? value?.replace('0', '') : value;
        form.setFieldValue(field, value);
      }
      if (preventSpace) {
        value = value?.replace(/\s/g, '');
        form.setFieldValue(field, value);
      }
      if (preventDoubleSpace) {
        value = value?.replace(/\s{2,}/g, ' ');
        form.setFieldValue(field, value);
      }
      if (preventSpecial) {
        value = value?.replace(RegSpecicalChar, '');
        form.setFieldValue(field, value);
      }
      if (preventSpecialExceptHyphenAndUnderscore) {
        value = value?.replace(
          RegSpecialCharactersExceptHyphenAndUnderscore,
          ''
        );
        form.setFieldValue(field, value);
      }
      if (preventSpecialExceptUnderscore) {
        value = value?.replace(RegSpecicalCharExceptUnderscore, '');
        form.setFieldValue(field, value);
      }
      if (type === 'number') {
        form.setFieldValue(field, value ? Number(value) : '');
      }
    };

    return (
      <Input
        onChange={handleChange}
        onBlur={handleBlur}
        allowClear
        onPressEnter={(e) => {
          form.setFieldValue(
            field,
            (e.target as HTMLInputElement).value.trim()
          );
          form.submit();
        }}
        {...rest}
        ref={ref}
      >
        {children}
      </Input>
    );
  }
);
