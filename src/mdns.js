const os = require('os');
const mdnsBuilder = require('multicast-dns');

const ttl = 5 * 60 // 5 minutes

function getIPs() {
    const nets = os.networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }

                results.push(net.address);
            }
        }
    }

    return results;
}

function start() {
    const name = os.hostname();
    const mdns = mdnsBuilder();
    // mdns.on('response', (response) => {
    //     console.log('[mdns]', 'got a response packet:', response)
    // })

    mdns.on('query', (query) => {
        const ips = getIPs();
        query.questions.forEach((q) => {
            if (q.type === 'A' && q.name === name) {
                const response = {
                    answers: ips.map(ip => ({
                        name,
                        ttl,
                        type: 'A',
                        data: ip,
                    })),
                }
                console.log('responding to mdns query with', response);
                mdns.respond(response)
            }
        })
    })

    mdns.on('error', (err) => {
        console.log('[mdns]', 'error', err);
    });

    console.log('[mdns]', 'started mdns server responding to', name);
}

module.exports = start;
