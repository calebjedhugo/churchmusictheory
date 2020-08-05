const clone = require('download-git-repo');
const fs = require('fs')

fs.mkdir('../deployWorkspace', () => {
  clone('calebjedhugo/churchmusictheory', '../deployWorkspace', () => {
    console.log('Master branch cloned successfully.')
  })
})
