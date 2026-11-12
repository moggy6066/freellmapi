// Pin the ICU default locale to en-US during tests. Without this, toLocaleString()
// and Intl.* formatting follow the host OS locale, so a machine set to Arabic or
// another non-Latin-script locale formats numbers as ٤٢ instead of 42 and every
// assertion on formatted output fails for reasons unrelated to the code under
// test. CI runners already default to en-US, so this changes nothing there; it
// only makes local runs deterministic.
//
// Both layers are patched: the Intl constructors (for code that builds formatters
// without an explicit locale) and the prototype shortcuts (Number/Date
// toLocaleString), because V8 binds those to the intrinsic %NumberFormat% rather
// than the JS-visible constructor.
const LOCALE = 'en-US';

const pinnedNumberFormat = Intl.NumberFormat;
// eslint-disable-next-line no-extend-native -- the only reliable way to pin the default locale
Intl.NumberFormat = function NumberFormat(
  locales?: string | readonly string[],
  options?: Intl.NumberFormatOptions,
) {
  return new pinnedNumberFormat(locales ?? LOCALE, options);
} as unknown as typeof Intl.NumberFormat;
Object.setPrototypeOf(Intl.NumberFormat, pinnedNumberFormat);
Intl.NumberFormat.prototype = pinnedNumberFormat.prototype;

const pinnedDateTimeFormat = Intl.DateTimeFormat;
// eslint-disable-next-line no-extend-native -- same pinning as above
Intl.DateTimeFormat = function DateTimeFormat(
  locales?: string | readonly string[],
  options?: Intl.DateTimeFormatOptions,
) {
  return new pinnedDateTimeFormat(locales ?? LOCALE, options);
} as unknown as typeof Intl.DateTimeFormat;
Object.setPrototypeOf(Intl.DateTimeFormat, pinnedDateTimeFormat);
Intl.DateTimeFormat.prototype = pinnedDateTimeFormat.prototype;

const numberToLocaleString = Number.prototype.toLocaleString;
// eslint-disable-next-line no-extend-native -- pins the OS locale out of test output
Number.prototype.toLocaleString = function toLocaleString(
  locales?: string | readonly string[],
  options?: Intl.NumberFormatOptions,
) {
  return numberToLocaleString.call(this, locales ?? LOCALE, options);
};

const dateToLocaleString = Date.prototype.toLocaleString;
// eslint-disable-next-line no-extend-native -- pins the OS locale out of test output
Date.prototype.toLocaleString = function toLocaleString(
  locales?: string | readonly string[],
  options?: Intl.DateTimeFormatOptions,
) {
  return dateToLocaleString.call(this, locales ?? LOCALE, options);
};
