import React, { FC } from 'react';
import { SwitchProps } from 'antd';
import { StyledSwitch } from './styles';

export const CSwitch: FC<SwitchProps> = React.memo((props) => {
  return <StyledSwitch {...props} />;
});
