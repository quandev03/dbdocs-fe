import React, { FC } from 'react';
import { StyledCheckbox } from './style';
import { CheckboxProps } from 'antd/lib/checkbox/Checkbox';

export const CCheckbox: FC<CheckboxProps> = React.memo(
  ({ children, ...rest }) => {
    return <StyledCheckbox {...rest}>{children}</StyledCheckbox>;
  }
);
