import{d as h,z as y,v as n,b as c,I as g,g as r,cZ as l,a0 as m}from"./index-Bm2o6IEH.js";/**
 * tdesign v1.18.5
 * (c) 2026 tdesign
 * @license MIT
 */var p={align:{type:String,default:"center",validator:function(t){return t?["left","right","center"].includes(t):!0}},content:{type:[String,Function]},dashed:Boolean,default:{type:[String,Function]},layout:{type:String,default:"horizontal",validator:function(t){return t?["horizontal","vertical"].includes(t):!0}},size:{type:[String,Number]}};/**
 * tdesign v1.18.5
 * (c) 2026 tdesign
 * @license MIT
 */var z=h({name:"TDivider",props:p,setup:function(t){var e=y("divider"),v=g();return function(){var u=v("default","content"),o=r(function(){return t.layout!=="vertical"}),a=r(function(){return o.value&&!!u}),d=["".concat(e.value),["".concat(e.value,"--").concat(t.layout)],n(n(n({},"".concat(e.value,"--dashed"),!!t.dashed),"".concat(e.value,"--with-text"),!!a.value),"".concat(e.value,"--with-text-").concat(t.align),!!a.value)],s=r(function(){if(t.size){var f=o.value?"".concat(l(t.size)," 0"):"0 ".concat(l(t.size));return{margin:f}}return null});return c("div",{class:d,style:s.value},[a.value&&c("span",{class:"".concat(e.value,"__inner-text")},[u])])}}});/**
 * tdesign v1.18.5
 * (c) 2026 tdesign
 * @license MIT
 */var C=m(z);export{C as D};
