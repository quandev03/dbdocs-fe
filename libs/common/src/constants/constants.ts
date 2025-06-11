export const ColorList = {
  SUCCESS: 'success', //  thành công, Đã phê duyệt, Hoàn thành, Hoạt động
  PROCESSING: 'processing', // Đang xử lý, đang phê duyệt
  FAIL: 'error', // thất bại, không thành công
  WAITING: 'warning', // Chờ xử lý 1 cái gì đó
  CANCEL: 'default', // Hủy
  DEFAULT: 'default', // Hủy
} as const;

export const ApprovalProcessKey = {
  ORGANIZATION_UNIT: 'ORGANIZATION_UNIT',
};

export const UploadFileMax = 500 * 1024; //500kB

export const FILE_SIZE_MAX_DEFAULT = 10 * 1024 * 1024; //10mb

export const FILE_TYPE = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  csv: 'text/csv',
  zip: 'application/zip',
  txt: 'text/plain',
  jpg: 'image/jpg',
  png: 'image/png',
  jpeg: 'image/jpeg',
};
