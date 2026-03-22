import { join } from "path";
import { existsSync } from "fs";

/**
 * Monorepo root (parent of /web). Override with RESEARCH_AGENT_ROOT.
 */
export function getRepoRoot(): string {
  const env = process.env.RESEARCH_AGENT_ROOT;
  if (env && existsSync(env)) return env;
  return join(process.cwd(), "..");
}

export function getPythonExecutable(): string {
  const root = getRepoRoot();
  const { platform } = process;
  if (platform === "win32") {
    return join(root, ".venv", "Scripts", "python.exe");
  }
  return join(root, ".venv", "bin", "python3");
}

export function getPipelineScript(): string {
  return join(getRepoRoot(), "scripts", "pipeline_json_stdout.py");
}
