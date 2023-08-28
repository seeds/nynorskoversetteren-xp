const HttpClient = require('/lib/http-client')
const Admin = require('/lib/xp/admin')
const I18n = require('/lib/xp/i18n')

module.exports = {
    performRequest,
    parseJSON,
    localize
}

function performRequest(request, MAX_RETRY = 3){
    try {
        if (MAX_RETRY === 0){
            return null
        }

        request.connectionTimeout = 60000
        request.readTimeout = 60000

        return HttpClient.request(request)
    } catch (error){
        return performRequest(request, MAX_RETRY - 1)
    }
}

function parseJSON(json) {
    try {
        return JSON.parse(json)
    } catch(err) {
        return {}
    }
}

function localize(key) {
    const locale = Admin.getLocale()

    return I18n.localize({
        key: key,
        locale: locale
    })
}
