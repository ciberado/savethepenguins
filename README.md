## IoTHub Azure Function processor example


## Local development 

* Install the *azure function* tools

```
nvm install 10.14.1
nvm use 10.14.1
npm install -g azure-functions-core-tools
```

* Install the `azurite` *storage account* emulator
```
npm install -g azurite
mkdir c:\tmp\azurite
azurite -s -l c:\tmp\azurite -d c:\tmp\azurite\debug.log
```

* Clone the repo, create the configuration file and run it locally

```
git clone https://github.com/ciberado/savethepenguins
cd savethepenguins

cat <<EOF >> local.settings.json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "AzureWebJobsSecretStorageType": "files",
    "EventHub" : "Endpoint=sb://<...>"
  }
}
EOF

func start
```