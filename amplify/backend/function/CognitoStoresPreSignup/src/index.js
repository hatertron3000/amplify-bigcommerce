/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var storageDynamoStoresName = process.env.STORAGE_DYNAMOSTORES_NAME
var storageDynamoStoresArn = process.env.STORAGE_DYNAMOSTORES_ARN

Amplify Params - DO NOT EDIT *//*
  this file will loop through all js modules which are uploaded to the lambda resource,
  provided that the file names (without extension) are included in the "MODULES" env variable.
  "MODULES" is a comma-delimmited string.
*/
const AWS = require('aws-sdk')
const https = require('https')

exports.handler = async (event) => {
  console.log({ message: 'Received signup request' })
  return new Promise((resolve, reject) => {
    try {
      let config = {
        client_id: process.env.CLIENT_ID,
        redirect_url: process.env.REDIRECT_URL
      }

      const secretsManagerClient = new AWS.SecretsManager()
      secretsManagerClient.getSecretValue({ SecretId: process.env.SECRETNAME }, (err, data) => {
        if (err) console.log(err)
        else {
          const secret = data.SecretString
          const secretJson = JSON.parse(secret)
          const client_secret = secretJson[process.env.SECRETKEY]

          // send the POST request 
          const body = JSON.stringify({
            client_id: config.client_id,
            client_secret,
            code: event.request.validationData.code,
            scope: event.request.validationData.scope,
            grant_type: 'authorization_code',
            redirect_uri: config.redirect_url,
            context: event.request.validationData.context,
          })

          const options = {
            hostname: 'login.bigcommerce.com',
            port: 443,
            path: '/oauth2/token',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body)
            }
          }

          const req = https.request(options, res => {
            let data = false
            res.on('data', chunk => {
              data = !data ? chunk : data + chunk
            })
            res.on('end', () => {
              if (res.statusCode == 200) {
                // Store the token in DynamoDB:
                // Token is base64 encoded. If encryption in transit is required,
                // consider creating an encryption Lamda with DynamoDB Encryption Client
                data = data.toString()
                const jsonData = JSON.parse(data),
                  encodedToken = Buffer.from(jsonData.access_token).toString('base64'),
                  dynamoDbClient = new AWS.DynamoDB(),
                  table = process.env.STORAGE_DYNAMOSTORES_NAME,
                  item = {
                    "Hash": {
                      S: jsonData.context.substring(7),
                    },
                    "Token": {
                      S: encodedToken,
                    },
                    "Scope": {
                      S: event.request.validationData.scope,
                    },
                    "Created": {
                      N: Math.round((new Date()).getTime() / 1000).toString(),
                    },
                    "Modified": {
                      N: Math.round((new Date()).getTime() / 1000).toString(),
                    },
                  }
                const params = {
                  TableName: table,
                  Item: item
                }

                console.log(`Adding user: ${event.request.userAttributes.name}`)
                dynamoDbClient.putItem(params, (err, data) => {
                  if (err) {
                    console.error(`Error adding store. Error: ${JSON.stringify(err, null, 2)}`)
                    reject(new Error('Error during installation'))
                  }
                  else {
                    console.log(`SUCCESS: Added user ${event.request.userAttributes.name}`)
                    event.response.autoConfirmUser = true
                    resolve(event)
                  }
                })

              }
              else {
                console.error(`Error adding user: BC responded with ${res.statusCode}
                    Response body:
                    ${data} `)
                reject(err)
              }
            })
          })

          req.on('error', err => {
            console.error(err)
            reject(err)
          })

          req.write(body)
          req.end()
        }
      })
    }
    catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
