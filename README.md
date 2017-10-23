SpaceAce wrapper for Next.js
=========================
![Build status](https://travis-ci.org/JonAbrams/next-spaceace-wrapper.svg?branch=master)

## Status

WIP. DO NOT USE (yet). So far just the readme's been touched.

Forked from [next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper)

## Usage

```bash
npm install next-spaceace-wrapper
```

Wrapper should be attached your page components (located in your project's `/pages`). For safety it is recommended that you wrap all pages, whether they use SpaceAce or not.

Here is an example minimal setup:
```js
import React, {Component} from "react";
import withSpace from "next-spaceace-wrapper";

/**
* @param {object} initialState
* @param {boolean} options.isServer indicates whether it is a server side or client side
* @param {Request} options.req NodeJS Request object (if any)
* @param {boolean} options.debug User-defined debug mode param
* @param {string} options.storeKey This key will be used to preserve store in global namespace for safe HMR
*/
const makeRootSpace = () => {
    return new Space({ env: process.env.NODE_ENV });
};

class Page extends Component {
    static getInitialProps({space, isServer, pathname, query}) {
        space.setState({ foo: bar }); // component will be able to read from space's state when rendered
        return { custom: 'custom' }; // you can pass some custom props to component from here
    }
    render() {
        const { space } = this.props;
        const rootSpace = space.parentSpace('root');
        return (
            <div>
                <div>Value from page's Space {space.state.foo}</div>
                <div>Value from root space {rootSpace.state.env}</div>
                <div>Prop from getInitialProps {this.props.custom}</div>
            </div>
        )
    }
}

// It's recommended to import `makeRootSpace` from a speparate module
// so that it can be shared between pages
// The second parameter to withSpace is the initial state for the page
Page = withSpace(makeRootSpace, { foo: '' })(Page);

export default Page;
```

## How it works

When you page component is wrapped by `withSpace`, it auto-creates the root space when `getInitialProps` is called by Next.js along with a sub-space dedicated to the page component (with the same name as the component). The page's space is passed down to the page's component as a prop called `space`. On the client side it also takes care of using same root space every time, whereas on server a new root space is created for each request, which is then set on the client.

The `withSpace` function accepts a `makeRootSpace` function as first argument. The `makeRootSpace` function will receive initial state as the first argument and should return a new instance `Space` each time when called, no memoization needed here, it is automatically handled by the `withSpace` wrapper. Pass the desired initial state for the page's space as the second parameter when calling `withSpace`.

`withSpace` also optionally accepts an object. In this case only 1 parameter is passed which can contain the following
configuration properties:

- `createRootSpace` (required, function) : the `makeRootSpace` function as described above
- `rootSpaceKey` (optional, string) : the key used on `window` to persist the root space on the client
- `debug` (optional, boolean) : enable debug logging

When `makeRootSpace` is invoked it is also provided a configuration object as the second parameter, which includes:

- `isServer` (boolean): `true` if called while on the server rather than the client
- `req` (Request): The `next.js` `getInitialProps` context `req` parameter
- `query` (object): The `next.js` `getInitialProps` context `query` parameter

The object also includes all configuration as passed to `withSpace` if called with an object of configuration properties.

**Use `withSpaceAce` to wrap only top level pages! All other components should keep using `subSpace(…)`**

Although it is possible to create server or client specific logic in both `createRootSpace` function and `getInitialProps` it is highly recommended to not have different behaviour. This may cause errors and checksum mismatches which in turn will ruin the whole purpose of server rendering.

I don't recommend to using `withSpace` in both top level pages and `_document.js` files, Next.JS [does not provide](https://github.com/zeit/next.js/issues/1267) a reliable way to determine the sequence when components will be rendered. So per Next.JS recommendation it is better to have just data-agnostic things in `_document` and wrap top level pages with another [HOC](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e) that will use `withSpace`.

## Async data in `getInitialProps`

```js
function getInitialProps({store, isServer, pathname, query}) {
    const startingDataPromise = fetch(…).then(res => res.json());

    // once the data arrives we can resume and render the app
    return startingDataPromise.then((startingData) => {
        space.setState({ userId: startingData.userId });
        return {custom: 'custom'};
    });

}
```

## Resources

* [SpaceAce](https://github.com/JonAbrams/SpaceAce)
* [next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper)
