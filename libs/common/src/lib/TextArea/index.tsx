import React, { FC } from 'react';
import { TextAreaProps } from 'antd/es/input';
import { StyledTextArea } from './style';
import { Form } from 'antd';
import { AnyElement } from '../../types';

export const CTextArea: FC<TextAreaProps> = React.memo(
  ({ placeholder, onBlur, ...rest }) => {
    const form = Form.useFormInstance();
    const field = rest.id as string;
    const handleBlur = (e: AnyElement) => {
      onBlur?.(e);
      if (form && field) {
        form.setFieldValue(field, e.target.value.trim());
        form.validateFields([field]);
      }
    };
    return (
      <StyledTextArea
        placeholder={placeholder ?? 'Nhập ghi chú'}
        onBlur={handleBlur}
        {...rest}
      />
    );
  }
);
