/*
import { Instance, Protocols, Ddbms  } from  'instance-lib-js'

import Bootstrap from './Bootstrap.js'

const boot = new Bootstrap(['ws', 'http', 'ipfs'])
const processes = boot.getProcesses()

const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const dbPath = path.resolve(__dirname, '../var/instance.db')
const db = new sqlite3.Database(dbPath)

// service
let instance = new Instance({
  'ws': new Protocols.WebSockets(processes.ws),
  'http': new Protocols.Http(processes.http)
}, db, [
    'ipfs': new Ddbms.Ipfs(processes.ipfs)
])

instance.loadListeners()

console.log('Server listening on port:', PORT) 

// backend
var express = require('express');
var app = express();

app.get('/nodes', async function(req, res) {
    res.send({
        success: true,
        data: await instance.models.node.getList()
    })
})

app.post('/nodes', function(req, res) {
    res.send('hello world');
})

app.put('/nodes', function(req, res) {
    res.send('hello world');
})

app.delete('/nodes', function(req, res) {
    res.send('hello world');
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
*/