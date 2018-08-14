// returns a database object
var Database = function(){
		
		this.init = function(){
			this.open();
			this.createTable();
		};

		this.open = function(){
			let size = 5 * 1024 * 1024;
			this.db = openDatabase('todoDB', '1', 'Todo List Manager', size);
		};

		this.onError = function(tx, e){
			alert('Error : ' + e.message);
		};

		this.onSuccess = function(tx, r){
			console.log("success: " + r);
		};

		this.createTable = function(){
			db = this.db;
			db.transaction(function(tx){
				// tx.executeSql("DROP TABLE todo", [], this.onSuccess, this.onError);
				tx.executeSql("CREATE TABLE IF NOT EXISTS" + 
								" todo(id INTEGER PRIMARY KEY ASC AUTOINCREMENT," + 
								" item TEXT," + 
								" created DATETIME," + 
								" status TEXT, " + 
								" priority TEXT)", [], this.onSuccess, this.onError);
			}.bind(this));
		};

		//--------------------- CRUD methods ---------------------

		this.addItem = function(item){
			db = this.db;
			return new Promise((resolve, reject) => {
				db.transaction(function(tx){
				tx.executeSql("INSERT INTO todo(item, created, status, priority)" + 
								" VALUES (?, ?, ?, ?)", 
								[item.item, item.created, item.status, item.priority],
								(tx, results) => { resolve(results); },
								(tx, error) => { reject(error); }
							);
				});
			});			
		};

		this.updateStatus = function(id, status){
			db = this.db;
			
			return new Promise((resolve, reject) => {
				db.transaction(function(tx){
				tx.executeSql("UPDATE todo SET status = ? WHERE id = ?",
								[status, id],
								(tx, results) => { resolve(results); },
								(tx, error) => { reject(error); }
							);
				});
			});
		}

		this.deleteByKey = function(item){
			db = this.db;
			return new Promise((resolve, reject) => {
				db.transaction((tx) => {
					tx.executeSql("DELETE FROM todo WHERE id = ?", 
									[item.id], 
									(tx, results) => { resolve(results); }, 
									(tx, error) => { reject(error); });
				});
			});
		};

		this.deleteCompleted = function(){
			db = this.db;

			return new Promise((resolve, reject) => {
				db.transaction((tx) => {
					tx.executeSql("DELETE FROM todo WHERE status = ?", ['X'], 
							(tx, results) => { resolve(results); },
							(tx, error) => { reject(error); }
						);
				});
			});	
		};

		this.deleteAll = function(){
			db = this.db;

			return new Promise((resolve, reject) => {
				db.transaction((tx) => {
					tx.executeSql("DELETE FROM todo", [], 
							(tx, results) => { resolve(results); },
							(tx, error) => { reject(error); }
						);
				});
			});	
		};

		this.loadAllItems = function(){
			db = this.db;

			return new Promise(function(resolve, reject){
				db.transaction(function(tx){
					tx.executeSql("SELECT * FROM todo", [], 
							(tx, results) => { resolve(results); }, 
							(tx, error) => { reject(error); }
						);
				});
			});
		};

		/* ---------------- STATISTICS METHODS ----------------*/
		this.getCountOfOpenTasks = function(){
			db = this.db;
			return new Promise(function(resolve, reject){
				db.transaction(function(tx){
					tx.executeSql("SELECT COUNT(*) FROM todo WHERE status = ?", [''],
							(tx, results) => { resolve(results); }, 
							(tx, error) => { reject(error); }
						);
				});
			});
		}
}