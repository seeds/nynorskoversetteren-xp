const Thymeleaf = require('/lib/thymeleaf')
const Portal = require('/lib/xp/portal')
const Content = require('/lib/xp/content')

const MyLicense = require('/lib/modules/license')
const Util = require('/lib/modules/util')

exports.get = function(req) {
    const view = resolve('nynorskoversetteren.html')
    let model = {}

    // Validate the license
    if (!MyLicense.isCurrentLicenseValid()) {
        model = {
            url: req.url,
            noLicense: true,
            licenseServiceUrl: Portal.serviceUrl({ service: 'license', type: 'absolute' }),
            translate: {
                noLicense: Util.localize('widgets.nynorskoversetteren.view.no_license'),
                uploadLicense: Util.localize('widgets.nynorskoversetteren.view.upload_license'),
                invalidLicense: Util.localize('widgets.nynorskoversetteren.view.invalid_license')
            }
        }

        return {
            contentType: 'text/html',
            body: Thymeleaf.render(view, model)
        }
    }

    const contentId = req.params.contentId
    const siteConfig = (contentId && Content.getSiteConfig({
        key: contentId,
        applicationKey: app.name
    })) || {}
    const apiKey = siteConfig.api_key
    const mode = siteConfig.mode || 'manual'

    if (!apiKey) {
        return {
            contentType: 'text/html',
            body: `<widget class="error">${Util.localize('widgets.nynorskoversetteren.view.error_message_api_key')}</widget>`
        }
    }

    model = {
        serviceUrl: Portal.serviceUrl({ service: 'translate', type: 'absolute', params: { contentId: contentId } }),
        apiKey: apiKey,
        mode: mode,
        translate: {
            input_placeholder: Util.localize('widgets.nynorskoversetteren.view.input_placeholder'),
            alt_header: Util.localize('widgets.nynorskoversetteren.view.alt_header'),
            alt_translate_btn: Util.localize('widgets.nynorskoversetteren.view.alt_translate_btn'),
            alt_auto_translate_btn: Util.localize('widgets.nynorskoversetteren.view.alt_auto_translate_btn'),
            alt_copy_btn: Util.localize('widgets.nynorskoversetteren.view.alt_copy_btn'),
            error_message: Util.localize('widgets.nynorskoversetteren.view.error_message'),
            alt_copy_btn_success: Util.localize('widgets.nynorskoversetteren.view.alt_copy_btn_success')
        }
    }

    return {
        contentType: 'text/html',
        body: Thymeleaf.render(view, model)
    }
}
