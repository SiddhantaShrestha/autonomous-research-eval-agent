import { spawn } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { existsSync } from "fs";
import { getPipelineScript, getPythonExecutable, getRepoRoot } from "@/lib/paths";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  let tempPath: string | null = null;
  try {
    const form = await req.formData();
    const query = String(form.get("query") ?? "").trim();
    const file = form.get("file");

    if (!query) {
      return Response.json({ error: "Query is required." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return Response.json({ error: "File is required." }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > MAX_BYTES) {
      return Response.json(
        { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB).` },
        { status: 400 }
      );
    }

    const name = file.name || "upload";
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : ".txt";
    tempPath = join(tmpdir(), `reval-${randomBytes(8).toString("hex")}${ext}`);
    await writeFile(tempPath, buf);

    const repoRoot = getRepoRoot();
    let pythonExe = getPythonExecutable();
    if (!existsSync(pythonExe)) {
      pythonExe = process.platform === "win32" ? "python" : "python3";
    }
    const script = getPipelineScript();
    if (!existsSync(script)) {
      return Response.json(
        { error: "Pipeline script not found. Set RESEARCH_AGENT_ROOT to the repo root." },
        { status: 500 }
      );
    }

    const payload = JSON.stringify({ query, file: tempPath });
    const jsonOut = await runPython(pythonExe, script, repoRoot, payload);

    let data: unknown;
    try {
      data = JSON.parse(jsonOut);
    } catch {
      return Response.json(
        { error: "Invalid JSON from pipeline.", detail: jsonOut.slice(0, 500) },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  } finally {
    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch {
        /* ignore */
      }
    }
  }
}

function runPython(
  pythonExe: string,
  script: string,
  cwd: string,
  stdinPayload: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonExe, [script], {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, PYTHONUTF8: "1" },
    });

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString("utf8");
    });
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString("utf8");
    });

    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      try {
        const j = JSON.parse(stderr.trim());
        if (j.error) reject(new Error(j.error));
        else reject(new Error(stderr || `Exit ${code}`));
      } catch {
        reject(new Error(stderr || stdout || `Python exited ${code}`));
      }
    });

    child.stdin?.write(stdinPayload, "utf8");
    child.stdin?.end();
  });
}
