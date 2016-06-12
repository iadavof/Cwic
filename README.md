# Flexible Reservation System Cwic

![Logo of reservation system Cwic](http://cwic.nl/assets/logo-5a80ab5715af3aaef15a220b1e2c7906.svg "Cwic")

## Introduction
In essence, every reservation is the same: you want to book a place, object or service for a certain period of time. So, why isn't there a reservation system that does not make any assumptions on the entity that is for rent? With this in mind, we started developing Cwic! The flexible reservation system that is highly configurable. This provides an enormous amount of bennefits. If you are a hotel owner and also want to rent bikes, you can add the bikes as entities in the same reservation system you use for the rooms, and already are familliar with. 

To get an impression of what is already done, you could visit the [homepage of the project](http://cwic.nl). The interface is in dutch, but we have prepared the full project with internationalization (i18n), so other languages could be added reasonably easy at any time.

But... the flexibility comes at a cost. It takes very, very many man hours to implement all this flexible features. And our initial team only existed of three people. So, we decided to make it open source! Now you can use the system, change it the way you like, contribute to it and let's see where it goes from here. We will still support the project, but we currently have limited amounts of time to work on it.

## Installation
1. `git clone ssh://git@github.com:CUnknown/Cwic.git`
2. `cd cwic`
3. Install postgresql if you don't already have it installed.
4. Make sure you're running the required ruby version (see the Gemfile of the project)
6. Make sure you have installed ImageMagick for image processing (http://www.imagemagick.org/script/binary-releases.php) or GraphicsMagick (http://www.graphicsmagick.org/README.html)
8. Run `bundle install`
11. Copy config/database.yml.example to config/database.yml **[1]**
12. Start the server with `rails s`

**[1]**: Specify your own configuration if neccesary.

## Contribution
We would really appreciate any contribution. Just create a Pull Request and we will be happy to give you feedback and merge additions.

## License

Copyright © 2016 IADA v.o.f. Nijmegen, Netherlands

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
