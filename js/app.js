var App = function(){
	this.model = new Model();
	this.view  = new View();
	this.controller = new Controller(this.model, this.view);

	this.controller.init();
};