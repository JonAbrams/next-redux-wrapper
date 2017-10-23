import React from "react";
import Link from "next/link";
import withSpace from "../src";
import { makeRootSpace } from "../components/rootSpace";

class Page extends React.Component {
  static getInitialProps({ space, isServer, pathname, query }) {
    console.log(
      Page.name,
      "- 2. Cmp.getInitialProps uses the store to dispatch things, pathname",
      pathname,
      "query",
      query
    );

    // If it's a server, then all async actions must be done before return or return a promise
    if (isServer) {
      return new Promise(res => {
        setTimeout(() => {
          space.setState({
            status: "rendered by server"
          });
          res({ custom: "custom server" });
        }, 200);
      });
    }

    // If it's a client, then it does not matter because client can be progressively rendered
    space.setState({ status: "rendered by client" });

    return { custom: "custom client" };
  }

  render() {
    // console.log('5. Page.render');
    return (
      <div>
        <div>Space's tick: {this.props.space.state.tick} (this page)</div>
        <div>Custom: {this.props.custom}</div>
        <Link href="/other">
          <a>Navigate</a>
        </Link>
      </div>
    );
  }
}

withSpace.setDebug(true);

Page = withSpace(makeRootSpace, { status: "not rendered yet" })(Page);

export default Page;
