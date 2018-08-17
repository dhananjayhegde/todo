// let Controller = function(model, view){

// 	this.model = model;
// 	this.view  = view;
	
// 	this.init = function(){
// 		this.model.init();
// 		this.view.init(this);
// 		this.view.refreshList();
// 	};

// 	this.getAllItems = function(){
// 		return this.model.getList();
// 	};
	
// 	this.loadAllItems = function(){
// 		return this.model.loadAllItems();
// 	};
	
// 	this.addItem = function(todoItem){
// 		return this.model.addItem(todoItem);
// 	};

// 	this.clearCompleted = function(){
// 		return this.model.clearCompleted();
// 	};
	
// 	this.clearAll = function(){ return this.model.clearAll(); };
	
// 	this.updateStatus = function($item){
// 		return this.model.updateStatus($item);
// 	};

// 	this.deleteSingleItem = function(item){
// 		return this.model.deleteSingleItem(item);
// 	};
// };