/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */

const BgapiPayload = require('./bgapipayload');


const BGAPI_MESSAGE_HEADER_BYTES = 4;
const CLASS_ID_BYTE_OFFSET = 2;
const MESSAGE_ID_BYTE_OFFSET = 3;
const GAP_CLASS_ID = 0x02;
const SCANNER_CLASS_ID = 0x05;
const GAP_GET_IDENTITY_ADDRESS_MESSAGE_ID = 0x05;
const GAP_GET_IDENTITY_ADDRESS_BYTES = 7;
const SCANNER_LEGACY_ADVERTISEMENT_REPORT_MESSAGE_ID = 0x00;
const SCANNER_EXTENDED_ADVERTISEMENT_REPORT_MESSAGE_ID = 0x02;
const SCANNER_LEGACY_ADVERTISEMENT_REPORT_MIN_BYTES = 19;
const SCANNER_EXTENDED_ADVERTISEMENT_REPORT_MIN_BYTES = 27;


/**
 * Decode the given BGAPI message.
 * @param {Buffer} message The message.
 * @param {String} origin Origin of the data stream.
 * @param {Number} time The time of the data capture.
 */
function decode(message, origin, time) {
  let isEvent = ((message.readUInt8() & 0x80) === 0x80);
  let classId = message.readUInt8(CLASS_ID_BYTE_OFFSET);
  let messageId = message.readUInt8(MESSAGE_ID_BYTE_OFFSET);
  let payload = message.subarray(BGAPI_MESSAGE_HEADER_BYTES);

  // TODO: in future, decode additional BGAPI messages

  if((classId === GAP_CLASS_ID) &&
     (messageId === GAP_GET_IDENTITY_ADDRESS_MESSAGE_ID)) {
    return decodeIdentityAddress(payload, origin, time);
  }

  if(isEvent && (classId === SCANNER_CLASS_ID)) {
    return decodeAdvertisementReport(payload, messageId, origin, time);
  }

  return new BgapiPayload(BgapiPayload.TYPE_UNSUPPORTED, {}, origin, time);
}


/**
 * Decode the given BGAPI identity address message payload.
 * @param {Buffer} payload The message payload.
 * @param {String} origin Origin of the data stream.
 * @param {Number} time The time of the data capture.
 */
function decodeIdentityAddress(payload, origin, time) {
  if(payload.length === GAP_GET_IDENTITY_ADDRESS_BYTES) {
    let content = {
        deviceId: payload.readUIntLE(0, 6).toString(16),
        deviceIdType: (payload.readUInt8(6) === 0x00) ? 2 : 3 // TODO
    };

    return new BgapiPayload(BgapiPayload.TYPE_IDENTITY_ADDRESS,
                            content, origin, time);
  }

  return new BgapiPayload(BgapiPayload.TYPE_UNSUPPORTED, {}, origin, time);
}


/**
 * Decode the given BGAPI advertisement report message payload.
 * @param {Buffer} payload The message payload.
 * @param {Number} messageId The id specifying the payload type.
 * @param {String} origin Origin of the data stream.
 * @param {Number} time The time of the data capture.
 */
function decodeAdvertisementReport(payload, messageId, origin, time) {

  // Legacy advertisement report
  // See: https://docs.silabs.com/bluetooth/latest/bluetooth-stack-api/sl-bt-evt-scanner-legacy-advertisement-report-s
  if((messageId === SCANNER_LEGACY_ADVERTISEMENT_REPORT_MESSAGE_ID) &&
     (payload.length >= SCANNER_LEGACY_ADVERTISEMENT_REPORT_MIN_BYTES)) {
    let eventFlags = payload.readUInt8();
    let transmitterId = payload.readUIntLE(1, 6).toString(16);
    let transmitterIdType = (payload.readUInt8(7) === 0x00) ? 2 : 3; // TODO
    let rssi = payload.readInt8(9);
    let dataLength = payload.readUInt8(18);
    let data = payload.toString('hex', 19);
    let isCompleteData = (data.length === (dataLength * 2));

    // TODO: reconstruct packet

    if(isCompleteData) {
      let content = { transmitterId: transmitterId,
                      transmitterIdType: transmitterIdType,
                      rssiSignature: [ { rssi: rssi } ],
                      packets: [ data ] };

      return new BgapiPayload(BgapiPayload.TYPE_ADVERTISEMENT_REPORT,
                              content, origin, time);
    }
  }

  // Extended advertisement report
  // See: https://docs.silabs.com/bluetooth/latest/bluetooth-stack-api/sl-bt-evt-scanner-extended-advertisement-report-s
  else if((messageId === SCANNER_EXTENDED_ADVERTISEMENT_REPORT_MESSAGE_ID) &&
          (payload.length >= SCANNER_EXTENDED_ADVERTISEMENT_REPORT_MIN_BYTES)) {
    // TODO: support in future
  }

  return new BgapiPayload(BgapiPayload.TYPE_UNSUPPORTED, {}, origin, time);
}


module.exports.decode = decode;
