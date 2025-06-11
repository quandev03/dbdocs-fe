import { Switch } from 'antd';
import styled from 'styled-components';

export const StyledSwitch = styled(Switch)`
  &.ant-switch-checked {
    background-color: ${({ theme }) => theme.statusGreen} !important;
  }
`;
