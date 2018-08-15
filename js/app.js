var app = function(){

	let TodoItem = function(item, created, status, priority){

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
	
	let model = {

		init : function(){
			this.db = new Database();
			this.db.init();
			this.db.loadAllItems();
		},

		loadAllItems : function(){
			let loadAllPromise = this.db.loadAllItems(); // returns a promise
			loadAllPromise
				.then((results) => { this.updateTodoList(results); })
				.catch((error) => { console.log("Error in promise " + error.message ); });

			return loadAllPromise;
		},

		updateTodoList : function(result){
			this.todoList = [];
			$.each(result.rows, (i, row) => { this.todoList.push(row); });
		},

		getList : function(){
			return this.todoList;
		},

		addItem : function(todoItem){
			return this.db.addItem(todoItem); //returns a promise
		},

		deleteItem : function(todoItem){
			this.todoList.remove(todoItem);
		},

		clearCompleted : function(){
			let clearPromise = this.db.deleteCompleted(); //returns a promise
			return clearPromise;
		},

		clearAll : function(){ return this.db.deleteAll(); }, //returns a promise

		updateStatus : function($item){
			return this.db.updateStatus($($item).attr('id'), 
										$($item).attr('status')); //returns a promise
		},

		deleteSingleItem: function(item){
			return this.db.deleteByKey(item);
		}

	};

	let controller = {
		init : function(model, view){
			this.model = model;
			this.view = view;
			this.model.init();
			this.view.init(this);
			this.view.refreshList();
		},

		getAllItems : function(){
			return this.model.getList();
		},

		loadAllItems : function(){
			return this.model.loadAllItems();
		},
		
		addItem: function(todoItem){
			return this.model.addItem(todoItem);
		},

		clearCompleted: function(){
			return this.model.clearCompleted();
		},
		
		clearAll: function(){ return this.model.clearAll(); },
		
		updateStatus : function($item){
			return this.model.updateStatus($item);
		},

		deleteSingleItem : function(item){
			return this.model.deleteSingleItem(item);
		}

	};

	let view = {
		init : function(controller){
			this.controller = controller;
			this.textArea = $('#ta-newtask')[0];
			this.list = $('#todo-list')[0];
			this.completedList = $('#completed-list')[0];
			
			$(this.textArea).on('change', function(e){
				let item = $(this.textArea).val();
				let created = new Date();				
				let todoItem = new TodoItem(item, created, '', 'high');
				
				this.controller
					.addItem(todoItem)
					.then((results) => { 
						this.refreshList(); 
						$(this.textArea).val(''); })
					.catch((error) => { console.log("Error in add Promise: " + error.message); });
				
			}.bind(this));

			$("#btn-clear-completed").on("click", (e) => {
				this.controller.clearCompleted()
					.then((results) => { this.refreshList(); })
					.catch((error) => { console.log("Error in clearCompleted promise: " + error.message); });
			});
			$("#btn-clear-all").on("click", (e) => {
				this.controller.clearAll()
					.then((results) => { this.refreshList(); })
					.catch((error) => { console.log("Error in clearAll promise: " + error.message); });
			});

			$('#btn-complete-marked').on('click', this.completeSelected.bind(this));
			$('#btn-delete-marked').on('click', this.deleteSelected.bind(this));
			$('#btn-undo-complete').on('click', this.undoCompletion.bind(this));
			
			$('#btn-info').on('click', function(e){
				$('.info ul').slideToggle();
			});

			//Handling filter of tasks based on click event on tags
			$('tag-item').on('click', function(e){ 
				$thisTag = $(e.target);
				$thisTag.siblings().removeClass("active");
				$thisTag.addClass("active");
				this.filterByTag($thisTag.attr('text'));
			}.bind(this));
		},

		filterByTag : function(filterText){
			switch(filterText){
				case 'Active':
					$('todo-item[status!=""]').hide();
					$('todo-item[status!=""]').promise().done(function(){
						$('todo-item[status=""]').show();
					});
					break;
				case 'Completed':
					$('todo-item[status!="X"]').hide();
					$('todo-item[status!="X"]').promise().done(function(){
						$('todo-item[status="X"]').show();
					});					
					break;
				case 'Total':
					$('todo-item').show();
					break;
			}
		},

		refreshTags : function(items){
			//update tags
			if(!items){
				let itemsPromise = this.controller.loadAllItems();
				let itemsArray = new Array();
				
				itemsPromise
					.then((results) => {
						$.each(results.rows, function(i, task){ itemsArray.push(task); });
						$("#total-items-tag")
							.attr('data', itemsArray.length);
						$("#active-items-tag")
							.attr('data', (itemsArray.filter((item) => item.status == '')).length);
						$("#completed-items-tag")
							.attr('data', (itemsArray.filter((item) => item.status == 'X')).length);
					});
			}			
		},

		refreshList : function(){
			let itemsPromise = this.controller.loadAllItems();

			itemsPromise
				.then((results) => {
					items = results.rows;
					
					$(this.list).children('todo-item').remove();
					$(this.completedList).children('todo-item').remove();
					$.each(items, function(i, task){
						$todotask = $('<todo-item>')
										.attr('text', task.item)
										.attr('id', task.id)
										.attr('status', task.status)
										.attr('priority', task.priority)
										.attr('created', task.created)
										.on('change', this.toggleSelection);
						
						if (task.status == 'X') {
							$(this.completedList).prepend($todotask);
						} else {
							$(this.list).prepend($todotask);
						}
					}.bind(this));
					this.refreshTags(null);
				})
				.catch((error) => { console.log("Error in refresh promise: " + error.message); });
		},

		addItem : function(todoItem){
			$('#todo-list').prepend($('<todo-item>')
							.attr('text', todoItem.item)
							.on('change', this.toggleSelection.bind(this)));
			this.refreshTags(null);
		},

		toggleSelection : function(e){
			e.target.selected = e.detail.checked;
		},

		deleteSelected : function(e){
			$items = $('todo-item[selected]');

			$.each($items, (function(){
				return function(i, item){
					this.controller.deleteSingleItem(item)
						.then((results) => {
							$(item).remove();
						})
						.catch((error) => { console.log('Error in deleteSelected(): ' + error.message); });
				}.bind(this);
			}.bind(this))());
			this.refreshTags(null);
		},

		undoCompletion : function(e){
			$completedItems = $('todo-item[selected]').filter('[status="X"]');

			$.each($completedItems, (function(){
				return function(i, item){
					$(item).attr('status', '');
					this.controller.updateStatus($(item))
						.then((results) => {
							$removedItem = $(item).remove();
							$removedItem.on('change', this.toggleSelection.bind(this));					
							$(this.list).prepend($removedItem);
						})
						.catch((error) => { console.log("Error in undoCompletion: "+ error.message); });
				}.bind(this);
			}.bind(this))());
			this.refreshTags(null);
		},

		completeSelected : function(e){
			$items = $('todo-item[selected]').filter('[status=""]');
			
			$.each($items, (function(){
				return function(i, item){
					$(item).attr('status', 'X')
					this.controller
						.updateStatus($(item))
						.then((results) => {
							$removedItem = $(item).remove();
							$removedItem.on('change', this.toggleSelection.bind(this));					
							$(this.completedList).prepend($removedItem);
						})
						.catch((error) => { console.log("Error in updateStatus Promise: " + error.message); });
				}.bind(this);
			}.bind(this))());
			this.refreshTags(null);
		}
	};
	controller.init(model, view);
};