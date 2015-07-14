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
  extra: {
    type: String,
    label: "Extra"
  },
//  'nestedFieldMultiple' : {
//    type:[Object],
//    label:"multiple city state blocks below"
//  },
//  'nestedFieldMultiple.$.city': {
//    type: String,
//    label: "City",
//    max: 200
//  },
//  'nestedFieldMultiple.$.state': {
//    type: String,
//    label: "State",
//    max: 200
//  },
//  'nestedField' : {
//    type:Object,
//    label:"singly occurring nested field"
//  },
//  'nestedField.city': {
//    type: String,
//    label: "City",
//    max: 200
//  },
//  'nestedField.state': {
//    type: String,
//    label: "State",
//    max: 200
//  }
}));


// todo: try nested elements here and if a problem, ask RE on the discussion forum.

Router.configure({
  layoutTemplate: 'main'
});
Router.route('/', 'showBooks');
Router.route('/new', 'insertBook');
Router.route('/book/:_id', function () {
  Meteor.subscribe('book', this.params._id);
  var item = Books.findOne({_id: this.params._id});
  this.render('editBook', {data: item});
}, {
  name: 'book.show'
});
Router.route('/deleteBook/:_id', function () {
  Meteor.call("deleteBook", this.params._id);
  Router.go('/');
}, {
  name: 'book.delete'
});

Meteor.methods({
  insertBook: function (theBook) {
    console.log('inserting book ', theBook);
    Books.insert(theBook);
    if (Meteor.isClient) {
      Router.go('/');
    }
  },
  deleteBook: function (bookId) {
    console.log('deleting book ', bookId);
    Books.remove({_id: bookId});
    if (Meteor.isClient) {
      Router.go('/');
    }
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
  Template.showBooks.helpers({
    'theBooks': function () {
      console.log("finding books in the helper");
      return Books.find({});
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish("books", function () {
    var foundOnServer = Books.find({}, {sort: {"title": 1}, fields: {"_id": 1, "title": 1, "author": 1 }});
    console.log("returning books")
    return foundOnServer;
  });
  Meteor.publish("book", function (id) {
    var foundOnServer = Books.find({_id:id}, {fields: {"_id": 1, "title": 1, "author": 1, "extra":1 }});
    console.log("returning a single book with full info, id: " + id);
    return foundOnServer;
  });
}