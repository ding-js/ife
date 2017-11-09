declare module '*.vue' {
  import Vue from 'vue';
  const component: any;
  export default component;
  // export default typeof Vue;
}

declare module '*.jpg' {
  const uri: string;
  export default uri;
}

declare const process: any;
