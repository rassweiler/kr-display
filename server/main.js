Fiber = Npm.require('fibers');
import { Meteor } from 'meteor/meteor';
var Connection = Tedious.Connection;
var connected = false;
var busy = false;
var cells = [];
//SimpleSchema.debug = true;

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
	console.log("Setup connection");
	connection.on('connect', function (err) {
		if (err){
			log.error(err);
			return console.error(err);
		}
		console.log("Connected");
		connected = true;
	});
	connection.on('errorMessage', function(err) {
		log.error("Error:",err);
	});
	var query = "SELECT DISTINCT Cell FROM dbo."+ Meteor.settings.private.database.tables["queryCell"];
	var request = new Tedious.Request(query, function (err, rowCount) {
		if (err) {
			console.log(err);
			log.error(err);
		}
	});
	Cell.remove({});
	
	request.on('row', function (columns) {
			console.log("Received sql cell list");
			if(columns){
				cells.push(columns["Cell"]["value"]);
			}
	});
	
	Meteor.setTimeout(function(){
		console.log("Executing request");
		connection.execSql(request);
	},2000);

	Meteor.setTimeout(function(){
		console.log("Executing cell building");
		for(var i = 0; i < cells.length; ++i){
			Cell.insert({name: cells[i], parts:{}});
		}
	},5000);
	// Remove old jobs
	Jobs.remove({});
	Jobs.startJobServer();
	// Remove deleted utilities
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
	utilities = null;
	utility = null;

	Meteor.setTimeout(function(){
		var cells = Cell.find({});
		console.log("Setting up jobs based on cells");
		var op = 0;
		cells.forEach(function(cell){
			var job = new Job(Jobs, 'queryCell',{cell:cell.name});
			job.delay((1+op)*1000).repeat({ wait: 30*1000 }).save();
			var job2 = new Job(Jobs, 'queryVariance',{cell:cell.name});
			job2.delay((2+op)*1000).repeat({ wait: 30*1000 }).save();
			var job3 = new Job(Jobs, 'queryAuto',{cell:cell.name});
			job3.delay((3+op)*1000).repeat({ wait: 30*1000 }).save();
			var job4 = new Job(Jobs, 'verifyCell',{cell:cell.name});
			job4.delay((4+op)*1000).repeat({ wait: 24*60*60*1000 }).save();
			op += 5;
		});
		var job = new Job(Jobs, 'clearCompleted', {});
		job.retry({ retries: 0,wait: 5*1000 }).delay((4+op)*1000).repeat({ wait: 2*60*1000 }).save();
		op = null;
		cells = null;
	}, 10000);
	log.info("Started Server");

	var workers = Jobs.processJobs(['queryCell', 'queryVariance', 'queryAuto', 'clearCompleted'],{maxJobs: 1},function (job, cb) {
		if (job._doc.type === 'queryCell') {
			var cellName = job.data.cell;
			var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.tables[job._doc.type] +" WHERE Cell = '"+ cellName + "'";
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
									//Find Cell Parts and targets
									var parts = cell.parts;
									if(!parts){
										parts = {};
									}
									for(var i = 0; i < rowCount; ++i){
										var name = rows[i]["PartNo"]["value"]
										if(name){
											if(!(name in parts)){
												parts[name] = {};
											}
											parts[name].name = rows[i]["PartNo"]["value"];
											parts[name].current = rows[i]["PartCount"]["value"];
											parts[name].target = rows[i]["TargetBuild"]["value"];
											parts[name].targetCT = rows[i]["TactTimeTarget"]["value"];
											parts[name].averageCT = rows[i]["AverageCycleTime"]["value"];
											parts[name].bestCT = rows[i]["BestCycleTime"]["value"];
										}
									}
									var andonOn = (rows[0].CallOn.value == "True" || rows[0].CallOn.value == "true" || rows[0].CallOn.value == true) ? true : false;
									var andonAnswered = (rows[0].CallAnswered.value == "True" || rows[0].CallAnswered.value == "true" || rows[0].CallAnswered.value == true) ? true : false;
									var shift = rows[0].ShiftName.value;
									var operator = rows[0].ClockNo.value;
									var downtime = rows[0].TotalCallAnsweredTime.value;
									var totalDowntime = rows[0].TotalCallTime.value;
									Cell.update(id,{$set: {andonOn:andonOn,andonAnswered:andonAnswered,shift:shift,operator:operator,downtime:downtime,totalDowntime:totalDowntime,parts:parts}},{upsert:true,bypassCollection2:true},function(error, result){
										if(error){
											log.error(error);
										}
									});
								}
							}else{
								log.error("No sql rows returned for query: "+query);
							}
							job.done();
							cb();
						}).run();
					});
					connection.execSql(request);
			}else{
				log.error("Not connected to db.");
				job.log("Job failed with error: Not connected to db.",{level: 'warning'});
				job.fail("" + "Not Connected to db.");
			}
		} else if (job._doc.type === 'queryVariance') {
			var cellName = job.data.cell;
			var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.tables[job._doc.type] +" WHERE Cell = '"+ cellName + "' ORDER BY 'EndTime' DESC";
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
									var parts = cell.parts;
									if(Object.keys(parts).length > 0){
										for(val in parts){
											parts[val]["variance"] = [];
											parts[val]["timeStamp"] = [];
											parts[val]["lastCT"] = null;
											if(parts[val]["targetCT"] != null){
												for(var i = 0; i < rows.length; ++i){
													if(rows[i]["PartNo"]["value"] == val){
														parts[val]["lastCT"] = rows[i]["CycleTime"]["value"];
														break;
													}
												}
											}
										}
										for(var i = 0; i < rows.length; ++i){
											parts[rows[i]["PartNo"]["value"]].variance.push(rows[i]["CycleVariance"]["value"]);
											parts[rows[i]["PartNo"]["value"]].timeStamp.push(new Date(rows[i]["EndTime"]["value"]));
										}
									}
									Cell.update(id,{$set: {parts:parts}},{upsert:true, bypassCollection2:true}, function(error, result){
										if(error){
											log.error(error);
										}
									});
								}
							}else{
								log.error("No sql rows returned for query: "+query);
							}
							job.done();
							cb();
						}).run();
					});
					connection.execSql(request);
			}else{
				log.error("Not connected to db.");
				job.log("Job failed with error: Not connected to db.",{level: 'warning'});
				job.fail("" + "Not Connected to db.");
			}
		} else if (job._doc.type === 'queryAuto') {
			var cellName = job.data.cell;
			var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.tables[job._doc.type] +" WHERE Cell = '"+ cellName + "'";
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
									var autoRunning = {};
									autoRunning.values = [];
									autoRunning.timeStamps = [];
									for(var i = 0; i < rows.length; ++i){
										autoRunning.values.push((rows[i]["AutoOn"]["value"] == true || rows[i]["AutoOn"]["value"] == "true" || rows[i]["AutoOn"]["value"] == "True" || rows[i]["AutoOn"]["value"] == 1)?1:0);
										autoRunning.timeStamps.push(rows[i]["EventTime"]["value"]);
									}
									Cell.update(id,{$set: {autoRunning:autoRunning}},{upsert:true, bypassCollection2:true}, function(error, result){
										if(error){
											log.error(error);
										}
									});
								}
							}else{
								log.error("No sql rows returned for query: "+query);
							}
							job.done();
							cb();
						}).run();
					});
					connection.execSql(request);
			}else{
				log.error("Not connected to db.");
				job.log("Job failed with error: Not connected to db.",{level: 'warning'});
				job.fail("" + "Not Connected to db.");
			}
		} else if (job._doc.type === 'verifyCell') {
			var cellName = job.data.cell;
			var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.tables[job._doc.type] +" WHERE Cell = '"+ cellName + "'";
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
								
							}else{
								log.error("No sql rows returned for query: "+query);
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
		} else if (job._doc.type === 'clearCompleted') {
			Jobs.remove({status:'completed'});
			job.done();
			cb();
		}
	});
});