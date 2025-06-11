export const RegOnlyNum = /^\d+$/;
export const RegValidPass =
  '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[~@#$!%^*?&()])[A-Za-z\\d@$!%*?&]';

export const RegValidStringEnglish =
  // eslint-disable-next-line no-useless-escape
  /^[~`!@#$%^&*()_+=[\]\{}|;':",.\\/<>?a-zA-Z0-9-]+$/;

export const RegSpecicalChar = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/g;
export const RegSpecialCharactersExceptHyphenAndUnderscore =
  /[`!@#$%^&*()+=[\]{};':"\\|,.<>/?~]/g;
export const RegexLicensePlate = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/;
export const RegexIdNoCard = /^\d{12}$/;
export const RegValidCode = /^[a-zA-Z0-9]+$/;
export const RegUuid =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
export const RegUlid = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

export const RegexAccountAlias = /^[a-z0-9]([a-z0-9]|-(?!-)){1,61}[a-z0-9]$/;

export const RegexOnlyTextAndSpace = /^[\p{L}\s]+$/u;
export const textOnlyRegex = /^[a-zA-Z0-9]+$/;
export const textSpaceRegex = /^[a-zA-Z0-9\s]+$/;
export const emailRegex =
  /^((?![#_.-])[a-zA-Z0-9][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[a-zA-Z0-9]|"[^<>()[\]\\.,;:\s@"]+")@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))$/;
export const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/;
export const vietnameseAlphabetAndNumbersRegex =
  /^[a-zA-Z0-9ÀÁÂÃÈÉÊỀỀỂỄỆÌÍÒÓÔÕÙÚĂẮẰẲẴẶĐĨŨƠỚỜỞỠỢơàáâãèéêềềểễệêìíòóôõùúăắằẳẵặđĩũơớờởỡợƯỪỨỬỮỰừứửữựưýỳỵỷỹÝỲỴỶỸ\s]+$/;
export const englishRegex = /^[a-zA-Z]+$/;
export const RegexOnlyTextAndNumbers = /^[\p{L}\d\s]+$/u; // New regex to allow letters, numbers, and spaces
export const RegSpecicalCharExceptUnderscore =
  /[`!@#$%^&*()+\-=[\]{};':"\\|,.<>/?~]/g;
export const serialRegex = /^84\d{14}$/;
export const vietnameseCharsRegex =
  /[ÁÀẢẠÃÂẤẦẨẬĂẮẰẲẴẶÉÈẺẸÊẾỀỂỄỆÍÌỈỊÓÒÒỎỌÔỐỒỔỘƠỚỜỞỠỢÚÙỦỤƯỨỪỬỮỰáàảạâấầẩậăắằẳẵặéèẻẹêếềểễệíìỉịóòỏọôốồổộơớờởỡợúùủụưứừửữựũŨĐđ]/;
export const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%:;*?&])[A-Za-z\d@$!%:;*?&]{8,}$/;
