var dateToddMonFormat = function(date){
	let options = { month : "short", day : "2-digit", year : "numeric"};
	return date.toLocaleDateString("en-IN", options);
};