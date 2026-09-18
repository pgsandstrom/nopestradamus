import { LOGIN_FRAGMENT } from '../shared/index.ts'

/**
 * Set on `<html>` while a secret link is being traded for a session. `login-cover.module.css`
 * keys the cover off it, so the name is spelled out in that file too.
 */
export const LOGIN_COVER_ATTRIBUTE = 'data-logging-in'

/**
 * Nothing is allowed to remove the cover except a real answer, so a visitor whose JavaScript
 * never arrives would otherwise be left staring at it. This is the escape hatch, and it is
 * generous: a login that takes this long has failed at something other than being slow.
 */
const GIVE_UP_AFTER_MS = 10_000

/**
 * Runs synchronously while the browser is still parsing `<head>`, which is the only moment early
 * enough to matter. The server cannot see the fragment, so the page it sent shows the prediction
 * as a stranger sees it; by the time React has hydrated and the login has come back, that wrong
 * view has already been painted. Raising the cover here means it never is.
 *
 * Written as plain ES5 in a string on purpose: it is inlined into the document verbatim, so
 * nothing compiles, bundles or polyfills it.
 */
const attribute = JSON.stringify(LOGIN_COVER_ATTRIBUTE)
export const loginCoverScript = `(function(){try{var r=document.documentElement
if(!new RegExp(${JSON.stringify(LOGIN_FRAGMENT.source)}).test(location.hash.slice(1)))return
r.setAttribute(${attribute},"")
setTimeout(function(){r.removeAttribute(${attribute})},${GIVE_UP_AFTER_MS})}catch(e){}})()`
