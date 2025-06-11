import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  FormItemProps,
  Tooltip,
  Upload,
  UploadProps,
} from 'antd';
import { TextLink } from '../Template';
import { FILE_SIZE_MAX_DEFAULT } from '../../constants';
import { MESSAGE } from '../../constants';
import { RcFile } from 'antd/lib/upload';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

type AcceptType = (typeof FILE_TYPES)[number];

const convertAcceptToExtensions = (accept: AcceptType[]): string => {
  const acceptMapping: Record<AcceptType, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpeg',
    'image/jpg': '.jpg',
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      '.xlsx',
    'application/vnd.ms-excel': '.xls',
    'text/csv': '.csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '.docx',
  };

  return accept.map((type) => acceptMapping[type]).join(', ');
};

type PropsUploadComponent = {
  onDownloadTemplate?: () => void;
  onDownloadFile?: () => void;
  onPreview?: () => void;
  accept?: AcceptType[];
  id?: string;
  allowClear?: boolean;
};

const UploadComponent = ({
  onDownloadTemplate,
  onDownloadFile,
  onPreview,
  accept,
  id,
  allowClear,
}: PropsUploadComponent) => {
  const form = Form.useFormInstance();
  // check field name of form list yes or no
  const field = id?.includes('_')
    ? id?.split('_').map((i) => (isNaN(+i) ? i : +i))
    : id;
  const fileNumbers = Form.useWatch(field, form);
  const beforeUploadHandler: UploadProps['beforeUpload'] = (file) => {
    form.setFieldValue(field, file);
    form.validateFields([field]);
    return false;
  };

  const handleClear = () => {
    form.resetFields([field]);
  };

  return (
    <div className="flex flex-col items-start justify-start gap-3">
      <div
        className={`grid ${
          onDownloadFile || onPreview ? 'grid-cols-1' : 'grid-cols-[124px_1fr]'
        } w-full max-w-full gap-3`}
      >
        {onDownloadFile ? null : (
          <Upload
            accept={accept?.join(',')}
            multiple={false}
            maxCount={1}
            showUploadList={false}
            beforeUpload={beforeUploadHandler}
            className="truncate"
          >
            <Tooltip
              title={accept && `Định dạng ${convertAcceptToExtensions(accept)}`}
              placement="top"
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                className="h-[35px] w-[124px]"
              >
                Chọn file
              </Button>
            </Tooltip>
          </Upload>
        )}
        <Tooltip
          title={fileNumbers?.name}
          placement="topLeft"
          className="truncate"
        >
          {onDownloadFile || onPreview ? (
            <TextLink onClick={onDownloadFile || onPreview}>
              {fileNumbers?.name}
            </TextLink>
          ) : (
            <div className="flex flex-1 items-center justify-between gap-3">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {fileNumbers?.name}
              </div>
              {allowClear && fileNumbers?.name && !onDownloadFile ? (
                <DeleteOutlined
                  className="cursor-pointer text-red-400 hover:text-red-500"
                  onClick={handleClear}
                />
              ) : null}
            </div>
          )}
        </Tooltip>
      </div>
      {onDownloadTemplate && !onDownloadFile && (
        <div className="flex flex-col items-center italic">
          {onDownloadTemplate && (
            <div
              onClick={onDownloadTemplate}
              className="cursor-pointer text-[#41CE6E] underline"
            >
              (*) Tải file mẫu
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type Props = FormItemProps & {
  onDownloadTemplate?: () => void;
  onDownloadFile?: () => void;
  onPreview?: () => void;
  accept?: AcceptType[];
  allowClear?: boolean;
  sizeMaxMB?: number;
};

const UploadFileTemplate = ({
  onDownloadTemplate,
  onDownloadFile,
  onPreview,
  accept,
  allowClear,
  sizeMaxMB = 5,
  required = true,
  ...props
}: Props) => {
  return (
    <Form.Item
      rules={[
        {
          validator(_, file?: RcFile) {
            if (required && !file) {
              return Promise.reject(MESSAGE.G06);
            }
            if (file && accept && !accept.includes(file?.type as AcceptType)) {
              return Promise.reject('File tải lên không đúng định dạng');
            }
            if (sizeMaxMB && file && file.size > sizeMaxMB * 1024 * 1024) {
              return Promise.reject(`File tải lên vượt quá ${sizeMaxMB}MB`);
            } else if (
              !sizeMaxMB &&
              file &&
              file.size > FILE_SIZE_MAX_DEFAULT
            ) {
              return Promise.reject('File tải lên vượt quá 5MB');
            }
            return Promise.resolve();
          },
        },
      ]}
      required={required}
      {...props}
    >
      <UploadComponent
        onDownloadTemplate={onDownloadTemplate}
        onDownloadFile={onDownloadFile}
        accept={accept}
        onPreview={onPreview}
        allowClear={allowClear}
      />
    </Form.Item>
  );
};

export default UploadFileTemplate;
