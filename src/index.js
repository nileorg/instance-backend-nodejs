const { Instance, Protocols, Ddbms } = require('instance-lib-js')

// get dependencies for ws and http server

// http server
const server = require('http').createServer(handleRequest)
const Httpdispatcher = require('httpdispatcher')
var dispatcher = new Httpdispatcher()
const PORT = 3334
function handleRequest (request, response) {
  try {
    dispatcher.dispatch(request, response)
  } catch (err) {
    console.log(err)
  }
}

// Initialize an websocket server
const wsServer = require('socket.io')(server)
server.listen(PORT)

// initialize database
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('var/instance.db', sqlite3.OPEN_READWRITE, function (err) {
  if (err) {
    console.log(err)
  }
})

// initialize ipfs
const IPFS = require('ipfs')
let ipfsNode = new IPFS({
  silent: true,
  repo: 'var/instance',
  config: {
    Addresses: {
      Swarm: ['/ip4/0.0.0.0/tcp/0']
    }
  }
})

// initialize the Instance with the object
let instance
ipfsNode.on('ready', () => {
  instance = new Instance({
    'ws': new Protocols.WebSockets(wsServer),
    'http': new Protocols.Http(dispatcher)
  }, db, {
    'ipfs': new Ddbms.Ipfs(ipfsNode)
  })
  // for each protocol initialize the listeners
  instance.loadListeners()
  console.log('Server listening on port:', PORT)
})

// API management system for instance
dispatcher.onGet('/nodes', async function (req, res) {
  const { success, results } = await instance.models.node.get()
  res.end(JSON.stringify({
    success: success,
    nodes: results
  }))
})
