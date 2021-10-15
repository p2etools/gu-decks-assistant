const fs = require('fs-extra')
const path = require('path')
const { sync: globSync } = require('glob')

const merged = {}
let packageJSON = undefined

for (const fpPath of globSync('out/publish-dry-run/*/*.forge.publish')) {
  const data = fs.readJsonSync(fpPath)
  if (!packageJSON) {
    packageJSON = data.packageJSON
  }
  merged[data.platform] = merged[data.platform] || {}
  merged[data.platform][data.arch] = merged[data.platform][data.arch] || new Set()
  for (const artifact of data.artifacts) {
    const artifactPath = data.platform === 'win32' ? artifact.replace(/\\/g, '/') : artifact
    merged[data.platform][data.arch].add(artifactPath)
  }
  fs.unlinkSync(fpPath)
}

for (const [platform, platformData] of Object.entries(merged)) {
  for (const [arch, data] of Object.entries(platformData)) {
    const mergedPath = path.join('out', 'publish-dry-run', `merged-${platform}`, `${arch}.forge.publish`)
    fs.mkdirSync(path.dirname(mergedPath), { recursive: true })
    fs.writeJsonSync(mergedPath, {
      artifacts: Array.from(data),
      packageJSON,
      platform,
      arch
    })
  }
}