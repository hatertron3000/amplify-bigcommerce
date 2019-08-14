exports.handler = (event, context) => {
  const crypto = require('crypto')

  const secret = event.request.privateChallengeParameters.answer
  const encodedStrings = event.request.challengeAnswer.split('.')

  if (encodedStrings.length !== 2) {
    context.done(new Error('Signed payload is not the correct format'), event)
  }
  else {
    const signature = new Buffer(encodedStrings[1], 'base64').toString('utf8')
    const data = new Buffer(encodedStrings[0], 'base64').toString('utf8')
    const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex')
    if (expectedSignature === signature) event.response.answerCorrect = true
    else event.response.answerCorrect = false
    context.done(null, event)
  }
}
