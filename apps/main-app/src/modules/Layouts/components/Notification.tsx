import { CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { Badge, Popover, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { memo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
import {
  useInfinityScrollNotification,
  useReadAllNotification,
  useReadOneNotification,
} from '../hooks';
import { AnyElement, INotification } from '../types';
import { IconNoti, StyledNoNotify, StyledTitleNoti } from '../styled';
import { formatDateTime } from '@vissoft-react/common';
import useConfigAppStore from '../stores';

const Notification = ({ listNotiRef }: AnyElement) => {
  const { showNotify, setShowNotify } = useConfigAppStore();
  const [typeNotify, setTypeNotify] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  const {
    data: notificationList = { data: [], total: 0 },
    fetchNextPage: userFetchNextPage,
    hasNextPage: userHasNextPage,
    isLoading,
    // refetch: refetchNotification,
  } = useInfinityScrollNotification({ limit: 20, seen: typeNotify === 'all' });

  // useEffect(() => {
  //   return onMessage(messaging, () => {
  //     refetchNotification();
  //   });
  // }, [refetchNotification]);

  const { mutate: readOneNotification } = useReadOneNotification();
  const { mutate: readAllNotification } = useReadAllNotification();

  const handleGetMore = () => {
    if (!showNotify || !userHasNextPage || isLoading) return;
    userFetchNextPage();
  };

  const handleSetShowNotify = () => {
    setShowNotify(!showNotify);
  };

  const handleCloseNotify = () => {
    setShowNotify(false);
  };

  const handleClickNotify = (item: INotification) => {
    readOneNotification(item.id);
    if (item.uriRef) {
      navigate(item.uriRef.substring(2));
    }
  };

  const handleReadAll = () => {
    readAllNotification();
  };
  const formatTimeAgo = (date: string | Date) => {
    const now = dayjs();
    const messageTime = dayjs(date);
    const diffSeconds = now.diff(messageTime, 'second');
    const diffMinutes = now.diff(messageTime, 'minute');
    const diffHours = now.diff(messageTime, 'hour');
    const isSameDay = now.isSame(messageTime, 'day');
    if (diffSeconds < 60) {
      return 'Vừa xong';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    }
    if (diffHours < 24 && isSameDay) {
      return `${diffHours} giờ trước`;
    }
    return messageTime.format(formatDateTime);
  };

  const content = (
    <div>
      <StyledTitleNoti>
        <b>Thông báo</b>
        <div className="flex items-center gap-2">
          <CloseOutlined
            className="cursor-pointer rounded-full p-2 text-[#666] hover:bg-[#eee]"
            onClick={handleCloseNotify}
          />
        </div>
      </StyledTitleNoti>

      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex gap-2">
          <div
            className={`flex cursor-pointer items-center gap-2 rounded-3xl px-3 py-1 transition-all duration-300 ease-in-out ${
              typeNotify === 'all'
                ? 'bg-primary text-white'
                : 'hover:bg-primary hover:text-white'
            }`}
            onClick={() => {
              setTypeNotify('all');
            }}
          >
            Tất cả
          </div>
          <div
            className={`flex cursor-pointer items-center gap-2 rounded-3xl px-3 py-1 transition-all duration-400 ease-in-out ${
              typeNotify === 'unread'
                ? 'bg-primary text-white'
                : 'hover:bg-primary hover:text-white'
            }`}
            onClick={() => {
              setTypeNotify('unread');
            }}
          >
            Chưa đọc
          </div>
        </div>
        <div
          className="flex w-max cursor-pointer items-center gap-1 text-[#1163AE]"
          onClick={handleReadAll}
        >
          <CheckCircleOutlined color="red" />
          <p className="underline">Đọc tất cả</p>
        </div>
      </div>

      <div className="px-3 py-2">
        <InfiniteScroll
          dataLength={notificationList?.data.length}
          next={handleGetMore}
          hasMore={true}
          loader={<Spin spinning={isLoading} />}
          height={'100%'}
          style={{ maxHeight: '550px' }}
          scrollThreshold={'100%'}
          ref={listNotiRef}
          className="flex flex-col gap-2"
        >
          {notificationList?.data?.length === 0 ? (
            <StyledNoNotify className="">Không có thông báo</StyledNoNotify>
          ) : (
            notificationList?.data.map((item, index) => (
              <Tooltip title={item.content} placement="topLeft" key={index}>
                <div
                  key={item.id}
                  onClick={() => handleClickNotify(item)}
                  className={`flex cursor-pointer flex-col gap-2 rounded-md border border-[#eee] p-2 transition-all duration-400 ease-in-out hover:bg-[#f7f7f7] ${
                    !item.seen ? 'bg-[#eee]' : 'bg-white'
                  }`}
                >
                  <div className="mt-1 line-clamp-2 text-[#666]">
                    {item.content}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-[#1163AE]">
                      {formatTimeAgo(item.sendDate)}
                    </span>
                  </div>
                </div>
              </Tooltip>
            ))
          )}
        </InfiniteScroll>
      </div>
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
      content={content}
      trigger={'click'}
      open={showNotify}
      onOpenChange={(visible) => setShowNotify(visible)}
      styles={{ body: { padding: 0, width: 400, minWidth: 400 } }}
    >
      <Badge count={notificationList.total || 0}>
        <IconNoti onClick={handleSetShowNotify} />
      </Badge>
    </Popover>
  );
};

export default memo(Notification);
