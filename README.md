

# Pi Lights

Pi Lights is an app for controlling a strip of individually addressable LEDs accepting the ws281x protocol.

Features include:

- REST API for controller patterns and brightness (see API docs below)
- MDNS server that enables routing to your pi on your local network via the hostname of the pi itself (the hostname of your pi is configured in the OS level)
- Self-updating by watching the master branch at https://github.com/jeremyroberts0/pi-lights
- Web interface wrapping the REST API for easy control on local network (note Chrome on Android does not support MDNS, so you have to navigiate via IP Address of the pi)
- **Terminal debugger** for developing and testing patterns without hardware

## Wishlist

- Homeassistant integration

## Setup

### Hardware

Wire lights to Pi as per https://learn.adafruit.com/neopixels-on-raspberry-pi/raspberry-pi-wiring

- Data line in GPIO18
- Ground to Ground
- Power to 5v pin

Unless you're using a 5v LED strip, you'll need to inject power seperately.  Multiple strips require power injection at the beginning fo each strip

### Software

This procedure installs the app and runs it as a systemd service, which takes care of gathering logs and starting the app when the pi reboots.

1. Install NodeJS on the pi
2. Clone this repo to `/home/pi/pi-lights`
3. `cd /home/pi/pi-lights`
4. Install nodejs dependencies `npm i --no-save`
6. Copy `pilights.service` to `/lib/systemd/system/pilights.service`
7. `sudo systemctl enable pilights.service`

The app is now running and available on port 80.  View logs with: `journalctl -u pilights.service`.

The app includes an auto update feature.  It polls github occasionally to check for changes and update itself.  You'll need to create an ssh key on your pi and add it to your Github account or to the pilights repo in order to for this to work.

## Terminal Debugger

The terminal debugger allows you to develop and test LED patterns without having physical LED hardware connected. This is particularly useful for:

- Developing new patterns
- Testing existing patterns with different LED counts
- Debugging pattern behavior without affecting actual LED strips

### Usage

**Basic debug mode** (uses terminal width for LED count):
```bash
node src/index.js --debug
# or
npm run debug
```

**Debug with specific LED count**:
```bash
node src/index.js --debug --leds=50
# or use predefined scripts
npm run debug:50   # 50 LEDs
npm run debug:100  # 100 LEDs
npm run debug:300  # 300 LEDs
```

**Alternative using environment variable** (backwards compatible):
```bash
CONSOLE_VISUALIZER=true node src/index.js
```

### Debug Display

The terminal debugger shows:
- Current pattern name
- Number of LEDs and render count
- Colored LED visualization using colored dots (●)
- Automatic line wrapping for long LED strips
- Real-time updates as patterns animate

### Tips

- Use different terminal sizes to see how patterns look with different LED counts
- The visualization wraps to multiple lines for long LED strips
- All API endpoints work normally in debug mode
- Use Ctrl+C to exit debug mode

## API

Info

```sh
curl http://localhost:8080/info
```

Set Pattern

```sh
curl -X POST http://localhost/pattern/off
curl -X POST http://localhost/pattern/rainbow
curl -X POST http://localhost/pattern/white
curl -X POST http://localhost/pattern/xmas
curl -X POST http://localhost/pattern/ready
curl -X POST http://localhost/pattern/loading
```

Set Brightness (0-100)

```sh
curl -X POST http://localhost/brightness/0
curl -X POST http://localhost/brightness/25
curl -X POST http://localhost/brightness/50
curl -X POST http://localhost/brightness/75
curl -X POST http://localhost/brightness/100
```