var bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var config = require('../instance.config.json')
module.exports = ({ instance, dispatcher }) => {
  /**
   * Handle CORS requests
  */
  dispatcher.beforeFilter(/\//, function (req, res, chain) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE')
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Headers', 'authentication')
      return res.end()
    } else {
      chain.next(req, res, chain)
    }
  })
  /**
   * The following middleware is attach on every request except /login
   * Check if in the authentication header contains a jwt token:
   *      - if the token is valid then continue the chain
   *      - if the token is invalid reply with 401
  */
  dispatcher.beforeFilter(/\/(?!login)/, function (req, res, chain) {
    try {
      var decoded = jwt.verify(req.headers.authentication, config.secret)
      if (decoded) {
        chain.next(req, res, chain)
      } else {
        res.writeHeader(401)
        return res.end()
      }
    } catch (e) {
      res.writeHeader(401)
      return res.end()
    }
  })
  /**
   * LOGIN
   *
   * @api {post} /login Login user
   * @apiParam (Request body) {String} username Username
   * @apiParam (Request body) {String} password Password
   * @apiGroup Tasks
   * @apiVersion 0.0.1
   * @apiName LoginUser
   * @apiGroup session
   * @apiPermission none
   * @apiSuccess {Bool} successful login
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    [{
   *      "success": true,
   *    }]
   * @apiErrorExample {json} List error
   *    HTTP/1.1 500 Internal Server Error
  */
  dispatcher.onPost('/login', async function (req, res) {
    const user = config.users.find(user => {
      return req.params.username === user.username
    })
    let success = false
    let token = false
    if (user) {
      success = await bcrypt.compare(req.params.password, user.password)
      if (success) {
        token = jwt.sign({ username: user.username }, config.secret, {
          expiresIn: 86400
        })
      }
    }
    return res.end(JSON.stringify({
      success: success,
      token: token
    }))
  })
  /**
   * LIST NODES
   *
   * @api {get} /nodes List all nodes
   * @apiHeader {String} Authentication User's unique token.
   * @apiGroup Tasks
   * @apiVersion 0.0.1
   * @apiName ListNodes
   * @apiGroup nodes
   * @apiPermission none
   * @apiSuccess {Object[]} nodes node's list
   * @apiSuccess {Number} nodes.id node id
   * @apiSuccess {String} node.title Node title
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    [{
   *      "id": 1,
   *      "title": "Node 1",
   *      "updated_at": "2016-02-10T15:46:51.778Z",
   *      "created_at": "2016-02-10T15:46:51.778Z"
   *    }]
   * @apiErrorExample {json} List error
   *    HTTP/1.1 500 Internal Server Error
  */
  dispatcher.onGet('/nodes', async function (req, res) {
    const { success, results } = await instance.models.node.get()
    res.end(JSON.stringify({
      success: success,
      nodes: results
    }))
  })

  /**
   * Edit the status of the node
   * @api {put} /nodes Edit the status of the node
   * @apiHeader {String} Authentication User's unique token.
   * @apiVersion 0.0.1
   * @apiName PutNodes
   * @apiGroup nodes
   * @apiPermission none
   *
   * @apiDescription Edit the status of the node.
   *
   * @apiParam (Request body) {Int} node_id Id of the node.
   * @apiParam (Request body) {Bool} active Id of the node.
   *
  */
  dispatcher.onPut('/nodes', async function (req, res) {
    if (!('node_id' in req.params) || !('active' in req.params)) {
      res.writeHeader(400)
      return res.end(JSON.stringify({
        message: 'Missing fields'
      }))
    }
    const success = await instance.models.node.updateStatus({
      nodeId: req.params.node_id,
      active: req.params.active
    })
    if (success) {
      return res.end(JSON.stringify({
        message: 'Success'
      }))
    } else {
      res.writeHeader(500)
      return res.end(JSON.stringify({
        message: 'Error changing node status'
      }))
    }
  })
  /**
   * DELETE NODES
   * @api {delete} /nodes Remove a node
   * @apiHeader {String} Authentication User's unique token.
   * @apiVersion 0.0.1
   * @apiName DeleteNodes
   * @apiGroup nodes
   * @apiParam {id} node_id nodes id
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 204 No Content
   * @apiErrorExample {json} Delete error
   *    HTTP/1.1 500 Internal Server Error
 */
  dispatcher.onDelete('/nodes', async function (req, res) {
    if (!('node_id' in req.params)) {
      res.writeHeader(400)
      return res.end(JSON.stringify({
        message: 'Missing fields'
      }))
    }
    const success = await instance.models.node.delete({
      nodeId: req.params.node_id
    })
    if (success) {
      return res.end(JSON.stringify({
        message: 'Success'
      }))
    } else {
      res.writeHeader(500)
      return res.end(JSON.stringify({
        message: 'Error removing node'
      }))
    }
  })
  /**
   * PUBLISH NODES
   * @api {post} /publish Publish nodes list
   * @apiHeader {String} Authentication User's unique token.
   * @apiVersion 0.0.1
   * @apiName PublishNodes
   * @apiGroup nodes
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 204 No Content
   * @apiErrorExample {json} Delete error
   *    HTTP/1.1 500 Internal Server Error
  */
  dispatcher.onPost('/publish', async function (req, res) {
    const hash = await instance.publishNodesList()
    if (hash) {
      return res.end(JSON.stringify({
        message: 'List published successfully',
        hash: hash
      }))
    }
    return res.end(JSON.stringify({
      message: 'Cannot get nodes list'
    }))
  })
}
