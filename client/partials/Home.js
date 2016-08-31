Template.Home.onCreated(function(){
	var self = this;
	self.autorun(function(){
		self.subscribe('cells');
		self.subscribe('utilities');
		self.subscribe('allJobs');
	});
});

Template.Home.helpers({
	plantLayout:()=>{
		if(Meteor.settings.public.plantLayout){
			return Meteor.settings.public.plantLayout;
		}else{
			return null;
		}
	}
});