export const DEV_BUILD = {
  version: "v3-dev-0.4.1",
  phase: "Phase 2C-2",
  updatedAt: "2026-06-07 15:10 JST"
};

export function formatDevBuildInfo(build = DEV_BUILD) {
  return `V3 Dev ${build.version} / ${build.phase} / ${build.updatedAt}`;
}

window.AppVersion = {
  DEV_BUILD,
  formatDevBuildInfo
};
