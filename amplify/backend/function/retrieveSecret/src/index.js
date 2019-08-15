const AWS = require('aws-sdk')

exports.handler = function (event, context) { //eslint-disable-line
  try {
    const secretsManagerClient = new AWS.SecretsManager()
    secretsManagerClient.getSecretValue({ SecretId: process.env.SECRETNAME }, (err, data) => {
      if (err) {
        console.log(err)
        context.done(err, null)
      }
      else {
        const secret = data.SecretString
        const secretJson = JSON.parse(secret)
        const client_secret = secretJson[process.env.SECRETKEY]
        console.log(`Retrieved secret for request ${context.awsRequestId}`)
        context.done(null, client_secret)
      }
    })
  }
  catch (err) {
    console.log(err)
    context.done(err, null)
  }
}
