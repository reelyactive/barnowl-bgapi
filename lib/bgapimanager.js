/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */


const BgapiPayload = require('./bgapipayload');
const Raddec = require('raddec');


/**
 * BgapiManager Class
 * Manages the BGAPI interfaces.
 */
class BgapiManager {

  /**
   * BgapiManager constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    this.barnowl = options.barnowl;
    this.radiosByOrigin = new Map();
  }

  /**
   * Handle the given BGAPI payload
   * @param {Object} payload The BGAPI payload to handle.
   */
  handleBgapiPayload(payload) {
    switch(payload.type) {
      case BgapiPayload.TYPE_ADVERTISEMENT_REPORT:
        handleAdvertisementReport(this, payload);
        break;
      case BgapiPayload.TYPE_IDENTITY_ADDRESS:
        handleIdentityAddress(this, payload);
        break;
    }
  }
}


/**
 * Translate and produce the given advertisement report as a Raddec.
 * @param {BgapiManager} instance The given BgapiManager instance.
 * @param {BgapiPayload} payload The advertisement report payload.
 */
function handleAdvertisementReport(instance, payload) {
  let isKnownOrigin = instance.radiosByOrigin.has(payload.origin);

  if(isKnownOrigin) {
    let radio = instance.radiosByOrigin.get(payload.origin);
    payload.earliestDecodingTime = payload.time;
    payload.rssiSignature.forEach((entry) => {
      entry.receiverId = radio.receiverId;
      entry.receiverIdType = radio.receiverIdType;
    });

    let raddec = new Raddec(payload);
    instance.barnowl.handleRaddec(raddec);
  }
}


/**
 * Handle identity address payload.
 * @param {BgapiManager} instance The given BgapiManager instance.
 * @param {BgapiPayload} payload The identity address payload.
 */
function handleIdentityAddress(instance, payload) {
  let radio = { receiverId: payload.deviceId,
                receiverIdType: payload.deviceIdType };

  instance.radiosByOrigin.set(payload.origin, radio);
  instance.barnowl.handleInfrastructureMessage(payload);
}


module.exports = BgapiManager;
