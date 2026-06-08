export const DEV_BUILD = {
  version: "v3-dev-0.5.0",
  phase: "Phase 3 / V3.1 math levels",
  updatedAt: "2026-06-08 19:00 JST"
};

export function formatDevBuildInfo(build = DEV_BUILD) {
  return `V3 Dev ${build.version} / ${build.phase} / ${build.updatedAt}`;
}

window.AppVersion = {
  DEV_BUILD,
  formatDevBuildInfo
};