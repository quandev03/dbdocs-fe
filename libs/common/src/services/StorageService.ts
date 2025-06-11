export const StorageService = {
  setCookie(name: string, value: string, seconds?: number) {
    let expires = '';
    if (seconds) {
      const date = new Date();
      date.setTime(date.getTime() + seconds * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    localStorage.setItem(name, value);
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  },
  getCookie(name: string) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return '';
  },
  eraseCookie(name: string) {
    document.cookie =
      name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },
  get(key: string, defaultValue = '') {
    const value = localStorage.getItem(key);
    return value ? value : defaultValue;
  },

  set(key: string, value = '') {
    localStorage.setItem(key, value);
  },

  remove(key: string) {
    localStorage.removeItem(key);
  },

  getAccessToken(ACCESS_TOKEN_KEY: string): string {
    return this.get(ACCESS_TOKEN_KEY);
  },

  setAccessToken(ACCESS_TOKEN_KEY: string, token: string) {
    this.set(ACCESS_TOKEN_KEY, token);
  },

  setRefreshToken(REFRESH_TOKEN_KEY: string, token: string) {
    this.set(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken(REFRESH_TOKEN_KEY: string): string {
    return this.get(REFRESH_TOKEN_KEY);
  },

  setFcmToken(FCM_TOKEN_KEY: string, token: string): void {
    this.set(FCM_TOKEN_KEY, token);
  },

  getFcmToken(FCM_TOKEN_KEY: string): string {
    return this.get(FCM_TOKEN_KEY);
  },

  setUserNameAccount(USERNAME: string, userName: string) {
    this.set(USERNAME, userName);
  },

  getUserNameAccount(USERNAME: string): string {
    return this.get(USERNAME);
  },

  removeToken(
    ACCESS_TOKEN_KEY: string,
    REFRESH_TOKEN_KEY: string,
    FCM_TOKEN_KEY: string,
    USERNAME: string
  ) {
    this.remove(ACCESS_TOKEN_KEY);
    this.remove(REFRESH_TOKEN_KEY);
    this.remove(FCM_TOKEN_KEY);
    this.remove(USERNAME);
  },
};
