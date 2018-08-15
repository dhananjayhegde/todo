class TagItem extends HTMLElement {

	constructor(){
		super();

		this.shadow = this.attachShadow({mode : 'open'});
		// this._id = '';
		this._text = '';
		this._data = '';
		this._active = '';
	}

	get text(){
		return this._text;
	}

	set text(val){
		this.setAttribute('text', val);
	}

	get active(){
		return this._active;
	}

	set active(val){
		this.setAttribute('active', val);
	}

	get data(){
		return this._data;
	}

	set data(val){
		this.setAttribute('data', val);
	}
	
	static get observedAttributes(){
		return ['text', 'data', 'active'];
	}

	attributeChangedCallback(name, oldVal, newVal){
		var attrName = '_' + name;
		this[attrName] = newVal;
		this._updateRendering();
	}

	connectedCallback(){
		this._updateRendering();
	}

	_onClick(event){
	
	}

	_updateRendering(){
		let tag_template = `
			<style>
				.tag-item{
					display: flex;
					flex-direction: row;
					justify-content: center;
					align-items: center;
					height: 1.5em;
					width: 100%;
					background-color: rgba(0, 0, 0, 0.2);
					margin: 0em 0.5em;
					font-size: 0.8em;
					border-radius: 2em;
				}				
				:host(.active) .tag-item, div:hover{
					background-color: rgba(0, 0, 0, 0.5);
					color: rgba(255, 255, 255, 0.9);
					border-radius: 2em;
				}
				span{
					padding: 0.7em;
				}
				.data{
					// width: 25%;
				}
				.text{
					// flex: 1;
				}
			</style>
			<div class="tag-item">
				<span class="data">${this.data}</span><span class="text">${this.text}</span>
			</div>
		`;
		this.shadow.innerHTML = tag_template;
	}
}

window.customElements.define('tag-item', TagItem);