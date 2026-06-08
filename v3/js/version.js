export const APP_VERSION = {
  major: 3,
  minor: 1,
  patch: 0,
  build: 0,
  generatedAt: "202606071900"
};

export function formatAppVersion(version = APP_VERSION) {
  return `v${version.major}.${version.minor}.${version.patch}.${version.build}.${version.generatedAt}`;
}

export const DEV_BUILD = {
  version: formatAppVersion(APP_VERSION),
  phase: "V3.1 main",
  updatedAt: APP_VERSION.generatedAt
};

export function formatDevBuildInfo() {
  return formatAppVersion(APP_VERSION);
}

window.AppVersion = {
  APP_VERSION,
  DEV_BUILD,
  formatAppVersion,
  formatDevBuildInfo
};