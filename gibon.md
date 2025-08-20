# Pi Lights - Project Documentation

## Project Overview

Pi Lights is a Node.js application designed to control individually addressable LED strips (WS281x protocol) using a Raspberry Pi. The project provides a comprehensive solution for LED control with features including:

- **REST API** for controlling LED patterns and brightness
- **Web interface** for easy local network control
- **MDNS server** for convenient hostname-based routing on local networks
- **Auto-update functionality** by monitoring the GitHub repository
- **State persistence** to restore previous settings after restarts
- **Multiple LED patterns** including rainbow, Christmas, St. Patrick's Day, and custom effects

The application is designed to run as a systemd service on Raspberry Pi, making it a robust, always-available LED controller.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │───▶│   REST API      │───▶│   LED Controller│
│  (Browser/API)  │    │   (Restify)     │    │   (rpi-ws281x)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                       ┌─────────────────┐              │
                       │   MDNS Server   │              │
                       └─────────────────┘              │
                                │                       │
                       ┌─────────────────┐              │
                       │   Auto Updater  │              │
                       └─────────────────┘              │
                                │                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │ State Persistence│    │   LED Patterns  │
                       └─────────────────┘    └─────────────────┘
```

### Key Components

1. **REST API Server** (`src/index.js`)
   - Built with Restify framework
   - Handles pattern selection, brightness control, and LED strip sizing
   - Provides system information and status endpoints
   - Serves web interface

2. **LED Controller** (`src/leds.js`)
   - Interfaces with `rpi-ws281x-native` library
   - Manages LED strip rendering and brightness
   - Handles pattern timing and animation loops
   - Includes console visualizer for development

3. **Pattern System** (`src/patterns/`)
   - Modular pattern architecture
   - Each pattern is a separate module returning animation functions
   - Supports both static and animated patterns
   - Consistent interface: `pattern(size)` returns `{ get(), interval }`

4. **MDNS Service** (`src/mdns.js`)
   - Enables hostname-based discovery on local networks
   - Allows accessing the pi via its hostname instead of IP

5. **Auto Updater** (`src/updater.js`)
   - Monitors GitHub repository for updates
   - Automatically pulls and restarts service when changes detected
   - Configurable update intervals

6. **State Persistence**
   - Saves last pattern, brightness, and strip size to filesystem
   - Restores state on application restart
   - Uses simple file-based storage in `src/persistence/`

## Directory Structure

```
pi-lights/
├── src/                        # Main source code
│   ├── index.js               # Main application server
│   ├── leds.js                # LED strip control interface
│   ├── logger.js              # Logging utility
│   ├── mdns.js                # MDNS server for network discovery
│   ├── updater.js             # Auto-update functionality
│   ├── console_visualizer.js  # Development LED visualization
│   ├── pilights.service       # Systemd service configuration
│   ├── patterns/              # LED pattern modules
│   │   ├── index.js          # Pattern registry/exports
│   │   ├── off.js            # Turn off LEDs
│   │   ├── rainbow.js        # Rainbow animation
│   │   ├── white.js          # Solid white
│   │   ├── xmas.js           # Christmas colors
│   │   ├── ready.js          # Ready indicator
│   │   ├── loading.js        # Loading animation
│   │   ├── starlight.js      # Twinkling stars effect
│   │   ├── stpatricks.js     # St. Patrick's Day colors
│   │   ├── baby.js           # Soft baby colors
│   │   ├── ukraine.js        # Ukraine flag colors
│   │   ├── solid.js          # Solid color utility
│   │   └── utils.js          # Pattern utilities
│   └── www/                   # Web interface
│       └── index.html        # Frontend control interface
├── package.json               # Node.js dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── .eslintrc                  # ESLint configuration
├── .gitignore                # Git ignore rules
├── README.md                 # Project documentation
└── demo.gif                  # Demo visualization
```

## Key Files

### Core Application Files

- **`src/index.js`** - Main application entry point with REST API endpoints
- **`src/leds.js`** - LED strip interface and pattern rendering engine
- **`src/patterns/index.js`** - Pattern registry that exports all available patterns

### Configuration Files

- **`package.json`** - Defines dependencies, scripts, and project metadata
- **`.eslintrc`** - Code style and linting rules (Airbnb base config)
- **`src/pilights.service`** - Systemd service definition for production deployment

### Pattern Development

- **`src/patterns/utils.js`** - Shared utilities for pattern development
- Individual pattern files in `src/patterns/` - Each implements a specific LED effect

## Coding Conventions

### Style Guide
- **ESLint**: Airbnb base configuration with customizations
- **Indentation**: 4 spaces (overrides Airbnb's 2-space default)
- **Semicolons**: Optional (turned off in ESLint)
- **Console**: Allowed (no-console rule disabled)

### Naming Conventions
- **Files**: lowercase with underscores (e.g., `console_visualizer.js`)
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE (e.g., `LED_MAX_COUNT`, `MIN_INTERVAL`)
- **Functions**: camelCase

### Pattern Development Conventions

Each pattern module should export a function that:
1. Takes a `size` parameter (number of LEDs)
2. Returns an object with:
   - `get()` function returning array of `[r, g, b]` color arrays
   - `interval` property (optional) for animation timing in milliseconds
   - Pattern function should have a `name` property matching the module key

Example pattern structure:
```javascript
function myPattern(size) {
    return {
        get: () => [...], // Array of [r,g,b] arrays
        interval: 100     // Optional: update interval in ms
    };
}
myPattern.name = 'myPattern';
module.exports = myPattern;
```

### API Conventions
- REST endpoints follow pattern: `POST /pattern/{patternName}`, `POST /brightness/{level}`
- Response codes: 204 for success, 400 for client errors
- State changes trigger automatic persistence

## Dependencies

### Core Runtime Dependencies
- **`restify`** (^6.3.4) - REST API server framework
- **`rpi-ws281x-native`** (^0.10.1) - Raspberry Pi WS281x LED control
- **`multicast-dns`** (^7.2.2) - MDNS server implementation
- **`simple-git`** (^2.31.0) - Git operations for auto-updates
- **`chalk`** (^4.1.0) - Console output coloring

### Development Dependencies
- **`eslint`** (^4.12.0) - Code linting
- **`eslint-config-airbnb-base`** (^12.1.0) - Airbnb style guide
- **`eslint-plugin-import`** (^2.8.0) - Import/export linting

### System Dependencies
- **Node.js** - Runtime environment
- **Raspberry Pi with GPIO access** - Required for LED control
- **WS281x LED strip** - Compatible individually addressable LEDs

## Development Workflow

### Setup Development Environment
1. Clone repository: `git clone https://github.com/jeremyroberts0/pi-lights.git`
2. Install dependencies: `npm ci`
3. For development with console visualization:
   ```bash
   npm run start:dev
   ```
   This enables console LED visualization and runs on port 8080

