import React from 'react';
import { useResizeObserver } from '../../hooks';
import { CModal } from '../Modal';

type Props = {
  file: string;
  open: boolean;
  title: string;
  onClose: () => void;
};

export const PreviewPDF: React.FC<Props> = ({
  file = '',
  title = 'Preview PDF',
  onClose,
  open,
}) => {
  const [, ref] = useResizeObserver<HTMLDivElement>();

  return (
    <CModal
      title={title}
      open={open}
      onCancel={() => onClose()}
      footer={null}
      width={840}
    >
      <div ref={ref}>
        <iframe
          width="100%"
          height={700}
          src={file}
          title={title}
          key={Math.random()}
        />
      </div>
    </CModal>
  );
};
