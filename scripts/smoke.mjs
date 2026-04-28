import { mkdir, readdir, rm } from "node:fs/promises"
import { join, resolve } from "node:path"
import { spawn } from "node:child_process"

const rootDir = resolve(process.cwd())
const tmpDir = join(rootDir, "tmp")
const smokeDir = join(rootDir, "smoke", "vite-react")

function run(command, args, cwd = rootDir) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32",
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolveRun()
        return
      }
      rejectRun(
        new Error(
          `Command failed (${code ?? "unknown"}): ${command} ${args.join(" ")}`,
        ),
      )
    })

    child.on("error", (error) => {
      rejectRun(error)
    })
  })
}

async function getPackedTarballPath() {
  const files = await readdir(tmpDir)
  const tgzFiles = files
    .filter((file) => file.startsWith("endnotes-") && file.endsWith(".tgz"))
    .sort()

  if (tgzFiles.length === 0) {
    throw new Error(`No endnotes tarball found in ${tmpDir}`)
  }

  return join(tmpDir, tgzFiles[tgzFiles.length - 1])
}

async function main() {
  await rm(tmpDir, { recursive: true, force: true })
  await mkdir(tmpDir, { recursive: true })

  await run("npm", ["run", "build"])
  await run("npm", ["pack", "--pack-destination", tmpDir])

  const tarballPath = await getPackedTarballPath()
  await run("npm", ["install"], smokeDir)
  await run("npm", ["install", tarballPath], smokeDir)
  await run("npm", ["run", "build"], smokeDir)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