### Running the Application
- **Development**: `npm run start:dev` (with console visualizer)
- **Production**: `npm start` (requires Raspberry Pi hardware)

### Code Quality
- **Linting**: `npm run test:lint` (automatically fixes issues)
- **Testing**: `npm test` (currently runs linting only)

### Building for Production
- **Production build**: `npm run build:prod` (installs only production dependencies)

### Systemd Service Deployment
1. Copy `src/pilights.service` to `/lib/systemd/system/pilights.service`
2. Enable service: `sudo systemctl enable pilights.service`
3. Start service: `sudo systemctl start pilights.service`
4. View logs: `journalctl -u pilights.service`

## Common Tasks

### Adding a New LED Pattern

1. **Create pattern file** in `src/patterns/`:
   ```javascript
   function newPattern(size) {
       return {
           get: () => {
               // Return array of [r,g,b] color arrays
               const colors = [];
               for (let i = 0; i < size; i++) {
                   colors.push([255, 0, 0]); // Red example
               }
               return colors;
           },
           interval: 100 // Optional: for animations
       };
   }
   newPattern.name = 'newPattern';
   module.exports = newPattern;
   ```

2. **Register pattern** in `src/patterns/index.js`:
   ```javascript
   module.exports = {
       // ... existing patterns
       newPattern: require('./newPattern'),
   }
   ```

3. **Test via API**:
   ```bash
   curl -X POST http://localhost/pattern/newPattern
   ```

### Modifying API Endpoints

Edit `src/index.js` to add new REST endpoints:
```javascript
server.get('/new-endpoint', (req, res) => {
    res.send({ message: 'New endpoint' });
});
```

### Adjusting LED Configuration

Key configuration constants in `src/index.js`:
- `LED_MAX_COUNT = 300` - Maximum number of LEDs
- `PORT = process.env.PORT || 80` - Server port

LED hardware configuration in `src/leds.js`:
- `MIN_INTERVAL = 20` - Minimum animation interval (ms)

### Debugging and Development

- **Console visualization**: Set `CONSOLE_VISUALIZER=true` environment variable
- **Development port**: Set `PORT=8080` to avoid requiring root privileges
- **Disable updates**: Set `NO_UPDATE=true` to prevent auto-updates during development
- **Node.js debugging**: Use `--inspect` flag (included in `start:dev` script)

### State Management

Application state is persisted in `src/persistence/`:
- `lastPattern` - Last selected pattern
- `lastBrightness` - Last brightness level (0-100)
- `lastSize` - Last LED strip size

To reset state, delete the persistence directory.

## Important Context

### Hardware Considerations
- **GPIO Access**: Requires root privileges or proper GPIO permissions
- **Power Requirements**: Large LED strips need external power injection
- **Wiring**: Data line connects to GPIO18, follow Adafruit wiring guide
- **Performance**: Raspberry Pi 3+ recommended for smooth animations

### Network Considerations
- **MDNS Limitations**: Chrome on Android doesn't support MDNS
- **Firewall**: Ensure port 80 (or configured port) is accessible
- **Auto-updates**: Requires SSH key setup for GitHub access

### Development Gotchas
- **Console Visualizer**: Automatically adjusts LED count to terminal width
- **LED Library**: `rpi-ws281x-native` only works on Raspberry Pi hardware
- **Color Format**: Uses `[r, g, b]` arrays, but hardware expects different bit ordering
- **Timing**: Minimum 20ms interval between LED updates for hardware stability

### Production Deployment
- **Systemd Service**: Handles automatic startup and restart on failure
- **Log Management**: Use `journalctl` for viewing application logs  
- **Updates**: Auto-update feature requires GitHub SSH key configuration
- **Port 80**: Requires root privileges or port forwarding setup

### Extension Points
- **Pattern System**: Easy to add new patterns via modular architecture  
- **Hardware Support**: Could be extended to other LED protocols
- **UI Enhancement**: Web interface can be customized in `src/www/index.html`
- **API Extensions**: REST API easily extensible for new features
- **Home Automation**: Ready for integration with home automation systems