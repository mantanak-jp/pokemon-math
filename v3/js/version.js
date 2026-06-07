export const DEV_BUILD = {
  version: "v3-dev-0.3.0",
  phase: "Phase 2B",
  updatedAt: "2026-06-07 09:35 JST"
};

export function formatDevBuildInfo(build = DEV_BUILD) {
  return `V3 Dev ${build.version} / ${build.phase} / ${build.updatedAt}`;
}

window.AppVersion = {
  DEV_BUILD,
  formatDevBuildInfo
};
