[![Build Status](https://travis-ci.org/gkweb/create-vanilla-js-app.png?branch=master)](https://travis-ci.org/gkweb/create-vanilla-js-app)

# Create Vanilla JS App 🌴🌴🌴

# Installation

## yarn
`yarn global add create-vanilla-js-app`

## npm
`npm i -g create-vanilla-js-app`

# Once installed

`cva projectname`

_creates boilerplate in `projectname` dir._

# A very simple vanilla js boilerplate

- Includes webpack HMR
- Webpack 4
- Es6 / Babel
- Webpack CSS loader / Style loader

I've tried to keep it as clean as possible. Add your own packages to suit your own workflow. The one thing I've ommited is `package-lock.json` generation. But you can add this back in by removing `.npmrc` before running `npm i`

### First

Install deps from project root `yarn` or `npm i`


### Generated app usage

### Start development server with:

`yarn start:dev` or `npm run start:dev`

It's possible to use a different port by specifying this first like so: 

`CVA_PORT=7788 yarn start:dev` to start with port 7788. Same for npm just include `CVA_PORT=7788` at the beginning.

### Build for production

`yarn build` or `npm run build`

### Ways you may add to this

+ Add jsx and react - Or just use create react app instead!
+ Add a .env for project specific environment values