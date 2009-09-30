// This allows us to add observers to element that might not exist in the page,
// without testing for them first. It will fail silently.
// e.g. O$('some_DOM_element').observe('click', function(){ alert('this will work')});
// e.g. O$('some_nonexistant_element').observe('click', function(){ alert('this will fail silently')});
var O$ = function(id){
	if($(id)){
		return $(id);
	}else{
		return {'observe' : function(){}};
	}
}

var $observe = function(id,eventName,func){
	if(elem = $(id)){
		elem.observe(eventName, func);
		// Kill the page jumping
		if(elem.getAttribute('href') == '#'){
			elem.onclick = function(){ return false };
		}
	}
}

// Finds an element's parent node that matches the selector
Element.addMethods({
	reverseSelect : function(element, selector){
		element = $(element);
		var parentNode = $(element.parentNode);
		try{
			return parentNode.match(selector) ? parentNode : parentNode.reverseSelect(selector);
		}catch(e){
			return null
		}		
	}
});

// Generic record error
function recordError(request, message){
	message = message || 'There was an error with your request.';
	try{ 
		// If there is no response text, just show a generic error
		var errors = request.responseText.evalJSON();
		alert(message+"\n"+errors.map(function(e){ return e.join(' ')}).join('\n'));					
	}catch(e){
		alert(message+"\n"+request.status);
	}
}

// Grabs the value of the authenticity_token from the page
function getAuthToken(){
	try{
		var authToken = $('authenticity_token').value; // $$('input[name="authenticity_token"]')[0].value;
	}catch(e){
		alert('You need an authentication token to do that.');
		throw $break;
	}		
	return authToken;
}

String.prototype.titleize = function(){return this.replace(/_/g, ' ').capitalize().gsub(/ \w/, function(m){return m[0].toUpperCase()})};
String.prototype.simpleFormat = function(){return '<p>'+this.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br/>')+'</p>';}

Date.prototype.humanFormat = function(){return this.getFullYear()+'/'+('0'+(this.getMonth()+1)).substr(-2)+'/'+('0'+this.getDate()).substr(-2)};

// Cookie Accessors 
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function destroyCookie(name) {
	createCookie(name,"",-1);
}

function replaceURLParamAndGo(paramName, newValue){
	var args = location.href.split('?');
	var new_args = newValue ? paramName+"="+newValue : null;
	if(args[1]){
		new_args = args[1].split('&').reject(function(a){return a.match(paramName+'=')}).concat(new_args).join('&');			
	}
	return location.href = args[0]+'?'+new_args;	
}

// Inserts test at the cursor position, rather than appending it to the bottom. 
function insertAtCursor(myField, myValue) { 
  //IE support 
  if (document.selection) { 
    myField.focus(); 
    sel = document.selection.createRange(); 
    sel.text = myValue; 
  } 
  //MOZILLA/NETSCAPE support 
  else if (myField.selectionStart || myField.selectionStart == '0') { 
    var startPos = myField.selectionStart; 
    var endPos = myField.selectionEnd; 
    myField.value = myField.value.substring(0, startPos) 
    + myValue 
    + myField.value.substring(endPos, myField.value.length); 
  } else { 
    myField.value += myValue; 
  } 
}

// This appends a javascript file to the page, but only if it hasn't already been loaded.
function appendJavascriptFile(name, forceFresh){
	var head = document.getElementsByTagName('head')[0];
	var scriptRegExp = new RegExp(name+"\\.js(\\?\\d+)?$");
	if(!$$('script').find(function(s){return s.src.match(scriptRegExp)})){
		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		// If we need to keep the JS fresh, add a timestamp
		var ord = forceFresh ? '?'+new Date().getTime() : '?THIS_DEPLOY_ORD'; // ?n lets us set expire headers w/ nginx
		if(name.match(/(^\/|\.js)/g)){
			newScript.src = name+ord;
		}else{
			newScript.src = '/javascripts/'+name+'.js'+ord;
		}
		head.appendChild(newScript);	
	}
}

// Appends stylesheet to the page
function appendStylesheet(name, forceFresh) {
	var head = document.getElementsByTagName('head')[0];
	var cssRegExp = new RegExp(name+"\\.css(\\?\\d+)?$");
	if(!$$('[rel="stylesheet"]').find(function(s){return s.href.match(cssRegExp)})){
		var newStylesheet = document.createElement('link');
		newStylesheet.setAttribute('type', 'text/css');
		newStylesheet.setAttribute('rel', 'stylesheet');
		newStylesheet.setAttribute('media', 'screen');
		// If we need to keep the CSS fresh, add a timestamp
		var ord = forceFresh ? '?'+new Date().getTime() : '?THIS_DEPLOY_ORD'; // ?n lets us set expire headers w/ nginx		
		if(name.match(/(^\/|\.css)/g)){
			newStylesheet.setAttribute('href', name+ord);
		}else{
			newStylesheet.setAttribute('href', '/stylesheets/'+name+'.css'+ord);
		}
		head.appendChild(newStylesheet);	
	}
}

// Gets the cursor position relative to the element that the event is coming from
function getElementCursorCoords(event, ofSelector){
	var coords = {};
	var element = event.element();
	// You can specify the matching selector if you want the element scope to bubble up
	if(ofSelector && !element.match(ofSelector)){
		element = element.reverseSelect(ofSelector);
	}
	var elementPosition = element.cumulativeOffset();
	coords['x'] = event.pointerX() - elementPosition.left;
	coords['y'] = event.pointerY() - elementPosition.top;		
	return coords;
}