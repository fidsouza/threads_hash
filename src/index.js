const { hashs } = require('../static/hashs.json')
const crypto = require('crypto')
const { Worker, isMainThread, parentPort } = require('worker_threads')

const LEADING_ZEROES = 4
const final = []
let finishedWorkers = 0
const hrstart = process.hrtime()


if (isMainThread) {

  for (let hash of hashs) {
    const worker = new Worker(__filename, { env: { LEADING_ZEROES } })
    worker.once('message', (message) => {
      final.push(message)
      finishedWorkers++
      if (finishedWorkers === hashs.length) console.log(final)

    })
    worker.on('error', console.error)

    console.log(`Iniciando worker de ID ${worker.threadId} e enviando o payload "${hash}"`)
    worker.postMessage(hash)
  }

} else {
  parentPort.once('message', (message) => {

    const hash = message
    let nonce = 0
    let generatedHash = ''

    do {
      generatedHash = crypto.createHash('sha256').update(hash + nonce).digest('hex')
      nonce++
    } while (generatedHash.slice(0, process.env.LEADING_ZEROES) !== '0'
    .repeat(process.env.LEADING_ZEROES))

    parentPort.postMessage({ hash: message, nonce, hash: generatedHash })

  })

}