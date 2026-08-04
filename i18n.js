/* Motor de idiomas ES/EN — intercambia el texto de los nodos sin tocar el HTML.
   Cada página define window.I18N_MAP = { "texto en español": "text in English", ... }.
   El español es el idioma base (queda en el HTML); solo se traduce a inglés. */
(function(){
  var MAP = window.I18N_MAP || {};
  var orig = new WeakMap();

  function textNodes(){
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var a = []; while(w.nextNode()) a.push(w.currentNode); return a;
  }
  function apply(lang){
    textNodes().forEach(function(n){
      if(!orig.has(n)) orig.set(n, n.nodeValue);
      var es = orig.get(n), key = es.trim();
      if(lang === 'en' && Object.prototype.hasOwnProperty.call(MAP, key)){
        n.nodeValue = es.replace(key, MAP[key]);
      } else {
        n.nodeValue = es;
      }
    });
    document.documentElement.lang = lang;
    try{ localStorage.setItem('jelab_lang', lang); }catch(e){}
    var b = document.getElementById('langToggle');
    if(b) b.textContent = (lang === 'en' ? 'ES' : 'EN');
  }
  function cur(){ try{ return localStorage.getItem('jelab_lang') || 'es'; }catch(e){ return 'es'; } }

  window.__setLang = apply;
  window.__curLang = cur;

  function init(){
    apply(cur());
    var b = document.getElementById('langToggle');
    if(b) b.addEventListener('click', function(){ apply(cur() === 'en' ? 'es' : 'en'); });
    // re-traduce contenido generado dinámicamente (catálogo, carrito, checkout)
    new MutationObserver(function(){ apply(cur()); }).observe(document.body, {childList:true, subtree:true});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
