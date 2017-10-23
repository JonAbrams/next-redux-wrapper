import Link from "next/link";
import React from "react";
import { makeRootSpace } from "../components/rootSpace";
import withSpace from "../src";

const Foo = withSpace(makeRootSpace)(() => <div>Foo</div>);

export default withSpace(makeRootSpace)(() => (
  <div>
    <div>This component makes an error, this is normal.</div>
    <Foo />
    <nav>
      <Link href="/">
        <a>Navigate to index</a>
      </Link>
    </nav>
  </div>
));
