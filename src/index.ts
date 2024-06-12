import 'katex/dist/katex.min.css';

import recaptcha from './scripts/recaptcha';

recaptcha.loaded().then(() => console.log('reCAPTCHA loaded'));