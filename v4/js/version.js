export const APP_VERSION = {
  major: 4,
  minor: 0,
  patch: 0,
  build: 1,
  generatedAt: "202606120001"
};

export function formatAppVersion(version = APP_VERSION) {
  return `v${version.major}.${version.minor}.${version.patch}.${version.build}.${version.generatedAt}`;
}

export const DEV_BUILD = {
  version: formatAppVersion(APP_VERSION),
  phase: "V4 basic flag quiz",
  updatedAt: APP_VERSION.generatedAt
};

export function formatDevBuildInfo() {
  return `V4開発版 ${formatAppVersion(APP_VERSION)}`;
}

window.AppVersion = {
  APP_VERSION,
  DEV_BUILD,
  formatAppVersion,
  formatDevBuildInfo
};
