import arcjet, { shield, detectBot } from '@arcjet/node';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
    }),
  ],
});

export default aj;
