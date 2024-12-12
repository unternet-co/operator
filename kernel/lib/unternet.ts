import Unternet from '@unternet/sdk';
const isDev = import.meta.env.DEV;

export const unternet = new Unternet({ isDev });
