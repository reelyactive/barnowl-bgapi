/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */


const EventEmitter = require('events').EventEmitter;
const SerialListener = require('./seriallistener.js');
const TestListener = require('./testlistener.js');
const BgapiDecoder = require('./bgapidecoder.js');
const BgapiManager = require('./bgapimanager.js');


/**
 * BarnowlBgapi Class
 * Converts BGAPI data into standard raddec events.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
class BarnowlBgapi extends EventEmitter {

  /**
   * BarnowlBgapi constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    super();
    options = options || {};

    this.listeners = [];
    this.bgapiManager = new BgapiManager({ barnowl: this });
    this.bgapiDecoder = new BgapiDecoder({ bgapiManager: this.bgapiManager });
  }

  /**
   * Add a listener to the given hardware interface.
   * @param {Class} ListenerClass The (uninstantiated) listener class.
   * @param {Object} options The options as a JSON object.
   */
  addListener(ListenerClass, options) {
    options = options || {};
    options.decoder = this.bgapiDecoder;

    let listener = new ListenerClass(options);
    this.listeners.push(listener);
  }

  /**
   * Handle and emit the given raddec.
   * @param {Raddec} raddec The given Raddec instance.
   */
  handleRaddec(raddec) {
    // TODO: observe options to normalise raddec
    this.emit("raddec", raddec);
  }

  /**
   * Handle and emit the given infrastructure message.
   * @param {Object} message The given infrastructure message.
   */
  handleInfrastructureMessage(message) {
    this.emit("infrastructureMessage", message);
  }

}


module.exports = BarnowlBgapi;
module.exports.SerialListener = SerialListener;
module.exports.TestListener = TestListener;
