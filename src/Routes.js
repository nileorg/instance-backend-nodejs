var bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var config = require('../instance.config.json')
module.exports = ({ instance, dispatcher }) => {
  /**
   * Handle CORS requests
  */
  dispatcher.beforeFilter(/\//, function (req, res, chain) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Headers', 'authentication')
      res.end()
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
        res.end()
      }
    } catch (e) {
      res.writeHeader(401)
      res.end()
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
    res.end(JSON.stringify({
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
 * GET NODES
 *
 * @api {get} /nodes/:id Read data of a node
 * @apiVersion 0.0.1
 * @apiName GetNodes
 * @apiGroup nodes
 * @apiPermission admin
 *
 * @apiDescription Returns an node object with the given id.
 *
 * @apiParam {String} id The nodes-ID.
 *
 * @apiExample Example usage:
 * curl -i http://localhost/nodes/4711
 *
 * @apiSuccess {String}   id            The nodes-ID.
 *
 * @apiError NoAccessRight Only authenticated Admins can access the data.
 * @apiError NodeNotFound   The <code>id</code> of the node was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 */

  // dispatcher.onGet('/nodes/:id', async function (req, res) {
  //   const { success, results } = await instance.models.node.get()
  //   res.end(JSON.stringify({
  //     success: success,
  //     nodes: results
  //   }))
  // })

  // --------------------------
  // --------------------------
  //        POST NODES
  // --------------------------
  // --------------------------

  /**
 * @api {post} /nodes Register a new node
 * @apiVersion 0.0.1
 * @apiName PostNodes
 * @apiGroup nodes
 * @apiPermission none
 *
 * @apiDescription Registers a new node to the instance.
 *
 * @apiParam {String} name Name of the node.
 *
 * @apiSuccess {String} id         The new nodes-ID.
 *
 */

  // // API management system for instance
  // dispatcher.onGet('/nodes', async function (req, res) {
  //   const { success, results } = await instance.models.node.get()
  //   res.end(JSON.stringify({
  //     success: success,
  //     nodes: results
  //   }))
  // })

  // --------------------------
  // --------------------------
  //        PUT NODES
  // --------------------------
  // --------------------------
  /**
* @api {put} /nodes/:id Edit a node
* @apiVersion 0.0.1
* @apiName PutNodes
* @apiGroup nodes
* @apiPermission none
*
* @apiDescription Edits a node.
*
* @apiParam {String} name Name of the node.
*
*/

  // dispatcher.onGet('/nodes/:id', async function (req, res) {
  //   const { success, results } = await instance.models.node.get()
  //   res.end(JSON.stringify({
  //     success: success,
  //     nodes: results
  //   }))
  // })

  // --------------------------
  // --------------------------
  //        DELETE NODES
  // --------------------------
  // --------------------------
  /**
 * @api {delete} /nodes/:id Remove a node
 * @apiVersion 0.0.1
 * @apiName DeleteNodes
 * @apiGroup nodes
 * @apiParam {id} id nodes id
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 204 No Content
 * @apiErrorExample {json} Delete error
 *    HTTP/1.1 500 Internal Server Error
 */

  // dispatcher.onGet('/nodes/:id', async function (req, res) {
  //   const { success, results } = await instance.models.node.get()
  //   res.end(JSON.stringify({
  //     success: success,
  //     nodes: results
  //   }))
  // })
}
