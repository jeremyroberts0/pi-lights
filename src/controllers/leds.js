const leds = require('../leds')

module.exports.setSolidColor = (req, res) => {
    leds.setSolidColor(req.body)
    res.send(204)
}

module.exports.setPattern = (req, res) => {
    if (req.body instanceof Array === false) {
        res.send(400)
        res.send({
            message: 'body should be an array of RGBs',
        })
        return
    }

    leds.setPattern(req.body)

    res.send(204)
}

module.exports.fade = (req, res) => {
    const { first, second, duration } = req.body
    if (!first || first.length !== 3 || !second || second.length !== 3 || !duration) {
        res.send(400)
        return
    }
    leds.fadeSolid(first, second, duration)
    res.send(204)
}

module.exports.rainbow = (req, res) => {
    leds.rainbow()
    res.send(204)
}

module.exports.xmas = (req, res) => {
    leds.xmas()
    res.send(204)
}

module.exports.reset = (req, res) => {
    leds.reset()
    res.send(204)
}
