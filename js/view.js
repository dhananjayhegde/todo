let View = function(model){
	var self = this;
	this.model = model;
		
	this.init = function(){
		// this.controller = controller;
		this.textArea = $('#ta-newtask')[0];
		this.list = $('#todo-list')[0];
		this.completedList = $('#completed-list')[0];
		
		$(this.textArea).on('change', function(e){
			let item = $(this.textArea).val();
			let created = new Date();				
			let todoItem = new Task(item, created, '', '');
			
			this.controller
				.addItem(todoItem)
				.then((results) => { 
					this.renderList(); 
					$(this.textArea).val(''); })
				.catch((error) => { console.log("Error in add Promise: " + error.message); });
			
		}.bind(this));

		$("#btn-clear-completed").on("click", (e) => {
			this.controller.clearCompleted()
				.then((results) => { this.renderList(); })
				.catch((error) => { console.log("Error in clearCompleted promise: " + error.message); });
		});
		$("#btn-clear-all").on("click", (e) => {
			this.controller.clearAll()
				.then((results) => { this.renderList(); })
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

		//render initial list
		this.model.loadAllItems().then(this.renderList);
	};
	
	this.filterByTag = function(filterText){
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
	};

	this.refreshTags = function(tasks){
		if(!tasks){
			let tasks = this.model.taskList;
		}
		$("#total-items-tag").attr('data', tasks.length);
		$("#active-items-tag").attr('data', (tasks.filter((item) => item.status == '')).length);
		$("#completed-items-tag").attr('data', (tasks.filter((item) => item.status == 'X')).length);			
	};

	this.renderList = function(results){		
		$(self.list).children('todo-item').remove();
		$(self.completedList).children('todo-item').remove();

		$.each(results, (i, task) => {
			$(self.list)
				.prepend($('<todo-item>')
					.attr('text', task.item)
					.attr('id', task.id)
					.attr('status', task.status)
					.attr('priority', task.priority)
					.attr('created', task.created)
					.on('change', this.toggleSelection));
			
		});
		self.refreshTags(results);
	};

	this.toggleSelection = function(e){
		e.target.selected = e.detail.checked;
	};

	this.deleteSelected = function(e){
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
	};

	this.undoCompletion = function(e){
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

	this.completeSelected = function(e){
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
	};		
};