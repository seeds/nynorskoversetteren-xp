var translateBtn;
var autoTranslateBtn;
var copyBtn;
var uploadBtn;

initialize();

function initialize() {
    translateBtn = document.getElementById('nynorskoversetteren_translate_btn');
    autoTranslateBtn = document.getElementById('nynorskoversetteren_auto_translate_btn');
    copyBtn = document.getElementById('nynorskoversetteren_copy_btn');
    uploadBtn = document.getElementById('nynorskoversetteren_upload_input');

    if (translateBtn) {
        translateBtn.addEventListener('click', function () {
            translateText(this)
        }, false)
    }

    if (autoTranslateBtn) {
        autoTranslateBtn.addEventListener('click', function () {
            autoTranslateText(this)
        }, false)
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            copyToClipboard(this)
        }, false)
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', function () {
            this.querySelector('input').click()
        }, false)

        uploadBtn.querySelector('input').addEventListener('change', function (e) {
            var serviceUrl = this.getAttribute('data-service-url');
            var licenseFile = e.target.files[0];

            if (licenseFile) {
                var formData = new FormData();
                formData.append('license', licenseFile);

                fetch(serviceUrl, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        document.querySelector('.nynorskoversetteren-license .error-message').style.display = 'none';
                        reloadWidget();
                    } else {
                        document.querySelector('.nynorskoversetteren-license .error-message').style.display = 'block';
                    }
                })
                .catch(error => {
                    document.querySelector('.nynorskoversetteren-license .error-message').style.display = 'none';
                })
            }
        })
    }
}

function reloadWidget() {
    const widget = document.querySelector('#nynorskoversetteren');
    const widgetUrl = widget.getAttribute('data-widget-url');

    fetch(widgetUrl, {
        method: 'GET'
    })
    .then(response => response.text())
    .then(response => {
        if (response) {
            widget.parentElement.innerHTML = response;
            initialize()
        }
    })
}

function copyToClipboard(elem) {
    var copyText = document.getElementById('nynorskoversetteren_copy_input');
    var tooltipCopyMessage = elem.getAttribute('data-copy-message');
    var tooltipSuccessMessage = elem.getAttribute('data-success-message');

    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(copyText.value);

    elem.setAttribute('data-tooltip', tooltipSuccessMessage)

    elem.addEventListener('mouseleave', function () {
        elem.setAttribute('data-tooltip', tooltipCopyMessage)
    })
}

function translateText(elem) {
    var text = document.getElementById('nynorskoversetteren_translate_input').value;
    var copyText = document.getElementById('nynorskoversetteren_copy_input');
    var errorElem = document.getElementById('nynorskoversetteren-error');
    var serviceUrl = elem.getAttribute('data-service-url');
    var apiKey = elem.getAttribute('data-api-key');
    var loader = elem.querySelector('.loader');
    var btnImage = elem.querySelector('img');

    copyText.value = '';
    errorElem.style.display = 'none';

    if (serviceUrl && apiKey) {
        btnImage.style.visibility = 'hidden';
        loader.style.visibility = 'visible';
        elem.disabled = true;

        fetch(serviceUrl, {
            method: 'POST',
            body: JSON.stringify({ text: text }),
            headers: {
                'x-api-key': apiKey
            }
        })
        .then(response => response.json())
        .then(response => {
            if (typeof response.text === 'string') {
                copyText.value = response.text;
            } else {
                errorElem.style.display = 'block';
            }
        })
        .catch(error => {
            errorElem.style.display = 'block';
            console.error('Error: ', error);
        })
        .finally(() => {
            btnImage.style.visibility = 'visible';
            loader.style.visibility = 'hidden';
            elem.disabled = false;
        })
    }
}

function autoTranslateText(elem) {
    var errorElem = document.getElementById('nynorskoversetteren-error');
    var serviceUrl = elem.getAttribute('data-service-url');
    var apiKey = elem.getAttribute('data-api-key');
    var loader = elem.querySelector('.loader');
    var btnImage = elem.querySelector('img');

    errorElem.style.display = 'none';

    if (serviceUrl && apiKey) {
        btnImage.style.visibility = 'hidden';
        loader.style.visibility = 'visible';
        elem.disabled = true;

        fetch(serviceUrl, {
            method: 'POST',
            body: JSON.stringify({ auto: true }),
            headers: {
                'x-api-key': apiKey
            }
        })
        .then(response => {
            if (response.status == 200) {
                console.log(`OK`, response)
            } else {
                errorElem.style.display = 'block';
            }
        })
        .catch(error => {
            errorElem.style.display = 'block';
            console.error('Error: ', error);
        })
        .finally(() => {
            btnImage.style.visibility = 'visible';
            loader.style.visibility = 'hidden';
            elem.disabled = false;
        })
    }
}
