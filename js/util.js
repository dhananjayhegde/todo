var dateToddMonFormat = function(date){
	let options = { month : "short", day : "2-digit" };
	return date.toLocaleDateString("en-IN", options);
};