/**
 * Every link in a mail is absolute and points here. It lives apart from `mailer.ts` because the
 * HTML renderer needs it too, and the renderer must not import the mailer — the mailer imports
 * the renderer.
 */
export const SITE_URL = 'https://nopestradamus.com'
