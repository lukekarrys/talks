# Backbone Tips and Tricks

## Intro

*Models*
- Key/value bindings
- Built in events
- Easy custom events

*Collections*
- Groups of models
- Built in enumerable functions

*Views*
- Declarative event handling
- Bind API data to DOM (via models, collections)

## Base

Everything I show you can be added to the proper Backbone type (Model, Collection, View) as a base method like so

```
// Replace `Model` with `View` or `Collection`
var BaseModel = Backbone.Model.extend({
  overrideThisFunction: function () {
    // Available to anything extending BaseModel
  }
});
```

## Super

JavaScript doesn't have a way to easily call the parent object method.
But you can stil do it like this:

```
var BaseModel = Backbone.Model.extend({
  set: function () {
    Backbone.Model.prototype.set.apply(this, arguments);
    // And then do some follow up stuff
  }
});
```

## Models

These are helpful ways to augment your base model so that it has everything you need.

### toJSON

Augment a model's properties before sending to the server:

```
var BaseModel = Backbone.Model.extend({
  toJSON: function () {
    var toJSON = Backbone.Model.prototype.toJSON.apply(this, arguments);
    return this.saveAllDistancesAsMiles(toJSON);
  },
  saveAllDistancesAsMiles: function (data) {
    var distancesKeys = ['drivingDistance', 'walkingDistance'];
    _.each(data, function (val, key) {
      if (_.contains(distancesKeys, key)) {
        data[key] = parseFloat(val) * 0.621371;
      }
    });
    return data;
  }
}
});
```

### parse

If you are dealing with legacy APIs or systems you don't control,
parse can help you normalize your data.

```
var BaseModel = Backbone.Model.extend({
  // API is giving us an array sometimes, but we want an object
  parse: function (response) {
    return _.isArray(response) ? response[0] || {} : response;
  }
});
```

## Templating

A huge part of Backbone is rendering data from models to the DOM.
Backbone provides some easy ways to represent Backbone models as objects
which can then be passed to your templating engine of choice.

But!

A lot of times you don't just want to display your data in the DOM.
You want to format it, localize it, etc.

You could use `toJSON` to augment the data again but that would only
be a good choice if we wanted the same augmentations to happen before sending
to the server, which might not be the case.

You could also set more properties on the model, but these would get serialized and
sent to the server which would not be ideal.

For some of our apps, we create a function on the models and collections called

`toTemplate`

### toTemplate

It can exist in much the same way we set up the other functions on our base model.

```
var BaseModel = Backbone.Model.extend({
  toTemplate: function (response) {
    return _.extend(_.clone(this.attributes), this.format());
  },
  format: function () {
    return {
      priceFormat: this.get('currency') + this.get('price')
    }
  }
});

var BaseCollection = Backbone.Collection.extend({
  toTemplate: function (response) {
    return this.map(function (model) { return model.toTemplate(); });
  }
});
```

## Views

As it says in the Backbone docs, views are almost more convention than code.
What that means is that you have a lot of freedom over what Backbone views actually do.
This also means that if you have a certain kind of web app (such as a single page app)
you might end up doing the same thing for each view. This is where a base view comes in.

### basicRender

The real Backbone render is a no-op, meaning it does nothing. You will probably
want your views to do more than nothing!

Our team has established a basicRender function which does exactly what it sounds like.

```
var BaseView = Backbone.View.extend({
  basicRender: function (context) {
    var currentEl = this.el;
    if (this.template) this.setElement(this.template(context || {}));
    $(currentEl).replaceWith(this.el);
    this.hideLoading();
    // Anything else you want to do on every view
    this.handleBindings();
  }
});
```

### handleBindings

You'll notice in basicRender, we call something called handleBindings. A binding
is something we specify on the view in order to say "whenever this property changes,
change this on the DOM".

