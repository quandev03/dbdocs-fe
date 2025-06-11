import styled from 'styled-components';

export const StyledWrapSelect = styled('div')<{ $maxRow?: number }>`
  width: 100%;

  ${({ $maxRow }) =>
    $maxRow &&
    $maxRow > 1 &&
    `
    .ant-select-selection-overflow {
      max-height: ${$maxRow * 30}px;
      overflow-y: scroll;
      overflow-x: hidden;

      &::-webkit-scrollbar {
       display: none;
      }
    }
  `}
  .ant-select-disabled .ant-select-selection-item {
    color: black !important;
  }
  .ant-select-item-option-selected {
    color: inherit; // Giữ nguyên màu sắc của mục đã chọn
  }
`;
