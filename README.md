# kr-display
Meteor app for displaying scada data from mssql server.

Created by Kyle Rassweiler

## Screenshots
![Plant Overview](public/Docs/Sample001.png)
![Cell List](public/Docs/Sample002.png)
![Cell Running](public/Docs/Sample003.png)
![Cell Faulted](public/Docs/Sample004.png)
![Cell Answered](public/Docs/Sample005.png)

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
			}
		},
		"cells":[
			"L3E",
			"C3O",
			"R3H"
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
		}
	}
}
```

## Cell Example
```json
{
  "_id": "ghnDPRwKbAyWbGbbG",
  "name": "Cell001",
  "fault": true,
  "answered": false,
  "downtime":0,
  "totalDown": 0,
  "autoRunning": [0,0,1,1,1,1,0,0,0,0,0,1,1,1,0],
  "lastCT": 100,
  "targetCT": 110,
  "bestCT": 90,
  "averageCT": 120,
  "partsMade": 90,
  "partsTarget": 120,
  "gap":{
	"valueY":[21,33,-1,-32,-4, -7,-1,5,12,12,12,1,14,-3,-15],
	"valueX":["2016-07-11 00:00:00","2016-07-11 00:01:00","2016-07-11 00:02:00","2016-07-11 00:03:00","2016-07-11 00:04:00","2016-07-11 00:05:00","2016-07-11 00:06:00","2016-07-11 00:07:00","2016-07-11 00:08:00","2016-07-11 00:09:00","2016-07-11 00:10:00","2016-07-11 00:11:00","2016-07-11 00:12:00","2016-07-11 00:13:00","2016-07-11 00:14:00"]
  }
}
```

## Utility Example
```json
{
  "_id": "3Wkp4h2yTGPaKv6K9",
  "name": "Electrical",
  "fault": true
}
```

## Setup
- Modify settings.json for your needs
- run meteor --settings settings.json to test on port 3000
- Program will auto populate cells and utilities based on values in settings.json