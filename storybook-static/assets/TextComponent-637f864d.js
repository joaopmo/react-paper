import{R as i,r as Pe}from"./index-8db94870.js";function x(e,r){if(e==null||e===!1)throw new Error(r)}function _e(e){const r=Math.max(...e.map(a=>a.length)),t=Array(isFinite(r)?r:0).fill(null).map((a,o)=>e.map(s=>s[o]??null));return t.length>0?t:[[]]}const U={borderBox:"height",contentBox:"height",marginBox:"height",rowGap:"row-gap",lineHeight:"line-height",marginTop:"margin-top",marginBottom:"margin-bottom",paddingTop:"padding-top",paddingBottom:"padding-bottom",borderTop:"border-top-width",borderBottom:"border-bottom-width"};function Se(e){return Object.hasOwn(e,"boxSizing")}function we(e){return Object.hasOwn(e,"display")}function Z({paddingTop:e,paddingBottom:r,borderTop:t,borderBottom:a}){return{paddingTop:e,paddingBottom:r,borderTop:t,borderBottom:a}}function Re({paddingTop:e,paddingBottom:r,borderTop:t,borderBottom:a,marginTop:o,marginBottom:s}){return{paddingTop:e,paddingBottom:r,borderTop:t,borderBottom:a,marginTop:o,marginBottom:s}}function T(e,r){const t=window.getComputedStyle(e);return Se(r)?{boxSizing:t.getPropertyValue(r.boxSizing)}:we(r)?{display:t.getPropertyValue(r.display)}:Object.entries(r).reduce((a,[o,s])=>{const c=parseFloat(t.getPropertyValue(s));return a[o]=Number.isNaN(c)?0:c,a},{})}function N(e,r){const t={boxSizing:"box-sizing"},a={display:"display"};if(r!=null){if(r==="boxSizing")return T(e,t).boxSizing;if(r==="display")return T(e,a).display;let{[r]:l}=T(e,{[r]:U[r]});if(r==="contentBox"&&T(e,t).boxSizing==="border-box"){const u=T(e,Z(U));Object.values(u).forEach(m=>{l-=m})}if(r==="borderBox"&&T(e,t).boxSizing!=="border-box"){const u=T(e,Z(U));Object.values(u).forEach(m=>{l+=m})}if(r==="marginBox"){const u=T(e,Re(U));T(e,t).boxSizing==="border-box"?(l+=u.marginTop,l+=u.marginBottom):Object.values(u).forEach(m=>{l+=m})}return l}const o=T(e,U),{display:s}=T(e,a),c={...o,display:s};return T(e,{boxSizing:"box-sizing"}).boxSizing==="border-box"?(c.contentBox-=c.paddingTop+c.paddingBottom,c.contentBox-=c.borderTop+c.borderBottom):(c.borderBox+=c.paddingTop+c.paddingBottom,c.borderBox+=c.borderTop+c.borderBottom),c}function Ee(e,r){return e!=null&&e!==!1?!!r:!0}function Ne(e){x(!1,"A <Column> is only ever to be used as the child of <Paper> component, never rendered directly. Please wrap your <Column> in a <Paper>.")}function Te(e){x(!1,"A <Node> is only ever to be used as the child of <Level> component, never rendered directly. Please wrap your <Node> in a <Level>.")}const Y=i.createContext({scale:1,marginRight:0,marginBottom:0,height:0,width:0});function xe(){return i.useContext(Y)}function Oe({widthFrac:e,multiplier:r,children:t}){const a=i.useRef(null),[o,s]=i.useState({scale:1,marginRight:0,marginBottom:0,height:0,width:0}),c=i.useCallback(u=>{u!==null&&(a.current=u)},[a]),l=i.useCallback(()=>{const u=297*r,m=210*r,y=a.current;if(y!==null){const h=y.offsetWidth*e/m,d=m*h-m,v=u*h-u;s(g=>{switch(!0){case g.scale!==h:case g.marginRight!==d:case g.marginBottom!==v:case g.height!==u:case g.width!==m:return{scale:h,marginRight:d,marginBottom:v,height:u,width:m};default:return g}})}},[a,e,r]);return i.useLayoutEffect(()=>(window.addEventListener("resize",l),l(),()=>{window.removeEventListener("resize",l)}),[l]),i.createElement("div",{className:"rp-dimension",ref:c},i.createElement(Y.Provider,{value:o},t))}function Be({children:e,open:r}){return i.createElement("div",{className:"rp-backdrop",style:{display:r?"flex":"none"}},e)}function Ae(){return i.createElement("div",{className:"rp-spinner"})}function Ie({column:e,structure:r,pageIndex:t,columnIndex:a}){const{subColumn:o}=te(),s=i.useCallback(c=>{c!=null&&t===0&&o!=null&&o(c,a)},[a,t,o]);return i.createElement("div",{className:`rp-column rp-column-${a}`,ref:s},e==null?void 0:e.map((c,l)=>{const{path:u,current:m,upperBound:y,lowerBound:h}=c,{content:d,element:v,rootKey:g}=r[u[0]][u[1]],S=-y,R=g!==""?g:`${l}.${u.join(".")}`,O=h<=0?h:0,B=h<=0&&y<=0?"none":h-y;return i.createElement("div",{style:{overflow:"hidden",maxHeight:B,marginBottom:O},key:R},i.createElement("div",{style:{position:"relative",top:S}},i.createElement(ne,{path:u,content:d,subscribe:m===0},v)))}))}const Me=i.memo(function({columns:e,structure:r,pageIndex:t,loading:a}){const{scale:o,...s}=xe();return i.createElement("div",{className:`rp-page rp-page-${t}`,style:{transform:`scale(${o})`,...s}},i.createElement(Be,{open:a},i.createElement(Ae,null)),e.map((c,l)=>i.createElement(Ie,{column:c,structure:r,pageIndex:t,columnIndex:l,key:l})))}),A=0,q=1;function Ce(){const e=i.useRef(new Map),r=i.useRef(new Map);return i.useMemo(function(){return{set(t){e.current.set(t.path.join("."),t);const a=r.current.get(t.path.join("."));a==null&&r.current.set(t.path.join("."),0);for(let o=t.path.length-1;o>0;o--){let s=r.current.get(t.path.slice(0,o).join("."));if(s==null&&a==null){r.current.set(t.path.slice(0,o).join("."),1);continue}s!=null&&a==null&&r.current.set(t.path.slice(0,o).join("."),++s);break}},sizeDiff(t){const a=this.get(t);if(a==null)return!1;const o=N(t,"marginBox");return this.set({...a,prevSize:o}),a.prevSize!==o},hasParents(t){const a=this.get(t);if(a==null)return!1;for(let o=a.path.length-1;o>=2;o--)if(!this.has(a.path.slice(0,o)))return!1;return!0},has(t){return e.current.has(t.join("."))},get(t){if(Array.isArray(t)){const a=r.current.get(t.join(".")),o=e.current.get(t.join("."));return a!=null&&o!=null?{...o,children:a}:o}if(t instanceof Element){for(const a of e.current.values())if(a.element.isEqualNode(t)||a.element===t||a.element.getAttribute("data-rp-id")===t.getAttribute("data-rp-id")){const o=r.current.get(a.path.join("."));return o!=null?{...a,children:o}:a}return}},childCount(t){return r.current.get(t.join("."))},delete(t){e.current.delete(t.path.join("."));const a=r.current.delete(t.path.join("."));let o=r.current.get(t.path.slice(0,-1).join("."));o!=null&&a&&r.current.set(t.path.slice(0,-1).join("."),--o)}}},[])}function ke(){const e=i.useRef(new Map);return i.useMemo(()=>({set(r,t){e.current.set(r,t)},get(r){return e.current.get(r)},delete(r){return e.current.delete(r)}}),[])}const ee=i.createContext({subNode:null,subColumn:null});function te(){return i.useContext(ee)}function re({structure:e,pageWidth:r}){const[t,a]=i.useState(!0),[o,s]=i.useState(new Map),c=ke(),l=Ce(),u=i.useRef(null);function m(n){return n=e.map((p,b)=>[p.map((_,P)=>({path:[b,P],current:0,leadPage:0,upperBound:0,lowerBound:0,addedHeight:0}))]),n}function y(n,{type:p,payload:b}){const{changes:_}=b;switch(p){case"resize":return O(n,_);case"reset":return m([]);default:throw new Error("Invalid case")}}const h=i.useCallback((n,p,b)=>{n.currSlice===0&&(n.leadPage=b.length),p.push({path:n.currPath.slice(0,2),current:n.currSlice++,leadPage:n.leadPage,addedHeight:n.addedHeight,upperBound:n.upperBound,lowerBound:n.lowerBound})},[]),d=i.useCallback((n,p,b,_)=>{let P=_==="rowGap"?n.parentStyle[_]:n.style[_];if(n.parentStyle.display!=="flex"&&(_==="marginTop"&&n.prevSibEl!=null&&(P=0),_==="marginBottom"&&n.nextSibEl!=null)){const E=N(n.nextSibEl,"marginTop");P=E>P?E:P}if(P!==0)for(;;){if(n.freeHeight>=P){n.freeHeight=n.freeHeight-P,n.addedHeight=n.addedHeight+P,n.lowerBound=n.lowerBound+P;break}if(_==="borderBox"){const E=N(c.get(n.currPath[A]),"contentBox");x(P<=E,"A <Field> of with content prop = block received an element with height greater than the page")}if(_==="contentBox"&&n.freeHeight>=n.style.lineHeight){const E=n.freeHeight-n.freeHeight%n.style.lineHeight;n.lowerBound=n.lowerBound+E,n.addedHeight=n.addedHeight+E,n.freeHeight=n.freeHeight-E,P=P-E}n.upperBound!==n.lowerBound&&h(n,p,b),b.push([...p]),p.length=0,n.addedHeight=0,n.upperBound=n.lowerBound,n.freeHeight=N(c.get(n.currPath[A]),"contentBox")}},[c,h]),v=i.useCallback(n=>{const p=n.slice(0,-1);for(let b=n.at(-1)-1;b>=0;b--){const _=l.get([...p,b]);if(N(_.element,"display")!=="none")return _.element}},[l]),g=i.useCallback(n=>{const p=n.slice(0,-1),b=l.childCount(p);for(let _=n.at(-1)+1;_<b;_++){const P=l.get([...p,_]);if(N(P.element,"display")!=="none")return P.element}},[l]),S=i.useCallback(n=>{const p=l.get(n);let b=0,_=0;for(let P=0;P<p.children;P++){const E=l.get([...n,P]),f=N(E.element,"marginBox");f>b&&(b=f,_=P)}return[...n,_]},[l]),R=i.useCallback(n=>{const p=[],b=[],_=N(c.get(n[A]),"contentBox"),P=l.get(n),E={rowGap:N(c.get(n[A]),"rowGap"),display:N(c.get(n[A]),"display")},f={field:P,freeHeight:_,prevPath:[],currPath:n,leadPage:0,currSlice:0,upperBound:0,lowerBound:0,addedHeight:0,parentStyle:E,style:N(P.element)},M=[];for(let C=e[n[A]].length-1;C>=n[q];C--)M.push([n[A],C]);for(;M.length>0;){f.currPath=M.pop(),f.field=l.get(f.currPath),f.style=N(f.field.element);const C=f.prevPath[q],ye=f.currPath[q];if(C!=null&&C!==ye&&(f.currSlice=0,f.parentStyle.display!=="flex"?(f.upperBound=f.style.marginTop,f.lowerBound=f.style.marginTop):(f.upperBound=0,f.lowerBound=0)),f.style.display==="none"){f.currPath.length===2&&(f.parentStyle.display==="flex"&&(f.lowerBound=-f.parentStyle.rowGap),h(f,p,b)),f.prevPath=[...f.currPath];continue}const Q=f.currPath.slice(0,-1);if(Q.length===1?f.parentStyle=E:f.parentStyle=N(l.get(Q).element),f.prevSibEl=v(f.currPath),f.nextSibEl=g(f.currPath),f.field.content==="text"&&f.prevPath.length<=f.currPath.length){if(d(f,p,b,"marginTop"),d(f,p,b,"borderTop"),d(f,p,b,"paddingTop"),f.field.children!==0){if(M.push([...f.currPath]),l.get([...f.currPath,0]).content==="parallel")M.push(S(f.currPath));else for(let G=f.field.children-1;G>=0;G--)M.push([...f.currPath,G]);f.prevPath=[...f.currPath];continue}d(f,p,b,"contentBox")}f.field.content==="text"&&(d(f,p,b,"paddingBottom"),d(f,p,b,"borderBottom")),(f.field.content==="block"||f.field.content==="parallel")&&(d(f,p,b,"marginTop"),d(f,p,b,"borderBox")),d(f,p,b,"marginBottom"),f.parentStyle.display==="flex"&&f.nextSibEl!=null&&d(f,p,b,"rowGap"),f.currPath.length===2&&h(f,p,b),f.prevPath=[...f.currPath]}return p.length>0&&b.push([...p]),b},[c,l,e,v,g,d,h,S]),O=i.useCallback(function(n,p){const b=structuredClone(n);p==null&&(p=new Map,e.forEach((_,P)=>{_.length>0&&p instanceof Map&&p.set(P,[P,0])}));for(const[_,P]of p)b[_]=R(P);return b},[e,R]),[B,k]=i.useReducer(y,[],m),L=i.useCallback(n=>{const p=n.reduce((b,{target:_})=>{if(!l.sizeDiff(_)||!l.hasParents(_))return b;const P=l.get(_).path;return b.set(P[A],[P[A],0]),b},new Map);p.size>0&&s(p)},[l]),W=i.useMemo(()=>{const n=new ResizeObserver(L);return{observe(p){n.observe(p.element,{box:"border-box"})},unobserve(p){n.unobserve(p.element)}}},[L]),z=i.useCallback(n=>{const p=l.get(n.element);if(p==null||p.prevSize!==n.prevSize||p.path.join(".")!==n.path.join("."))return l.set(n),W.observe(n),function(){l.delete(n),W.unobserve(n)}},[l,W]),$=i.useCallback((n,p)=>{c.set(p,n)},[c]);i.useMemo(()=>{const n=e.map(p=>p.length);(u.current==null||u.current.join(".")!==n.join("."))&&k({type:"reset",payload:{}})},[e]),i.useEffect(()=>{u.current=e.map(n=>n.length),k({type:"resize",payload:{}})},[e]),i.useEffect(()=>{o.size>0&&(a(!0),k({type:"resize",payload:{changes:o}}),s(new Map))},[o]),i.useEffect(()=>{a(!1)},[B]);const H=i.useMemo(()=>_e(B),[B]);return i.createElement(ee.Provider,{value:{subNode:z,subColumn:$}},i.createElement(Oe,{widthFrac:r,multiplier:3.78},i.createElement("div",{className:"rp-container"},H.map((n,p)=>i.createElement(Me,{columns:n,structure:e,pageIndex:p,loading:t,key:p})))))}const Le=i.memo(re,We);function We(e,r){if(e.pageWidth!==r.pageWidth||e.structure.length!==r.structure.length)return!1;for(let t=0;t<e.structure.length;t++){if(e.structure[t].length!==r.structure[t].length)return!1;for(let a=0;a<e.structure[t].length;a++)if(e.structure[t][a].rootKey!==r.structure[t][a].rootKey)return!1}return!0}const K=i.createContext({register:()=>({ref:null,"data-rp-id":"","data-rp-display":"visible"}),path:[],subscribe:!1});function Ue(){return i.useContext(K)}function je(){const{register:e}=i.useContext(K);return{register:e}}const ne=i.memo(function({path:e,children:r,content:t,subscribe:a}){const{subNode:o}=te(),s=i.useRef(null);i.useLayoutEffect(()=>{if(s.current!=null&&o!=null&&a)return o({path:e,children:0,content:t??"text",element:s.current,prevSize:N(s.current,"marginBox")})},[o,e,a,t]);const c=i.useCallback((l=!0)=>({ref:s,"data-rp-id":e.join("."),"data-rp-display":l?"visible":"none"}),[e]);return i.createElement(K.Provider,{value:{register:c,path:e,subscribe:a}},r)});function ze({children:e,parallel:r=!1}){const{path:t,subscribe:a}=Ue(),o=i.useCallback((c,l=0)=>{const u=[];return i.Children.forEach(c,m=>{if(i.isValidElement(m)){if(m.type===i.Fragment)return u.push(...o(m.props.children,l+u.length));x(m.type===Te,`[${typeof m.type=="string"?m.type:m.type.name}] is not a <Node> component. All component children of <Level> must be a <Node>  or <React.Fragment>`),x(i.isValidElement(m.props.element),"The element prop of a <Node> must be a valid React Element"),u.push(i.createElement(ne,{path:[...t,l+u.length],content:r?"parallel":m.props.content,subscribe:a,key:l+u.length},m.props.element))}}),u},[r,t,a]),s=i.useMemo(()=>o(e),[e,o]);return i.createElement(i.Fragment,null,s)}function He(e){x(!1,"A <Root> is only ever to be used as the child of <Column> component, never rendered directly. Please wrap your <Root> in a <Column>.")}function De(e){return typeof e=="string"||e instanceof String}function Fe({children:e,pageWidth:r=.6,memoize:t=!1}){x(r>=.1&&r<=1,"The pageWidth prop should be a number between 0.1 and 1.");const a=i.useCallback(c=>{const l=[];return i.Children.forEach(c,u=>{if(i.isValidElement(u)){if(u.type===i.Fragment)return l.push(...a(u.props.children));x(u.type===He,`[${typeof u.type=="string"?u.type:u.type.name}] is not a <Root> component. All component children of <Column> must be a <Root>  or <React.Fragment>`),x(i.isValidElement(u.props.element),"The element prop of a <Root> must be a valid React Element"),x(Ee(t,De(u.props.rootKey)),"When <Paper> has the memoize prop every <Root> must have a rootKey prop of type string"),l.push({element:u.props.element,rootKey:u.props.rootKey??"",content:u.props.content??"text"})}}),l},[t]),o=Pe.useCallback(c=>{const l=[];return i.Children.forEach(c,(u,m)=>{if(x(i.isValidElement(u),`Children [${m}] is an invalid React Element. Expected a <Column> Element`),u.type===i.Fragment)return l.push(...o(u.props.children));x(u.type===Ne,`Children [${m}] is not a <Column>`),l.push(a(u.props.children))}),l},[a]),s=i.useMemo(()=>o(e),[e,o]);return t?i.createElement(Le,{structure:s,pageWidth:r}):i.createElement(re,{structure:s,pageWidth:r})}ze.__docgenInfo={description:"",methods:[],displayName:"xe",props:{parallel:{defaultValue:{value:"!1",computed:!1},required:!1}}};Fe.__docgenInfo={description:"",methods:[],displayName:"we",props:{pageWidth:{defaultValue:{value:"0.6",computed:!1},required:!1},memoize:{defaultValue:{value:"!1",computed:!1},required:!1}}};var ae={},I={};Object.defineProperty(I,"__esModule",{value:!0});I.FORMAT_PLAIN=I.FORMAT_HTML=I.FORMATS=void 0;var oe="html";I.FORMAT_HTML=oe;var ie="plain";I.FORMAT_PLAIN=ie;var $e=[oe,ie];I.FORMATS=$e;var w={};Object.defineProperty(w,"__esModule",{value:!0});w.UNIT_WORDS=w.UNIT_WORD=w.UNIT_SENTENCES=w.UNIT_SENTENCE=w.UNIT_PARAGRAPHS=w.UNIT_PARAGRAPH=w.UNITS=void 0;var ue="words";w.UNIT_WORDS=ue;var le="word";w.UNIT_WORD=le;var se="sentences";w.UNIT_SENTENCES=se;var ce="sentence";w.UNIT_SENTENCE=ce;var de="paragraphs";w.UNIT_PARAGRAPHS=de;var fe="paragraph";w.UNIT_PARAGRAPH=fe;var Ge=[ue,le,se,ce,de,fe];w.UNITS=Ge;var j={};Object.defineProperty(j,"__esModule",{value:!0});j.WORDS=void 0;var qe=["ad","adipisicing","aliqua","aliquip","amet","anim","aute","cillum","commodo","consectetur","consequat","culpa","cupidatat","deserunt","do","dolor","dolore","duis","ea","eiusmod","elit","enim","esse","est","et","eu","ex","excepteur","exercitation","fugiat","id","in","incididunt","ipsum","irure","labore","laboris","laborum","Lorem","magna","minim","mollit","nisi","non","nostrud","nulla","occaecat","officia","pariatur","proident","qui","quis","reprehenderit","sint","sit","sunt","tempor","ullamco","ut","velit","veniam","voluptate"];j.WORDS=qe;var pe={},D={};Object.defineProperty(D,"__esModule",{value:!0});D.LINE_ENDINGS=void 0;var Ve={POSIX:`
`,WIN32:`\r
`};D.LINE_ENDINGS=Ve;var me={},X={},ge={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=function(o){var s=o.trim();return s.charAt(0).toUpperCase()+s.slice(1)},t=r;e.default=t})(ge);var V={exports:{}};(function(e,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var t=function(){return!!e.exports},a=t;r.default=a})(V,V.exports);var Ke=V.exports,he={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=function(){var o=!1;try{o=navigator.product==="ReactNative"}catch{o=!1}return o},t=r;e.default=t})(he);var ve={},F={};Object.defineProperty(F,"__esModule",{value:!0});F.SUPPORTED_PLATFORMS=void 0;var Xe={DARWIN:"darwin",LINUX:"linux",WIN32:"win32"};F.SUPPORTED_PLATFORMS=Xe;(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=F,t=function(){var s=!1;try{s=process.platform===r.SUPPORTED_PLATFORMS.WIN32}catch{s=!1}return s},a=t;e.default=a})(ve);var J={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=function(){var o=arguments.length>0&&arguments[0]!==void 0?arguments[0]:0;return Array.apply(null,Array(o)).map(function(s,c){return c})},t=r;e.default=t})(J);var be={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=t(J);function t(s){return s&&s.__esModule?s:{default:s}}var a=function(c,l){var u=(0,r.default)(c);return u.map(function(){return l()})},o=a;e.default=o})(be);(function(e){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"capitalize",{enumerable:!0,get:function(){return r.default}}),Object.defineProperty(e,"isNode",{enumerable:!0,get:function(){return t.default}}),Object.defineProperty(e,"isReactNative",{enumerable:!0,get:function(){return a.default}}),Object.defineProperty(e,"isWindows",{enumerable:!0,get:function(){return o.default}}),Object.defineProperty(e,"makeArrayOfLength",{enumerable:!0,get:function(){return s.default}}),Object.defineProperty(e,"makeArrayOfStrings",{enumerable:!0,get:function(){return c.default}});var r=l(ge),t=l(Ke),a=l(he),o=l(ve),s=l(J),c=l(be);function l(u){return u&&u.__esModule?u:{default:u}}})(X);(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=j,t=X;function a(m,y){if(!(m instanceof y))throw new TypeError("Cannot call a class as a function")}function o(m,y){for(var h=0;h<y.length;h++){var d=y[h];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(m,d.key,d)}}function s(m,y,h){return y&&o(m.prototype,y),h&&o(m,h),Object.defineProperty(m,"prototype",{writable:!1}),m}function c(m,y,h){return y in m?Object.defineProperty(m,y,{value:h,enumerable:!0,configurable:!0,writable:!0}):m[y]=h,m}var l=function(){function m(){var y=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},h=y.sentencesPerParagraph,d=h===void 0?{max:7,min:3}:h,v=y.wordsPerSentence,g=v===void 0?{max:15,min:5}:v,S=y.random;y.seed;var R=y.words,O=R===void 0?r.WORDS:R;if(a(this,m),c(this,"sentencesPerParagraph",void 0),c(this,"wordsPerSentence",void 0),c(this,"random",void 0),c(this,"words",void 0),d.min>d.max)throw new Error("Minimum number of sentences per paragraph (".concat(d.min,") cannot exceed maximum (").concat(d.max,")."));if(g.min>g.max)throw new Error("Minimum number of words per sentence (".concat(g.min,") cannot exceed maximum (").concat(g.max,")."));this.sentencesPerParagraph=d,this.words=O,this.wordsPerSentence=g,this.random=S||Math.random}return s(m,[{key:"generateRandomInteger",value:function(h,d){return Math.floor(this.random()*(d-h+1)+h)}},{key:"generateRandomWords",value:function(h){var d=this,v=this.wordsPerSentence,g=v.min,S=v.max,R=h||this.generateRandomInteger(g,S);return(0,t.makeArrayOfLength)(R).reduce(function(O,B){return"".concat(d.pluckRandomWord()," ").concat(O)},"").trim()}},{key:"generateRandomSentence",value:function(h){return"".concat((0,t.capitalize)(this.generateRandomWords(h)),".")}},{key:"generateRandomParagraph",value:function(h){var d=this,v=this.sentencesPerParagraph,g=v.min,S=v.max,R=h||this.generateRandomInteger(g,S);return(0,t.makeArrayOfLength)(R).reduce(function(O,B){return"".concat(d.generateRandomSentence()," ").concat(O)},"").trim()}},{key:"pluckRandomWord",value:function(){var h=0,d=this.words.length-1,v=this.generateRandomInteger(h,d);return this.words[v]}}]),m}(),u=l;e.default=u})(me);(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=I,t=D,a=s(me),o=X;function s(d){return d&&d.__esModule?d:{default:d}}function c(d,v){if(!(d instanceof v))throw new TypeError("Cannot call a class as a function")}function l(d,v){for(var g=0;g<v.length;g++){var S=v[g];S.enumerable=S.enumerable||!1,S.configurable=!0,"value"in S&&(S.writable=!0),Object.defineProperty(d,S.key,S)}}function u(d,v,g){return v&&l(d.prototype,v),g&&l(d,g),Object.defineProperty(d,"prototype",{writable:!1}),d}function m(d,v,g){return v in d?Object.defineProperty(d,v,{value:g,enumerable:!0,configurable:!0,writable:!0}):d[v]=g,d}var y=function(){function d(){var v=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},g=arguments.length>1&&arguments[1]!==void 0?arguments[1]:r.FORMAT_PLAIN,S=arguments.length>2?arguments[2]:void 0;if(c(this,d),this.format=g,this.suffix=S,m(this,"generator",void 0),r.FORMATS.indexOf(g.toLowerCase())===-1)throw new Error("".concat(g," is an invalid format. Please use ").concat(r.FORMATS.join(" or "),"."));this.generator=new a.default(v)}return u(d,[{key:"getLineEnding",value:function(){return this.suffix?this.suffix:!(0,o.isReactNative)()&&(0,o.isNode)()&&(0,o.isWindows)()?t.LINE_ENDINGS.WIN32:t.LINE_ENDINGS.POSIX}},{key:"formatString",value:function(g){return this.format===r.FORMAT_HTML?"<p>".concat(g,"</p>"):g}},{key:"formatStrings",value:function(g){var S=this;return g.map(function(R){return S.formatString(R)})}},{key:"generateWords",value:function(g){return this.formatString(this.generator.generateRandomWords(g))}},{key:"generateSentences",value:function(g){return this.formatString(this.generator.generateRandomParagraph(g))}},{key:"generateParagraphs",value:function(g){var S=this.generator.generateRandomParagraph.bind(this.generator);return this.formatStrings((0,o.makeArrayOfStrings)(g,S)).join(this.getLineEnding())}}]),d}(),h=y;e.default=h})(pe);(function(e){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"LoremIpsum",{enumerable:!0,get:function(){return o.default}}),e.loremIpsum=void 0;var r=I,t=w,a=j,o=s(pe);function s(l){return l&&l.__esModule?l:{default:l}}var c=function(){var u=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},m=u.count,y=m===void 0?1:m,h=u.format,d=h===void 0?r.FORMAT_PLAIN:h,v=u.paragraphLowerBound,g=v===void 0?3:v,S=u.paragraphUpperBound,R=S===void 0?7:S,O=u.random,B=u.sentenceLowerBound,k=B===void 0?5:B,L=u.sentenceUpperBound,W=L===void 0?15:L,z=u.units,$=z===void 0?t.UNIT_SENTENCES:z,H=u.words,n=H===void 0?a.WORDS:H,p=u.suffix,b=p===void 0?"":p,_={random:O,sentencesPerParagraph:{max:R,min:g},words:n,wordsPerSentence:{max:W,min:k}},P=new o.default(_,d,b);switch($){case t.UNIT_PARAGRAPHS:case t.UNIT_PARAGRAPH:return P.generateParagraphs(y);case t.UNIT_SENTENCES:case t.UNIT_SENTENCE:return P.generateSentences(y);case t.UNIT_WORDS:case t.UNIT_WORD:return P.generateWords(y);default:return""}};e.loremIpsum=c})(ae);const Je=function(r){function*t(o){let s=0;for(let c=0;c<o.length;c++){const l=o.charCodeAt(c);s=(s<<5)-s+l,s=s&s}for(;;)s=Math.sin(s++)*1e4,yield s-Math.floor(s)}const a=t(r);return()=>a.next().value}("123456789"),Qe={lineHeight:1.4,margin:"5px"},Ze=ae.loremIpsum({count:10,units:"paragraphs",random:Je});function et(){const{register:e}=je();return i.createElement("div",{...e(),style:Qe},Ze)}export{je as B,et as T,He as m,Te as o,Ne as r,Fe as w,ze as x};
//# sourceMappingURL=TextComponent-637f864d.js.map