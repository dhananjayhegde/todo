var App = function(){
	this.model = new Model();
	this.model.init();
	this.view  = new View(this.model);
	this.view.init();
	// this.controller = new Controller(this.model, this.view);

	// this.controller.init();
};