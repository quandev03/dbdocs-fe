import { Checkbox } from 'antd';
import styled from 'styled-components';

export const StyledCheckbox = styled(Checkbox)`
  display: flex;
  align-items: center;

  .ant-checkbox-disabled + span {
    color: #000000;
  }
`;
