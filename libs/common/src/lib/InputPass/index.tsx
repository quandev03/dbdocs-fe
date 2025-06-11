import { PasswordProps } from 'antd/es/input';
import React, { FC } from 'react';
import { StyledInputPass } from './style';
import { Form } from 'antd';
import { AnyElement } from '../../types';

interface Props extends PasswordProps {
  children?: React.ReactElement | React.ReactElement[] | React.ReactNode;
}

export const CInputPassword: FC<Props> = React.memo(
  ({ id, onBlur, ...rest }) => {
    const form = Form.useFormInstance();
    const field = id as string;
    const handleBlur = (e: AnyElement) => {
      if (onBlur) {
        onBlur(e);
      } else {
        form.validateFields([field]);
      }
    };
    return <StyledInputPass {...rest} onBlur={handleBlur}></StyledInputPass>;
  }
);
