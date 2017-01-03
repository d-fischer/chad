# Chad
A chat client for Twitch

## Download
You can always download the latest version [right here](https://github.com/d-fischer/chad/releases). Currently there are Windows 64-bit and macOS builds.

## Build and run from source
You can build the client from source with a few easy steps. (Node being installed is assumed)

```bash
npm install
cd app
npm install
```
    
Optionally, you can install electron globally:

```bash
npm install -g electron
```
    
After that, you only need to run the following (in the root directory) to launch the client:

```bash
# if you installed electron globally, use this
electron app

# if you didn't, use this instead
node_modules/.bin/electron app
```

## Contribute
Feature requests, bug reports or even pull requests are always appreciated! :)
