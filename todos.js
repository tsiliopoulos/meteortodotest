Todos = new Mongo.Collection('todos');

// Client
if (Meteor.isClient) {
  Meteor.subscribe('todos');
  //Template Helpers
  Template.main.helpers({
    todos: function () {
      return Todos.find({}, { sort: { createdAt: -1 } });
    }
  });
  
  //Template Events
  Template.main.events({
    "submit .new-todo": function (event) {
      var text = event.target.text.value;
      Meteor.call('addTodo',text);
      
      //clear form
      event.target.text.value = "";
     
      // Prevent Submit
      return false;
    },
    "click .toggle-checked": function (event) {
      Meteor.call('setChecked', this._id, !this.checked );
    },
    "click .delete-todo": function (event) {
      if (confirm('Are You Sure?')) {
        Meteor.call('deleteTodo', this._id);
      }
    }
  });
  
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

// Server
if(Meteor.isServer) {
  Meteor.publish('todos', function(){
    
    if(!this.userId) {
      return Todos.find({userId: this.userId});
    } 
    if(this.username == 'admin')
    {
      console.log('hello admin');
    }
    else {
      return Todos.find({userId: this.userId});
    } 
  });
}


// methods
Meteor.methods ({
  addTodo:function(text){
    if(!Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    } 
    Todos.insert({
        text: text,
        createdAt: new Date(),
        userId: Meteor.userId(),
        username: Meteor.user().username
      });
  },
  deleteTodo:function(todoId){
    var todo = Todos.findOne(todoId);
    if(todo.userId != Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
    Todos.remove(todoId);
  },
  setChecked: function(todoId, setChecked) {
    var todo = Todos.findOne(todoId);
    if(todo.userId != Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
    Todos.update(todoId, { $set: { checked: setChecked } });
  }
});

