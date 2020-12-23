

# Pi Lights
![Demo](/demo.gif)


Pi Lights is a REST API for controller a strip of individually addressable LEDs.  Currently built for ws2801 LEDs but this could easily be made configurable.


## API

Info

```sh
curl http://localhost:8080/info
```

Set Pattern

```sh
curl -X POST http://localhost:8080/pattern/off
curl -X POST http://localhost:8080/pattern/rainbow
curl -X POST http://localhost:8080/pattern/white
curl -X POST http://localhost:8080/pattern/xmas
curl -X POST http://localhost:8080/pattern/ready
curl -X POST http://localhost:8080/pattern/loading
```

Set Brightness (0-100)

```sh
curl -X POST http://localhost:8080/brightness/0
curl -X POST http://localhost:8080/brightness/25
curl -X POST http://localhost:8080/brightness/50
curl -X POST http://localhost:8080/brightness/75
curl -X POST http://localhost:8080/brightness/100
```

## Running as a systemd service

1. Place `pilights.service` in /lib/systemd/system
2. `sudo systemctl enable myscript.service`

View logs with: `journalctl -u pilights.service`

## Usage

### Preqrequisites
- NodeJS

### Development
- Install dependencies: `npm i`
- Start: `npm run start`

### Production (Raspberry Pi)
- Install dependencies `npm i `
- Start: `sudo npm start` (currently requires root permissions to access SPIO)

### Additional pi config
- The default raspbian installation has SPIO disabled.  You'll need to enable it via `raspi-config`
- The app does not start automatically when the pi boots, you'll need to start it manually

## Native App
Native app for controlling this server can be found here:
https://github.com/jeremyroberts0/pi-lights-app

## Roadmap
- Encapsulate / document pi pre-requisites as much as possible.