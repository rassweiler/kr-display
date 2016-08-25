# kr-display
Meteor app for displaying scada data from mssql server.

Created by Kyle Rassweiler

## Screenshots
![Screen001](public/Docs/Sample001.png)
![Screen002](public/Docs/Sample002.png)
![Screen003](public/Docs/Sample003.png)

## Fonts
This project uses the red alert font for the logo and Raleway font for the pages.

## Settings Example
```json
{
	"private":{
		"database":{
			"type":"mssql",
			"username": "Test",
			"password": "test",
			"server":"192.168.0.2",
			"options":{
				"encrypt": false
			}
		},
		"cells":[
			{
				"name":"R3H"
			}
		],
		"utilities":[
			{
				"name":"Electrical"
			}
		]
	},
	"public": {
		"plantLayout":{
			"alt":"Test Image",
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
  "down": true,
  "answered": false,
  "lastCT": 100,
  "targetCT": 110,
  "bestCT": 90,
  "averageCT": 120,
  "partsMade": 90,
  "partsTarget": 120,
  "gap":{
    "valueY":[21,33,-1,-32,-4],
    "valueX":["2016-07-11 00:00:00","2016-07-11 00:01:00","2016-07-11 00:02:00","2016-07-11 00:03:00","2016-07-11 00:04:00"]
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