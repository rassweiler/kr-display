Fiber = Npm.require('fibers');
import { Meteor } from 'meteor/meteor';
var Connection = Tedious.Connection;
var connected = false;
var busy = false;
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
	connection.on('connect', function (err) {
		if (err){
			log.error(err);
			return console.error(err);
		}
		log.info("In connection callback");
		connected = true;
	});
	connection.on('debug', function(msg) {
	    //log.debug(msg,msg);
		// This is the only way to grab timeout errors??
		if (msg.indexOf('timeout : failed') > -1) {
			self.connectionError = true;
		}
	});
	connection.on('errorMessage', function(err) {
		log.error(err);
		self.connectionError = true;
	});
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
	utilities = null;
	utility = null;
	log.info("Checked Utilities");
	// Remove deleted cells
	var cellList = Meteor.settings.private.cells;
	var cells = Cell.find({});
	remove = [];
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
	remove = null;
	// Add missing cells
	for(val in cellList){
		cell = Cell.findOne({name:cellList[val].name});
		if(!cell){
			Cell.insert({name: cellList[val].name, group: cellList[val].group, parts:{}}, function(error, result) {
				if(error){
					log.error(error, result);
					console.log(error);
				}
			});
		}
	}
	cell = null;
	cellList = null;
	log.info("Checked Cells");
	
	var op = 0;
	cells.forEach(function(cell){
		var job = new Job(Jobs, 'queryParts',{cell:cell.name});
		//job.priority('normal').retry({ retries: 3,wait: 5*1000 }).delay((6+op)*1000).repeat({ wait: 30*1000 }).save();
		job.retry({ retries: 0,wait: 5*1000 }).delay((6+op)*1000).repeat({ wait: 30*1000 }).save();
		var job2 = new Job(Jobs, 'queryVariance',{cell:cell.name});
		//job2.priority('normal').retry({ retries: 5,wait: 5*1000 }).delay(5*1000).repeat({ wait: 30*1000 }).save();
		job2.retry({ retries: 0,wait: 5*1000 }).delay((7+op)*1000).repeat({ wait: 30*1000 }).save();
		var job3 = new Job(Jobs, 'clearCompleted', {});
		job3.retry({ retries: 0,wait: 5*1000 }).delay((8+op)*1000).repeat({ wait: 2*60*1000 }).save();
		op += 5;
	});
	op = null;
	cells = null;
	log.info("Set Up Jobs");

	var workers = Jobs.processJobs(['queryParts', 'queryVariance', 'clearCompleted'],{maxJobs: 1},function (job, cb) {
		if (job._doc.type === 'queryParts') {
			var cellName = job.data.cell;
			var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.tables[0] +" WHERE Cell = '"+ cellName + "'";
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
								log.info("Row Count: "+rowCount);
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
											parts[name].lastCT = rows[i]["LastCycleTime"]["value"];
											parts[name].averageCT = rows[i]["AverageCycleTime"]["value"];
											parts[name].bestCT = rows[i]["BestCycleTime"]["value"];
										}
									}
									var andonOn = (rows[0].CallOn.value == "True") ? true : false;
									var andonAnswered = (rows[0].CallAnswered.value == "True") ? true : false;
									var shift = rows[0].ShiftName.value;
									var operator = rows[0].ClockNo.value;
									var downtime = rows[0].TotalCallTime.value;
									var totalDowntime = rows[0].TotalCallAnsweredTime.value;
									Cell.update(id,{$set: {andonOn:andonOn,andonAnswered:andonAnswered,shift:shift,operator:operator,downtime:downtime,totalDowntime:totalDowntime,parts:parts}},{upsert:true, bypassCollection2:true},function(error, result){
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
							log.info("Finished job.");
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
								log.info("Row Count: "+rowCount);
								var cell = Cell.find({name:cellName}).fetch()[0];
								var id = cell._id;
								if(id){
									var autoRunning = cell.autoRunning;
									var parts = cell.parts;
									if(Object.keys(parts).length > 0){
										for(val in parts){
											log.debug("Val: ", val);
											parts[val]["variance"] = [];
											parts[val]["timeStamp"] = [];
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
								log.error("No sql rows returned!");
							}
							log.info("Finished job");
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