import { StepsProps } from 'antd';
import React, { FC } from 'react';
import { StyledSteps } from './styles';

export const CSteps: FC<StepsProps> = React.memo((props) => {
  return <StyledSteps {...props} />;
});
