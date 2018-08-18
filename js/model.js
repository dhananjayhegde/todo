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
	var self = this;
	this.taskList = new Array();
	this.Sorters = {};

	this.priorityOrder = {
		'!' : 99,
		'-' : 50,
		'/' : 10
	};

	this.statusOrder = {
		'X' : 99,
		''  : 9
 	};

	this.init = function(){
		this.db = new Database();
		this.db.init();
		// this.db.loadAllItems();
	};

	async function loadAllItems(){
		let results = await this.db.loadAllItems(); // returns a promise
		self.taskList = Object.values(results.rows);
		return self.taskList;
	};

	this.loadAllItems = loadAllItems;

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

	// Async-ed updateStatus function - reloads taskList after update
	async function updateStatus($items, status){
		//TODO: Error handling in case Promise rejects
		await Promise.all($items.toArray().map(async function(item) {
			return self.db.updateStatus($(item).attr('id'), status);
		}));
		await self.loadAllItems();
	}
	this.updateStatus = updateStatus;

	this.deleteSingleItem = function(item){
		return this.db.deleteByKey(item);
	};

	this.toTitleCase = function(str){
		return str.replace(/^[-A-Z]|\s[a-z]/igm, function(m) {return m.toUpperCase()});
	};

	this.sortedList = function(sortCriteria){
		let sortFunction = sortCriteria
								.split('-')
								.map( str => self.toTitleCase(str))
								.reduce((final, curr) => { return final + curr; }, 'sort');
		try{
			return self.Sorters[sortFunction]();
		}catch(TypeError){
			console.log('function ' + sortFunction + '() not defined.  Sorting by Date by defualt');
			return self.Sorters['sortByDateDesc']();
		}
	}

	this.Sorters.sortByDateAsc = function(){
		console.log("sortByDateAsc");
		return self.taskList.sort((t1, t2) => {
			if(t1.created > t2.created){
				return -1;
			}else {
				return 1;
			}
		});
	};
	this.Sorters.sortByDateDesc = function(){
		console.log("sortByDateDsc");
		return self.taskList.sort((t1, t2) => {
			if(t1.created > t2.created){
				return 1;
			}else {
				return -1;
			}
		});
	};
	this.Sorters.sortByPriorityAsc = function(){
		console.log("sortByPriorityAsc");
		
		return self.taskList.sort((t1, t2) => {
			return self.priorityOrder[t2.priority] - self.priorityOrder[t1.priority];
		});
	};
	this.Sorters.sortByPriorityDesc = function(){
		console.log("sortByPriorityDesc");
		return self.taskList.sort((t1, t2) => {
			return self.priorityOrder[t1.priority] - self.priorityOrder[t2.priority];
		});
	};
	this.Sorters.sortByStatusCompleteFirst = function(){
		console.log("sortByStatusCompleteFirst");
		return self.taskList.sort((t1, t2) => {
			return this.statusOrder[t1.status] - this.statusOrder[t2.status];
		});
	};
	this.Sorters.sortByStatusIncompleteFirst = function(){
		console.log("sortByStatusIncompleteFirst");
		return self.taskList.sort((t1, t2) => {
			return this.statusOrder[t2.status] - this.statusOrder[t1.status];
		});
	};
};