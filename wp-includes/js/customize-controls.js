(function(a,c){var b=wp.customize;b.Setting=b.Value.extend({initialize:function(g,f,d){var e;b.Value.prototype.initialize.call(this,f,d);this.id=g;this.transport=this.transport||"refresh";this.bind(this.preview)},preview:function(){switch(this.transport){case"refresh":return this.previewer.refresh();case"postMessage":return this.previewer.send("setting",[this.id,this()])}}});b.Control=b.Class.extend({initialize:function(i,e){var g=this,d,h,f;this.params={};c.extend(this,e||{});this.id=i;this.selector="#customize-control-"+i.replace("]","").replace("[","-");this.container=c(this.selector);f=c.map(this.params.settings,function(j){return j});b.apply(b,f.concat(function(){var j;g.settings={};for(j in g.params.settings){g.settings[j]=b(g.params.settings[j])}g.setting=g.settings["default"]||null;g.ready()}));g.elements=[];d=this.container.find("[data-customize-setting-link]");h={};d.each(function(){var k=c(this),j;if(k.is(":radio")){j=k.prop("name");if(h[j]){return}h[j]=true;k=d.filter('[name="'+j+'"]')}b(k.data("customizeSettingLink"),function(m){var l=new b.Element(k);g.elements.push(l);l.sync(m);l.set(m())})})},ready:function(){},dropdownInit:function(){var e=this,d=this.container.find(".dropdown-status"),f=this.params,g=function(h){if(typeof h==="string"&&f.statuses&&f.statuses[h]){d.html(f.statuses[h]).show()}else{d.hide()}};this.container.on("click",".dropdown",function(h){h.preventDefault();e.container.toggleClass("open")});this.setting.bind(g);g(this.setting())}});b.ColorControl=b.Control.extend({ready:function(){var e=this,d,f,g;d=this.container.find(".dropdown-content");g=function(h){h=h?"#"+h:"";d.css("background",h);e.farbtastic.setColor(h)};this.farbtastic=c.farbtastic(this.container.find(".farbtastic-placeholder"),function(h){e.setting.set(h.replace("#",""))});this.setting.bind(g);g(this.setting());this.dropdownInit()}});b.UploadControl=b.Control.extend({ready:function(){var d=this;this.params.removed=this.params.removed||"";this.success=c.proxy(this.success,this);this.uploader=c.extend({container:this.container,browser:this.container.find(".upload"),dropzone:this.container.find(".upload-dropzone"),success:this.success},this.uploader||{});this.uploader=new wp.Uploader(this.uploader);this.remover=this.container.find(".remove");this.remover.click(function(e){d.setting.set(d.params.removed);e.preventDefault()});this.removerVisibility=c.proxy(this.removerVisibility,this);this.setting.bind(this.removerVisibility);this.removerVisibility(this.setting.get());if(this.params.context){d.uploader.param("post_data[context]",this.params.context)}d.uploader.param("post_data[theme]",b.settings.theme.stylesheet)},success:function(d){this.setting.set(d.url)},removerVisibility:function(d){this.remover.toggle(d!=this.params.removed)}});b.ImageControl=b.UploadControl.extend({ready:function(){var e=this,d;this.uploader={init:function(f){var h,g;if(f.features.dragdrop){return}h=e.container.find(".upload-fallback");g=h.children().detach();this.browser.detach().empty().append(g);h.append(this.browser).show()}};b.UploadControl.prototype.ready.call(this);this.thumbnail=this.container.find(".preview-thumbnail img");this.thumbnailSrc=c.proxy(this.thumbnailSrc,this);this.setting.bind(this.thumbnailSrc);this.library=this.container.find(".library");this.tabs={};d=this.library.find(".library-content");this.library.children("ul").children("li").each(function(){var g=c(this),h=g.data("customizeTab"),f=d.filter('[data-customize-tab="'+h+'"]');e.tabs[h]={both:g.add(f),link:g,panel:f}});this.selected=this.tabs[d.first().data("customizeTab")];this.selected.both.addClass("library-selected");this.library.children("ul").on("click","li",function(g){var h=c(this).data("customizeTab"),f=e.tabs[h];g.preventDefault();if(f.link.hasClass("library-selected")){return}e.selected.both.removeClass("library-selected");e.selected=f;e.selected.both.addClass("library-selected")});this.library.on("click","a",function(f){var g=c(this).data("customizeImageValue");if(g){e.setting.set(g);f.preventDefault()}});if(this.tabs.uploaded){this.tabs.uploaded.target=this.library.find(".uploaded-target");if(!this.tabs.uploaded.panel.find(".thumbnail").length){this.tabs.uploaded.both.addClass("hidden")}}this.dropdownInit()},success:function(d){b.UploadControl.prototype.success.call(this,d);if(this.tabs.uploaded&&this.tabs.uploaded.target.length){this.tabs.uploaded.both.removeClass("hidden");c('<a href="#" class="thumbnail"></a>').data("customizeImageValue",d.url).append('<img src="'+d.url+'" />').appendTo(this.tabs.uploaded.target)}},thumbnailSrc:function(d){if(/^(https?:)?\/\//.test(d)){this.thumbnail.prop("src",d).show()}else{this.thumbnail.hide()}}});b.defaultConstructor=b.Setting;b.control=new b.Values({defaultConstructor:b.Control});b.Previewer=b.Messenger.extend({refreshBuffer:250,initialize:function(g,e){var d=this,f=/^https?/;c.extend(this,e||{});this.loaded=c.proxy(this.loaded,this);this.refresh=(function(h){var i=h.refresh,k=function(){j=null;i.call(h)},j;return function(){if(typeof j!=="number"){if(h.loading){h.loading.remove();delete h.loading;h.loader()}else{return k()}}clearTimeout(j);j=setTimeout(k,h.refreshBuffer)}})(this);this.container=b.ensure(g.container);this.allowedUrls=g.allowedUrls;b.Messenger.prototype.initialize.call(this,g.url);this.origin.unlink(this.url).set(window.location.href);this.add("scheme",this.origin()).link(this.origin).setter(function(i){var h=i.match(f);return h?h[0]:""});this.url.setter(function(i){var h;if(/\/wp-admin(\/|$)/.test(i.replace(/[#?].*$/,""))){return null}c.each([i.replace(f,d.scheme()),i],function(k,j){c.each(d.allowedUrls,function(l,m){if(0===j.indexOf(m)){h=j;return false}});if(h){return false}});return h?h:null});this.url.bind(this.refresh);this.scroll=0;this.bind("scroll",function(h){this.scroll=h});this.bind("url",this.url)},loader:function(){if(this.loading){return this.loading}this.loading=c("<iframe />").appendTo(this.container);return this.loading},loaded:function(){if(this.iframe){this.iframe.remove()}this.iframe=this.loading;delete this.loading;this.targetWindow(this.iframe[0].contentWindow);this.send("scroll",this.scroll)},query:function(){},refresh:function(){var d=this;if(this.request){this.request.abort()}this.request=c.ajax(this.url(),{type:"POST",data:this.query()||{},success:function(g){var i=d.loader()[0].contentWindow,f=d.request.getResponseHeader("Location"),e="WP_CUSTOMIZER_SIGNATURE",h;if(f&&f!=d.url()){d.url(f);return}h=g.lastIndexOf(e);if(-1===h||h<g.lastIndexOf("</html>")){return}g=g.slice(0,h)+g.slice(h+e.length);d.loader().one("load",d.loaded);i.document.open();i.document.write(g);i.document.close()},xhrFields:{withCredentials:true}})}});b.controlConstructor={color:b.ColorControl,upload:b.UploadControl,image:b.ImageControl};c(function(){b.settings=window._wpCustomizeSettings;b.l10n=window._wpCustomizeControlsL10n;if(!b.settings){return}if(!c.support.postMessage||(!c.support.cors&&b.settings.isCrossDomain)){return window.location=b.settings.url.fallback}var d=c(document.body),f,g,e;c("#customize-controls").on("keydown",function(h){if(13===h.which){h.preventDefault()}});g=new b.Previewer({container:"#customize-preview",form:"#customize-controls",url:b.settings.url.preview,allowedUrls:b.settings.url.allowed},{query:function(){return{customize:"on",theme:b.settings.theme.stylesheet,customized:JSON.stringify(b.get())}},nonce:c("#_wpnonce").val(),save:function(){var i=c.extend(this.query(),{action:"customize_save",nonce:this.nonce}),h=c.post(b.settings.url.ajax,i);b.trigger("save",h);d.addClass("saving");h.always(function(){d.removeClass("saving")});h.done(function(){b.trigger("saved")})}});c.each(b.settings.settings,function(i,h){b.create(i,i,h.value,{transport:h.transport,previewer:g})});c.each(b.settings.controls,function(k,i){var h=b.controlConstructor[i.type]||b.Control,j;j=b.control.add(k,new h(k,{params:i,previewer:g}))});g.refresh();(function(){var j=new b.Values(),i=j.create("saved"),h=j.create("activated");j.bind("change",function(){var l=c("#save"),k=c(".back");if(!h()){l.val(b.l10n.activate).prop("disabled",false);k.text(b.l10n.cancel)}else{if(i()){l.val(b.l10n.saved).prop("disabled",true);k.text(b.l10n.close)}else{l.val(b.l10n.save).prop("disabled",false);k.text(b.l10n.cancel)}}});i(true);h(b.settings.theme.active);b.bind("change",function(){j("saved").set(false)});b.bind("saved",function(){j("saved").set(true);j("activated").set(true)});h.bind(function(k){if(k){b.trigger("activated")}});b.state=j}());b.bind("activated",function(){if(b.settings.url.activated){window.location=b.settings.url.activated}});c(".customize-section-title").click(function(){var h=c(this).parents(".customize-section");c(".customize-section").not(h).removeClass("open");h.toggleClass("open");return false});c("#save").click(function(h){g.save();h.preventDefault()});c(".collapse-sidebar").click(function(h){d.toggleClass("collapsed");h.preventDefault()});e=new b.Messenger(b.settings.url.parent);e.bind("back",function(){c(".back").on("click.back",function(h){h.preventDefault();e.send("close")})});c.each(["saved","activated"],function(h,j){b.bind(j,function(){e.send(j)})});e.send("ready");c.each({background_image:{controls:["background_repeat","background_position_x","background_attachment"],callback:function(h){return !!h}},show_on_front:{controls:["page_on_front","page_for_posts"],callback:function(h){return"page"===h}},header_textcolor:{controls:["header_textcolor"],callback:function(h){return"blank"!==h}}},function(h,i){b(h,function(j){c.each(i.controls,function(k,l){b.control(l,function(n){var m=function(o){n.container.toggle(i.callback(o))};m(j.get());j.bind(m)})})})});b.control("display_header_text",function(i){var h="";i.elements[0].unsync(b("header_textcolor"));i.element=new b.Element(i.container.find("input"));i.element.set("blank"!==i.setting());i.element.bind(function(j){if(!j){h=b("header_textcolor").get()}i.setting.set(j?h:"blank")});i.setting.bind(function(j){i.element.set("blank"!==j)})});b.trigger("ready")})})(wp,jQuery);