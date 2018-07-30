// bridge talk example
// https://forums.adobe.com/thread/1243877
#target Illustrator
#targetengine main

(function () {
/////////////////////////////////////////
// MAKE THE PANEL STUFF
/////////////////////////////////////////
var win = new Window( "palette", "Modular Grid Creator", undefined);
//var dialog = new Window( "dialog", "Modular Grid Creator", undefined);

var panel = win.add( "panel", undefined, "Grid Parameters");
panel.alignChildren = "left";

panel.group0 = panel.add('group');

panel.stWidth = panel.group0.add ("statictext", undefined, "New Artboard Width / Height");
panel.etWidth = panel.group0.add ("edittext", undefined, "1920");
//panel.stHeight = panel.group0.add ("statictext", undefined, "Canvas Height");
panel.etHeight = panel.group0.add ("edittext", undefined, "1080");

panel.groupC = panel.add('group');

var ckCreateNewArtboard = panel.groupC.add ("checkbox" , undefined, "Create New Artboard");
ckCreateNewArtboard.value = true;

panel.group1 = panel.add('group');

panel.stColumns = panel.group1.add ("statictext", undefined, "Columns");
panel.etColumns = panel.group1.add ("edittext", undefined, "12");
panel.etColumns.characters = 3;
panel.stColumnGutter = panel.group1.add ("statictext", undefined, "Column Gutter");
panel.etColumnGutter = panel.group1.add ("edittext", undefined, "24");
panel.etColumnGutter.characters = 3;

panel.groupA = panel.add('group');

panel.stRows = panel.groupA.add ("statictext", undefined, "Rows");
panel.etRows = panel.groupA.add ("edittext", undefined, "8");
panel.etRows.characters = 3;
panel.stRowGutter = panel.groupA.add ("statictext", undefined, "Row Gutter");
panel.etRowGutter = panel.groupA.add ("edittext", undefined, "24");
panel.etRowGutter.characters = 3;

panel.group2 = panel.add('group');

panel.stMarginTop = panel.group2.add ("statictext", undefined, "Margin Top, Right, Bottom, Left");
panel.etMarginTop = panel.group2.add ("edittext", undefined, "96");
panel.etMarginTop.characters = 3;
//panel.stMarginRight = panel.group2.add ("statictext", undefined, "Margin Right");
panel.etMarginRight = panel.group2.add ("edittext", undefined, "96");
panel.etMarginRight.characters = 3;
//panel.stMarginBottom = panel.group2.add ("statictext", undefined, "Margin Bottom");
panel.etMarginBottom = panel.group2.add ("edittext", undefined, "96");
panel.etMarginBottom.characters = 3;
//panel.stMarginLeft = panel.group2.add ("statictext", undefined, "Margin Left");
panel.etMarginLeft = panel.group2.add ("edittext", undefined, "96");
panel.etMarginLeft.characters = 3;

panel.group3 = panel.add('group');


var btnBuildGrid = panel.group3.add( "button", undefined, "Build Grid");
btnBuildGrid.active=true;

var btnCancel = panel.group3.add('button', undefined, 'Cancel');
//panel.group3.add( "button", undefined, "Cancel", { name: "Cancel" } );


ckCreateNewArtboard.onClick = function(){
    if(ckCreateNewArtboard.value==true){
        panel.etWidth.enabled = true;
        panel.etHeight.enabled = true;
        panel.stWidth.enabled = true;
        //panel.stHeight.enabled = true;
    } else {
        panel.etWidth.enabled = false;
        panel.etHeight.enabled = false;
        panel.stWidth.enabled = false;
        //panel.stHeight.enabled = false;

    }
}

btnCancel.onClick = function(){
    win.close();
}

btnBuildGrid.onClick = function() {
    //alert("button Clicked");
    buildMsg();
}


function buildMsg(){
    //alert("buildMsg");
    var bt = new BridgeTalk;
    bt.target = "illustrator";
    var params = {
        width : parseInt(panel.etWidth.text),
        height : parseInt(panel.etHeight.text),
        columns : parseInt(panel.etColumns.text),
        columnGutter : parseInt(panel.etColumnGutter.text),
        rows : parseInt(panel.etRows.text),
        rowGutter : parseInt(panel.etRowGutter.text),
        marginTop : parseInt(panel.etMarginTop.text),
        marginRight : parseInt(panel.etMarginRight.text),
        marginBottom : parseInt(panel.etMarginBottom.text),
        marginLeft : parseInt(panel.etMarginLeft.text),
        ckCreateNewArtboard : ckCreateNewArtboard.value
    };
    //var msg = buildGrid + '\rbuildGrid();';
    //alert(buildGrid + "buildGrid("+params.toSource()+");");
    var msg = buildGrid + "buildGrid("+params.toSource()+");";
    bt.body = msg;
    bt.send();  
}


function buildGrid(gridParams) {


    function makeColor(r,g,b){
        var c = new RGBColor();
        c.red   = r;
        c.green = g;
        c.blue  = b;
        return c;
    }

    function getValidNum(val) {
      var num = parseInt(val);
      if (isNaN(num))
        return 0;

      return num;
    }

    var doc = app.activeDocument;
    var lastArtboard = doc.artboards[doc.artboards.length-1];
    var activeArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var p = doc.pathItems; //app.activeDocument.pathItems is where we draw things.
    

    // check if we need to create a new artboard
    if (gridParams.ckCreateNewArtboard == true){
        var width = gridParams.width;
        var height = gridParams.height;
        var artboardPadding = 10;
        var x1 = lastArtboard.artboardRect[2]+artboardPadding;
        var y1 = lastArtboard.artboardRect[1];
        var x2 = x1 + width;
        var y2 = y1 - height;
        doc.artboards.add([x1, y1, x2, y2]);
        // make the artboard
    } else {
        //do some math to get the width and height of the active artboard
        var width = activeArtboard.artboardRect[2]-activeArtboard.artboardRect[0];
        var height = -(activeArtboard.artboardRect[3]-activeArtboard.artboardRect[1]);
        var x1 = activeArtboard.artboardRect[0];
        var y1 = activeArtboard.artboardRect[1];
        var x2 = activeArtboard.artboardRect[2];
        var y2 = activeArtboard.artboardRect[3];
        //get the activeArtboard dimensions 
    }

    // Do the calcs
    var marginTop = gridParams.marginTop;
    var marginBottom = gridParams.marginBottom;
    var marginLeft = gridParams.marginLeft;
    var marginRight = gridParams.marginRight;

    var availableHeight = height-marginTop-marginBottom;
    var availableWidth = width-marginLeft-marginRight;
    var columns = gridParams.columns;
    var columnGutter= gridParams.columnGutter;
    var rows = gridParams.rows;
    var rowGutter=gridParams.rowGutter;
    var moduleWidth = (availableWidth-(columnGutter*(columns-1)))/columns;
    var moduleHeight = (availableHeight-(rowGutter*(rows-1)))/rows;

    var moduleGroup = doc.groupItems.add();
    moduleGroup.name = "Module Group: " + moduleWidth +"x"+moduleHeight;

    // Make the modules
    for (var i=0; i<columns; i++){
        for (var j=0; j<rows; j++){
            var x = marginLeft+(moduleWidth*i)+(columnGutter*i)+x1;
            var y = availableHeight+marginBottom-(moduleHeight*j)-(columnGutter*j)-height+y1;
            var rect = moduleGroup.pathItems.rectangle(y, x, moduleWidth, moduleHeight);
            rect.strokeColor = makeColor(255,0,0);
        }
    }
};
win.show();



})()


