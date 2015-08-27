
Books = new Mongo.Collection("books");
Books.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max: 200
  },
   'yesOrNo': {
    type: String,
    optional: true,
    label: "Yes or no, you decide",
    autoform: {
      type: 'select-radio',
      options: function () {
        return [
          {label: "Yes", value: "Yes"},
          {label: "No", value: "No"},
        ]
      }
    }
  },
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
  data: function () {
    var id = this.params._id;
    console.log("/book/:id data," + id);
    return {_id: id};
  },
  name: 'book.show',
  template: 'editBook',
  onRun: function () {
    var id = this.params._id;
    console.log("on run, log a view of book " + id);
    this.next();
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


  Template.editBook.onCreated(function () {
    console.log("template edit book on created!");
    var self = this;
    // Use self.subscribe with the data context reactively
    self.autorun(function () {
      var dataContext = Template.currentData();
      var id = dataContext._id;
      console.log("self autorun, subbing to book id: " + id);
      subs.subscribe('book', id);
    });
  });
  
  Template.editBook.helpers( {
    theBook: function () {
      var dataContext = Template.currentData();
      var id = dataContext._id;
      console.log("theBook helper for id: " + id);
      return Books.findOne({_id:id});
    }
  })

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
    var foundOnServer = Books.find({}, {sort: {"title": 1}});
    console.log("returning books")
    return foundOnServer;
  });
  Meteor.publish("book", function (id) {
//    console.log("fetching book " + id + ", waiting 4 sec...")
//    Meteor._sleepForMs(4000);
    var foundOnServer = Books.find({_id: id});
    console.log("returning a single book with full info, id: " + id);
    return foundOnServer;
  });
}