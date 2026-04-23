/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */


/**
 * Decode all the BGAPI messages from the data Buffer.
 * @param {Buffer} data The message(s).
 * @param {String} origin Origin of the data stream.
 * @param {Number} time The time of the data capture.
 */
function decode(data, origin, time) {
  console.log(data.toString('hex'));

  return [];
}


module.exports.decode = decode;
