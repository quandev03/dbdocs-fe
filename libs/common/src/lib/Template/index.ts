import { Input, Row, Slider } from 'antd';
import Typography from 'antd/es/typography';
import styled from 'styled-components';
import { CModal } from '../Modal';

export const Text = styled(Typography.Text)<{ width?: string; color?: string }>`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 13px;
  line-height: 22px;
  cursor: revert !important;
  white-space: nowrap;
  width: ${({ width }) => (width ? width : undefined)};
`;

export const TextLink = styled(Typography.Text)`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 13px;
  line-height: 22px;
  color: ${({ theme }) => theme.primary};
  cursor: pointer !important;
  white-space: pre;
  a {
    color: ${({ theme }) => theme.primary} !important;
  }
`;
export const RowButton = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

export const TitleHeader = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.titleDefault};
  margin-bottom: 12px;
`;

export const RowHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 16px;

  .ant-form {
    flex: 1;
    &-item {
      margin-bottom: 0;
    }
  }
`;
export const WrapperFormFilter = styled(Row)`
  min-width: 50%;
`;

export const WrapperButton = styled.div`
  display: flex;
  gap: 8px;
  align-items: start;
  flex-wrap: wrap;
`;

export const BtnGroupFooter = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  button {
    min-width: 120px;
  }
`;

export const WrapperContentPopoverFilter = styled.div`
  min-width: 537px;
  max-width: 537px;
  padding: 16px 0;
`;

export const WrapperTitlePopoverFilter = styled.div`
  font-size: 20px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.01em;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TitleModal = styled.div`
  font-weight: 600;
  font-size: 18px;
`;

export const StyledModalDetail = styled(CModal)`
  .ant-divider {
    margin: 20px 0;
  }

  .titleTree {
    margin: 0px 0 20px;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }

  .treeWrap {
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.strokeLineLight};
    border-radius: 8px;
    max-height: 350px;
    overflow: scroll;
    margin-bottom: 25px;

    .ant-tree-title {
      color: ${({ theme }) => theme.contentTable};
      line-height: 30px;
    }

    .ant-tree-switcher-icon {
      margin-top: 10px;
    }
  }

  .ant-tree-node-content-wrapper {
    color: ${({ theme }) => theme.buttonInput};
  }

  .clr-validate {
    color: ${({ theme }) => theme.statusRed};
  }

  .switchActive {
    margin-top: 12px;

    .ant-row {
      flex-direction: row;
    }

    .ant-form-item-label {
      padding-bottom: 0;

      label {
        padding-bottom: 0;
        line-height: 2.3;
      }
    }

    .spanActive {
      padding-left: 10px;
    }
  }

  .ant-form-item-label label {
    font-weight: 500;
    font-size: 14px;
    line-height: 22px;
    color: ${({ theme }) => theme.contentTable} !important;
  }

  .ant-tree-checkbox-disabled {
    .ant-tree-checkbox-inner::after {
      border-color: #2d394b !important;
    }
  }
`;

export const WrapperActionTable = styled.div`
  .ant-btn {
    margin: 0 2.5px;
  }

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0px;

  .iconMore {
    cursor: pointer;
  }
`;

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  .iconReload {
    cursor: pointer;
    transition: all 0.25s linear;
    &:hover {
      opacity: 0.7;
    }
  }
`;

export const CButtonDownloadFile = styled.button`
  background-color: unset;
  color: #2437b1;
  cursor: pointer;
`;

export const CSlider = styled(Slider)`
  .ant-slider-handle {
    box-shadow: ${({ value }) => {
      return (value as number[]).includes(0)
        ? ''
        : 'rgb(255, 204, 99) 0px 0px 0px 6px';
    }};
    border-radius: 50%;
    &::after {
      box-shadow: ${({ disabled }) => {
        return disabled
          ? 'none !important'
          : 'rgb(255, 204, 99) 0px 0px 0px 6px';
      }};
    }
  }
  .ant-slider-mark {
    top: -30px;
  }
`;

export const StyledSearch = styled(Input.Search)`
  height: 36px;
  width: 379px !important;
  position: relative;

  .ant-input-wrapper {
    border-radius: 8px !important;

    .ant-input-affix-wrapper {
      min-height: 36px;
      border-radius: 8px !important;

      &:hover,
      :focus {
        border: 1px solid ${({ theme }) => theme.primary};
      }
    }

    .ant-input-group-addon {
      position: absolute;
      top: 0;
      width: 87px;
      inset-inline-start: calc(100% - 91px) !important;
      button {
        border-radius: 6px !important;
        height: 28px;
        margin-top: 4px;
        width: 100%;
        z-index: 10;
        font-weight: 600;
        font-size: 13px;
        box-shadow: none !important;
      }
    }
    .ant-input {
      width: calc(100% - 110px);
      font-weight: 500;
      font-size: 13px;
      line-height: 20px;
      color: ${({ theme }) => theme.contentPlaceholder};
    }
  }
`;
export const TitleSection = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
`;
