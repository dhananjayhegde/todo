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
	var self 		= this;
	this.taskList 	= new Array();
	this.Sorters 	= {};
	this.Groupers 	= {};
	this.Filters 	= {}; 
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
		self.taskList.forEach( t => t.created = new Date(t.created));
		return self.taskList;
	};

	this.loadAllItems = loadAllItems;

	this.updateTodoList = function(result){
		this.todoList = [];
		$.each(result.rows, (i, row) => { this.todoList.push(row); });
	};
	
	async function addItem(todoItem){
		await this.db.addItem(todoItem); //returns a promise
		await self.loadAllItems();
	};
	this.addItem = addItem;
	
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

	/**
	 * 
	 * @param {*} options is of type {filterCriteria : '', sortCriteria: '', groupCriteria: ''}
	 */
	this.getList = function(options){
		let resultArray = {'All' : self.taskList};
		
		if(options['filterCriteria']){
			resultArray = self.applyFilter(resultArray, options['filterCriteria']);
		}
		if(options['sortCriteria']){
			resultArray = self.applySort(resultArray, options['sortCriteria']);
		}
		if(options['groupCriteria']){
			resultArray = self.applyGrouping(resultArray, options['groupCriteria']);
		}
		return resultArray;
	};

	// Group =====>
	this.applyGrouping = function(taskList, groupCriteria){
		let groupFunction 
			= groupCriteria
				.split('-')
				.map( str => self.toTitleCase(str))
				.reduce((final, curr) => { return final + curr; }, 'group');
		try{
			return self.Groupers[groupFunction](taskList);
		}catch(TypeError){
			console.log('function ' + groupFunction + '() not defined.  List Not Grouped');
			return self.Groupers['groupByNone'](taskList);
		}
	};
	
	this.Groupers.groupByNone = function(taskList){
		return taskList;
	};
	
	this.Groupers.groupByStatus = function(taskList){
		let result = {};
		let groupKeyNames = { 'X' : 'Completed', '' : 'Incomplete'};
		let groupKeys = new Set(taskList.map(task => task.status));

		groupKeys.forEach((gropuKey) => {
			result[groupKeyNames[groupKeys]] = taskList.filter(task => task.status == groupKey);
		});
		return result;
	};

	this.Groupers.groupByDate = function(taskList){
		let result = {};
		let groupKeys = new Set(taskList.map(task => task.date));

		groupKeys.forEach((gropuKey) => {
			result[groupKeys] = taskList.filter(task => task.created == groupKey);
		});
		return result;
	};

	this.Groupers.groupByPriority = function(taskList){
		let result = {};
		let groupKeyNames = { '!' : 'High', '-' : 'Medium', '/' : 'Low'};
		let groupKeys = new Set(taskList.map(task => task.priority));

		groupKeys.forEach((gropuKey) => {
			result[groupKeyNames[groupKeys]] = taskList.filter(task => task.priority == groupKey);
		});
		return result;
	};
	
	// Filter =====> 
	this.applyFilter = function(taskList, filterCriteria){
		let filterFunction 
			= filterCriteria
				.split('-')
				.map( str => self.toTitleCase(str))
				.reduce((final, curr) => { return final + curr; }, 'filter');
		try{
			return self.Filters[filterFunction](taskList);
		}catch(TypeError){
			console.log('function ' + filterFunction + '() not defined.  Showing all tasks');
			return self.Filters['filterByAll'](taskList);
		}
	};
	
	this.Filters.filterByAll = function(taskList){
		return taskList;
	};

	this.Filters.filterByIncomplete = function(taskList){
		let result = {};
		for(group in taskList){
			result[group] = taskList[group].filter(task => task.status == '');
		}
		return result;
		// return taskList.filter(task => task.status == '');
	};

	this.Filters.filterByComplete = function(taskList){
		let result = {};
		for(group in taskList){
			result[group] = taskList[group].filter(task => task.status == 'X');
		}
		return result;
		// return taskList.filter(task => task.status == 'X');
	};

	// Sort =====>
	this.applySort = function(taskList, sortCriteria){
		let sortFunction 
			= sortCriteria
				.split('-')
				.map( str => self.toTitleCase(str))
				.reduce((final, curr) => { return final + curr; }, 'sort');
		try{
			return self.Sorters[sortFunction](taskList);
		}catch(TypeError){
			console.log('function ' + sortFunction + '() not defined.  Sorting by Date by defualt');
			return self.Sorters['sortByDateDesc'](taskList);
		}
	}

	this.Sorters.sortByDateAsc = function(taskList){
		console.log("sortByDateAsc");
		let result = {};

		for(group in taskList){
			result[group] = taskList[group].sort((t1, t2) => {
				if(t1.created > t2.created){
					return -1;
				}else {
					return 1;
				}
			});
		}
		return result;
	};
	
	this.Sorters.sortByDateDesc = function(taskList){
		console.log("sortByDateDsc");
		let result = {};

		for(group in taskList){
			result[group] = taskList[group].sort((t1, t2) => {
				if(t1.created > t2.created){
					return 1;
				}else {
					return -1;
				}
			});
		}
		return result;
	};
	
	this.Sorters.sortByPriorityAsc = function(taskList){
		console.log("sortByPriorityAsc");
		let result = {};
		
		for(group in taskList){
			result[group] = taskList[group].sort((t1, t2) => {
				return self.priorityOrder[t2.priority] - self.priorityOrder[t1.priority];
			});
		}
		return result;
	};
	this.Sorters.sortByPriorityDesc = function(taskList){
		console.log("sortByPriorityDesc");
		let result = {};
		
		for(group in taskList){
			result[group] = taskList[group].sort((t1, t2) => {
				return self.priorityOrder[t1.priority] - self.priorityOrder[t2.priority];
			});
		}
		return result;
	};
	
	this.Sorters.sortByStatusCompleteFirst = function(taskList){
		console.log("sortByStatusCompleteFirst");
		let result = {};

		for(group in tasks){
			result[group] = taskList[group].sort((t1, t2) => {
				return this.statusOrder[t1.status] - this.statusOrder[t2.status];
			});
		}
		return result;
	};
	
	this.Sorters.sortByStatusIncompleteFirst = function(taskList){
		console.log("sortByStatusIncompleteFirst");
		let result = {};

		for(group in tasks){
			result[group] = taskList[group].sort((t1, t2) => {
				return this.statusOrder[t2.status] - this.statusOrder[t1.status];
			});
		}
		return result;
	};
};