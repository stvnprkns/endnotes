import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { constants } from "node:fs"

const rootDir = resolve(process.cwd())

function fail(message) {
  throw new Error(`verify:package failed: ${message}`)
}

async function assertFileExists(path) {
  try {
    await access(path, constants.F_OK)
  } catch {
    fail(`Missing required file: ${path.replace(`${rootDir}/`, "")}`)
  }
}

function includesCssSideEffect(sideEffects) {
  if (Array.isArray(sideEffects)) {
    return sideEffects.some((value) => typeof value === "string" && value.includes(".css"))
  }
  return sideEffects === true
}

async function main() {
  const packageJsonPath = resolve(rootDir, "package.json")
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"))

  const exportsMap = packageJson.exports ?? {}
  if (!exportsMap["."]) {
    fail('`package.json.exports["."]` is missing')
  }
  if (!exportsMap["./style.css"]) {
    fail('`package.json.exports["./style.css"]` is missing')
  }

  const files = packageJson.files ?? []
  if (!Array.isArray(files) || !files.includes("dist")) {
    fail('`package.json.files` must include "dist"')
  }

  if (!includesCssSideEffect(packageJson.sideEffects)) {
    fail("`package.json.sideEffects` must include CSS")
  }

  const peerDependencies = packageJson.peerDependencies ?? {}
  if (!peerDependencies.react || !peerDependencies["react-dom"]) {
    fail("`package.json.peerDependencies` must include react and react-dom")
  }

  await assertFileExists(resolve(rootDir, "dist", "index.js"))
  await assertFileExists(resolve(rootDir, "dist", "index.d.ts"))
  await assertFileExists(resolve(rootDir, "dist", "endnotes.css"))

  console.log("verify:package passed")
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
