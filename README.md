Kurounin:Pagination
=================

This package allows you to paginate the subscriptions over meteor's collections. It can be used in a Blaze template or in ReactJS.


Features
--------

+ **Incremental subscriptions**. Downloads only what is needed, not the entire collection at once. Suitable for large datasets.
+ **Instant changes propagation**. Any document changes are instantly propagated, thanks to light-weight modifications of subscription mechanism.
+ **Local cache**. Uses [ccorcos:subs-cache](https://atmospherejs.com/ccorcos/subs-cache) to cache a maximum of 5 subscriptions, for 5 minutes.
+ **Easy integration**. The package works out of the box. Page changes are triggered by a single reactive dictionary variable.
+ **Multiple collections per page**. Each Pagination instance runs independently. You can even create multiple paginations for one collection on a single page.
+ **Bootstrap 3 compatible navigation template**. Blaze template for a bootstrap 3 styled paginator.
+ **Bootstrap 3 compatible navigation react class**. ReactJS class for a bootstrap 3 styled paginator.


# Usage

In your collections file (e.g. lib/collections.js):
```js
MyCollection = new Meteor.Collection('myCollectionName');

```

In your publications file (e.g. server/publications.js):
```js
new Meteor.Pagination(MyCollection);

```

For Blaze template
--------------------------------------------------
In your template file (e.g. client/views/mylist.html):
```html
<template name="myList">
	<div>
    	<ul>
          {{#each documents}}
              <li>Document #{{_id}}</li>
          {{/each}}
        </ul>
        {{> defaultBootstrapPaginator pagination=templatePagination limit=10 containerClass="text-center"}}
	</div>
</template>
```
**[kurounin:pagination-blaze](https://atmospherejs.com/kurounin/pagination-blaze) package is needed for paginator**


In your template javascript file (e.g. client/scripts/mylist.js):
```js
Template.myList.created = function () {
	this.pagination = new Meteor.Pagination(MyCollection, {
        sort: {
            _id: -1
        }
    });
}

Template.myList.helpers({
    templatePagination: function () {
        return Template.instance().pagination;
    },
	documents: function () {
		return Template.instance().pagination.getPage();
	}
});
```

For ReactJS template
--------------------------------------------------
In your view file (e.g. client/views/mylist.jsx):
```html
MyListPage = React.createClass({
    mixins: [ReactMeteorData],

    pagination: new Meteor.Pagination(MyCollection),

    getMeteorData: function() {
        return {
            documents: this.pagination.getPage(),
            ready: this.pagination.ready()
        };
    },

    renderDocument: function(document) {
        return (
        	<li>Document #{document._id}	</li>
        );
    },

    render: function() {
        return (
          <div>
              <ul>
                  {this.data.documents.map(this.renderDocument)}
              </ul>
              <DefaultBootstrapPaginator
                  pagination={this.pagination}
                  limit={10}
                  containerClass="text-center"
                  />
          </div>
        );
    }
});
```
**[kurounin:pagination-reactjs](https://atmospherejs.com/kurounin/pagination-reactjs) package is needed for paginator**


# Client Pagination available settings on init

* `page`: set the initial page, for example the page parameter from url (defaults to **1**)
* `perPage`: set the number of documents to be fetched per page (defaults to **10**)
* `filters`: filters to be applied to the subscription (defaults to **{}**, meaning no filters)
* `fields`: fields to be returned (defaults to **{}**, meaning all fields)
* `sort`: set the sorting for retrieved documents (defaults to **{_id: -1}**)


# Client Pagination available methods

* `currentPage([int])`: get/set the current page
* `perPage([int])`: get/set the number of documents per page
* `filters([Object])`: get/set the current filters
* `fields([Object])`: get/set the retrieved fields
* `sort([Object])`: get/set the sorting order
* `totalItems()`: get the total number of documents
* `totalPages()`: get the total number of pages
* `ready()`: checks if the subscription for the current page is ready
* `getPage()`: returns the documents for the current page


# Blaze Paginator template

A Blaze template is provided to allow navigation through available pages:

```html
{{> defaultBootstrapPaginator pagination=templatePagination limit=10 containerClass="text-center"}}
```
Available template parameters are:
* `pagination`: pagination instance
* `limit`: the maximum number of page links to display
* `containerClass`: optional container class for the paginator


# ReactJS Paginator class

A ReactJS class is provided to allow navigation through available pages:

```js
<DefaultBootstrapPaginator pagination={this.pagination} limit={10} containerClass="text-center" />
```
Available class properties are:
* `pagination`: pagination instance
* `limit`: maximum number of page links to display (defaults to **10**)
* `containerClass`: optional container class for the paginator


### Packages used as inspiration:

 * [alethes:pages](https://atmospherejs.com/alethes/pages) for pagination instantiation 
 * [aida:pagination](https://atmospherejs.com/aida/pagination) for bootstrap paginator template
