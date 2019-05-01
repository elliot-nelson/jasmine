getJasmineRequireObj().SpyStrategy = function(j$) {

  /**
   * @interface SpyStrategy
   */
  function SpyStrategy(options) {
    options = options || {};

    /**
     * Get the identifying information for the spy.
     * @name SpyStrategy#identity
     * @member
     * @type {String}
     */
    this.identity = options.name || 'unknown';
    this.originalFn = options.fn || function() {};
    this.getSpy = options.getSpy || function() {};
    this.plan = this._defaultPlan = function() {};

    var k, cs = options.customStrategies || {};
    for (k in cs) {
      if (j$.util.has(cs, k) && !this[k]) {
        this[k] = createCustomPlan(cs[k]);
      }
    }
  }

  function createCustomPlan(factory) {
    return function() {
      var plan = factory.apply(null, arguments);

      if (!j$.isFunction_(plan)) {
        throw new Error('Spy strategy must return a function');
      }

      this.plan = plan;
      return this.getSpy();
    };
  }

  /**
   * Execute the current spy strategy.
   * @name SpyStrategy#exec
   * @function
   */
  SpyStrategy.prototype.exec = function(context, args) {
    return this.plan.apply(context, args);
  };

  /**
   * Tell the spy to call through to the real implementation when invoked.
   * @name SpyStrategy#callThrough
   * @function
   */
  SpyStrategy.prototype.callThrough = function() {
    this.plan = this.originalFn;
    return this.getSpy();
  };

  /**
   * Tell the spy to return the value when invoked.
   * @name SpyStrategy#returnValue
   * @function
   * @param {*} value The value to return.
   */
  SpyStrategy.prototype.returnValue = function(value) {
    this.plan = function() {
      return value;
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to return one of the specified values (sequentially) each time the spy is invoked.
   * @name SpyStrategy#returnValues
   * @function
   * @param {...*} values - Values to be returned on subsequent calls to the spy.
   */
  SpyStrategy.prototype.returnValues = function() {
    var values = Array.prototype.slice.call(arguments);
    this.plan = function () {
      return values.shift();
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to return a promise resolving to the specified value when invoked.
   * @name SpyStrategy#resolveValue
   * @function
   * @param {*} value The value to return.
   */
  SpyStrategy.prototype.resolveValue = function(value) {
    var global = j$.getGlobal();

    if (!global.Promise) {
      throw new Error('resolveValue is unavailable because the environment does not support promises.');
    }

    this.plan = function() {
      return global.Promise.resolve(value);
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to return a promise resolving to one of the specified values (sequentially) when invoked.
   * @name SpyStrategy#resolveValues
   * @function
   * @param {...*} values - Values to be returned on subsequent calls to the spy.
   */
  SpyStrategy.prototype.resolveValues = function() {
    var global = j$.getGlobal();

    if (!global.Promise) {
      throw new Error('resolveValues is unavailable because the environment does not support promises.');
    }

    var values = Array.prototype.slice.call(arguments);
    this.plan = function () {
      return global.Promise.resolve(values.shift());
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to return a promise rejecting with the specified value when invoked.
   * @name SpyStrategy#rejectValue
   * @function
   * @param {*} value The value to return.
   */
  SpyStrategy.prototype.rejectValue = function(value) {
    var global = j$.getGlobal();

    if (!global.Promise) {
      throw new Error('rejectValue is unavailable because the environment does not support promises.');
    }

    this.plan = function() {
      return global.Promise.reject(value);
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to return a promise reject with one of the specified values (sequentially) when invoked.
   * @name SpyStrategy#rejectValues
   * @function
   * @param {...*} values - Values to be returned on subsequent calls to the spy.
   */
  SpyStrategy.prototype.rejectValues = function() {
    var global = j$.getGlobal();

    if (!global.Promise) {
      throw new Error('rejectValues is unavailable because the environment does not support promises.');
    }

    var values = Array.prototype.slice.call(arguments);
    this.plan = function () {
      return global.Promise.reject(values.shift());
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to throw an error when invoked.
   * @name SpyStrategy#throwError
   * @function
   * @param {Error|String} something Thing to throw
   */
  SpyStrategy.prototype.throwError = function(something) {
    var error = (something instanceof Error) ? something : new Error(something);
    this.plan = function() {
      throw error;
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to call a fake implementation when invoked.
   * @name SpyStrategy#callFake
   * @function
   * @param {Function} fn The function to invoke with the passed parameters.
   */
  SpyStrategy.prototype.callFake = function(fn) {
    if(!(j$.isFunction_(fn) || j$.isAsyncFunction_(fn))) {
      throw new Error('Argument passed to callFake should be a function, got ' + fn);
    }
    this.plan = fn;
    return this.getSpy();
  };

  /**
   * Tell the spy to call the specified fake implementations (sequentially) each time the spy is invoked.
   * @name SpyStrategy#callFakes
   * @function
   * @param {...*} fns - Functions to invoke with the passed parameters.
   */
  SpyStrategy.prototype.callFakes = function() {
    var fns = Array.prototype.slice.call(arguments);
    this.plan = function () {
      return fns.shift().apply(this, arguments);
    };
    return this.getSpy();
  };

  /**
   * Tell the spy to do nothing when invoked. This is the default.
   * @name SpyStrategy#stub
   * @function
   */
  SpyStrategy.prototype.stub = function(fn) {
    this.plan = function() {};
    return this.getSpy();
  };

  SpyStrategy.prototype.isConfigured = function() {
    return this.plan !== this._defaultPlan;
  };

  return SpyStrategy;
};
