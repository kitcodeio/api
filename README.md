![](https://beta.kitcode.io/assets/images/kitcode%20logo.png)
## kitcide.io-api
###  Steps to run this project in your local:
```
$ git clone https://gitlab.com/kitcode/kitcode.io-api.git
```
```
$ npm install 
```
```
$ npm run serve
```

### `options` and `env`
You can set `env` and update `version`
#### Update Version
```
  npm run update:version -- [option]
```
##### Available option:
`-t` or `--type` to specify the type of update, which are `major`, `minor`, `patch` and `prerelease`
eg. `npm run update:version -- -t major`
#### Set Enviroment
###### For PRODUCTION: `npm run set:env:prod`
###### For BETA: `npm run set:env:beta`
###### For STAGING: `npm run set:env:staging`
**Note:** `staging` is the default enviroment
