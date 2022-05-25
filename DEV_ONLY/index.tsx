/* globals document */

import * as React from "react";

import {
  createCustomEqual,
  circularDeepEqual,
  circularShallowEqual,
  deepEqual,
  shallowEqual,
} from "../src";

document.body.style.backgroundColor = "#1d1d1d";
document.body.style.color = "#d5d5d5";
document.body.style.margin = "0px";
document.body.style.padding = "0px";

const div = document.createElement("div");

div.textContent = "Check the console for details.";

document.body.appendChild(div);

console.group("string");
console.log("true", deepEqual("foo", "foo"));
console.log("false", deepEqual("foo", "bar"));
console.groupEnd();

console.group("number");
console.log("true", deepEqual(123, 123));
console.log("false", deepEqual(123, 234));
console.groupEnd();

console.group("zero");
console.log("true", deepEqual(0, 0));
console.log("true", deepEqual(0, -0));
console.groupEnd();

console.group("Infinity");
console.log("true", deepEqual(Infinity, Infinity));
console.log("false", deepEqual(Infinity, -Infinity));
console.groupEnd();

console.group("null");
console.log("true", deepEqual(null, null));
console.log("false", deepEqual(null, undefined));
console.groupEnd();

console.group("NaN");
console.log("true", deepEqual(NaN, NaN));
console.log("false", deepEqual(NaN, 123));
console.groupEnd();

console.group("array");
console.log("true", deepEqual([1, 2, 3], [1, 2, 3]));
console.log("false", deepEqual([1, 2, 3], [3, 2, 1]));
console.log("false", deepEqual([1, 2, 3], [1, 2, 3, 4]));
console.log("false", deepEqual({}, []));
console.groupEnd();

console.group("deep array");
console.log(
  "true",
  deepEqual([{ foo: "bar" }, { bar: "baz" }], [{ foo: "bar" }, { bar: "baz" }])
);
console.log(
  "false",
  deepEqual([{ foo: "bar" }, { bar: "baz" }], [{ bar: "baz" }, { foo: "bar" }])
);
console.groupEnd();

console.group("date");
console.log("true", deepEqual(new Date(), new Date()));
console.log("false", deepEqual(new Date(), new Date(2017, 0, 1)));
console.groupEnd();

console.group("regexp");
console.log("true", deepEqual(/foo/, /foo/));
console.log("false", deepEqual(/foo/, /foo/g));
console.groupEnd();

console.group("promise");
const promise = Promise.resolve("foo");

console.log(true, deepEqual({ promise }, { promise }));
console.log(false, deepEqual({ promise }, { promise: Promise.resolve("foo") }));
console.groupEnd();

console.group("map deep");

console.log(
  "true",
  deepEqual(
    new Map().set("foo", "bar").set("bar", { baz: "baz" }),
    new Map().set("foo", "bar").set("bar", { baz: "baz" })
  )
);
console.log(
  "false",
  deepEqual(
    new Map().set("foo", "bar").set("bar", { baz: "baz" }),
    new Map().set("foo", "bar").set("bar", { baz: "quz" })
  )
);
console.log(
  "true",
  deepEqual(
    new Map().set("foo", { bar: "baz" }).set("bar", "baz"),
    new Map().set("bar", "baz").set("foo", { bar: "baz" })
  )
);
console.log(
  "false",
  deepEqual(
    new Map([
      ["key1", "foo"],
      ["key2", "bar"],
    ]),
    new Map([
      ["key1", "bar"],
      ["key2", "foo"],
    ])
  )
);

console.groupEnd();

console.group("map shallow");
console.log(
  "true",
  shallowEqual(
    new Map().set("foo", "bar").set("bar", "baz"),
    new Map().set("foo", "bar").set("bar", "baz")
  )
);
console.log(
  "false",
  shallowEqual(
    new Map().set("foo", { bar: "baz" }).set("bar", "baz"),
    new Map().set("foo", { bar: "baz" }).set("bar", "baz")
  )
);
console.log(
  "true",
  shallowEqual(
    new Map().set("foo", "bar").set("bar", "baz"),
    new Map().set("bar", "baz").set("foo", "bar")
  )
);
console.log(
  "false",
  shallowEqual(
    new Map([
      ["key1", "foo"],
      ["key2", "bar"],
    ]),
    new Map([
      ["key1", "bar"],
      ["key2", "foo"],
    ])
  )
);

