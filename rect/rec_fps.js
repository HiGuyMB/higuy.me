!function(e){function t(t){for(var n,o,a=t[0],i=t[1],l=0,f=[];l<a.length;l++)o=a[l],Object.prototype.hasOwnProperty.call(r,o)&&r[o]&&f.push(r[o][0]),r[o]=0;for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n]);for(u&&u(t);f.length;)f.shift()()}var n={},r={2:0};var o={};var a={4:function(){return{}}};function i(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.e=function(e){var t=[],n=r[e];if(0!==n)if(n)t.push(n[2]);else{var l=new Promise((function(t,o){n=r[e]=[t,o]}));t.push(n[2]=l);var f,s=document.createElement("script");s.charset="utf-8",s.timeout=120,i.nc&&s.setAttribute("nonce",i.nc),s.src=function(e){return i.p+""+({}[e]||e)+".js"}(e);var u=new Error;f=function(t){s.onerror=s.onload=null,clearTimeout(c);var n=r[e];if(0!==n){if(n){var o=t&&("load"===t.type?"missing":t.type),a=t&&t.target&&t.target.src;u.message="Loading chunk "+e+" failed.\n("+o+": "+a+")",u.name="ChunkLoadError",u.type=o,u.request=a,n[1](u)}r[e]=void 0}};var c=setTimeout((function(){f({type:"timeout",target:s})}),12e4);s.onerror=s.onload=f,document.head.appendChild(s)}return({0:[4]}[e]||[]).forEach((function(e){var n=o[e];if(n)t.push(n);else{var r,l=a[e](),f=fetch(i.p+""+{4:"b20747c3afdc8d4b269c"}[e]+".module.wasm");if(l instanceof Promise&&"function"==typeof WebAssembly.compileStreaming)r=Promise.all([WebAssembly.compileStreaming(f),l]).then((function(e){return WebAssembly.instantiate(e[0],e[1])}));else if("function"==typeof WebAssembly.instantiateStreaming)r=WebAssembly.instantiateStreaming(f,l);else{r=f.then((function(e){return e.arrayBuffer()})).then((function(e){return WebAssembly.instantiate(e,l)}))}t.push(o[e]=r.then((function(t){return i.w[e]=(t.instance||t).exports})))}})),Promise.all(t)},i.m=e,i.c=n,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i.oe=function(e){throw console.error(e),e},i.w={};var l=window.webpackJsonp=window.webpackJsonp||[],f=l.push.bind(l);l.push=t,l=l.slice();for(var s=0;s<l.length;s++)t(l[s]);var u=f;i(i.s=2)}({2:function(e,t,n){n.e(0).then(n.bind(null,0)).then(async e=>{let t=await(await fetch("template/rec.hbs")).text(),n=Handlebars.compile(t);const r=document.getElementById("output_text"),o=document.getElementById("input_file");o.addEventListener("change",async t=>{let a=o.files[0];if(a){let o=await(i=a,new Promise((e,t)=>{let n=new FileReader;n.onload=()=>{e(n.result)},n.onerror=t,n.readAsArrayBuffer(i)})),l=e.import_json(new Uint8Array(o));try{!function(e){let t=0;for(let n=0;n<e.frames.length;n++){let r=e.frames[n];t+=r.delta}function o(t,n,r){let o=t+e.frames[n].delta,a=t,i=0;for(let t=0;t<r&&!(t>n);t++)o-=e.frames[n-t].delta,i++;let l=0;for(let t=0;t<r&&!(n+t>=e.frames.length);t++)a+=e.frames[n+t].delta,l++;return(i+l-1)/(a-o)*1e3}let a=[],i=[],l=[],f=0;a.push(f),i.push(o(f,0,10));for(let t=0;t<e.frames.length;t++){let n=e.frames[t];f+=n.delta,a.push(f),i.push(o(f,t,10)),l.push(n.delta)}r.innerHTML=n(e),Plotly.newPlot("rec-ms-plot",[{x:a,y:l}],{margin:{t:0},xaxis:{title:"Time",range:[a[0],a[a.length-1]]},yaxis:{title:"DT",range:[0,Math.max(...l)]},textfont:{color:"#ffffff"},fillcolor:"rgb(0, 0, 0)"}),Plotly.newPlot("rec-fps-plot",[{x:a,y:i}],{margin:{t:0},xaxis:{title:"Time",range:[a[0],a[a.length-1]]},yaxis:{title:"FPS",range:[0,Math.max(...i)]},textfont:{color:"#ffffff"},fillcolor:"rgb(0, 0, 0)"})}(JSON.parse(l))}catch(t){r.innerText="Error: "+t.toString()}}var i})}).catch(console.error)}});