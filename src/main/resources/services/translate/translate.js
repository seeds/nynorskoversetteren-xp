const Totaltekst = require('/lib/modules/totaltekst')
const Util = require('/lib/modules/util')

exports.post = function(req) {
    const reqBody = Util.parseJSON(req.body)
    const apiKey = req.headers['x-api-key']
    const translated = Totaltekst.translate(apiKey, reqBody.text)

    return {
        contentType: 'application/json',
        body: {
            text: translated
        }
    }
}