```
var BaseView = Backbone.View.extend({
  handleBindings: function () {
    var self = this;
    _.each(this.contentBindings || {}, function (selector, key) {
      var func = function () {
            var el = (selector.length > 0) ? self.$(selector) : $(self.el),
                method = el.is('input, select, textarea') ? 'val' : 'html';
            el[method](self.model.get(key));
          };
      self.listenTo(self.model, 'change:' + key, func);
      func();
    });
  }
});

var NewView = BaseView.extend({
  contentBindings: {
    name: 'div.name',
    age: 'span.age',
    lastName: 'input.lastName'
  }
});
```

### pages



```
var PageView = BaseView.extend({
  show: function (animation) {
    $('body').scrollTop(0);
    app.currentPage = this;
    document.title = _.result(this, 'title');
    this.trigger('pageshow');
    return this;
  },
  hide: function () {
    this.showLoading();
    this.trigger('pagehide');
    this.remove();
    return this;
  },
  hideLoading: function () {
    this.$('#pageLoader').hide();
  },
  showLoading: function () {
    this.$('#pageLoader').show();
  }
});

app.renderPage = function (pageView, animation) {
  var container = this.view.$('#pages');
  if (app.currentPage) {
    app.currentPage.hide(animation);
  }
  container.append(pageView.render().el);
  pageView.show(animation);
};
```

### Modals

Modals (or any other oft repeated interface element) can be cumbersome to create
again and again. In this example we create a `renderModal` function that our views
can easily create a modal.

```
var BaseView = Backbone.View.extend({
  renderDialog: function (html, removeCb) {
    var dialog = $(html).addClass(''),
        container = $('body'),
        $current = container.find('.modal');

    if ($current.length > 0) {
      $current.modal('hide');
    }

    container.append(dialog);

    dialog
    .on('click', 'a[data-dismiss]', function (e) {
      e.preventDefault();
      dialog.modal('hide');
    })
    .on('shown', function () {
      dialog.find('[data-focus="0"]').focus();
    })
    .modal('show')
    .on('hidden', function () {
      dialog.remove();
      if (removeCb) removeCb();
    });
    return dialog;
  }
});
```


## Nested Models

One thing I've tried to hack into a Backbone app of mine, was nested models. So Model A
has the the data needed to fetch Model B. A lot of time I ended up with very tightly coupled
models. The initialize functions were a bevy of listeners and events. So we came up with this solution
to try and allow models to have nested models.

The requirements I wanted were:

- Allow a parent model to be notified of events from the child model
- Allow a parent to easily fetch the data from a child
- Customize how a parent needs to setup a child model

```
var BaseModel = Backbone.Model.extend({
  format: function () { return {}; },
  toTemplate: function () {
    return _.extend(_.clone(this.attributes), this.formatChildren(), this.format());
  },
  formatChildren: function () {
    var data = {};
    _.each(this.children || {}, function (value, key) {
      data[key] = this[key].toTemplate();
    }, this);
    return data;
  },
  createChildren: function (children) {
    _.each(children || this.children || {}, function (value, key) {
      // Instantiate child
      this[key] = new value.object(value.attributes || {}, _.extend(value.options || {}, {parent: this}));

      // Broadcast all child events to parent
      this.listenTo(this[key], 'all', function () {
        var _args = _.toArray(arguments),

            childEvents = _args.slice(0, 1).join('').split(':'),
            eventName = childEvents.slice(0, 1),
            listenToEventRest = childEvents.slice(1),
            events = _.flatten([eventName, key, listenToEventRest]).join(':'),

            object = _args.slice(1, 2),
            rest = _args.splice(2),
            args = [events, this].concat(rest).concat(object);

        this.trigger.apply(this, args);
      });

      if (_.isFunction(value.setup)) {
        // Listen to parent sync and setup child
        this.listenTo(this, 'sync', _.bind(value.setup, this, this[key]));
      }
    }, this);
  }
});
```

Then you can do something like this:

```
var ShowModel = BaseModel.extend({
  children: {
    venue: {
      object: Backbone.Model,
      setup: function (venue, show, resp, options) {
        var venueId = show.get('venueId');
        venue.set('id', venueId);
        venue.fetch();
      }
    }
  },
  initialize: function () {
    this.listenTo(this, 'sync:venue', this.renderVenue);
  }
});
```
