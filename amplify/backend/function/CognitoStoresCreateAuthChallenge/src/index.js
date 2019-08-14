const AWS = require('aws-sdk')

exports.handler = (event, context, callback) => {
  if (event.request.challengeName === 'CUSTOM_CHALLENGE') {
    const secretsManager = new AWS.SecretsManager()
    secretsManager.getSecretValue({ SecretId: process.env.SECRETNAME }, (err, data) => {
      if (err) {
        context.done(new Error('Error creating challenge', null))
      }
      else {
        const secret = data.SecretString
        const secretJson = JSON.parse(secret)
        const client_secret = secretJson[process.env.SECRETKEY]

        event.response.privateChallengeParameters = {}
        event.response.privateChallengeParameters.answer = client_secret
        context.done(null, event);
      }
    })
  }
}