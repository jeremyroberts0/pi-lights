

# Pi Lights
![Demo](/demo.gif)


Pi Lights is a REST API for controller a strip of individually addressable LEDs.  Currently built for ws2801 LEDs but this could easily be made configurable.

## Usage

### Preqrequisites
- NodeJS
- Yarn

### Development
- Install dependencies: `yarn --pure-lockfile`
- Start: `npm run start:dev`

Be sure to use `start:dev` and not `start` for development.  The `start` command will throw an exception at boot up if it doesn't have access to SPIO pins.

### Production (Raspberry Pi)
- Install dependencies `yarn --pure-lockfile --production`
- Start: `sudo npm start` (currently requires root permissions to access SPIO)

### Additional pi config
- The default raspbian installation has SPIO disabled.  You'll need to enable it via `raspi-config`
- The app does not start automatically when the pi boots, you'll need to start it manually

## Roadmap
- Encapsulate / document pi pre-requisites as much as possible.