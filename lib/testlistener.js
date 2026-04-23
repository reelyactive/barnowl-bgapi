/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */


const DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS = 1000;
const DEFAULT_RSSI = -70;
const MIN_RSSI = -90;
const MAX_RSSI = -50;
const RSSI_RANDOM_DELTA = 5;
const TEST_ORIGIN = '/dev/ttyUSB0';


/**
 * TestListener Class
 * Provides a consistent stream of artificially generated BGAPI data.
 */
class TestListener {

  /**
   * TestListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.decoder = options.decoder;
    this.radioDecodingPeriod = options.radioDecodingPeriod ||
                               DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS;
    this.rssi = [ DEFAULT_RSSI ];

    emitAddress(this);
    setInterval(emitRadioDecodings, this.radioDecodingPeriod, this);
  }

}


/**
 * Emit simulated radio decoding packets
 * See: https://docs.silabs.com/bluetooth/latest/bluetooth-stack-api/sl-bt-evt-scanner-legacy-advertisement-report-s
 * @param {TestListener} instance The given instance.
 */
function emitRadioDecodings(instance) {
  let time = new Date().getTime();
  let rssi = (256 + instance.rssi[0]).toString(16);
  let simulatedBgapiData = Buffer.from(
    'b03205000055daba50e1fe01ffdd2500000000000000' +
    '1f0201061bff99040510f4412ac5c401b8fca4011c9256954303f8846c38d057', 'hex'); 
  updateSimulatedRssi(instance);
  instance.decoder.handleBgapiData(simulatedBgapiData, TEST_ORIGIN, time);
}


/**
 * Emit simulated address packet
 * @param {TestListener} instance The given instance.
 */
function emitAddress(instance) {
  let time = new Date().getTime();
  let simulatedBgapiData = Buffer.from('b007020580ecb6b51a5100', 'hex');
  instance.decoder.handleBgapiData(simulatedBgapiData, TEST_ORIGIN, time);
}


/**
 * Update the simulated RSSI values
 * @param {TestListener} instance The given instance.
 */
function updateSimulatedRssi(instance) {
  for(let index = 0; index < instance.rssi.length; index++) {
    instance.rssi[index] += Math.floor((Math.random() * RSSI_RANDOM_DELTA) -
                                       (RSSI_RANDOM_DELTA / 2));
    if(instance.rssi[index] > MAX_RSSI) {
      instance.rssi[index] = MAX_RSSI;
    }
    else if(instance.rssi[index] < MIN_RSSI) {
      instance.rssi[index] = MIN_RSSI;
    }
  }
}


module.exports = TestListener;
