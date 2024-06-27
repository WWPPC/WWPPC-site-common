import 'katex/dist/katex.min.css';

import recaptcha from '#/scripts/recaptcha';

recaptcha.loaded().then(() => console.log('reCAPTCHA loaded'));

export function setTheme(color1: string, color2: string, color3: string) {
    document.documentElement.style.setProperty('--color-1', color1);
    document.documentElement.style.setProperty('--color-2', color2);
    document.documentElement.style.setProperty('--color-3', color3);
}

export const isDev = process.env.NODE_ENV == 'development';