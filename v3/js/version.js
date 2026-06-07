export const DEV_BUILD = {
  version: "v3-dev-0.4.2",
  phase: "Phase 2C-3",
  updatedAt: "2026-06-07 17:35 JST"
};

export function formatDevBuildInfo(build = DEV_BUILD) {
  return `V3 Dev ${build.version} / ${build.phase} / ${build.updatedAt}`;
}

window.AppVersion = {
  DEV_BUILD,
  formatDevBuildInfo
};
