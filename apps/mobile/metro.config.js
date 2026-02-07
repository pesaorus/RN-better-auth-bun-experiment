const { getDefaultConfig } = require("expo/metro-config")
const path = require("node:path")

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot]

// Let Metro resolve packages from the monorepo root
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(monorepoRoot, "node_modules"),
]

// Resolve Better Auth package exports
config.resolver.unstable_enablePackageExports = true

module.exports = config
