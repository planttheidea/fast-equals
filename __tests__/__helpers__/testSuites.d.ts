interface Test {
  deepEqual: boolean;
  description: string;
  shallowEqual: boolean;
  value1: any;
  value2: any;
}

interface TestSuite {
  description: string;
  tests: Test[];
}

const testSuites: TestSuite[];

export default testSuites;
