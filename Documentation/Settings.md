# Settings File
This settings.json file should be located in the project root if you are using the Start-Dev.bat file. KR-Display requires these settings.

## Settings Example
```json
{
	"private":{
		"database":{
			"config":{
				"userName": "ReadOnly",
				"password": "ReadOnly",
				"server":"SERVER",
				"options":{
					"encrypt": false,
					"database": "DisplayTest",
					"instanceName": "SQLEXPRESS",
					"useColumnNames": true,
					"rowCollectionOnDone": true,
					"requestTimeout": 0
				}
			},
			"tables":{
				"queryCell":"ProductionTimeStatusAll",
				"verifyCell":"ProductionTimeStatusAll",
				"queryVariance":"ProductionCycleVariance",
				"queryAuto":"ProductionAutoOnState"
			}
		},
		"log":{
			"options":{
				"path":"C:\\Path\\To\\Logs"
			}
		},
		"utilities":[
			"Electrical",
			"Water",
			"Air"
		]
	},
	"public": {
		"plantLayout":{
			"alt":"Test Image",
			"src": "/img/PlantLayout.png"
		},
		"company":"Company Name"
	}
}
```
## Settings Values

### database

#### config
This is fed directly to [Tedious](http://tediousjs.github.io/tedious/). If your database doesn't use named pipes you can remove the instance name.