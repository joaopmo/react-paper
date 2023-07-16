import{R as e}from"./index-8db94870.js";import{B as W,w as p,r as m,m as n,T as c}from"./TextComponent-637f864d.js";import"./_commonjsHelpers-042e6b4d.js";function s(){const{register:r}=W();return e.createElement("div",{...r()},e.createElement("img",{src:"https://picsum.photos/seed/123456789/200/300",alt:"random image"}))}function o({pageWidth:r}){return e.createElement(p,{pageWidth:r},e.createElement(m,null,e.createElement(n,{element:e.createElement(c,null)}),e.createElement(n,{element:e.createElement(s,null),content:"block"})))}try{o.displayName="SingleColumn",o.__docgenInfo={description:"",displayName:"SingleColumn",props:{pageWidth:{defaultValue:null,description:"",name:"pageWidth",required:!0,type:{name:"number"}}}}}catch{}function u({pageWidth:r}){return e.createElement(p,{pageWidth:r},e.createElement(m,null,e.createElement(n,{element:e.createElement(c,null)}),e.createElement(n,{element:e.createElement(s,null),content:"block"})),e.createElement(m,null,e.createElement(n,{element:e.createElement(s,null),content:"block"}),e.createElement(n,{element:e.createElement(c,null)})))}try{u.displayName="DoubleColumn",u.__docgenInfo={description:"",displayName:"DoubleColumn",props:{pageWidth:{defaultValue:null,description:"",name:"pageWidth",required:!0,type:{name:"number"}}}}}catch{}const x={component:o,argTypes:{pageWidth:{control:{type:"number",min:.1,max:1,step:.1}}}},t={render:r=>e.createElement(p,{...r}),args:{pageWidth:.5}},a={render:r=>e.createElement(o,{...r}),args:{pageWidth:.5}},l={render:r=>e.createElement(u,{...r}),args:{pageWidth:.5}};var i,d,g;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => {
    return <Paper {...args} />;
  },
  args: {
    pageWidth: 0.5
  }
}`,...(g=(d=t.parameters)==null?void 0:d.docs)==null?void 0:g.source}}};var E,_,C;a.parameters={...a.parameters,docs:{...(E=a.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: args => {
    return <SingleColumnComponent {...args} />;
  },
  args: {
    pageWidth: 0.5
  }
}`,...(C=(_=a.parameters)==null?void 0:_.docs)==null?void 0:C.source}}};var h,y,b;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: args => {
    return <DoubleColumnComponent {...args} />;
  },
  args: {
    pageWidth: 0.5
  }
}`,...(b=(y=l.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};const N=["Empty","SingleColumn","DoubleColumn"];export{l as DoubleColumn,t as Empty,a as SingleColumn,N as __namedExportsOrder,x as default};
//# sourceMappingURL=Basics.stories-c1ca8044.js.map
