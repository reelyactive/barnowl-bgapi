barnowl-bgapi
=============

__barnowl-bgapi__ converts the decodings of _any_ ambient Bluetooth Low Energy devices from a BGAPI-enabled Silicon Labs device into standard developer-friendly JSON that is vendor/technology/application-agnostic.

__barnowl-bgapi__ is a lightweight [Node.js package](https://www.npmjs.com/package/barnowl-bgapi) that can run on resource-constrained edge devices.  It can [forward data](#pareto-anywhere-integration) to reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware suite, and can just as easily be run standalone behind a [barnowl](https://github.com/reelyactive/barnowl) instance, as detailed in the code examples below.


Quick Start
-----------

Clone this repository and install package dependencies with `npm install`.  If installation fails on your system, validate the [special cases for installing SerialPort](https://serialport.io/docs/guide-installation).

Then from the root folder run at any time:

    npm start

__barnowl-bgapi__ will attempt to automatically connect to a serial device with the name 'Silicon Labs'.  Alternatively, the path to the device can be specified as an option (ex: "/dev/ttyUSB0"), for instance in the `bin/barnowl-bgapi` startup script.


Hello barnowl-bgapi!
--------------------

The following code will listen to _simulated_ hardware and output packets to the console:

```javascript
const BarnowlBgapi = require('barnowl-bgapi');

let barnowl = new BarnowlBgapi();

barnowl.addListener(BarnowlBgapi.TestListener, {});

barnowl.on("raddec", (raddec) => { console.log(raddec); });

barnowl.on("infrastructureMessage", (message) => { console.log(message); });
```

As output you should see a stream of [raddec](https://github.com/reelyactive/raddec/) objects similar to the following:

```javascript
{
  transmitterId: "fee150bada55",
  transmitterIdType: 3,
  rssiSignature: [
    {
      receiverId: "511ab5b6ec80",
      receiverIdType: 2,
      rssi: -35,
      numberOfDecodings: 1
    }
  ],
  packets: [ '0201061bff99040510f4412ac5c401b8fca4011c9256954303f8846c38d057' ],
  timestamp: 1777037147513
}
```

Regardless of the underlying RF protocol and hardware, the [raddec](https://github.com/reelyactive/raddec/) specifies _what_ (transmitterId) is _where_ (receiverId & rssi), as well as _how_ (packets) and _when_ (timestamp).


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2026 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.