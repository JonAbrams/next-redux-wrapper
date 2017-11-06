var React = require("react");
var Space = require("spaceace");

var _Promise;
var _debug = false;
var skipMerge = ["initialState", "initialProps", "isServer", "space"];
var DEFAULT_KEY = "__NEXT_SPACEACE_ROOT_SPACE__";
var isBrowser = typeof window !== "undefined";

function initRootSpace(makeRootSpace, cmpName, context, config) {
  var req = context.req;
  var isServer = !!req && !isBrowser;
  var spaceKey = config.spaceKey;

  var options = Object.assign({}, config, {
    isServer: isServer,
    req: req,
    res: context.res,
    query: context.query
  });

  // Always make a new store if server
  if (isServer) {
    if (!req._space) {
      req._space = makeRootSpace({ isServer: isServer, context: context });
    }
    return req._space;
  }

  if (!isBrowser) return null;

  // Memoize store if client
  if (!window[spaceKey]) {
    window[spaceKey] = makeRootSpace({ isServer: isServer, context: context });
  }

  return window[spaceKey];
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return call && (typeof call === "object" || typeof call === "function")
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError(
      "Super expression must either be null or a function, not " +
        typeof superClass
    );
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

module.exports = function(createRootSpace) {
  var config = { spaceKey: DEFAULT_KEY, debug: _debug };

  return function(Cmp) {
    function WrappedCmp() {
      _possibleConstructorReturn(
        this,
        (WrappedCmp.__proto__ || Object.getPrototypeOf(WrappedCmp)).apply(
          this,
          arguments
        )
      );

      var props = this.props;
      var hasSpace = !!props.space && !!props.space.subSpace;

      if (!props.space) {
        throw new Error(
          "Attention, withRootSpace should be used only with top level pages!"
        );
      }

      this.space = hasSpace
        ? props.space
        : initRootSpace(createRootSpace, Cmp.name, {}, config).subSpace(
            Cmp.name
          ); // client case, no context but has initialState

      this.space.setState(props.space.state, "next-spaceace-wrapper-page-init");
    }

    _inherits(WrappedCmp, React.Component);

    WrappedCmp.getInitialProps = function(ctx) {
      return new _Promise(function(res) {
        ctx = ctx || {};
        if (config.debug)
          console.log(
            Cmp.name,
            "- 1. WrappedCmp.getInitialProps wrapper",
            ctx.req && ctx.req._space
              ? "takes the req space"
              : "creates the space"
          );
        ctx.isServer = !!ctx.req;
        ctx.space = initRootSpace(
          createRootSpace,
          Cmp.name,
          { req: ctx.req, query: ctx.query, res: ctx.res },
          config
        ).subSpace(Cmp.name);

        res(
          _Promise.all([
            ctx.isServer,
            ctx.space,
            ctx.req,
            Cmp.getInitialProps ? Cmp.getInitialProps.call(Cmp, ctx) : {}
          ])
        );
      }).then(function(arr) {
        if (config.debug)
          console.log(
            Cmp.name,
            "- 3. WrappedCmp.getInitialProps has space state",
            arr[1].state
          );

        return {
          isServer: arr[0],
          space: arr[1],
          initialProps: arr[3]
        };
      });
    };

    WrappedCmp.prototype.componentDidMount = function() {
      var self = this;

      self._isMounted = true;

      // Subscribe to changes so that it can re-render
      self.space.getRootSpace().subscribe(function() {
        if (!self._isMounted) return;
        self.forceUpdate();
      });
    };

    WrappedCmp.prototype.componentWillUnmount = function() {
      this._isMounted = false;
    };

    WrappedCmp.prototype.render = function() {
      return React.createElement(
        Cmp,
        Object.assign({}, this.props, {
          space: this.space
        })
      );
    };

    return WrappedCmp;
  };
};

module.exports.setPromise = function(Promise) {
  _Promise = Promise;
};

module.exports.setDebug = function(debug) {
  _debug = debug;
};

module.exports.setPromise(Promise);
