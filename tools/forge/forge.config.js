// Forge Configuration
const path = require('path')
const rootDir = process.cwd()

module.exports = {
  // Packager Config
  packagerConfig: {
    // Create asar archive for main, renderer process files
    asar: true,
    // Set executable name
    executableName: 'NeFaktura',
    // Set application copyright
    appCopyright: 'Copyright (C) 2022 Sergei Patiakin',
    // Set application icon
    icon: 'assets/images/nef-logo',
  },
  // Forge Makers
  makers: [
    {
      // Squirrel.Windows is a no-prompt, no-hassle, no-admin method of installing
      // Windows applications and is therefore the most user friendly you can get.
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ne-faktura',
      },
    },
    {
      // The Zip target builds basic .zip files containing your packaged application.
      // There are no platform specific dependencies for using this maker and it will run on any platform.
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  // Forge Plugins
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        // Fix content-security-policy error when image or video src isn't same origin
        // Remove 'unsafe-eval' to get rid of console warning in development mode.
        devContentSecurityPolicy: `default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline' data:`,
        // Ports
        port: 3000, // Webpack Dev Server port
        loggerPort: 9000, // Logger port
        // Main process webpack configuration
        mainConfig: path.join(rootDir, 'tools/webpack/webpack.main.js'),
        // Renderer process webpack configuration
        renderer: {
          // Configuration file path
          config: path.join(rootDir, 'tools/webpack/webpack.renderer.js'),
          // Entrypoints of the application
          entryPoints: [
            {
              // Window process name
              name: 'app_window',
              // React Hot Module Replacement (HMR)
              rhmr: 'react-hot-loader/patch',
              // HTML index file template
              html: path.join(rootDir, 'src/renderer/app.html'),
              // Renderer
              js: path.join(rootDir, 'src/renderer/app-renderer.tsx'),
              // Main Window
              // Preload
              preload: {
                js: path.join(rootDir, 'src/renderer-preload/app-preload.tsx'),
              },
            },
          ],
        },
        devServer: {
          liveReload: false,
        },
      },
    },
  ],
}
