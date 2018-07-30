#target Illustrator
#targetengine main

(function () {

var USE_DIALOG = false;


if(USE_DIALOG){
	var win = new Window("dialog", "Square Grid Creator");
}else {
	var win = new Window("palette", "Square Grid Creator");	
}

var panel = win.add( "panel", undefined, "Grid Parameters");
panel.alignChildren = "left";

var group0 = panel.add('group');


var stWidth = group0.add ("statictext", undefined, "New Artboard Width / Height");
var etWidth = group0.add ("edittext", undefined, "1920");
etWidth.characters = 4;
//var stHeight = group0.add ("statictext", undefined, "New Artboard Height");
var etHeight = group0.add ("edittext", undefined, "1080");
etHeight.characters = 4;

var groupX = panel.add('group');
var stStrokeWidth = groupX.add ("statictext", undefined, "Stroke Width");
var etStrokeWidth = groupX.add ("edittext", undefined, "1");

etStrokeWidth.characters = 2;

var groupA = panel.add('group');

var ckCreateNewArtboard = groupA.add ("checkbox" , undefined, "Create New Artboard");
ckCreateNewArtboard.value = true;

var group1 = panel.add('group');

var stSize = group1.add ("statictext", undefined, "Square Grid Size");
var etSize = group1.add ("edittext", undefined, "100");
etSize.characters = 3;


var group2 = panel.add('group');

var btnBuildGrid = group2.add( "button", undefined, "Build Square Grid");
btnBuildGrid.active=true;


ckCreateNewArtboard.onClick = function(){
    if(ckCreateNewArtboard.value==true){
        etWidth.enabled = true;
        etHeight.enabled = true;
        stWidth.enabled = true;
       // stHeight.enabled = true;
    } else {
        etWidth.enabled = false;
        etHeight.enabled = false;
        stWidth.enabled = false;
        //stHeight.enabled = false;
    }
}

btnBuildGrid.onClick = function() {
    //alert("button Clicked");
    // get all the params
    var params = {
        size : getValidNum(etSize.text),
        width : getValidNum(etWidth.text),
        height : getValidNum(etHeight.text),
        strokeWidth : getValidNum(etStrokeWidth.text),
        ckCreateNewArtboard : ckCreateNewArtboard.value
    };

    //for better debugging
    if(USE_DIALOG){
    	buildGrid(params);
    }else{
    	buildMsg(params);
    }
    
}

function buildMsg(d){
	//alert("buildMsg");
    var bt = new BridgeTalk;
    bt.target = "illustrator";
   // alert(d.size);
    //var msg = buildGrid + '\rbuildGrid();';
    // alert(buildGrid + "buildGrid("+params.toSource()+");");
    var msg = buildGrid + "buildGrid("+d.toSource()+");";
    bt.body = msg;
    bt.send();  
}

function buildGrid(d) {
	//alert("buildGrid");

    function makeColor(r,g,b){
        var c = new RGBColor();
        c.red   = r;
        c.green = g;
        c.blue  = b;
        return c;
    }

	function makeLine(x,y,width,height){
		//alert("makeLine");
		var line = squareGridGroup.pathItems.add();
		line.setEntirePath([[x,y],[x+width,y+height]]);
		line.closed = false;
		line.filled = false;
		line.strokeColor = makeColor(0,255,255);
		line.strokeWidth = d.strokeWidth;
		return line;
	}

	var doc = app.activeDocument;

    if (d.ckCreateNewArtboard == true){
        var ar = doc.artboards[doc.artboards.length-1].artboardRect.slice();

        var padding = 100;
        var x1 = ar[2] + padding;
        var y1 = ar[1];
        var x2 = ar[2] + padding + d.width;
        var y2 = ar[1] - d.height;

        try{
             var newArtboard = doc.artboards.add([x1, y1, x2, y2]);
        }catch (e){
             alert("Cant create artboard outside of drawable area. Try rearranging artboards first.");
             //alert(e);
        }
        
        //var newArtboard = doc.artboards.add([x1, y1, x2, y2]);

        //create a new artboard to the right of this artboard at the width and height of the panel

        // then take this new artboard as ar

        ar = newArtboard.artboardRect.slice();


    } else {
        var ar = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect.slice();
    }
   
    var p = doc.pathItems; //app.activeDocument.pathItems is where we draw things.


    var startX = ar[0];
    var startY = ar[1];
    var width = Math.abs(ar[0]-ar[2]);
    var height = Math.abs(ar[1]-ar[3]);
    var endX = ar[2];
    var endY = ar[3];
    var rowCount = Math.ceil(height/d.size)+1;
    var columnCount = Math.ceil(width/d.size)+1;
    width = (columnCount-1)*d.size;
    height = (rowCount-1)*d.size;

    var squareGridGroup = doc.groupItems.add();
    squareGridGroup.name = "squareGridGroup-" + d.size;


    for(var i = 0; i<rowCount; i++){
    	var hLine = makeLine(startX,startY-(i*d.size),width,0);
    }

   	for(var j = 0; j<columnCount; j++){
   		var vLine = makeLine(startX+(j*d.size),startY-height,0,height);
   	}
    
    


}

win.show();

/////////////////////////////////////////
// HELPERS
/////////////////////////////////////////


function getValidNum(val) {
  var num = parseInt(val);
  if (isNaN(num))
    return 0;

  return num;
}

})()








// this creates an artboard, rectangle, and line, with helper functions
/*
function altArtboardRect(x, y, w, h) {
    return [x, y, (x + w), y-h]; //l,t,b,r
}

function makeLine(x,y,width,height){
    var line = app.activeDocument.pathItems.add();
    line.setEntirePath([[x,y],[x+width,y+height]]);
    line.closed = false;
    line.filled = false;
    line.strokeColor = makeColor(255,0,0);
    line.strokeWidth = 0.25;
    return line;
}

var startX = -666;
var startY = -888;
var width = 250;
var height = 672
var endX = startX+width;
var endY = startY-height; 

var artboard = app.activeDocument.artboards.add(altArtboardRect(x,y,width,height));
var rect = app.activeDocument.pathItems.rectangle(y,x,width,height);

var line = makeLine(startX,startY,250,0);

*/


