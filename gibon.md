# Pi Lights - Project Documentation

## Project Overview

Pi Lights is a Node.js application designed to control individually addressable LED strips (WS281x protocol) using a Raspberry Pi. The project provides a REST API, web interface, and automatic discovery features for controlling LED lighting patterns and brightness over a local network.

### Key Features
- **REST API**: Control LED patterns and brightness programmatically
- **Web Interface**: Browser-based control panel for easy interaction
- **MDNS Discovery**: Automatic network discovery using the Pi's hostname
- **Auto-Update**: Self-updating by monitoring the master branch on GitHub
- **Pattern System**: Modular LED pattern implementations with real-time rendering
- **State Persistence**: Remembers last pattern, brightness, and LED count across restarts
- **Console Visualizer**: Development mode for testing without physical LEDs

## Architecture

### High-Level Architecture
The application follows a modular Node.js architecture with clear separation of concerns:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   REST API      │    │   Pattern Engine │    │   LED Hardware  │
│   (Restify)     │────│   (Patterns)     │────│   (WS281x)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         └──────────────│   State Manager  │─────────────┘
                        │   (Persistence)  │
                        └──────────────────┘
                                 │
                 ┌─────────────────────────────────────┐
                 │            Services                 │
                 │  ┌─────────┐ ┌─────────┐ ┌─────────┐│
                 │  │  MDNS   │ │Updater  │ │ Logger  ││
                 │  └─────────┘ └─────────┘ └─────────┘│
                 └─────────────────────────────────────┘
```

### Key Components

1. **HTTP Server** (`src/index.js`): Main application entry point using Restify
2. **LED Controller** (`src/leds.js`): Hardware abstraction layer for WS281x LEDs
3. **Pattern System** (`src/patterns/`): Modular LED animation implementations
4. **MDNS Service** (`src/mdns.js`): Network discovery for local access
5. **Auto Updater** (`src/updater.js`): Git-based automatic updates
6. **Web Interface** (`src/www/index.html`): Browser-based control panel

## Directory Structure

```
pi-lights/
├── src/                          # Source code
│   ├── patterns/                 # LED pattern implementations
│   │   ├── index.js             # Pattern registry
│   │   ├── rainbow.js           # Rainbow animation
│   │   ├── white.js             # Solid white
│   │   ├── xmas.js              # Christmas colors
│   │   ├── loading.js           # Loading animation
│   │   ├── starlight.js         # Starlight effect
│   │   └── utils.js             # Pattern utilities
│   ├── www/                      # Web interface assets
│   │   └── index.html           # Control panel UI
│   ├── index.js                 # Main application server
│   ├── leds.js                  # LED hardware interface
│   ├── mdns.js                  # Network discovery service
│   ├── updater.js               # Auto-update functionality
│   ├── logger.js                # Logging utility
│   ├── console_visualizer.js    # Development LED simulator
│   └── pilights.service         # Systemd service definition
├── package.json                 # Node.js dependencies and scripts
├── .eslintrc                    # ESLint configuration
└── README.md                    # Project documentation
```

## Key Files

### Core Application Files
- **`src/index.js`**: Main server with REST API endpoints, state management, and service orchestration
- **`src/leds.js`**: Hardware abstraction for WS281x LED strips with brightness and pattern control
- **`src/patterns/index.js`**: Central registry of all available LED patterns

### Pattern Files
- **`src/patterns/rainbow.js`**: Animated rainbow color cycling
- **`src/patterns/white.js`**: Solid white illumination
- **`src/patterns/xmas.js`**: Christmas-themed red and green colors
- **`src/patterns/loading.js`**: Loading animation effect
- **`src/patterns/starlight.js`**: Twinkling starlight effect
- **`src/patterns/utils.js`**: Common pattern utilities and helpers

### Configuration Files
- **`package.json`**: Dependencies, scripts, and project metadata
- **`.eslintrc`**: Code style and linting rules (Airbnb base with customizations)
- **`src/pilights.service`**: Systemd service configuration for production deployment

## Coding Conventions

### Style Guide
- **Linting**: ESLint with Airbnb base configuration
- **Indentation**: 4 spaces (overriding Airbnb default)
- **Semicolons**: Optional (disabled)
- **Console logs**: Allowed for debugging and operational logging
- **Global requires**: Allowed for Node.js patterns

### Naming Conventions
- **Files**: camelCase for JavaScript files, lowercase for service files
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE for environment variables and global constants
- **Pattern functions**: Named functions that return objects with `get()` method and optional `interval`

### Pattern Architecture
All LED patterns follow a consistent interface:
```javascript
function patternName(size) {
    return {
        get: () => [...], // Returns array of [r, g, b] tuples
        interval: 50      // Optional: milliseconds between updates
    };
}
```

## Dependencies

### Core Dependencies
- **`restify`**: REST API server framework
- **`rpi-ws281x-native`**: Raspberry Pi WS281x LED strip control
- **`multicast-dns`**: MDNS service for network discovery
- **`simple-git`**: Git operations for auto-update functionality
- **`chalk`**: Terminal color output for logging

### Development Dependencies
- **`eslint`**: JavaScript linting
- **`eslint-config-airbnb-base`**: Airbnb JavaScript style guide
- **`eslint-plugin-import`**: ES6 import/export linting

### Hardware Dependencies
- Raspberry Pi with GPIO access
- WS281x compatible LED strips (NeoPixels, etc.)
- Proper power supply for LED strips

## Development Workflow

### Installation
```bash
# Clone repository
git clone https://github.com/jeremyroberts0/pi-lights.git
cd pi-lights

