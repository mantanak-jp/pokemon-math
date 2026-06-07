export const DEV_BUILD = {
  version: "v3-dev-0.3.1",
  phase: "Phase 2B-2",
  updatedAt: "2026-06-07 11:25 JST"
};

export function formatDevBuildInfo(build = DEV_BUILD) {
  return `V3 Dev ${build.version} / ${build.phase} / ${build.updatedAt}`;
}

window.AppVersion = {
  DEV_BUILD,
  formatDevBuildInfo
};
