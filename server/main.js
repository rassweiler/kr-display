import { Meteor } from 'meteor/meteor';
var Connection = Tedious.Connection;

Jobs.allow({
	insert: function(){
		return true;
	},
	update: function(){
		return true;
	},
	remove: function(){
		return true;
	}
});

Meteor.startup(() => {
	// Remove old jobs
	Jobs.remove({});
	Jobs.startJobServer();
	var connected = false;
	// code to run on server at startup
	// Remove deleted utilities
	console.log("Started job server");
	var utilities = Meteor.settings.private.utilities;
	var utility = Utility.find({});
	var remove = [];
	utility.forEach(function(ut){
		var found = false;
		for(val in utilities){
			if(ut.name == utilities[val]){
				found = true;
				break;
			}
		}
		if(!found){
			remove.push(ut.name);
		}
	});
	Utility.remove({'name':{'$in':remove}});
	// Add missing utilities
	for(val in utilities){
		utility = Utility.findOne({name:utilities[val]});
		if(!utility){
			Utility.insert({name: utilities[val], fault: false}, function(error, result) {
				console.log(error);
			});
		}
	}
	// Remove deleted cells
	var cellList = Meteor.settings.private.cells;
	var cells = Cell.find({});
	var remove = [];
	cells.forEach(function(ut){
		var found = false;
		for(val in cellList){
			if(ut.name == cellList[val]){
				found = true;
				break;
			}
		}
		if(!found){
			remove.push(ut.name);
		}
	});
	Cell.remove({'name':{'$in':remove}});
	// Add missing cells
	for(val in cellList){
		cell = Cell.findOne({name:cellList[val]});
		if(!cell){
			Cell.insert({name: cellList[val], fault:false, answered:false,lastCT:0,bestCT:0, averageCT:0,partsMade:0,partsTarget:0, gap:{valueY:[0],valueX:[0]}}, function(error, result) {
				if(error){
					console.log(error);
				}
			});
		}
	}
	cell = null;
	
	//Start data collection jobs
	var config = Meteor.settings.private.database.config;
	var connection = new Connection(config);

	connection.on('connect', function (err) {
		if (err) return console.error(err);
		connected = true;
		console.log("Connected to mssql");
		/*
		var request = new Tedious.Request("SELECT FromPLC, ShiftName, ProductionDate FROM dbo.ProductionResultFromPLC WHERE ShiftName = 'A'", function (err, rowCount) {
			if (err) {
				console.log(err);
			}
		});
		request.on('row', function (columns) {
			//console.log(columns);
			var r = '';
			columns.forEach(function (column) {
				r = r + ' ' + column.value;
			});
			console.log('\n ', r);

			// "select CycleVariance, DateTime from dbo.ProductionResultFromPLC WHERE DateTime < CURRENT_TIMESTAMP AND DateTime > DateADD(hh, -3, CURRENT_TIMESTAMP)"
			console.log(Date());
		});

		connection.execSql(request);
		*/
	});

	cells.forEach(function(cell){
		console.log("Create job: "+cell.name);
		var job = new Job(Jobs, 'queryDB',{cell:cell.name});
		job.priority('normal').retry({ retries: 5,wait: 5*1000 }).delay(5*1000).repeat({ wait: 30*1000 }).save();
	});

	var workers = Jobs.processJobs('queryDB',function (job, cb) {
		console.log("Running Job: "+job.data.cell);
		var cell = job.data.cell;
		var query = "SELECT Cell, FromPLC, ShiftName, ProductionDate FROM dbo.ProductionResultFromPLC WHERE Cell = '"+ cell +"'";
		if(connected){
				var request = new Tedious.Request(query, function (err, rowCount) {
					if (err) {
						console.log(err);
						job.log("Job failed with error" + err,{level: 'warning'});
						job.fail("" + err);
						cb();
					}
				});
				request.on('row', function (columns) {
					//console.log(columns);
				});
				console.log("Executed sql");
				connection.execSql(request);
				job.done();
				cb();
				Jobs.remove({status:'completed'});
		}else{
			console.log("Not connected to db.");
			job.log("Job failed with error: Not connected to db.",{level: 'warning'});
			job.fail("" + "Not Connected to db.");
		}
	});
});