
var editor = ace.edit("editor");

var editorMode = "c_cpp";
var langMapMode = {
  "C++":"c_cpp",
  "C":"c_cpp",
  "Java":"java",
  "Python2.7":"python"
};
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode(`ace/mode/${editorMode}`);
editor.$blockScrolling = Infinity
var Marker;
require(["/js/libs/marker.js"],function(marker_obj){
  var marker = marker_obj.marker;
  marker.session = editor.session;
  marker.session.addDynamicMarker(marker, true);
  Marker = marker;
  var socket = io();

  // var selection = new Selection(editor.getSession());
  editor.session.selection.on("changeCursor",function(){
    console.log("new cursor pos",editor.getCursorPosition());
    var msg = editor.getCursorPosition();
    msg.id = socket.id;
    socket.emit("newCursorPos",msg);
  });

  function patch(e){
      console.log("Change in text",e);
      socket.emit("newPatch",e);
  }

  editor.on("change",patch);
  // editor.session.on("change",function(e){
  //   console.log("session",e);
  // });

  socket.on("connect",function(){
    console.log("Connected to server");
  });

  socket.on("patchText",function(e){
    console.log("Recv a patch from other client");
    editor.off("change",patch);
    editor.session.doc.applyDelta(e);
    editor.on("change",patch);
  });

  socket.on("cursorPosUpdate",function(msg){
    Marker.updateCursor(msg);
  });

  socket.on("newuserJoin",function(msg){
    console.log("Recv new user");
    // var msg = {
    //   text: editor.getValue(),
    //   cursorPosition: editor.getCursorPosition()
    // };
    msg.text = editor.getValue();
    msg.cursorPosition = editor.getCursorPosition();
    msg.cursorPosition.id = socket.id;
    console.log("Sending new user info", msg);
    socket.emit("newuserInfo",msg);
  });

  socket.on("newuserSync",function(msg){
    console.log("Recv sync info from other client",msg);
    if(editor.getValue()===""){
      editor.off("change",patch);
      editor.setValue(msg.text,-1);
      editor.on("change",patch);
    }
    Marker.addCursor({row:msg.cursorPosition.row,column:msg.cursorPosition.column,id:msg.cursorPosition.id});
  });

  socket.on("userdisconnect",function(msg){
    console.log(`user ${msg.id} Disconnected`);
    Marker.deleteCursor(msg.id);
  });

  socket.on("codeResult",function(result){
    console.log("Recv code result",result);
    jQuery("#result").text(`Output: \n${result.output}`);
  });

  socket.on("disconnect",function(){
    console.log("Disconnected from server");
  });


  var langTypeSelect = jQuery("#langType")
  jQuery("#editorForm").on('submit',function(e){
    e.preventDefault();
    console.log("Code to compile");
    console.log(editor.getValue());
    socket.emit("codeToRun",{langType:langTypeSelect.val(),codes:editor.getValue()});//langType needs to be changable
  });


  langTypeSelect.on("change",function(e){
    console.log("user change language to ",langTypeSelect.val());
    if(editorMode !== langMapMode[langTypeSelect.val()]){
      editorMode = langMapMode[langTypeSelect.val()];
      editor.setValue("");
      editor.getSession().setMode(`ace/mode/${editorMode}`);
    }

  });
});
