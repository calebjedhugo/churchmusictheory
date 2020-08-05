const fs = require('fs')
const path = require('path')
const node_ssh = require('node-ssh')
const ssh = new node_ssh()
const deployKey = fs.readFileSync(path.join(__dirname, '../../deploy'), {encoding: 'utf8'})
const {passphrase, username, host} = require('../../passwords.json').ssh



ssh.connect({
  host: host,
  username: username,
  privateKey: deployKey,
  passphrase: passphrase
}).then(async () => {

  //Get the names of the files and directories to copy.
  let filesToCopy = await new Promise((resolve, reject) => {
    fs.readdir('../deployWorkspace', (err, files) => {
      if(err) reject(err)
      files.splice(files.indexOf('client'), 1)
      resolve(files)
    })
  }).catch(e => {throw e})

  const failed = []
  const successful = []
  ssh.putDirectory('../deployWorkspace/', 'public_html/churchmusictheory.com/test/', {
    recursive: true,
    concurrency: 10,
    validate: (itemPath) => {
      const baseName = path.basename(itemPath)
      return baseName.substr(0, 1) !== '.' && // do not allow dot files
             baseName !== 'node_modules' && // do not allow node_modules
             baseName !== 'client' && //do not allow client source code.
             baseName !== 'package.json' &&
             baseName !== 'package-lock.json' &&
             baseName !== 'deploy'
    },
    tick: (localPath, remotePath, error) => {
      if (error) {
        failed.push(localPath)
      } else {
        successful.push(localPath)
      }
    }
  }).then(status => {
    console.log('the directory transfer was', status ? 'successful' : 'unsuccessful')
    console.log('failed transfers', failed.join(', '))
    console.log('successful transfers', successful.join(', '))
  }).catch(e => {
    console.log(e.message)
  }).finally(() => {
    ssh.dispose()
  })
}).catch(e => {
  console.log(e.message)
})
