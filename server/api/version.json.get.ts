import packageJson from '~/package.json'

export default defineEventHandler(async (event) => {
  try {
    const versionInfo = {
      version: packageJson.version || '1.0.0',
      appName: packageJson.name || 'Gacharary App',
      buildDate: new Date().toISOString().split('T')[0],
      environment: process.env.NODE_ENV || 'development',
      buildTime: new Date().toISOString()
    }
    
    return versionInfo
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get version information'
    })
  }
})
