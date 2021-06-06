# tm-replay-analysis-backend
## Content
1. About
2. Dependencies
3. Installation
4. Configuration
5. Usage
6. Credit and Motivation

## 1. About
This repository is one of two required repositories to run the trackmania-replay-analysis application. (The other can be found [here](https://github.com/legendariusx/tm-replay-analysis-frontend))
Of the two repositories, this is the backend which supports extracting, storing, and querying replays created in Trackmania 2 (All environments), Trackmania Nations Forever, Trackmania United Forever and Trackmania Turbo. 
**Attention:** Replays from Trackmania 2020 are **NOT** supported (yet).
The replays are extracted using the [scripts](https://github.com/donadigo/gbxtools) and [Python library](https://github.com/donadigo/pygbx) created by donadigo.

Do I need to install all this stuff?
No, this application will hopefully be available publicly. When and if this happens, I cannot say at this moment. When the time comes, I will post an update here.

## 2. Dependencies
### OS
This application has been tested on Ubuntu WSL and Ubuntu Server 20.04.
### Node.js
Node.js is the runtime for this application. You can download it [here](https://nodejs.org/en/download/). Ubuntu 20.04 instructions [here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04-de).
Verified on Node v14+.
### Python 3
Python 3 is required to run the extraction scripts. Install instructions for Ubuntu 20.04 [here](https://www.python.org/downloads/).
### pygbx
pygbx is the library created by donadigo for handling Trackmania replays and maps.
You can install it using Python 3's pip:

    python3 -m pip install pygbx
   In order to run the library, you also need to install python-lzo:
   

    sudo apt-get install python-lzo
   
TODO: Add remaining dependencies and fix order.
### yarn (recommended)
yarn will be used to install the node dependencies. This is not mandatory as npm will also work, but the project has been set up with yarn.

    npm i --global yarn
### MongoDB
The extracted replays are stored in a MongoDB. Instructions for Ubuntu 20.04 [here](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/).
I recommend installing MongoDB as a service and running it automatically on startup.

