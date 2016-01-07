var Pagination = (function () {
    function Pagination(collection, settings) {
        if (!(this instanceof Meteor.Pagination)) {
            throw new Meteor.Error(4000, "The Meteor.Pagination instance has to be initiated with `new`");
        }

        this.collection = collection;
        this.settings = new ReactiveDict();
        settings = _.extend(
            {
                page: 1,
                perPage: 10,
                router: true,
                routename: "pagination",
                routeparams: "page",
                filters: {},
                fields: {},
                sort: { _id: 1 }
            },
            settings || {}
        );

        this.subsCache = new SubsCache({
            expireAfter: 5, // minutes
            cacheLimit: 5 // number of subscriptions
        });

        if (!this.currentPage()) {
            var pageparams = new Function('return Router.current().params.' + settings.routeparams + ';'); //Return a dynamic Route Params Name
            if(settings.router && pageparams()) { //Check if using Router and existing Page Number
                this.currentPage(pageparams());
            } else {
                this.currentPage(settings.page);
            }
        }

        if (!this.perPage()) {
            this.perPage(settings.perPage);
        }
        
        if (!this.router()) {
            this.router(settings.router);
        }
        
        if (!this.routename()) {
            this.routename(settings.routename);
        }
        
        if (!this.filters()) {
            this.filters(settings.filters);
        }

        if (!this.fields()) {
            this.fields(settings.fields);
        }

        if (!this.sort()) {
            this.sort(settings.sort);
        }

        if (!this.ready()) {
            this.ready(false);
        }
    }

    Pagination.prototype.currentPage = function (page) {
        if (arguments.length === 1) {
            if (this.settings.get("page") !== page && page >= 1) {
                this.settings.set("page", page);
            }
        } else {
            return this.settings.get("page");
        }
    };

    Pagination.prototype.perPage = function (perPage) {
        if (arguments.length === 1) {
            if (this.settings.get("perPage") !== perPage) {
                this.settings.set("perPage", perPage);
            }
        } else {
            return this.settings.get("perPage");
        }
    };
    
    Pagination.prototype.router = function (router) {
        if (arguments.length === 1) {
            if (this.settings.get("router") !== router) {
                this.settings.set("router", router);
            }
        } else {
            return this.settings.get("router");
        }
    };
    
    Pagination.prototype.routename = function (routename) {
        if (arguments.length === 1) {
            if (this.settings.get("routename") !== routename) {
                this.settings.set("routename", routename);
            }
        } else {
            return this.settings.get("routename");
        }
    };
    
    Pagination.prototype.filters = function (filters) {
        if (arguments.length === 1) {
            filters = !_.isEmpty(filters) ? filters : {};
            this.settings.set("filters", filters);
        } else {
            return this.settings.get("filters");
        }
    };

    Pagination.prototype.fields = function (fields) {
        if (arguments.length === 1) {
            this.settings.set("fields", fields);
        } else {
            return this.settings.get("fields");
        }
    };

    Pagination.prototype.sort = function (sort) {
        if (arguments.length === 1) {
            this.settings.set("sort", sort);
        } else {
            return this.settings.get("sort");
        }
    };

    Pagination.prototype.totalItems = function (totalItems) {
        if (arguments.length === 1) {
            this.settings.set("totalItems", totalItems);

            if (this.currentPage() > 1 && totalItems <= this.perPage() * this.currentPage()) {
                // move to last page available
                this.currentPage(this.totalPages());
            }
        } else {
            return this.settings.get("totalItems");
        }
    };

    Pagination.prototype.totalPages = function () {
        var totalPages = this.totalItems() / this.perPage();

        return Math.ceil(totalPages ? totalPages : 1);
    };

    Pagination.prototype.ready = function (ready) {
        if (arguments.length === 1) {
            this.settings.set("ready", ready);
        } else {
            return this.settings.get("ready");
        }
    };

    Pagination.prototype.getPage = function() {
        var options = {
                fields: this.fields(),
                sort: this.sort(),
                skip: (this.currentPage() - 1) * this.perPage(),
                limit: this.perPage()
            },
            handle = this.subsCache.subscribe(
                this.collection._name,
                this.filters(),
                options
            ),
            query = {};

        this.ready(handle.ready());
        if (handle.ready()) {
            this.totalItems(Counts.get('sub_count_' + handle.sub.subscriptionId));
        }

        query['sub_' + handle.sub.subscriptionId] = 1;
        return this.collection.find(query, {fields: this.fields(), sort: this.sort()}).fetch();
    };

    return Pagination;
})();

Meteor.Pagination = Pagination;
