import { TableProps } from 'antd';
import { FC, useCallback, useLayoutEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AnyElement } from '../../types';
import { decodeSearchParams } from '../../utils';
import { TotalTableMessage } from '../TotalTableMessage';
import { StyledCommonTable } from './styles';

const DEFAULT_TOP = 150;
const MARGIN_HEIGHT = 150;
const HEIGHT_HEADER_TABLE = 50;

interface CTableProps<T> extends TableProps<T> {
  otherHeight?: number;
}

export const CTable: FC<CTableProps<AnyElement>> = ({
  pagination = false,
  otherHeight = 0,
  ...rest
}) => {
  const [tableHeight, setTableHeight] = useState(0);
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = decodeSearchParams(searchParams);

  const handleChangeHeight = useCallback(() => {
    const boundingClientRect: DOMRect | undefined = document
      ?.querySelector('#common-table')
      ?.getBoundingClientRect();
    if (boundingClientRect) {
      const tempHeight = window.innerHeight - otherHeight - MARGIN_HEIGHT;
      if (boundingClientRect.height <= HEIGHT_HEADER_TABLE) {
        setTableHeight(tempHeight - DEFAULT_TOP);
      } else {
        const top = boundingClientRect.top || 0;
        setTableHeight(tempHeight - top);
      }
    }
  }, [otherHeight]);

  useLayoutEffect(() => {
    handleChangeHeight();
  }, [handleChangeHeight, pathname, rest.loading]);

  const handleChangePagination = (page: number, pageSize: number) => {
    setSearchParams({ ...params, page: page - 1, size: pageSize });
  };

  return (
    <StyledCommonTable
      id="common-table"
      size="small"
      locale={{ emptyText: 'Không có dữ liệu' }}
      scroll={{ y: tableHeight }}
      {...rest}
      pagination={
        pagination
          ? {
              current: params.page + 1,
              pageSize: params.size,
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: [20, 50, 100],
              defaultPageSize: 20,
              onChange: pagination?.onChange ?? handleChangePagination,
              showTotal: TotalTableMessage,
              showQuickJumper: false,
            }
          : false
      }
    />
  );
};
