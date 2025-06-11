import { ItemType } from 'antd/lib/menu/interface';
import { compact } from 'lodash';
import { Link } from 'react-router-dom';
import { AnyElement, MenuItem } from '../types';

export function convertVietnameseToEnglish(text: string) {
  const vowelMap = {
    á: 'as',
    à: 'af',
    ả: 'ar',
    ã: 'ax',
    ạ: 'aj',
    ấ: 'aas',
    ầ: 'aaf',
    ẩ: 'aar',
    ẫ: 'aax',
    ậ: 'aaj',
    é: 'es',
    è: 'ef',
    ẻ: 'er',
    ẽ: 'ex',
    ẹ: 'ej',
    ế: 'ees',
    ề: 'eef',
    ể: 'eer',
    ễ: 'eex',
    ệ: 'eej',
    í: 'is',
    ì: 'if',
    ỉ: 'ir',
    ĩ: 'ix',
    ị: 'ij',
    ó: 'os',
    ò: 'of',
    ỏ: 'or',
    õ: 'ox',
    ọ: 'oj',
    ố: 'oos',
    ồ: 'oof',
    ổ: 'oor',
    ỗ: 'oox',
    ộ: 'ooj',
    ớ: 'ows',
    ờ: 'owf',
    ở: 'owr',
    ỡ: 'owx',
    ợ: 'owj',
    ú: 'us',
    ù: 'uf',
    ủ: 'ur',
    ũ: 'ux',
    ụ: 'uj',
    ứ: 'uws',
    ừ: 'uwf',
    ử: 'uwr',
    ữ: 'uwx',
    ự: 'uwj',
    ý: 'ys',
    ỳ: 'yf',
    ỷ: 'yr',
    ỹ: 'yx',
    ỵ: 'yj',
    ê: 'ee',
    â: 'aa',
    ô: 'oo',
    ơ: 'ow',
    ư: 'uw',
    Á: 'As',
    À: 'Af',
    Ả: 'Ar',
    Ã: 'Ax',
    Ạ: 'Aj',
    Ấ: 'AAs',
    Ầ: 'AAf',
    Ẩ: 'AAr',
    Ẫ: 'AAx',
    Ậ: 'AAj',
    É: 'Es',
    È: 'Ef',
    Ẻ: 'Er',
    Ẽ: 'Ex',
    Ẹ: 'Ej',
    Ế: 'EEs',
    Ề: 'EEf',
    Ể: 'EEr',
    Ễ: 'EEx',
    Ệ: 'EEj',
    Í: 'Is',
    Ì: 'If',
    Ỉ: 'Ir',
    Ĩ: 'Ix',
    Ị: 'Ij',
    Ó: 'Os',
    Ò: 'Of',
    Ỏ: 'Or',
    Õ: 'Ox',
    Ọ: 'Oj',
    Ố: 'OOs',
    Ồ: 'OOf',
    Ổ: 'OOr',
    Ỗ: 'OOx',
    Ộ: 'OOj',
    Ớ: 'OWs',
    Ờ: 'OWf',
    Ở: 'OWr',
    Ỡ: 'OWx',
    Ợ: 'OWj',
    Ú: 'Us',
    Ù: 'Uf',
    Ủ: 'Ur',
    Ũ: 'Ux',
    Ụ: 'Uj',
    Ứ: 'UWs',
    Ừ: 'UWf',
    Ử: 'UWr',
    Ữ: 'UWx',
    Ự: 'UWj',
    Ý: 'Ys',
    Ỳ: 'Yf',
    Ỷ: 'Yr',
    Ỹ: 'Yx',
    Ỵ: 'Yj',
    Ê: 'EE',
    Â: 'AA',
    Ô: 'OO',
    Ơ: 'OW',
    Ư: 'UW',
    ă: 'aw',
  };

  let result = text;
  for (const [vietnameseChar, englishChar] of Object.entries(vowelMap)) {
    result = result.replace(new RegExp(vietnameseChar, 'g'), englishChar);
  }

  return result.replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export const parseValue = (val: AnyElement) => {
  if (val === 'undefined') return undefined;
  if (val === 'null') return null;
  return val;
};

export const convertMenuItemToItem = (
  { parentId, label, key, icon, hasChild }: MenuItem,
  menus: MenuItem[],
  isChildMenu?: boolean
) => {
  if (parentId && !isChildMenu) return null;
  const isLinked = !menus.some(
    (value: AnyElement) => value['parentId'] === key
  );
  const menuLabel = !isLinked ? (
    <div title={label}>{label}</div>
  ) : (
    <Link to={key} title={label}>
      {label}
    </Link>
  );
  const childrens: ItemType[] = menus
    .filter((item) => item['parentId'] === key)
    .map((subItem) => convertMenuItemToItem(subItem, menus, true));
  if (compact(childrens).length === 0 && hasChild === true) return null;
  return {
    key: key,
    icon: icon,
    children: childrens.length ? childrens : null,
    label: menuLabel,
  };
};
