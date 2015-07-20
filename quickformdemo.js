
Books = new Mongo.Collection("books");
Books.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max: 200
  },
//  author: {
//    type: String,
//    label: "Author"
//  },
  publishDate: {
    type: Date,
    label: "Publish Date"
  },
//  extra: {
//    type: String,
//    label: "Extra"
//  },
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
//  'nestedField': {
//    type: Object,
//    label: "singly occurring nested field"
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

subs = new SubsManager();

Router.configure({
  layoutTemplate: 'main'
});
Router.route('/', {
  action: function () {
    console.log("root action...");
    this.render('showBooks');
  },
  name: 'home',
  waitOn: function () {
    console.log("root waitOn...");
    subs.subscribe('books');
  }
});
Router.route('/new', 'insertBook');
Router.route('/book/:_id', {
  action: function () {
    console.log("/book/:id action, finding the book " + this.params._id);
    var item = Books.findOne({_id: this.params._id});
    console.log("/book/:id action, found book:", item);
    this.render('editBook', {data: item});
  },
  name: 'book.show',
  waitOn: function () {
    console.log("/book/:id waitOn...");
    subs.subscribe('book', this.params._id);
  }
}
);
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
  Template.registerHelper("mdy", function (date) {
    if (date) {
      return moment(date).format('MM/DD/YYYY');
    }
  });

  Template.registerHelper("mdytime", function (date) {
    if (date) {
      return moment(date).format('MM/DD/YYYY h:mm:ss a');
    }
  });



  Template.showBooks.helpers({
    'theBooks': function () {
      console.log("showBooks theBooks helper doing a find of all books...");
      var books = Books.find({});
      console.log("got em");
      return books;
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish("books", function () {
//    console.log("fetching books, but it takes 6  seconds...")
//    Meteor._sleepForMs(6000);
    var foundOnServer = Books.find({}, {sort: {"title": 1}, fields: {"_id": 1, "title": 1, "author": 1, 'publishDate': 1}});
    console.log("returning books")
    return foundOnServer;
  });
  Meteor.publish("book", function (id) {
//    console.log("fetching book " + id + ", waiting 4 sec...")
//    Meteor._sleepForMs(4000);
    var foundOnServer = Books.find({_id: id}, {fields: {"_id": 1, "title": 1, "author": 1, 'publishDate': 1, "extra": 1, "nestedField": 1}});
    console.log("returning a single book with full info, id: " + id);
    return foundOnServer;
  });
}