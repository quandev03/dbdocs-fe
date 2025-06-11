import { MESSAGE, RegValidStringEnglish } from '../constants';
import { Rule } from 'antd/lib/form';
import { Dayjs } from 'dayjs';

export const serialSimReg = /^84.{14}$/;

const required = {
  required: true,
  message: MESSAGE.G06,
};

const minLength = (min: number, message: string): Rule => ({
  min,
  message,
});

const maxLength = (max: number): Rule => ({
  max,
  message: MESSAGE.G34(max),
});

const maxNumber = (max: number | undefined, message: string): Rule => ({
  validator: (_, value) => {
    if (
      value?.toString() &&
      max?.toString() &&
      Number(value.toString().replace(/\D/g, '')) > max
    ) {
      return Promise.reject(message);
    }
    return Promise.resolve();
  },
});

const minNumber = (min: number, message: string): Rule => ({
  validator: (_, value) => {
    if (value?.toString() && Number(value) < min) {
      return Promise.reject(message);
    }
    return Promise.resolve();
  },
});

const equal = (
  compared: string | number | undefined,
  message: string
): Rule => ({
  validator: (_, value) => {
    if (value?.toString() && compared && String(value) !== String(compared)) {
      return Promise.reject(message);
    }
    return Promise.resolve();
  },
});

const beforeDay = (day: Dayjs | undefined, message: string): Rule => ({
  validator: (_, value) => {
    if (value && value.isBefore(day, 'day')) {
      return Promise.reject(message);
    }
    return Promise.resolve();
  },
});

const english: Rule = { pattern: RegValidStringEnglish, message: MESSAGE.G07 };
const serialSim: Rule = { pattern: serialSimReg, message: MESSAGE.G07 };
const email: Rule = { type: 'email', message: MESSAGE.G07 };

const lengthNumber = (len: number) => ({
  len,
  message: MESSAGE.G07,
});

const validateForm = {
  required,
  minLength,
  maxLength,
  lengthNumber,
  english,
  maxNumber,
  serialSim,
  minNumber,
  email,
  beforeDay,
  equal,
};

export default validateForm;
