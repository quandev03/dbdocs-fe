import { decodeSearchParams } from '../../utils';
import { Pagination, PaginationProps } from 'antd';
import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

export const TotalMessage = (total: number) => {
  return `Tổng ${total} bản ghi`;
};

const StylePagination = styled(Pagination)`
  display: flex;
  justify-content: flex-end;
  position: relative;
  .ant-pagination-options {
    position: absolute;
    left: 0;
    height: 27px;
  }
`;

export const CPagination: FC<PaginationProps> = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = decodeSearchParams(searchParams);
  const handleChangePagination = (page: number, pageSize: number) => {
    setSearchParams({ ...params, page: page - 1, size: pageSize });
  };
  return (
    <StylePagination
      showTitle
      showQuickJumper={false}
      showSizeChanger={true}
      pageSizeOptions={[20, 50, 100]}
      defaultPageSize={20}
      pageSize={params.size}
      current={1}
      showTotal={TotalMessage}
      total={props.total}
      onChange={props.onChange ?? handleChangePagination}
      size="small"
      {...props}
    />
  );
};
