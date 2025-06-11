import { StyledSpan } from './style';
import React, { FC } from 'react';

export const CSpan: FC<React.HTMLAttributes<HTMLSpanElement>> = React.memo(
  ({ ...rest }) => {
    return <StyledSpan {...rest}></StyledSpan>;
  }
);
