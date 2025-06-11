import { Steps } from 'antd';
import styled from 'styled-components';

export const StyledSteps = styled(Steps)`
  .ant-steps-item-content > .ant-steps-item-title::after {
    background-color: rgba(5, 5, 5, 0.15) !important;
    height: 2px !important;
    left: 0px;
  }
  &.step-approval {
    width: fit-content;
    .ant-steps-item-title {
      padding-inline-end: 36px;
    }
  }
`;
