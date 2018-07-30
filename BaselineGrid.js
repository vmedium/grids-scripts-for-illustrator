#target Illustrator
#targetengine main

(function () {

var USE_DIALOG = false;

if(USE_DIALOG){
	var win = new Window("dialog", "Baseline Grid Creator");
}else {
	var win = new Window("palette", "Baseline Grid Creator");	
}

var panel = win.add( "panel", undefined, "Grid Parameters");
panel.alignChildren = "left";
var groupA = panel.add('group');

var stWidth = groupA.add ("statictext", undefined, "New Artboard Width / Height");
var etWidth = groupA.add ("edittext", undefined, "1920");
//var stHeight = groupA.add ("statictext", undefined, "Height");
var etHeight = groupA.add ("edittext", undefined, "1080");



var groupB = panel.add('group');
var ckCreateNewArtboard = groupB.add ("checkbox" , undefined, "Create New Artboard");
ckCreateNewArtboard.value = true;

var groupC = panel.add('group');
var stBaseline = groupC.add ("statictext", undefined, "Baseline (px)");
var etBaseline = groupC.add ("edittext", undefined, "16");
// var stMicroBaseline = groupC.add ("statictext", undefined, "MicroBaseline");
// var etMicroBaseline = groupC.add ("edittext", undefined, "8");

var groupD = panel.add('group');
var stFieldHeight = groupD.add ("statictext", undefined, "Field Height (in baselines)");
var etFieldHeight = groupD.add ("edittext", undefined, "10");

var groupE = panel.add('group');
var stMarginTop = groupE.add ("statictext", undefined, "MarginTop (in baselines)");
var etMarginTop = groupE.add ("edittext", undefined, "0");
var stMarginSide = groupE.add ("statictext", undefined, "MarginSide (px)");
var etMarginSide = groupE.add ("edittext", undefined, "60");

var groupF = panel.add('group');
var stColumns = groupF.add ("statictext", undefined, "Columns");
var etColumns = groupF.add ("edittext", undefined, "12");
var stColumnGutter = groupF.add ("statictext", undefined, "Column Gutter (px)");
var etColumnGutter = groupF.add ("edittext", undefined, "24");

var group0=panel.add('group');
var stModule = group0.add("statictext", undefined, "calculating...");
stModule.characters = 40;

var groupG = panel.add('group');
var btnBuildGrid = groupG.add( "button", undefined, "Build Baseline Grid");
btnBuildGrid.active=true;
var btnCancel = groupG.add('button', undefined, 'Cancel');

win.show();

var editTextArray = [etWidth, etHeight, etBaseline, etFieldHeight, etMarginTop, etMarginSide, etColumns, etColumnGutter];

for (var k=0; k<editTextArray.length; k++){
	editTextArray[k].onChanging = updateModuleText;
}

function updateModuleText(){

	//alert ('updateModuleText');

	var d = {
		width : parseInt(etWidth.text),
		height : parseInt(etHeight.text),
		marginTop: parseInt(etMarginTop.text),
		marginSide: parseInt(etMarginSide.text),
		baseline : parseInt(etBaseline.text),
		microBaseline : parseInt(etBaseline.text)/2,
		columns : parseInt(etColumns.text),
		columnGutter : parseInt(etColumnGutter.text),
		fieldHeight : parseInt(etFieldHeight.text),
		createNewArtboard : ckCreateNewArtboard.value 
	}
	var gutterTotal = (d.columns-1)*d.columnGutter;

	var moduleWidth = (d.width-(d.marginSide*2)-gutterTotal) / d.columns;
	var moduleHeight = d.baseline*d.fieldHeight;

	moduleWidth = Math.round(moduleWidth * 100) / 100;
	moduleHeight = Math.round(moduleHeight * 100) / 100;

	stModule.text = "Module Size: " + moduleWidth +" x " + moduleHeight;
}

updateModuleText();

ckCreateNewArtboard.onClick = function(){
    if(ckCreateNewArtboard.value==true){
        stWidth.enabled = true;
        etWidth.enabled = true;
        etHeight.enabled = true;
        stModule.enabled = true;
        updateModuleText();
    } else {
        stWidth.enabled = false;
        etWidth.enabled = false;
        etHeight.enabled = false;
        stModule.enabled = false;
        stModule.text = "";
    }	
}
//ckCreateNewArtboard.onClick();

btnCancel.onClick = function(){
    win.close();
}

btnBuildGrid.onClick = function() {
	//alert("buildGrid");

	// get all the data from the panel
	var data = {
		width : parseInt(etWidth.text),
		height : parseInt(etHeight.text),
		marginTop: parseInt(etMarginTop.text),
		marginSide: parseInt(etMarginSide.text),
		baseline : parseInt(etBaseline.text),
		microBaseline : parseInt(etBaseline.text)/2,
		columns : parseInt(etColumns.text),
		columnGutter : parseInt(etColumnGutter.text),
		fieldHeight : parseInt(etFieldHeight.text),
		createNewArtboard : ckCreateNewArtboard.value 
	}
 
	if (USE_DIALOG){
		drawGrid(data);
	}else{
		var bt = new BridgeTalk;
	    bt.target = "illustrator";
	    var msg = drawGrid + "drawGrid("+data.toSource()+");";
	    bt.body = msg;
	    bt.send();
	}



    //
}




function drawGrid(data){
	// alert("drawGrid");
	var doc = app.activeDocument;
	var p = doc.pathItems;
	var d = data;

	function makeColor(r,g,b){
	    var c = new RGBColor();
	    c.red   = r;
	    c.green = g;
	    c.blue  = b;
	    return c;
	}
    
    if (d.createNewArtboard) {
    	var ar = doc.artboards[doc.artboards.length-1].artboardRect.slice();
        var padding = 100;
        var x1 = ar[2] + padding;
        var y1 = ar[1];
        var x2 = ar[2] + padding + d.width;
        var y2 = ar[1] - d.height;
        var newArtboard = doc.artboards.add([x1, y1, x2, y2]);
        var targetArtboard = newArtboard;

    } else {
    	var targetArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];	
    }

    var t = targetArtboard.artboardRect;
    d.width = Math.abs(t[2]-t[0]);
    d.height = Math.abs(t[3]-t[1]);

    //var moduleWidth = d.width-(d.columnGutter*d.columns-1)/d.columns;
	var gutterTotal = (d.columns-1)*d.columnGutter;
	var moduleWidth = (d.width-(d.marginSide*2)-gutterTotal) / d.columns;
	var moduleHeight = d.baseline*d.fieldHeight;
	var rows = Math.floor(d.height/(moduleHeight+d.microBaseline));
    
    var startX = t[0]; // dont add the margin to the startY
    var startY = t[3]+d.height;

	// BASELINE draw basline grid from top down and fit rows
	var baselineGroup = app.activeDocument.groupItems.add();
	baselineGroup.name = "Baseline: " + d.baseline + "/" + d.microBaseline;
	for (var i = 0; i<d.height/d.microBaseline; i++){
		var shape = baselineGroup.pathItems.add();
		var newY = startY-(i*d.microBaseline);
		shape.setEntirePath([ 
		    [startX,newY],
		    [startX+d.width,newY]
		]);
		shape.closed = false;
		shape.filled = false;
		shape.strokeColor = makeColor(255,0,0);
		shape.strokeWidth = 0.25;
		shape.opacity = 30*(2-(i%2));
	}

	// MODULES 
	var moduleGroup = app.activeDocument.groupItems.add();
	moduleGroup.name = "ModuleGroup: " + moduleWidth +" x "+moduleHeight;

	for (var i=0; i<d.columns; i++){
		for (var j=0; j<rows; j++){
			var nextX = startX+i*(moduleWidth+d.columnGutter)+d.marginSide;
			var nexY = startY-(d.marginTop*d.baseline)-((moduleHeight+d.baseline)*j);
			var rect = moduleGroup.pathItems.rectangle(nexY, nextX, moduleWidth, moduleHeight);
			rect.fillColor = makeColor(0,127,255);
			rect.opacity = 10;
			rect.stroked = false;
		}
	}

	win.close();	
}



})()

/*
var shape = app.activeDocument.pathItems.add();
shape.setEntirePath([ 
		    [0,0],
		    [960,0]
		    ]);
shape.closed = false;
shape.filled = false;
shape.strokeWidth = 0.25;

var rect = app.activeDocument.pathItems.rectangle(0, 0, 960, 50);
rect.fillColor = makeColor(255,0,0);
rect.opacity = 20;
rect.stroked=false;





*/