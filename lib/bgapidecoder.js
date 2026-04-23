/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */


const BgapiMessageDecoder = require('./bgapimessagedecoder');

const BGAPI_MESSAGE_HEADER_BYTES = 4;


/**
 * BgapiDecoder Class
 * Decodes data streams from one or more BGAPI streams and forwards the
 * packets to the given BgapiManager instance.
 */
class BgapiDecoder {

  /**
   * BgapiDecoder constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.bgapiManager = options.bgapiManager;
    this.queuesByOrigin = new Map();
  }


  /**
   * Handle data from a BGAPI stream, specified by the origin
   * @param {Buffer} data The BGAPI data.
   * @param {String} origin The unique origin identifier of the source.
   * @param {Number} time The time of the data capture.
   */
  handleBgapiData(data, origin, time) {
    let self = this;
    let chunks = self.queuesByOrigin.has(origin) ?
                          [ self.queuesByOrigin.get(origin), data ] : [ data ];
    let queue = Buffer.concat(chunks);
    let messages = [];
    let isPossibleQueuedMessage = (queue.length >= BGAPI_MESSAGE_HEADER_BYTES);

    // Extract individual BGAPI messages from the data queue
    while(isPossibleQueuedMessage) {
      let isBgapi = (((queue.readUInt8() >> 3) & 0x07) === 0x06);
      let payloadLength = ((queue.readUInt8() & 0x07) * 256) +
                          queue.readUInt8(1);
      let messageLength = BGAPI_MESSAGE_HEADER_BYTES + payloadLength;

      if(queue.length >= messageLength) {
        if(isBgapi) {
          messages.push(queue.subarray(0, messageLength));
        }

        queue = queue.subarray(messageLength);
        isPossibleQueuedMessage = (queue.length >= BGAPI_MESSAGE_HEADER_BYTES);
      }
      else {
        isPossibleQueuedMessage = false;
      }
    }

    self.queuesByOrigin.set(origin, queue);

    messages.forEach((message) => {
      let bgapiPayload = BgapiMessageDecoder.decode(message, origin, time);

      self.bgapiManager.handleBgapiPayload(bgapiPayload);
    });
  }
}


module.exports = BgapiDecoder;
