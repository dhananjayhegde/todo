let Task = function(item, created, status, priority){

	item = item.trim();

	switch(item.charAt(0)){
		case '!':
		case '/':
			priority = item.charAt(0);
			item = item.substring(1).trim();
			break;
		default:
			priority = '-';
	}
	
	this.item  		= item;
	this.created  	= created;
	this.status 	= status;
	this.priority  	= priority;
	this.id			= '';
};

let Model = function(){

	this.init = function(){
		this.db = new Database();
		this.db.init();
		this.db.loadAllItems();
	};

	this.loadAllItems = function(){
		let loadAllPromise = this.db.loadAllItems(); // returns a promise
		loadAllPromise
			.then((results) => { this.updateTodoList(results); })
			.catch((error) => { console.log("Error in promise " + error.message ); });

		return loadAllPromise;
	};

	this.updateTodoList = function(result){
		this.todoList = [];
		$.each(result.rows, (i, row) => { this.todoList.push(row); });
	};

	this.getList = function(){
		return this.todoList;
	};
	
	this.addItem = function(todoItem){
		return this.db.addItem(todoItem); //returns a promise
	};
	
	this.deleteItem = function(todoItem){
		this.todoList.remove(todoItem);
	};

	this.clearCompleted = function(){
		let clearPromise = this.db.deleteCompleted(); //returns a promise
		return clearPromise;
	};

	this.clearAll = function(){ return this.db.deleteAll(); }; //returns a promise

	this.updateStatus = function($item){
		return this.db.updateStatus($($item).attr('id'), 
									$($item).attr('status')); //returns a promise
	};

	this.deleteSingleItem = function(item){
		return this.db.deleteByKey(item);
	};

};