## Configuration

### Option: `app_log_level`

Set the log level for the application.

Possible values: `fatal`, `error`, `warn`, `notice`, `info`, `debug`

Default: `info`

### Option: `disable_log_colors`

Disable colored log output (useful for some log viewers).

Default: `false`

### Option: `mdns_network_interface`

Specify the network interface to use for mDNS. Leave empty to auto-detect.

Examples: `eth0`, `wlan0`

Default: (auto-detect)

## How to Use

1. Start the addon
2. Access the web interface via Ingress
3. Configure your bridges and devices
4. Connect your Matter controllers (Apple Home, Google Home, Alexa)

## Updates

This addon automatically builds from the fork repository. To get the latest version:

1. Wait for GitHub Actions to build (happens automatically on push)
2. In Home Assistant: Add-ons → This Addon → ⋮ → Rebuild

This will pull the latest Docker image and restart the addon.

## Support

For issues and documentation, see:
- Fork: https://github.com/jeffothy/home-assistant-matter-hub
- Upstream: https://github.com/t0bst4r/home-assistant-matter-hub
