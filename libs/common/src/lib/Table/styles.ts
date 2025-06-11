import { AnyElement } from '@/modules/Layouts/types';
import { Table } from 'antd';
import styled from 'styled-components';

export const StyledCommonTable = styled<AnyElement>(Table)`
  .ant-table {
    border-left: 1px solid ${({ theme }) => theme.strokeLineLight};
    border-right: 1px solid ${({ theme }) => theme.strokeLineLight};
    border-radius: 8px;
  }

  .ant-table-header {
    .ant-table-cell {
      width: 200px;
      background-color: ${({ theme }) => theme.strokeLineLight};

      .ant-typography {
        color: ${({ theme }) => theme.titleTable} !important;
      }

      .ant-typography.ant-typography-disabled {
        color: ${({ theme }) => theme.contentTableDisable} !important;
      }
    }
  }

  .ant-table-body {
    overflow: scroll !important;
    scrollbar-width: auto;
    scrollbar-color: auto;

    .ant-table-cell {
      overflow: hidden;
      white-space: nowrap;

      &:not(:has(.ant-tag, .ant-space)) {
        text-overflow: ellipsis;
      }
    }

    .ant-table-cell:has(button) {
      padding: 5.5px 8px !important;
    }
  }

  .ant-table-row-selected {
    .ant-table-cell {
      background-color: ${({ theme }) => theme.tableSelectedActive} !important;
    }
  }

  .ant-pagination {
    margin-bottom: 11px !important;

    &-total-text {
      font-weight: 500;
      line-height: 22px;
      font-size: 14px;
      color: ${({ theme }) => theme.contentPlaceholder};
    }
  }

  .ant-pagination-options {
    position: absolute;
    left: 0;
  }

  .ant-table-row.row-has-color {
    background-color: ${({ theme }) => theme.tableSelectedActive};

    .ant-table-cell-fix-right,
    .ant-table-cell-fix-left {
      background-color: ${({ theme }) => theme.tableSelectedActive};
    }
  }

  .ant-table-row {
    .ant-table-cell-row-hover {
      background-color: #e9e9e9 !important;

      .ant-table-cell-fix-right,
      .ant-table-cell-fix-left {
        background-color: #e9e9e9 !important;
      }
    }
  }

  .ant-table-row.align-top
    .ant-table-cell:not(:has(.ant-typography-danger))
    .ant-typography {
    margin-top: 8px !important;
  }

  .ant-table-row.align-top .ant-table-cell svg {
    margin-top: 8px !important;
  }

  .ant-table-row.align-top
    .ant-table-cell
    .ant-form-item-control-input-content
    svg {
    margin-top: unset !important;
  }

  .ant-select-dropdown {
    top: -110px !important;
  }

  &.dynamic-table {
    table {
      table-layout: fixed !important;
    }
    td.ant-table-cell:has(.ant-form-item) {
      vertical-align: top;
    }

    .ant-table-tbody {
      /* tr:not(.ant-table-row) .ant-table-cell {
        padding: 18px 8px !important;
      } */

      .ant-table-row .ant-table-cell {
        .ant-form-item {
          margin-bottom: 0;
        }
      }
    }

    width: 100%;
  }

  &.animation-table .ant-table {
    .ant-table-body {
      transition: max-height 0.25s ease-in-out;
    }

    &:not(.ant-table-empty) .ant-table-body {
      overflow-y: ${({ dataSource }) =>
        `${dataSource?.length < 10 ? 'hidden' : 'scroll'} `} !important;
      max-height: ${({ scroll, dataSource }) =>
        `${
          dataSource?.length < 10
            ? 49 * (dataSource ?? []).length
            : (scroll?.y ?? 450)
        }px`} !important;
    }

    &.ant-table-empty .ant-table-body {
      overflow-y: hidden !important;
      max-height: 39px !important;
      border-bottom: 1px solid #f0f0f0;

      .ant-table-cell {
        height: ${({ scroll }) => `${scroll?.y ?? 450}px`} !important;
        vertical-align: baseline;
      }
    }
  }
`;
