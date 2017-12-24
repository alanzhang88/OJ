// marker
//thanks to https://stackoverflow.com/questions/24807066/multiple-cursors-in-ace-editor
define(function (require, exports, module) {
var marker = {};
marker.cursors = [];//{row: 1, column: 10, id:"asdasdasd"}
marker.update = function(html, markerLayer, session, config) {
    var start = config.firstRow, end = config.lastRow;
    var cursors = this.cursors;
    for (var i = 0; i < cursors.length; i++) {
        var pos = this.cursors[i];
        if (pos.row < start) {
            continue;
        } else if (pos.row > end) {
            break;
        } else {
            // compute cursor position on screen
            // this code is based on ace/layer/marker.js
            var screenPos = session.documentToScreenPosition(pos);

            var height = config.lineHeight;
            var width = config.characterWidth;
            var top = markerLayer.$getTop(screenPos.row, config);
            var left = markerLayer.$padding + screenPos.column * width;
            // can add any html here
            html.push(
                "<div class='MyCursorClass' style='",
                "height:", height, "px;",
                "top:", top, "px;",
                "left:", left, "px; width:", width, "px'></div>"
            );
        }
    }
}
marker.redraw = function() {
   this.session._signal("changeFrontMarker");
}
marker.addCursor = function(cursor) {
    // add to this cursors
    marker.cursors.push(cursor);
    // trigger redraw
    marker.redraw();
}
marker.deleteCursor = function(socket_id){
  marker.cursors = marker.cursors.filter((cursor)=>{
    return cursor.id !== socket_id;
  });
  marker.redraw();
}
marker.updateCursor = function(cursor){
  var i = 0
  for( ; i < marker.cursors.length; i++){
    if(marker.cursors[i].id === cursor.id){
      marker.cursors[i] = cursor;
      break;
    }
  }
  if (i === marker.cursors.length){
    marker.addCursor(cursor);
  }
  marker.redraw();
}
// marker.session = editor.session;
// marker.session.addDynamicMarker(marker, true)
// call marker.session.removeMarker(marker.id) to remove it
// call marker.redraw after changing one of cursors

module.exports = {marker};
})