console.groupEnd();

console.group("set");

console.log("true", deepEqual(new Set().add("bar"), new Set().add("bar")));
console.log("false", deepEqual(new Set().add("bar"), new Set().add("baz")));

console.groupEnd();

console.group("object");
console.log(
  "true",
  deepEqual(
    { some: { deeply: { nested: "value" } } },
    { some: { deeply: { nested: "value" } } }
  )
);
console.log(
  "false",
  deepEqual(
    { some: { deeply: { nested: "value" } } },
    { some: { deeply: { nested: "thing" } } }
  )
);
console.groupEnd();

console.group("custom");

const object1 = {
  deep: {
    deeper: {
      three: 3,
    },
    two: 2,
  },
  zero: 0,
};

const object2 = {
  deep: {
    deeper: {
      three: 3,
    },
    two: 2,
  },
  zero: 0,
};

const object3 = {
  deep: {
    deeper: {
      one: 1,
    },
    two: 2,
  },
  zero: 0,
};

const object4 = {
  deep: {
    deeper: {
      three: 3,
    },
    two: 2,
  },
  zero: 0,
};

type Comparator = <A, B>(a: A, b: B) => boolean;

const isNotDeeplyOne = (comparator: Comparator) => (a: any, b: any) => {
  if (typeof a === "number" || typeof b === "number") {
    return a !== 1 && b !== 1;
  }

  return Object.keys(a).every((key) => comparator(a[key], b[key]));
};

const doesNotEverEqualOne = createCustomEqual({ isEqual: isNotDeeplyOne });

console.log("true", doesNotEverEqualOne(object1, object2));
console.log("false", doesNotEverEqualOne(object3, object4));
console.groupEnd();

console.group("circular object");

const cache = new WeakMap();

const isDeepEqualCircular = createCustomEqual({
  isEqual: (comparator) => (a, b) => {
    if (cache.has(a) || cache.has(b)) {
      return cache.get(a) === cache.get(b);
    }

    if (typeof a === "object") {
      cache.set(a, b);
    }

    if (typeof b === "object") {
      cache.set(b, a);
    }

    return comparator(a, b);
  },
});

interface Circular {
  me: {
    deeply: {
      nested: {
        reference: Circular;
      };
    };
    value: string;
  };
}

class Circular {
  me: {
    deeply: {
      nested: {
        reference: Circular;
      };
    };
    value: string;
  };

  constructor(value: string) {
    this.me = {
      deeply: {
        nested: {
          reference: this,
        },
      },
      value,
    };
  }
}

console.log(
  "true",
  circularDeepEqual(new Circular("foo"), new Circular("foo"))
);
console.log(
  "false",
  circularDeepEqual(new Circular("foo"), new Circular("bar"))
);
console.log("false", circularDeepEqual(new Circular("foo"), { foo: "baz" }));

console.groupEnd();

console.group("circular array");

const array: any[] = ["foo"];

array[1] = array;

console.log("true", circularShallowEqual(array, ["foo", array]));
console.log("false", circularShallowEqual(array, [array]));

console.groupEnd();

console.group("react small");

console.log("true", deepEqual(<div>foo</div>, <div>foo</div>));
console.log("false", deepEqual(<div>foo</div>, <div>bar</div>));

console.groupEnd();

console.group("react large");

console.log(
  "true",
  deepEqual(
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 auto" }}>Item</div>
        <div style={{ flex: "1 1 0" }}>Item</div>
      </div>
    </main>,
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 auto" }}>Item</div>
        <div style={{ flex: "1 1 0" }}>Item</div>
      </div>
    </main>
  )
);
console.log(
  "false",
  deepEqual(
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 auto" }}>Item</div>
        <div style={{ flex: "1 1 0" }}>Item</div>
      </div>
    </main>,
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Other Content</p>

      <div style={{ display: "flex" }}>
        <div style={{ flex: "1 1 auto" }}>Item</div>
        <div style={{ flex: "1 1 0" }}>Item</div>
      </div>
    </main>
  )
);

console.groupEnd();
