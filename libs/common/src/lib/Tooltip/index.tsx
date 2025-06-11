import { TooltipProps } from 'antd';
import React from 'react';
import { StyledTooltip } from './styles';

export const CTooltip: React.FC<TooltipProps> = React.memo(
  ({ placement = 'topLeft', ...rest }) => {
    return <StyledTooltip placement={placement} {...rest} />;
  }
);
