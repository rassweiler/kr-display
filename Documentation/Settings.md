# Settings File
This settings.json file should be located in the project root if you are using the development .bat file.

## Settings Example
```json
{
	"private":{
		"database":{
			"config":{
				"userName": "User",
				"password": "Password",
				"server":"server",
				"options":{
					"encrypt": false,
					"database": "Database"
				}
			},
			"table":"TestTable",
			"nonpartcolumns":"TimeStamp Cell Zone AutoRunning AndonOn AndonAnswered TargetCycleTime BestCycleTime AverageCycleTime CycleTime CycleVariance Downtime TotalDowntime"
		},
		"log":{
			"options":{
				"path":"G:\\Path\\To\\My\\House\\Logs"
			}
		},
		"cells":[
			{
				"name":"Test1",
				"group":"A"
			},
			{
				"name":"Test3",
				"group":"A"
			},
			{
				"name":"Test2",
				"group":"B"
			},
			{
				"name":"Test0",
				"group":"B"
			}
		],
		"utilities":[
			"Electrical",
			"Water",
			"Air"
		]
	},
	"public": {
		"plantLayout":{
			"alt":"Plant Layout",
			"src": "/img/PlantLayout.png"
		},
		"company":"Some Place"
	}
}
```