import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation keys
const translations = {
  en: {
    // Homepage
    'homepage.title': 'DBDocs',
    'homepage.newProject': 'New Project',
    'homepage.myProjects': 'My Projects',
    'homepage.sharedWithMe': 'Shared with me',
    'homepage.apiTokens': 'API Tokens',
    'homepage.settings': 'Settings',
    'homepage.theme': 'Theme',
    'homepage.language': 'Language',
    'homepage.lightMode': 'Light Mode',
    'homepage.darkMode': 'Dark Mode',
    'homepage.english': 'English',
    'homepage.vietnamese': 'Vietnamese',
    'homepage.searchPlaceholder': 'Search diagram',
    'homepage.help': 'Help',
    'homepage.profile': 'Profile',
    'homepage.logout': 'Logout',
    'homepage.projectsSection': 'Projects',
    'homepage.projectsTitle': 'Projects',
    'homepage.projectsSubtitle': 'Manage your database documentation projects',
    'homepage.allProjects': 'All Projects',
    'homepage.searchProjects': 'Search projects',
    'homepage.loadingProjects': 'Loading projects...',
    'homepage.noProjectsSearch': 'No projects match your search',
    'homepage.noProjectsFound': 'No projects found',
    'homepage.nameProject': 'Project Name',
    'homepage.lastModified': 'Last Modified',
    'homepage.createdAt': 'Created At',
    'homepage.edit': 'Edit',
    'homepage.viewDocs': 'View Docs',
    'homepage.viewDetails': 'View Details',
    'homepage.rename': 'Rename',
    'homepage.delete': 'Delete',
    'homepage.sharedBy': 'Shared by',
    'homepage.unknown': 'Unknown',
    'homepage.settingsSection': 'Settings',
    'homepage.sharedProjectsTitle': 'Shared Projects',
    'homepage.sharedProjectsSubtitle': 'View projects shared with you',
    'homepage.loadingSharedProjects': 'Loading shared projects...',
    'homepage.noSharedProjectsSearch': 'No shared projects match your search',
    'homepage.noSharedProjectsFound': 'No shared projects found',
    'homepage.createNewProject': 'Create New Project',
    'homepage.projectCode': 'Project Code',
    'homepage.description': 'Description',
    'homepage.pleaseEnterProjectCode': 'Please enter project code',
    'homepage.projectCodeMinLength': 'Project code must be at least 3 characters',
    'homepage.projectCodeMaxLength': 'Project code cannot exceed 15 characters',
    'homepage.projectCodePattern': 'Project code can only contain letters, numbers, underscores and hyphens',
    'homepage.projectCodeTooltip': 'Project code must be 3-15 characters with no spaces or special characters',
    'homepage.enterProjectCode': 'Enter project code',
    'homepage.pleaseEnterDescription': 'Please enter project description',
    'homepage.enterProjectDescription': 'Enter project description',
    'homepage.create': 'Create',
    'homepage.createProject': 'Create Project',
    "homepage.cancel": "Cancel",
    
    // Documentation
    'docs.wiki': 'Wiki',
    'docs.diagram': 'Diagram',
    'docs.changelog': 'Changelog',
    'docs.exit': 'Exit',
    'docs.backToHome': 'Back to Home',
    'docs.databaseSchema': 'Database Schema',
    'docs.searchTables': 'Search tables, fields...',
    'docs.tables': 'tables',
    'docs.fields': 'fields',
    'docs.noTablesFound': 'No tables found',
    'docs.tableDetail': 'Table Detail',
    'docs.back': 'Back',
    'docs.backToDatabase': 'Back to Database',
    'docs.columns': 'Columns',
    'docs.dataType': 'Data Type',
    'docs.constraints': 'Constraints',
    'docs.notes': 'Notes',
    'docs.totalColumns': 'Total Columns',
    'docs.keyColumns': 'Key Columns',
    'docs.regularFields': 'Regular Fields',
    'docs.creator': 'Creator',
    'docs.dateCreated': 'Date created',
    'docs.projectCode': 'Project code',
    'docs.lastUpdated': 'Last updated',
    'docs.version': 'Version',
    'docs.description': 'Description',
    'docs.latest': 'Latest',
    'docs.noDescription': 'No description provided',
    'docs.recentActivities': 'Recent activities',
    'docs.viewMore': 'view more',
    'docs.tables': 'Tables',
    'docs.fields': 'Fields',
    'docs.updates': 'Updates',
    'docs.name': 'Name',
    'docs.tableNotes': 'Table notes',
    'docs.lastUpdate': 'Last Update',
    'docs.noNotes': 'No notes',
    
    // Editor
    'editor.settings': 'Settings',
    'editor.theme': 'Theme',
    'editor.language': 'Language',
    'editor.exit': 'Exit',
    'editor.saveChanges': 'Save Changes',
    'editor.history': 'History',
    'editor.back': 'Back',
    'editor.export': 'Export',
    'editor.share': 'Share',
    'editor.publishToDbdocs': 'Publish to dbdocs',
    'editor.downloadDbml': 'Download DBML',
    'editor.copyDbml': 'Copy DBML',
    'editor.exportSqlDdl': 'Export SQL DDL',
    'editor.projectHistory': 'Project History',
    'editor.loadingHistory': 'Loading history...',
    'editor.noHistoryRecords': 'No history records found',
    'editor.viewThisVersion': 'View this version',
    'editor.unknownUser': 'Unknown user',
    'editor.noDescription': 'No description',
    'editor.generateSqlDdl': 'Generate SQL DDL',
    'editor.generateDownload': 'Generate & Download',
    'editor.copyToClipboard': 'Copy to Clipboard',
    'editor.downloadSqlFile': 'Download SQL file',
    'editor.selectVersionFirst': 'Please select a version or changelog first',
    'editor.confirmRevert': 'Confirm Revert to Previous Changelog',
    'editor.confirmRevertText': 'Are you sure you want to revert to v',
    'editor.yesRevert': 'Yes, revert to this version',
    'editor.cancel': 'Cancel',
    'editor.warning': 'Warning',
    'editor.unsavedChanges': 'You have unsaved changes that will be lost if you revert to this change log.',
    'editor.shareProject': 'Share Project',
    'editor.close': 'Close',
    'editor.addPeople': 'Add People',
    'editor.peopleWithAccess': 'People with Access',
    'editor.loading': 'Loading...',
    'editor.invite': 'Invite',
    'editor.edit': 'Edit',
    'editor.remove': 'Remove',
    'editor.editPermission': 'Edit Permission',
    'editor.removeAccess': 'Remove Access',
    'editor.confirmRemove': 'Are you sure you want to remove access for',
    'editor.version': 'Version',
    'editor.selectVersion': 'Select version',
    'editor.viewOnly': 'View Only',
    'editor.loadingProject': 'Loading project...',
    'editor.loadingEditor': 'Loading editor...',
    'editor.accessDenied': 'Access Denied',
    'editor.noPermission': 'You don\'t have permission to view this project.',
    'editor.goBack': 'Go Back',
    'editor.enterEmailUsername': 'Enter email or username',
    'editor.required': 'Required',
    
    // Common
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
  },
  vi: {
    // Homepage
    'homepage.title': 'DBDocs',
    'homepage.newProject': 'Dự án mới',
    'homepage.myProjects': 'Dự án của tôi',
    'homepage.sharedWithMe': 'Được chia sẻ với tôi',
    'homepage.apiTokens': 'API Tokens',
    'homepage.settings': 'Cài đặt',
    'homepage.theme': 'Chủ đề',
    'homepage.language': 'Ngôn ngữ',
    'homepage.lightMode': 'Chế độ sáng',
    'homepage.darkMode': 'Chế độ tối',
    'homepage.english': 'Tiếng Anh',
    'homepage.vietnamese': 'Tiếng Việt',
    'homepage.searchPlaceholder': 'Tìm kiếm sơ đồ',
    'homepage.help': 'Trợ giúp',
    'homepage.profile': 'Hồ sơ',
    'homepage.logout': 'Đăng xuất',
    'homepage.projectsSection': 'Dự án',
    'homepage.projectsTitle': 'Dự án',
    'homepage.projectsSubtitle': 'Quản lý các dự án tài liệu cơ sở dữ liệu của bạn',
    'homepage.allProjects': 'Tất cả dự án',
    'homepage.searchProjects': 'Tìm kiếm dự án',
    'homepage.loadingProjects': 'Đang tải dự án...',
    'homepage.noProjectsSearch': 'Không có dự án nào phù hợp với tìm kiếm',
    'homepage.noProjectsFound': 'Không tìm thấy dự án nào',
    'homepage.nameProject': 'Tên Dự Án',
    'homepage.lastModified': 'Sửa Đổi Cuối',
    'homepage.createdAt': 'Ngày Tạo',
    'homepage.edit': 'Sửa',
    'homepage.viewDocs': 'Xem Tài Liệu',
    'homepage.viewDetails': 'Xem Chi Tiết',
    'homepage.rename': 'Đổi tên',
    'homepage.delete': 'Xóa',
    'homepage.sharedBy': 'Được chia sẻ bởi',
    'homepage.unknown': 'Không rõ',
    'homepage.settingsSection': 'Cài đặt',
    'homepage.sharedProjectsTitle': 'Dự án được chia sẻ',
    'homepage.sharedProjectsSubtitle': 'Xem các dự án được chia sẻ với bạn',
    'homepage.loadingSharedProjects': 'Đang tải dự án được chia sẻ...',
    'homepage.noSharedProjectsSearch': 'Không có dự án chia sẻ nào phù hợp với tìm kiếm',
    'homepage.noSharedProjectsFound': 'Không tìm thấy dự án chia sẻ nào',
    'homepage.createNewProject': 'Tạo Dự Án Mới',
    'homepage.projectCode': 'Mã Dự Án',
    'homepage.description': 'Mô tả',
    'homepage.pleaseEnterProjectCode': 'Vui lòng nhập mã dự án',
    'homepage.projectCodeMinLength': 'Mã dự án phải có ít nhất 3 ký tự',
    'homepage.projectCodeMaxLength': 'Mã dự án không được vượt quá 15 ký tự',
    'homepage.projectCodePattern': 'Mã dự án chỉ có thể chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang',
    'homepage.projectCodeTooltip': 'Mã dự án phải có 3-15 ký tự, không có khoảng trắng hoặc ký tự đặc biệt',
    'homepage.enterProjectCode': 'Nhập mã dự án',
    'homepage.pleaseEnterDescription': 'Vui lòng nhập mô tả dự án',
    'homepage.enterProjectDescription': 'Nhập mô tả dự án',
    'homepage.create': 'Tạo',
    'homepage.createProject': 'Tạo Dự Án',
    "homepage.cancel": "Hủy",
    
    // Documentation
    'docs.wiki': 'Wiki',
    'docs.diagram': 'Sơ đồ',
    'docs.changelog': 'Lịch sử thay đổi',
    'docs.exit': 'Thoát',
    'docs.backToHome': 'Về trang chủ',
    'docs.databaseSchema': 'Cấu trúc cơ sở dữ liệu',
    'docs.searchTables': 'Tìm kiếm bảng, trường...',
    'docs.tables': 'bảng',
    'docs.fields': 'trường',
    'docs.noTablesFound': 'Không tìm thấy bảng nào',
    'docs.tableDetail': 'Chi tiết bảng',
    'docs.back': 'Quay lại',
    'docs.backToDatabase': 'Quay lại cơ sở dữ liệu',
    'docs.columns': 'Cột',
    'docs.dataType': 'Kiểu dữ liệu',
    'docs.constraints': 'Ràng buộc',
    'docs.notes': 'Ghi chú',
    'docs.totalColumns': 'Tổng số cột',
    'docs.keyColumns': 'Cột khóa',
    'docs.regularFields': 'Trường thông thường',
    'docs.creator': 'Người tạo',
    'docs.dateCreated': 'Ngày tạo',
    'docs.projectCode': 'Mã dự án',
    'docs.lastUpdated': 'Cập nhật cuối',
    'docs.version': 'Phiên bản',
    'docs.description': 'Mô tả',
    'docs.latest': 'Mới nhất',
    'docs.noDescription': 'Không có mô tả',
    'docs.recentActivities': 'Hoạt động gần đây',
    'docs.viewMore': 'xem thêm',
    'docs.tables': 'Bảng',
    'docs.fields': 'Trường',
    'docs.updates': 'Cập nhật',
    'docs.name': 'Tên',
    'docs.tableNotes': 'Ghi chú bảng',
    'docs.lastUpdate': 'Cập nhật cuối',
    'docs.noNotes': 'Không có ghi chú',
    
    // Editor
    'editor.settings': 'Cài đặt',
    'editor.theme': 'Chủ đề',
    'editor.language': 'Ngôn ngữ',
    'editor.exit': 'Thoát',
    'editor.saveChanges': 'Lưu thay đổi',
    'editor.history': 'Lịch sử',
    'editor.back': 'Quay lại',
    'editor.export': 'Xuất',
    'editor.share': 'Chia sẻ',
    'editor.publishToDbdocs': 'Công bố lên dbdocs',
    'editor.downloadDbml': 'Tải DBML',
    'editor.copyDbml': 'Sao chép DBML',
    'editor.exportSqlDdl': 'Xuất SQL DDL',
    'editor.projectHistory': 'Lịch sử dự án',
    'editor.loadingHistory': 'Đang tải lịch sử...',
    'editor.noHistoryRecords': 'Không tìm thấy bản ghi lịch sử',
    'editor.viewThisVersion': 'Xem phiên bản này',
    'editor.unknownUser': 'Người dùng không rõ',
    'editor.noDescription': 'Không có mô tả',
    'editor.generateSqlDdl': 'Tạo SQL DDL',
    'editor.generateDownload': 'Tạo & Tải xuống',
    'editor.copyToClipboard': 'Sao chép vào clipboard',
    'editor.downloadSqlFile': 'Tải file SQL',
    'editor.selectVersionFirst': 'Vui lòng chọn phiên bản hoặc changelog trước',
    'editor.confirmRevert': 'Xác nhận khôi phục về Changelog trước',
    'editor.confirmRevertText': 'Bạn có chắc muốn khôi phục về v',
    'editor.yesRevert': 'Có, khôi phục về phiên bản này',
    'editor.cancel': 'Hủy',
    'editor.warning': 'Cảnh báo',
    'editor.unsavedChanges': 'Bạn có thay đổi chưa lưu sẽ bị mất nếu khôi phục về changelog này.',
    'editor.shareProject': 'Chia sẻ dự án',
    'editor.close': 'Đóng',
    'editor.addPeople': 'Thêm người',
    'editor.peopleWithAccess': 'Người có quyền truy cập',
    'editor.loading': 'Đang tải...',
    'editor.invite': 'Mời',
    'editor.edit': 'Sửa',
    'editor.remove': 'Xóa',
    'editor.editPermission': 'Sửa quyền',
    'editor.removeAccess': 'Xóa quyền truy cập',
    'editor.confirmRemove': 'Bạn có chắc muốn xóa quyền truy cập cho',
    'editor.version': 'Phiên bản',
    'editor.selectVersion': 'Chọn phiên bản',
    'editor.viewOnly': 'Chỉ xem',
    'editor.loadingProject': 'Đang tải dự án...',
    'editor.loadingEditor': 'Đang tải editor...',
    'editor.accessDenied': 'Truy cập bị từ chối',
    'editor.noPermission': 'Bạn không có quyền xem dự án này.',
    'editor.goBack': 'Quay lại',
    'editor.enterEmailUsername': 'Nhập email hoặc tên người dùng',
    'editor.required': 'Bắt buộc',
    
    // Common
    'common.close': 'Đóng',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.confirm': 'Xác nhận',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'vi' : 'en');
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]];
    if (!translation) {
      console.warn(`Translation key '${key}' not found for language '${language}'`);
      return key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 