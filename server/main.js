Fiber = Npm.require('fibers');
import { Meteor } from 'meteor/meteor';
var Connection = Tedious.Connection;
var connected = false;
var busy = false;
// Initialize Logger:
this.log = new Logger();
// Initialize LoggerFile and enable with default settings:
(new LoggerFile(this.log,Meteor.settings.private.log.options)).enable();

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
	//Start data collection jobs
	var config = Meteor.settings.private.database.config;
	var connection = new Connection(config);
	connection.on('connect', Meteor.bindEnvironment(function (err) {
		if (err){
			log.error(err);
			return console.error(err);
		}
		log.info("In connection callback");
		connected = true;
	}));
	log.info("Connected to DB");
	// Remove old jobs
	Jobs.remove({});
	Jobs.startJobServer();
	// code to run on server at startup
	// Remove deleted utilities
	log.info("Started job server");
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
				log.error(error);
				console.log(error);
			});
		}
	}
	log.info("Checked Utilities");
	// Remove deleted cells
	var cellList = Meteor.settings.private.cells;
	var cells = Cell.find({});
	var remove = [];
	cells.forEach(function(ut){
		var found = false;
		for(val in cellList){
			if(ut.name == cellList[val].name){
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
		cell = Cell.findOne({name:cellList[val].name});
		if(!cell){
			Cell.insert({name: cellList[val].name, group: cellList[val].group, shift:"A", operator:0, andonOn:false, andonAnswered:false, downtime:0,totalDowntime:0,parts:[], cycleVariance:[],autoRunning:[],timeStamp:[]}, function(error, result) {
				if(error){
					log.error(error);
					console.log(error);
				}
			});
		}
	}
	cell = null;
	log.info("Checked Cells");
	
	var op = 0;
	cells.forEach(function(cell){
		var job = new Job(Jobs, 'queryDB',{cell:cell.name});
		job.priority('normal').retry({ retries: 0,wait: 5*1000 }).delay((6+op)*1000).repeat({ wait: 30*1000 }).save();
		op += 5;
		//var job2 = new Job(Jobs, 'queryVariance',{cell:cell.name});
		//job2.priority('normal').retry({ retries: 5,wait: 5*1000 }).delay(5*1000).repeat({ wait: 30*1000 }).save();
	});
	log.info("Set Up Jobs");
/*
	var workers = Jobs.processJobs('queryDB',function (job, cb) {
		var cellName = job.data.cell;
		var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.tables[0] +" WHERE Cell = '"+ cellName + "'";
		log.info("In job, connected:"+connected, query);
		if(connected){
				var request = new Tedious.Request(query, function (err, rowCount) {
					if (err) {
						console.log(err);
						log.error(err);
						job.log("Job failed with error" + err,{level: 'warning'});
						job.fail("" + err);
						cb();
					}
				});
				request.on('doneInProc', function (rowCount, more, rows) {
					Fiber(function() {
						if(rowCount > 0){
							var cell = Cell.find({name:cellName});
							var id = cell.fetch()[0]._id;
							if(id){
								//Find Cell Parts and targets
								var parts = [];
								for(var i = 0; i < rowCount; ++i){
									if(rows[i]["PartNo"]["value"]){
										var part = {};
										part.name = rows[i]["PartNo"]["value"];
										part.current = rows[i]["PartCount"]["value"];
										part.target = rows[i]["TargetBuild"]["value"];
										part.targetCT = rows[i]["TactTimeTarget"]["value"];
										part.lastCT = rows[i]["LastCycleTime"]["value"];
										part.averageCT = rows[i]["AverageCycleTime"]["value"];
										part.bestCT = rows[i]["BestCycleTime"]["value"];
										parts.push(part);
									}
								}
								var andonOn = (rows[0].CallOn.value == "True") ? true : false;
								var andonAnswered = (rows[0].CallAnswered.value == "True") ? true : false;
								var shift = rows[0].ShiftName.value;
								var operator = rows[0].ClockNo.value;
								var downtime = rows[0].TotalCallTime.value;
								var totalDowntime = rows[0].TotalCallAnsweredTime.value;
								Cell.update(id,{$set: {parts:parts,andonOn:andonOn,andonAnswered:andonAnswered,shift:shift,operator:operator,downtime:downtime,totalDowntime:totalDowntime}}, function(error, result){
									if(error){
										log.error(error);
									}
								});
							}
						}else{
							log.error("No sql rows returned!");
						}
						job.done();
						cb();
						Jobs.remove({status:'completed'});
					}).run();
				});
				connection.execSql(request);
		}else{
			log.error("Not connected to db.");
			job.log("Job failed with error: Not connected to db.",{level: 'warning'});
			job.fail("" + "Not Connected to db.");
		}
	});
	*/
	var workers = Jobs.processJobs('queryDB',function (job, cb) {
		var cellName = job.data.cell;
		var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.tables[1] +" WHERE Cell = '"+ cellName + "'";
		log.info("In job, connected:"+connected, query);
		if(connected){
				var request = new Tedious.Request(query, function (err, rowCount) {
					if (err) {
						console.log(err);
						log.error(err);
						job.log("Job failed with error" + err,{level: 'warning'});
						job.fail("" + err);
						cb();
					}
				});
				request.on('doneInProc', function (rowCount, more, rows) {
					Fiber(function() {
						if(rowCount > 0){
							var cell = Cell.find({name:cellName}).fetch()[0];
							var id = cell._id;
							if(id){
								var autoRunning = [];
								var parts = cell.parts;
								for(var i = 0; i < rows.length; ++i){
									var index = -1;
									for(var y = 0; y < parts.length; ++y){
										if(parts[y].name == rows[i]["PartNo"]["value"]){
											index = y;
											break;
										}
									}
									if(index > -1){
										parts[index].variance.push(rows[i]["CycleVariance"]["value"]);
										parts[index].timeStamp.push(new Date(rows[i]["EndTime"]["value"]));
									}
								}
								Cell.update(id,{$set: {autoRunning:autoRunning,parts:parts}}, function(error, result){
									if(error){
										log.error(error);
									}
								});
							}
						}else{
							log.error("No sql rows returned!");
						}
						job.done();
						cb();
						Jobs.remove({status:'completed'});
					}).run();
				});
				connection.execSql(request);
		}else{
			log.error("Not connected to db.");
			job.log("Job failed with error: Not connected to db.",{level: 'warning'});
			job.fail("" + "Not Connected to db.");
		}
	});
	/*
	var workers2 = Jobs.processJobs('queryVariance',function (job, cb) {
		var cellName = job.data.cell;
		var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.tables[1] +" WHERE Cell = '"+ cellName + "'";
		if(connected){
				var request = new Tedious.Request(query, function (err, rowCount) {
					if (err) {
						console.log(err);
						log.error(err);
						job.log("Job failed with error" + err,{level: 'warning'});
						job.fail("" + err);
						cb();
					}
				});
				request.on('doneInProc', function (rowCount, more, rows) {
					Fiber(function() {
						if(rowCount > 0){
							log.info("Variance Rows:",rows);
							var cell = Cell.find({name:cellName});
							var id = cell.fetch()[0]._id;
							if(id){
								var autoRunning = [];
								var cycleVariance = [];
								var timeStamp = [];
								for(var i = 0; i < rows.length; ++i){
									//autoRunning.push(rows[i]["AutoRunning"]["value"] ? 1:0 );
									cycleVariance.push(rows[i]["CycleVariance"]["value"]);
									timeStamp.push(new Date(rows[i]["TimeStamp"]["value"]));
								}
								Cell.update(id,{$set: {autoRunning:autoRunning,cycleVariance:cycleVariance,timeStamp:timeStamp}}, function(error, result){
									if(error){
										log.error(error);
									}
								});
							}
						}else{
							log.error("No sql rows returned!");
						}
					}).run();
				});
				connection.execSql(request);
				job.done();
				cb();
				Jobs.remove({status:'completed'});
		}else{
			console.log("Not connected to db.");
			log.error("Not connected to db.");
			job.log("Job failed with error: Not connected to db.",{level: 'warning'});
			job.fail("" + "Not Connected to db.");
		}
	});
	*/
});