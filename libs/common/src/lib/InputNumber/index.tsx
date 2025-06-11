import { Form, InputNumberProps } from 'antd';
import React, { FC, FocusEvent } from 'react';
import { StyledInputNumber } from './style';

interface Props extends InputNumberProps {
  children?: React.ReactElement | React.ReactElement[] | React.ReactNode;
}

export const CInputNumber: FC<Props> = React.memo(({ id, onBlur, ...rest }) => {
  const form = Form.useFormInstance();
  const field = id as string;
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e);
    } else {
      form.validateFields([field]);
    }
  };
  return <StyledInputNumber {...rest} onBlur={handleBlur}></StyledInputNumber>;
});
