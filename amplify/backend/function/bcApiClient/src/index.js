const https = require('https')

// BEGIN BIGCOMMERCE CLASS
const BigCommerce = class {
  constructor({ store_hash, client_id, access_token }) {
    this.store_hash = store_hash
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'BC-Lambda-v0r1',
      'X-Auth-Client': client_id,
      'X-Auth-Token': access_token,
    }
  }

  // Methods
  _request({ store_hash, endpoint, params, body, method }) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.bigcommerce.com',
        port: 443,
        path: `/stores/${store_hash}${endpoint}${params ? `?${params}` : ''}`,
        method,
        headers: this.headers,
      }

      try {
        const req = https.request(options, res => {
          let data = false

          res.on('data', chunk => {
            data = !data ? chunk : data + chunk
          })

          res.on('end', () => {
            const returnValue = {
              data: JSON.parse(data.toString()),
              status: res.statusCode
            }
            console.log(JSON.stringify({
              message: `Received ${res.statusCode} response to ${options.method} request to ${options.path}`,
              status: res.statusCode
            }))
            resolve(returnValue)
          })
        })
        if (body) {
          req.write(body)
          console.log(body)
        }
        console.log(JSON.stringify({
          message: `Sending ${options.method} request to ${options.path}`
        }))
        req.end()
      }
      catch (err) {
        reject(err)
      }
    })
  }

  /*********************/
  /* Store Information */
  /*********************/

  getStore() {
    return new Promise((resolve, reject) => {
      try {
        const params = {
          store_hash: this.store_hash,
          endpoint: `/v2/store`,
          method: 'GET'
        }
        this._request(params)
          .then(data => resolve(data))
          .catch(err => reject(err))
      }
      catch (err) {
        reject(err)
      }
    })
  }

  /************/
  /* Webhooks */
  /************/

  getHooks() {
    return new Promise((resolve, reject) => {
      try {
        const params = {
          store_hash: this.store_hash,
          endpoint: `/v2/hooks`,
          method: 'GET'
        }
        this._request(params)
          .then(data => resolve(data))
          .catch(err => reject(err))
      }
      catch (err) {
        reject(err)
      }
    })
  }

  putHook({ id, body }) {
    return new Promise((resolve, reject) => {
      try {
        const params = {
          store_hash: this.store_hash,
          endpoint: `/v2/hooks/${id}`,
          method: 'PUT',
          body: JSON.stringify(body)
        }
        this._request(params)
          .then(data => resolve(data))
          .catch(err => reject(err))
      }
      catch (err) {
        reject(err)
      }
    })
  }

  postHook({ body }) {
    return new Promise((resolve, reject) => {
      try {
        const params = {
          store_hash: this.store_hash,
          endpoint: `/v2/hooks`,
          method: 'POST',
          body: JSON.stringify(body),
        }
        this._request(params)
          .then(data => resolve(data))
          .catch(err => reject(err))
      }
      catch (err) {
        reject(err)
      }
    })
  }

  deleteHook({ id }) {
    return new Promise((resolve, reject) => {
      try {
        const params = {
          store_hash: this.store_hash,
          endpoint: `/v2/hooks/${id}`,
          method: 'DELETE'
        }
        this._request(params)
          .then(data => resolve(data))
          .catch(err => reject(err))
      }
      catch (err) {
        reject(err)
      }
    })
  }
}
// END BIGCOMMERCE CLASS



const methods = ['GET_STORE', 'GET_HOOK', 'GET_HOOKS', 'PUT_HOOK', 'POST_HOOK', 'DELETE_HOOK']

const validate = ({ store_hash, access_token, version, method, params, body }) => {
  const hashRe = new RegExp('([a-z0-9\d\S]){3,15}')
  if (typeof store_hash !== 'string' || !hashRe.test(store_hash))
    throw new Error('Store hash is not valid')
  else if (typeof access_token !== 'string' || !access_token)
    throw new Error('Access token is not valid')
  else if (version && version != (2 || 3 || null))
    throw new Error('Version must be 2, 3, or null.')
  else if (!methods.includes(method))
    throw new Error('Method not supported')
  else if (params && typeof params !== 'object')
    throw new Error('Params must be an object')
  else if (body && typeof body !== 'object')
    throw new Error('Body must be an object')
  else return
}

exports.handler = (event, context) => {
  try {
    validate(event)

    const bcInit = {
      store_hash: event.store_hash,
      client_id: process.env.CLIENT_ID,
      access_token: event.access_token
    }

    const bigCommerce = new BigCommerce(bcInit)


    if (event.method === "GET_STORE")
      bigCommerce.getStore()
        .then(data => {
          context.done(null, data)
        })
        .catch(err => {
          context.done(err, event)
        })
    else if (event.method === "GET_HOOK")
      bigCommerce.getHook(event.params)
        .then(data => {
          context.done(null, data)
        })
        .catch(err => {
          event.response = err
          context.done(err, event)
        })
    else if (event.method === "GET_HOOKS")
      bigCommerce.getHooks(event.params)
        .then(data => {
          context.done(null, data)
        })
        .catch(err => {
          event.response = err
          context.done(err, event)
        })
    else if (event.method === "PUT_HOOK")
      bigCommerce.putHook({ body: event.body, id: event.params.id })
        .then(data => {
          context.done(null, data)
        })
        .catch(err => {
          event.response = err
          context.done(err, event)
        })
    else if (event.method === "POST_HOOK")
      bigCommerce.postHook({ body: event.body })
        .then(data => {
          context.done(null, data)
        })
        .catch(err => {
          event.response = err
          context.done(err, event)
        })
    else if (event.method === "DELETE_HOOK")
      bigCommerce.deleteHook(event.params)
        .then(data => {
          context.done(null, data)
        })
        .catch(err => {
          event.response = err
          context.done(err, event)
        })
    else
      context.done(new Error('Method not supported'), event)
  }
  catch (err) {
    console.log(err)
    event.response = err
    context.done(err, event)
  }
}