# Install dependencies
npm ci

# Development mode (with console visualizer)
npm run start:dev

# Production mode
npm start
```

### Available Scripts
- **`npm start`**: Run the application in production mode
- **`npm run start:dev`**: Development mode with console visualizer and debugger
- **`npm test`**: Run linting tests
- **`npm run test:lint`**: Run ESLint with auto-fix
- **`npm run build:prod`**: Install only production dependencies

### Environment Variables
- **`PORT`**: Server port (default: 80)
- **`NO_UPDATE`**: Disable auto-update functionality
- **`CONSOLE_VISUALIZER`**: Enable console-based LED visualization for development
- **`NODE_ENV`**: Environment mode (production/development)

## Common Tasks

### Adding New LED Patterns
1. Create a new file in `src/patterns/` (e.g., `mypattern.js`)
2. Implement the pattern function following the standard interface:
   ```javascript
   function myPattern(size) {
       return {
           get: () => {
               // Return array of [r, g, b] tuples for each LED
               return Array(size).fill([255, 0, 0]); // Example: all red
           },
           interval: 100 // Optional: update every 100ms
       };
   }
   module.exports = myPattern;
   ```
3. Register the pattern in `src/patterns/index.js`
4. Add API endpoint in `src/index.js` if needed

### Extending the REST API
1. Add new routes in `src/index.js` using Restify patterns:
   ```javascript
   server.post('/custom/:param', (req, res, next) => {
       // Handle request
       res.send({ success: true });
       return next();
   });
   ```

### Hardware Configuration
- LEDs connect to GPIO18 (configurable in `rpi-ws281x-native`)
- Maximum LED count: 300 (configurable in `index.js`)
- Power injection may be required for longer strips

### Production Deployment
1. Copy `src/pilights.service` to `/lib/systemd/system/`
2. Enable service: `sudo systemctl enable pilights.service`
3. Start service: `sudo systemctl start pilights.service`
4. View logs: `journalctl -u pilights.service`

## Important Context

### Raspberry Pi Specific
- Requires root privileges for GPIO access in production
- Hardware PWM conflicts may occur with audio output
- LED strips require adequate power supply (separate from Pi power)

### Network Discovery
- MDNS enables access via hostname (e.g., `http://raspberrypi.local`)
- Chrome on Android doesn't support MDNS - use IP address instead
- Firewall must allow port 80 (or configured port)

### Auto-Update System
- Monitors GitHub repository for changes
- Requires SSH key configuration for private repositories
- Updates occur every 3 minutes when changes detected
- Can be disabled with `NO_UPDATE=true` environment variable

### Development Gotchas
- `rpi-ws281x-native` requires native compilation on Pi
- Console visualizer mode helps development without hardware
- Pattern intervals below 20ms are automatically corrected
- State persistence survives application restarts but not filesystem changes

### Performance Considerations
- Maximum update rate: 50 FPS (20ms intervals)
- Pattern complexity affects CPU usage
- Memory usage scales with LED count
- Network latency affects real-time control responsiveness