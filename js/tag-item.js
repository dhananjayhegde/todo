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
				div{
					border: 1px solid rgba(0, 0, 0, 0.1);
					border-radius: 2em;
					font-size: 0.7em;
					background-color: rgba(0, 0, 0, 0.1);
				}
				:host(.active), div:hover{
					background-color: rgba(0, 0, 0, 0.5);
					color: #ddd;
					border-radius: 2em;
				}
				span{
					padding: 0.7em;
					margin: 0.5em 0.4em;
				}
			</style>
			<div class="tag-item">
				<span class="data">${this.data}</span><span>${this.text}</span>
			</div>
		`;
		this.shadow.innerHTML = tag_template;
	}
}

window.customElements.define('tag-item', TagItem);