'use strict';

function twitchAPIRequest(url, callback) {
    require('chat/connection').chatInterface.api({
        url: url,
        headers: {
            'Client-ID': 'etkg90uv09c04nadunxf64wp5ueqcdv'
        }
    }, (err, res, body) => {
        if (typeof callback === 'function') {
            if (err) {
                callback.call(undefined, undefined, false);
            }
            else {
                callback.call(undefined, body, true);
            }
        }
    });
}

module.exports = twitchAPIRequest;