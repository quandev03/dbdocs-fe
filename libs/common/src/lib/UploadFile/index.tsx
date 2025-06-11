import { FILE_TYPE, UploadFileMax } from '../../constants';
import { MESSAGE } from '../../constants';
import { Col, Row, Space, Upload, UploadFile, UploadProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { CButton } from '../Button';
import { NotificationError } from '../Notification';
import { X } from 'lucide-react';

interface CUploadProps {
  // props using for Form.Item
  value?: UploadFile;
  onChange?: (value?: UploadFile) => void;
  handlePreview?: (value: UploadFile) => void;
}

const props: UploadProps = {
  name: 'file',
  multiple: false,
  beforeUpload: () => false,
};

const checkFileType = (accept: string) => {
  const fileTypeList = [];
  if (/pdf/.test(accept)) {
    fileTypeList.push(FILE_TYPE.pdf);
  }
  if (/xlsx/.test(accept)) {
    fileTypeList.push(FILE_TYPE.xlsx);
  }
  return fileTypeList;
};

export const CUploadFile: React.FC<CUploadProps & UploadProps> = ({
  value,
  onChange,
  disabled,
  accept = '.pdf',
  ...rest
}) => {
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) NotificationError(error);
  }, [error]);

  const handleChange: UploadProps['onChange'] = ({ file }) => {
    if (typeof onChange === 'function') {
      if (
        accept &&
        file.lastModified &&
        !checkFileType(accept).includes(file.type || '')
      ) {
        setError(`${MESSAGE.G14} ${accept}`);
        return;
      } else if (file.size && file.size > UploadFileMax) {
        setError(MESSAGE.G13);
        return;
      }
      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange?.(undefined);
  };

  return (
    <Upload
      {...rest}
      {...props}
      accept={accept}
      // fileList={value}
      showUploadList={false}
      disabled={disabled}
      multiple={false}
      maxCount={1}
      onChange={handleChange}
    >
      <div onClick={() => setError('')}>
        {value ? (
          <Row justify="space-between">
            <Col span={22} className="custom-upload-list">
              <div
                key={value.uid}
                className="custom-upload-list-item"
                onClick={(e) => e.stopPropagation()}
              >
                <Space>
                  <div title={value.name} className="cursor-auto">
                    {value.name}
                  </div>
                  {
                    <CButton
                      type="text"
                      size="small"
                      icon={<X />}
                      hidden={disabled}
                      onClick={() => handleRemove()}
                    />
                  }
                </Space>
              </div>
            </Col>
          </Row>
        ) : (
          <CButton className="w-[133px]" disabled={disabled}>
            Chọn file
          </CButton>
        )}
      </div>
    </Upload>
  );
};
