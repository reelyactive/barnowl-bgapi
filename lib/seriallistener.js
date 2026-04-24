/**
 * Copyright reelyActive 2026
 * We believe in an open Internet of Things
 */


// Constants
const BAUDRATE = 115200;
const AUTO_PATH = 'auto';
const AUTO_MANUFACTURER = 'Silicon Labs'; // TODO: check default name


/**
 * SerialListener Class
 * Listens for reel data on a UDP port.
 */
class SerialListener {

  /**
   * SerialListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};
    let self = this;
    let path = options.path || AUTO_PATH;

    this.decoder = options.decoder;
    this.decodingOptions = options.decodingOptions || {};

    openSerialPort(path, (err, serialPort, path) => {
      if(err) {
        return console.log('barnowl-bgapi: error opening serial port',
                           err.message);
      }
      self.serialPort = serialPort;
      self.path = path;
      handleSerialEvents(self);
      queryIdentityAddress(self, () => {
        initiateScanning(self);
      });
    });
  }
}


/**
 * Handle events from the serial port.
 * @param {SerialListener} instance The SerialListener instance.
 */
function handleSerialEvents(instance) {
  instance.serialPort.on('data', (data) => {
    let origin = instance.path;
    let time = new Date().getTime();
    instance.decoder.handleBgapiData(data, origin, time,
                                     instance.decodingOptions);
  });
  instance.serialPort.on('close', () => {
    console.log('barnowl-bgapi: serial port closed');
  });
  instance.serialPort.on('error', (err) => {
    console.log('barnowl-bgapi: serial port error', err.message);
  });
}


/**
 * Send commands to query identity address.
 * @param {SerialListener} instance The SerialListener instance.
 * @param {function} callback The optional function to call upon completion.
 */
function queryIdentityAddress(instance, callback) {

  // See: https://docs.silabs.com/bluetooth/latest/bluetooth-stack-api/sl-bt-gap#sl-bt-gap-get-identity-address
  let command = Buffer.from('300205', 'hex');

  instance.serialPort.write(command, (err) => {
    if(typeof callback === 'function') { return callback(err); }
  });
}


/**
 * Send commands to initiate scanning.
 * @param {SerialListener} instance The SerialListener instance.
 * @param {function} callback The optional function to call upon completion.
 */
function initiateScanning(instance, callback) {

  // See: https://docs.silabs.com/bluetooth/latest/bluetooth-stack-api/sl-bt-scanner#sl-bt-scanner-set-parameters
  let scanParameters = Buffer.from('300505060004000400', 'hex');

  // See: https://docs.silabs.com/bluetooth/latest/bluetooth-stack-api/sl-bt-scanner#sl-bt-scanner-start
  let scanStart = Buffer.from('300205030101', 'hex');

  // TODO: make scan parameters configurable (currently defaults)
  instance.serialPort.write(scanParameters, (err) => {
    instance.serialPort.write(scanStart, (err) => {
      if(!err) {
        console.log('barnowl-bgapi: initiated scanning');
      }
      if(typeof callback === 'function') { return callback(err); }
    });
  });
}


/**
 * Open the serial port based on the given path.
 * @param {String} path Path to serial port, ex: /dev/ttyUSB0 or auto.
 * @param {function} callback The function to call on completion.
 */
function openSerialPort(path, callback) {
  const { SerialPort } = require('serialport');
  let serialPort;

  if(path === AUTO_PATH) {
    let detectedPath;
    SerialPort.list().then(ports => {
      ports.forEach(port => {
        if(port.manufacturer === AUTO_MANUFACTURER) {
          serialPort = new SerialPort({ path: port.path, baudRate: BAUDRATE },
                                      (err) => {
            console.log('barnowl-bgapi: auto serial path: \"' + port.path +
                        '\" was selected');
            return callback(err, serialPort, port.path);
          });
        }
        else if(port.manufacturer) {
          console.log('barnowl-bgapi: alternate serial path: \"' +
                      port.path + '\" is a ' + port.manufacturer +
                      ' device.');
        }
      });
      if(!serialPort) {
        return callback( { message: "Can't auto-determine serial port" } );
      }
    });
  }
  else {
    serialPort = new SerialPort({ path: path, baudRate: BAUDRATE }, (err) => {
      return callback(err, serialPort, path);
    });
  }
}


module.exports = SerialListener;
