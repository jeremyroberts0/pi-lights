const cp = require('child_process')
const sg = require('simple-git');

const git = sg({
    baseDir: __dirname,
})
    .env('GIT_SSH_COMMAND', 'ssh -i /home/pi/.ssh/id_rsa')

const MIN_INTERVAL = 1 * 60 * 1000; // 1 minute

let updateRunning = false;

function startUpdater(interval) {
    if (interval < MIN_INTERVAL) {
        console.error('update interval less than 1 minute: ', interval);
        console.error('updater not running');
    }
    setInterval(async () => {
        if (updateRunning) {
            console.log('update already running, skipping');
            return;
        }
        updateRunning = true;
        try {
            const diff = await git.diff();
            if (diff !== '') {
                console.error('local repo contains changes, not updating');
                return;
            }

            await git.fetch('origin', 'master');
            const localMasterSha = await git.revparse('master');
            const remoteMasterSha = await git.revparse('origin/master');

            if (localMasterSha === remoteMasterSha) {
                console.log('nothing to update, master and origin/master match', localMasterSha);
                return;
            }

            await git.checkout('master')
            await git.pull();

            cp.execSync('npm install --no-save', {
                cwd: __dirname,
                timeout: 5 * 60 * 1000, // 5 minutes
            })

            console.log('app updated, exiting process')
            process.exit(0);
            // Expect app to be restarted by systemd (see pilights.service)
        } catch (err) {
            console.error('updater error', err);
        }
        updateRunning = false;
    }, interval)
}

module.exports = startUpdater;