const Util = require('/lib/modules/util')

const baseUrl = 'https://translate.totaltekst.cloud/api/v1'

module.exports = {
    translate
}

function translate(apiKey, text) {
    const templateId = '129bc495-522b-453b-a6dd-7f04d792524c'

    if (apiKey) {
        const response = Util.performRequest({
            method: 'POST',
            url: `${baseUrl}/trans`,
            headers: {
                'x-tt-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                mark_unknown: false,
                trans_template: templateId
            }),
            contentType: 'application/json'
        })

        if (response && response.body && response.status === 200) {
            const body = Util.parseJSON(response.body)

            return body.translation || ''
        }
    }

    return null
}
