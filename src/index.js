const { Instance, Protocols, Ddbms } = require('instance-lib-js')
const Initializer = require('./Initializer')
var config = require('../instance.config.json')

new Initializer(config.initializer)
  .getServices()
  .then(services => {
    let instance = new Instance({
      'ws': new Protocols.WebSockets(services.wsServer),
      'http': new Protocols.Http(services.dispatcher)
    }, services.db, {
      'ipfs': new Ddbms.Ipfs(services.ipfsNode)
    })
    // for each protocol initialize the listeners
    instance.loadListeners()
    return { instance, services }
  })
  .then(({ instance, services }) => {
    require('./Routes')({ instance, dispatcher: services.dispatcher })
  })
