/*!
 * Copyright 2017 by ding
 * @author Ding <ding-js@outlook.com>
 */
var ding=webpackJsonpding([1],{105:function(t,e,i){"use strict";function o(t){var e,i,o=t.map(function(t){return t/255}),r=o[0],n=o[1],s=o[2],a=Math.max(r,n,s),h=Math.min(r,n,s),l=(a+h)/2;if(a===h)e=i=0;else{var d=a-h;switch(i=l<.5?d/(a+h):d/(2-a-h),a){case r:e=(n-s)/d+(n<s?6:0);break;case n:e=(s-r)/d+2;break;case s:e=(r-n)/d+4;break;default:return[]}e/=6}return[e,i,l].map(function(t){return Math.round(100*t)/100})}function r(t){return t.map(function(t){var e=t.toString(16);return e.length<2?"0"+e:e}).join("")}function n(t){return Array.prototype.slice.call(t.data,0,3)}function s(t){var e,i,o,r=t[0],n=t[1],s=t[2];if(0===n)e=i=o=s;else{var a=function(t,e,i){return i<0?i+=1:i>1&&(i-=1),i<1/6?t+6*(e-t)*i:i<.5?e:i<2/3?t+(e-t)*(2/3-i)*6:t},h=s<.5?s*(1+n):s+n-s*n,l=2*s-h;e=a(l,h,r+1/3),i=a(l,h,r),o=a(l,h,r-1/3)}return[e,i,o].map(function(t){return Math.round(255*t)})}Object.defineProperty(e,"__esModule",{value:!0}),e.Rgb2Hsl=o,e.Rgb2Hex=r,e.ImageData2Rgb=n,e.Hsl2Rgb=s},106:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),i(253);var o=i(266),r=i(265),n=i(105),s=document.querySelector("#color-text"),a=document.querySelector("#color-preview"),h=Array.prototype.slice.call(document.querySelectorAll("#rgb-info input"),0),l=Array.prototype.slice.call(document.querySelectorAll("#hsl-info input"),0),d=new o.default(document.querySelector("#color-block"),{onColorChange:function(t){var e=n.ImageData2Rgb(t),i=n.Rgb2Hsl(e),o="#"+n.Rgb2Hex(e);h.forEach(function(t,i){t.value=e[i]}),l.forEach(function(t,e){t.value=i[e]}),s.innerHTML="RGB: "+e.join(",")+"<br>HSL: "+i.join(",")+"<br>HEX: "+o,a.style.backgroundColor=o}}),c=new r.default(document.querySelector("#color-bar"),{onColorChange:function(t){var e=n.ImageData2Rgb(t);d.color="#"+n.Rgb2Hex(e)}});document.querySelector("#rgb-info").addEventListener("change",function(t){if("input"===t.target.nodeName.toLowerCase()){var e=[],i=t.target,o=i.value,r=parseInt(o);if(""===o)return;r<0?i.value="0":r>255&&(i.value="255");for(var s=0,a=h;s<a.length;s++){var l=a[s],u=l.value;if(""===u)return;e.push(parseInt(u))}var f="#"+n.Rgb2Hex(e);d.currentColor=f,c.hideSlider()}}),document.querySelector("#hsl-info").addEventListener("change",function(t){if("input"===t.target.nodeName.toLowerCase()){var e=[],i=t.target,o=i.value,r=parseFloat(o);if(""===o)return;r<0?i.value="0":r>1&&(i.value="1");for(var s=0,a=l;s<a.length;s++){var h=a[s],u=h.value;if(""===u)return;e.push(parseFloat(u))}var f=n.Hsl2Rgb(e),_="#"+n.Rgb2Hex(f);d.currentColor=_,c.hideSlider()}})},253:function(t,e){},265:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=function(){function t(t,e){var i=this;this._padding=10,this._showSlider=!1,this._colors=["f00","ffA500","ff0","008000","00f","4b0082","800080"],this._options={lineWidth:2,strokeStyle:"#ffc0cb"},this.mouseHandle=function(t){i._showSlider=!0,i.setCoordinate(t.layerY)},e&&Object.assign(this._options,e),this._element=t,this.init()}return t.prototype.init=function(){var t=this,e=this._padding,i=this._element,o=i.getContext("2d"),r=+i.getAttribute("width"),n=+i.getAttribute("height"),s=o.createLinearGradient(e,e,e,n-2*e),a=this._colors,h=a.length;a.forEach(function(t,e){s.addColorStop(e/(h-1),"#"+t)}),this._gradient=s,this._ctx=o,this._width=r,this._height=n,o.lineWidth=this._options.lineWidth,o.strokeStyle=this._options.strokeStyle,i.addEventListener("click",this.mouseHandle),i.addEventListener("mousemove",function(e){1===e.which&&t.mouseHandle(e)}),this.fill()},t.prototype.fill=function(){var t=this._gradient,e=this._ctx,i=this._padding;e.fillStyle=t,e.fillRect(this._padding,this._padding,this._width-2*i,this._height-2*i)},t.prototype.setCoordinate=function(t){var e,i=this._padding;e=t<i?i:t>this._height-i?this._height-i-1:t,this._y=e,this.draw()},t.prototype.renderCurrentColor=function(){if(this._showSlider){var t=this._width/2,e=this._y;if(void 0!==e){var i=this._ctx;if(i.strokeRect(0,e-3,this._width,6),this._options.onColorChange){var o=i.getImageData(t,e,1,1);this._options.onColorChange(o)}}}},t.prototype.draw=function(){var t=this._ctx;t.clearRect(0,0,this._width,this._height),this.fill(),this.renderCurrentColor()},t.prototype.hideSlider=function(){this._showSlider&&(this._showSlider=!1,this.draw())},t}();e.default=o},266:function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=i(105),r=function(){function t(t,e){var i=this;this._padding=10,this._options={lineWidth:2,strokeStyle:"#ffc0cb"},this.mouseHandle=function(t){i.setCoordinate(t.layerX,t.layerY)},e&&Object.assign(this._options,e),this._element=t,this.init()}return t.prototype.init=function(){var t=this,e=this._padding,i=this._element,o=i.getContext("2d"),r=+i.getAttribute("width"),n=+i.getAttribute("height"),s=r-2*e,a=n-2*e;o.lineWidth=this._options.lineWidth,o.strokeStyle=this._options.strokeStyle,this._ctx=o,this._width=r,this._height=n,this._contentWidth=s,this._contentHeight=a,i.addEventListener("click",this.mouseHandle),i.addEventListener("mousemove",function(e){1===e.which&&t.mouseHandle(e)}),this.draw()},t.prototype.fill=function(){var t=this._ctx,e=this._padding,i=t.createLinearGradient(this._width-e,this._height-e,e,e);i.addColorStop(0,"#000"),void 0!==this._middleColor&&i.addColorStop(.5,this._middleColor),i.addColorStop(1,"#fff"),t.fillStyle=i,t.fillRect(this._padding,this._padding,this._contentWidth,this._contentHeight)},t.prototype.setCoordinate=function(t,e){var i,o,r=this._padding;i=t<r?r+1:t>this._contentWidth+r?this._contentWidth+r-1:t,o=e<r?r+1:e>this._contentHeight+r?this._contentHeight+r-1:e,this._x=i,this._y=o,this.draw()},t.prototype.renderCurrentColor=function(){var t=this._x,e=this._y;if(void 0!==t&&void 0!==e){var i=this._ctx;if(i.beginPath(),i.arc(t,e,this._padding/2,0,2*Math.PI),i.stroke(),this._options.onColorChange){var o=i.getImageData(t,e,1,1);this._options.onColorChange(o)}}},t.prototype.draw=function(){var t=this._ctx;t.clearRect(0,0,this._width,this._height),this.fill(),this.renderCurrentColor()},Object.defineProperty(t.prototype,"color",{set:function(t){this._middleColor=t,this.draw()},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"currentColor",{set:function(t){var e=Math.round(this._width/2)-1,i=Math.round(this._height/2)-1,r=this._ctx;this._middleColor=t,this.draw();for(var n=[],s=0;s<3;s++)for(var a=0;a<3;a++)n.push({x:e+s,y:i+a});for(var h=0,l=n;h<l.length;h++){var d=l[h],c="#"+o.Rgb2Hex(o.ImageData2Rgb(r.getImageData(d.x,d.y,1,1)));if(c===t)return this._x=d.x,this._y=d.y,void this.draw()}this._x=e+1,this._y=i+1,this.draw()},enumerable:!0,configurable:!0}),t}();e.default=r},268:function(t,e,i){i(106),t.exports=i(52)}},[268]);