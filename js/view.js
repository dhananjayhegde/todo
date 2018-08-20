let View = function(model){
	var self = this;
	this.model = model;
	this.ListDisplayOptions = {
		'filterCriteria' 	: 'by-all',
		'groupCriteria' 	: 'by-status',
		'sortCriteria' 		: 'by-date-desc'
	};
		
	this.init = function(){
		// this.controller = controller;
		this.textArea = $('#ta-newtask')[0];
		this.list = $('#todo-list')[0];
		this.completedList = $('#completed-list')[0];
		
		$(this.textArea).on('change', function(e){
			let item = $(this.textArea).val();
			let created = new Date();				
			let todoItem = new Task(item, created, '', '');
			
			this.model
				.addItem(todoItem)
				.then((results) => {
					this.renderList(self.model.getList(self.ListDisplayOptions)); 
					$(this.textArea).val(''); })
				.catch((error) => { console.log("Error in add Promise: " + error.message); });
			
		}.bind(this));

		$("#btn-clear-completed")
			.prop('title', 'Delete completed tasks from database')
			.on("click", (e) => {
				this.model.clearCompleted()
					.then((results) => { this.renderList(self.model.getList(self.ListDisplayOptions)); })
					.catch((error) => { console.log("Error in clearCompleted promise: " + error.message); });
			});
		$("#btn-clear-all")
			.prop('title', 'Delete all tasks from database')
			.on("click", (e) => {
			this.model.clearAll()
				.then((results) => { this.renderList(self.model.getList(self.ListDisplayOptions)); })
				.catch((error) => { console.log("Error in clearAll promise: " + error.message); });
			});

		$('#btn-complete-marked')
			.prop('title', 'Set selected tasks to "Completed" status')
			.on('click', this.completeSelected.bind(this));
		$('#btn-delete-marked')
			.prop('title', 'Delete selected tasks from database')
			.on('click', this.deleteSelected.bind(this));
		$('#btn-undo-complete')
			.prop('title', 'Set selected tasks to "Incomplete" status ')
			.on('click', this.undoCompletion.bind(this));
		
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

		$('#sort-by').on('change', (event) => {
			self.ListDisplayOptions['sortCriteria'] = $(event.target).val();
			self.renderList(self.model.getList(self.ListDisplayOptions));
		});
		
		$('#group-by').on('change', (event) => {
			self.ListDisplayOptions['groupCriteria'] = $(event.target).val();
			self.renderList(self.model.getList(self.ListDisplayOptions));
		});

		//render initial list
		this.model.loadAllItems().then((results) => this.renderList(self.model.getList(self.ListDisplayOptions)));
	};
	
	this.filterByTag = function(filterText){
		switch(filterText){
			case 'Incomplete':
				self.ListDisplayOptions['filterCriteria'] = 'by-incomplete';
				break;
			case 'Completed':
				self.ListDisplayOptions['filterCriteria'] = 'by-complete';				
				break;
			case 'All':
				self.ListDisplayOptions['filterCriteria'] = 'by-all';
				break;
		}
		self.renderList(self.model.getList(self.ListDisplayOptions));
	};

	this.refreshTags = function(){
		tasks = this.model.taskList;
		$("#total-items-tag").attr('data', tasks.length);
		$("#active-items-tag").attr('data', (tasks.filter((item) => item.status == '')).length);
		$("#completed-items-tag").attr('data', (tasks.filter((item) => item.status == 'X')).length);			
	};

	this.renderList = function(results){		
		$('#list-area').children().remove();

		$.each(Object.keys(results), (i, key) => {
			//for each group, create a new UL list and set the heading to group key
			let $list = $('<ul>');
			$($list).append('<h5>' + key + '</h5>');
			$.each(results[key], (j, task) => {
				$($list)
					.append($('<todo-item>')
						.attr('text', task.item)
						.attr('id', task.id)
						.attr('status', task.status)
						.attr('priority', task.priority)
						.attr('created', task.created)
						.on('change', self.toggleSelection)
						.on('change', self.toggleCompletion)
						.on('delete', self.deleteItem));
			});
			$('#list-area').append($list);
		});
		self.refreshTags();
	};

	this.toggleSelection = function(e){
		e.target.selected = e.detail.checked;
	};

	this.deleteItem = function(e){
		self.model
			.deleteSingleItem($(e.target))
			.then((results) => {
				self.renderList(self.model.getList(self.ListDisplayOptions));
				self.refreshTags();
			})
			.catch(console.error);
	};

	this.deleteSelected = function(e){
		$items = $('todo-item[selected]');
		self.model
			.deleteSingleItem($items)
			.then((results) => {
				self.renderList(self.model.getList(self.ListDisplayOptions));
				self.refreshTags();
			})
			.catch(console.error);
	};

	this.undoCompletion = function(e){
		$items = $('todo-item[selected]').filter('[status="X"]');
		self.model
			.updateStatus($items, '')
			.then((results) => {
				self.renderList(self.model.getList(self.ListDisplayOptions));
				self.refreshTags();
			})
			.catch(console.error);
	},

	this.toggleCompletion = function(e){
		let statusToBe = $(e.target).attr('status') === 'X'? '' : 'X';
		self.model
			.updateStatus($(e.target), statusToBe)
			.then((results) => {
				self.renderList(self.model.getList(self.ListDisplayOptions));
				self.refreshTags();
			})
			.catch(console.error);
	};
	
	this.completeSelected = function(e){
		$items = $('todo-item[selected]').filter('[status=""]');
		self.model
			.updateStatus($items, 'X')
			.then((results) => {
				self.renderList(self.model.getList(self.ListDisplayOptions));
				self.refreshTags();
			})
			.catch(console.error);
	};		
};