import React, { FC } from 'react';
import { StyledRadio } from './style';
import { RadioButtonProps } from 'antd/es/radio/radioButton';

export const CRadio: FC<RadioButtonProps> = React.memo(
  ({ children, ...rest }) => {
    return <StyledRadio {...rest}>{children}</StyledRadio>;
  }
);
