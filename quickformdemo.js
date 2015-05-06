Books = new Mongo.Collection("books");
Books.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max: 200
  },
  author: {
    type: String,
    label: "Author"
  },  
  'nestedFieldMultiple' : {
    type:[Object],
    label:"multiple city state blocks below"
  },
  'nestedFieldMultiple.$.city': {
    type: String,
    label: "City",
    max: 200
  },
  'nestedFieldMultiple.$.state': {
    type: String,
    label: "State",
    max: 200
  },
  'nestedField' : {
    type:Object,
    label:"singly occurring nested field"
  },
  'nestedField.city': {
    type: String,
    label: "City",
    max: 200
  },
  'nestedField.state': {
    type: String,
    label: "State",
    max: 200
  }
}));


// todo: try nested elements here and if a problem, ask RE on the discussion forum.

Router.configure({
  layoutTemplate: 'main'
});
Router.route('/', 'insertAndShowBooks');
Router.route('/book/:_id', function () {
  var item = Books.findOne({_id: this.params._id});
  this.render('editBook', {data: item});
}, {
  name: 'book.show'
});

Meteor.methods({
  insertBook: function (theBook) {
    console.log('inserting book ', theBook);
    Books.insert(theBook);
  },
  updateBook: function (modifier, id) {
    console.log("updateBook method running updating these fields", modifier);
    console.log("for this document id:", id);
    Books.update(id, modifier);
    if (Meteor.isClient) {
      Router.go('/');
    }
  },
});

if (Meteor.isClient) {
  Meteor.subscribe('books');
  Template.insertAndShowBooks.helpers({
    'theBooks': function () {
      return Books.find({});
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish("books", function () {
    var foundOnServer = Books.find({});
    return foundOnServer;
  });
}