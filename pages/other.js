import Link from "next/link";
import React from "react";
import { makeRootSpace } from "../components/rootSpace";
import withSpace from "../src";

export default withSpace(makeRootSpace)(({ url: { pathname } }) => (
  <div>
    <div>Using Next.js default prop in a wrapped component: {pathname}</div>
    <nav>
      <Link href="/">
        <a>Navigate to index</a>
      </Link>
    </nav>
  </div>
));
