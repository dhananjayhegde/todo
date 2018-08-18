class TodoItem extends HTMLElement {

	constructor(){
		super();

		this.shadow = this.attachShadow({mode : 'open'});
		this._id = '';
		this._text = '';		
		let d = new Date();
		this._created = this.getDateInFormat(d);
		this._status = '';
		this._priority = '';
	}

	getDateInFormat(date){
		let options = { month : "short", day : "2-digit" };
		return date.toLocaleDateString("en-IN", options);
	}

	get id(){
		return this._id;
	}

	set id(val){
		this.setAttribute('id', val);
	}

	get text(){
		return this._text;
	}

	set text(val){
		this.setAttribute('text', val);
	}

	get status(){
		return this._status;
	}

	set status(val){
		this.setAttribute('status', val);
	}

	get priority(){
		return this._priority;
	}

	set selected(val){
		const isChecked = Boolean(val);
      	if (isChecked)
        	this.setAttribute('selected', '');
      	else
        	this.removeAttribute('selected');
	}

	get selected(){
		return this.hasAttribute('selected');
	}

	set priority(val){
		this.setAttribute('priority', val);
	}

	get created(){
		return this._created;
	}

	set created(val){
		let d = new Date(val);
		this.setAttribute('created', this.getDateInFormat(d));
	}

	static get observedAttributes(){
		return ['id', 'text', 'created', 'status', 'priority', 'selected'];
	}

	attributeChangedCallback(name, oldVal, newVal){
		var attrName = '_' + name;

		switch(name){
			case "created":
				newVal = this.getDateInFormat(new Date(newVal));
				this[attrName] = newVal;
				break;
			case "status":
				this[attrName] = newVal;
				this._updateRendering();
				break;
			default:
				this[attrName] = newVal;
		}
		
	}

	connectedCallback(){
		this._updateRendering();
	}

	_onClick(event){
		this.dispatchEvent(new CustomEvent('change', {
			detail : { 
				checked : event.target.checked, 
			},
			bubbles : true,
		}));
	}

	_updateRendering(){
		// let todo_template = document.createElement('template');
		let todo_template = `
			<style>
				.grid{
					display: flex;
					flex-direction: row;
					align-items: center;
					list-style-type: none;
					/* height: 1.5em; */
					padding: 0.5em;
					margin: 0.5em;
					border: 1px solid #ccc;
					border-radius: 2em;
					box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
					font-size: 0.9em;
				}
				.col{
					margin-right: 0.5em;
				}
				.fixed{
					width: 2em;
				}
				.fluid{
					flex: 1;
				}
				.grid:hover{
					box-shadow: inset -1px 1px 10px 1px rgba(0, 0, 0, 0.1);
				}
				:host(.completed) li{
					text-decoration: line-through;
					color: #ada3a3;
				}
				:host(.completed:hover) li{
					background-color: #c6f2d4;
					color: #ada3a3;
				}
				:host([status='X']) li{
					text-decoration: line-through;
					color: #ada3a3;
				}
				/*:host([status='X']:hover) li{
					background-color: #c6f2d4;
					color: #ada3a3;
				}*/
				:host([priority="!"]) li{
					color: rgb(255, 253, 239);
					background-color: rgb(217, 26, 26);
				}
				:host([priority="/"]) li{
					color: #ada3a3;
				}
				
				/* ------ checkbox styles ----- */
				.container {
				  display: block;
				  position: relative;
				  cursor: pointer;				  
				  -webkit-user-select: none;
				  -moz-user-select: none;
				  -ms-user-select: none;
				  user-select: none;
				  width: 1.5em;
				  height: 1.5em;
				  border-radius: 2em;
				}

				/* Hide the browser's default checkbox */
				.container input {
				  position: absolute;
				  opacity: 0;
				  cursor: pointer;
				  height: 100%;
				  width: 100%;
				  margin: 0px;
				}
				.checkmark {
				  position: absolute;
				  top: 0;
				  left: 0;
				  height: 100%;
				  width: 100%;
				  background-color: #fff;
				  border-radius: 2em;
				  box-shadow: inset -1px 1px 10px 0px rgba(0, 0, 0, 0.1);

				}

				/* On mouse-over, add a grey background color */
				.container:hover input ~ .checkmark {
				  background-color: #fff;
				  box-shadow: inset 1px 1px 10px 0px rgba(0, 0, 0, 0.3);
				}

				/* When the checkbox is checked, add a blue background */
				.container input:checked ~ .checkmark {
				  background-color: #fff;
				}

				/* Create the checkmark/indicator (hidden when not checked) */
				.checkmark:after {
				  content: "";
				  position: absolute;
				  display: none;
				}

				/* Show the checkmark when checked */
				.container input:checked ~ .checkmark:after {
				  display: block;
				}

				/* Style the checkmark/indicator */
				.container .checkmark:after {
				  left: 12px;
				  top: -3px;
				  width: 0.25em;
				  height: 1em;
				  border: solid rgb(217, 26, 26);
				  border-width: 0 3px 3px 0;
				  -webkit-transform: rotate(45deg);
				  -ms-transform: rotate(45deg);
				  transform: rotate(45deg);
				  border-radius: 0px;
				}
				/* Custom checkbox css ends */
			</style>
			
			<li class="grid">
				<label class="container col fixed">
					<input type="checkbox"/>
					<span class="checkmark"></span>
				</label>
				<div class="col fluid">${this.text}</div>
				<div class="col">${this.created}</div>
			</li>
		`;

		this.shadow.innerHTML = todo_template;
		this.shadow.querySelector('li input').addEventListener('click', this._onClick.bind(this));
		this.dispatchEvent(new CustomEvent('change', {
			detail : { 
				checked : false, 
			},
			bubbles : true,
		}));
	}
}

window.customElements.define('todo-item', TodoItem);