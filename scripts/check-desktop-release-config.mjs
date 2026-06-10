import { readFile } from "node:fs/promises";

const workflow = await readFile(".github/workflows/release-desktop.yml", "utf8");
const builder = await readFile("apps/desktop/electron-builder.yml", "utf8");

const requiredWorkflowTokens = [
  "CSC_LINK: ${{ secrets.MAC_CSC_LINK }}",
  "CSC_KEY_PASSWORD: ${{ secrets.MAC_CSC_KEY_PASSWORD }}",
  "APPLE_API_KEY: ${{ secrets.APPLE_API_KEY }}",
  "APPLE_API_KEY_ID: ${{ secrets.APPLE_API_KEY_ID }}",
  "APPLE_API_ISSUER: ${{ secrets.APPLE_API_ISSUER }}",
  "APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}",
];

for (const token of requiredWorkflowTokens) {
  if (!workflow.includes(token)) {
    throw new Error(`Desktop release workflow is missing ${token}`);
  }
}

const forbiddenWorkflowTokens = ['CSC_IDENTITY_AUTO_DISCOVERY: "false"'];
for (const token of forbiddenWorkflowTokens) {
  if (workflow.includes(token)) {
    throw new Error(`Desktop release workflow disables signing with ${token}`);
  }
}

const requiredBuilderTokens = [
  "hardenedRuntime: true",
  "gatekeeperAssess: false",
  "notarize: true",
  "entitlements: build/entitlements.mac.plist",
  "entitlementsInherit: build/entitlements.mac.inherit.plist",
];

for (const token of requiredBuilderTokens) {
  if (!builder.includes(token)) {
    throw new Error(`Desktop electron-builder config is missing ${token}`);
  }
}

if (/^\s*identity:\s*null\s*$/m.test(builder)) {
  throw new Error("Desktop electron-builder config disables signing with identity: null");
}

console.log("Desktop release signing and notarization config check passed.");
