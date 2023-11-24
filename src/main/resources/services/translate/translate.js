const Content = require('/lib/xp/content')
const Context = require('/lib/xp/context')
const Totaltekst = require('/lib/modules/totaltekst')
const Util = require('/lib/modules/util')

const Node = require('/lib/xp/node')

const DateFns = require('/lib/external/date-fns')

exports.post = function(req) {
    const reqBody = Util.parseJSON(req.body)
    const contentId = req.params.contentId
    const apiKey = req.headers['x-api-key']
    const auto = reqBody.auto

    if (auto) {
        if (!contentId || !apiKey) {
            return {
                status: 400
            }
        }

        autoTranslate(apiKey, contentId)

        return {
            status: 200
        }
    } else {
        const translated = Totaltekst.translate(apiKey, reqBody.text)

        return {
            contentType: 'application/json',
            body: {
                text: translated
            }
        }
    }
}

function autoTranslate(apiKey, contentId) {
    const content = Content.get({ key: contentId }) || {}
    const context = Context.get()

    if (content) {
        const DraftRepo = Node.connect({
            repoId: context.repository,
            branch: 'draft',
            principals: ['role:system.admin']
        })

        DraftRepo.modify({
            key: content._id,
            editor: (node) => {
                const dataFields = node.data || {}
                const xDataFields = node.x || {}
                const componentFields = node.components || []

                translateMainFields(apiKey, node)

                translateObj(apiKey, dataFields)
                translateObj(apiKey, xDataFields)

                processPage(apiKey, componentFields)

                if (!node.workflow) node.workflow = {}
                node.workflow.state = 'IN_PROGRESS'

                return node
            }
        })
    }
}

function isTranslatedField(value) {
    return value 
        && (typeof value === 'string')
        && !DateFns.isDateValue(value)
        && !Util.isUrlValue(value)
        && !Util.isUUIDValue(value)
}

function translateObj(apiKey, obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key]

            if (value) {
                if (isTranslatedField(value)) {
                    const translated = Totaltekst.translate(apiKey, value)
    
                    if (translated) {
                        obj[key] = translated
                    }
                } else if (typeof value === 'object') {
                    translateObj(apiKey, value)
                }
            }
        }
    }
}

function processPage(apiKey, obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key]

            if (value) {
                if (value.type === 'text') {
                    translateObj(apiKey, value.text)
                } else if (key === 'config') {
                    translateObj(apiKey, value)
                } else if (typeof value === 'object') {
                    processPage(apiKey, value)
                }
            }
        }
    }
}

function translateMainFields(apiKey, obj) {
    const translated = obj.displayName ? Totaltekst.translate(apiKey, obj.displayName) : null
    if (translated) {
        obj.displayName = translated
    }
}
