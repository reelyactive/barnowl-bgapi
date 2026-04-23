/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */


// Constants (BGAPI)


// Constants (Type)
const TYPE_ADVERTISEMENT_REPORT = 'advertisementReport';
const TYPE_IDENTITY_ADDRESS = 'identityAddress';
const TYPE_UNSUPPORTED = 'unsupported';


/**
 * BgapiPayload Class
 * Represents a BGAPI payload
 */
class BgapiPayload {

  /**
   * BgapiPayload constructor
   * @param {String} type Type of BGAPI payload.
   * @param {Object} content Content of the given payload type.
   * @param {Object} origin Origin of the data stream.
   * @param {String} time The time of the data capture.
   * @constructor
   */
  constructor(type, content, origin, time) {
    content = content || {};

    // AdvertisementReport
    if(type === TYPE_ADVERTISEMENT_REPORT) {
      this.type = TYPE_ADVERTISEMENT_REPORT;
      this.transmitterId = content.transmitterId;
      this.transmitterIdType = content.transmitterIdType;
      this.packets = content.packets;
      this.rssiSignature = content.rssiSignature;
    }

    // IdentityAddress
    else if(type === TYPE_IDENTITY_ADDRESS) {
      this.type = TYPE_IDENTITY_ADDRESS;
      this.deviceId = content.deviceId;
      this.deviceIdType = content.deviceIdType;
    }

    // Unsupported
    else {
      this.type = TYPE_UNSUPPORTED;
    }

    this.origin = origin;
    this.time = time;
  }

}


module.exports = BgapiPayload;
module.exports.TYPE_ADVERTISEMENT_REPORT = TYPE_ADVERTISEMENT_REPORT;
module.exports.TYPE_IDENTITY_ADDRESS = TYPE_IDENTITY_ADDRESS;
module.exports.TYPE_UNSUPPORTED = TYPE_UNSUPPORTED;
