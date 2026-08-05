/* Motor de idiomas ES/EN — intercambia el texto de los nodos sin tocar el HTML.
   Cada página define window.I18N_MAP = { "texto en español": "text in English", ... }.
   El español es el idioma base (queda en el HTML); solo se traduce a inglés. */
(function(){
  var MAP = window.I18N_MAP || {};
  var orig = new WeakMap();
  var observer = null;

  function textNodes(){
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var a = []; while(w.nextNode()) a.push(w.currentNode); return a;
  }

  function apply(lang){
    if(observer) observer.disconnect();            // evita el bucle infinito al traducir
    textNodes().forEach(function(n){
      if(n.parentNode && n.parentNode.id === 'langToggle') return;   // no traducir el botón
      if(!orig.has(n)) orig.set(n, n.nodeValue);
      var es = orig.get(n), key = es.trim();
      if(lang === 'en' && Object.prototype.hasOwnProperty.call(MAP, key)){
        n.nodeValue = es.split(key).join(MAP[key]);  // split/join = reemplazo literal (seguro con "$")
      } else {
        n.nodeValue = es;
      }
    });
    document.documentElement.lang = lang;
    try{ localStorage.setItem('jelab_lang', lang); }catch(e){}
    var b = document.getElementById('langToggle');
    if(b){
      var lbl = (lang === 'en' ? 'ES' : 'EN');
      if(b.firstChild && b.firstChild.nodeType === 3) b.firstChild.nodeValue = lbl; // sin childList
      else b.textContent = lbl;
    }
    if(observer) observer.observe(document.body, {childList:true, subtree:true});
  }

  function cur(){ try{ return localStorage.getItem('jelab_lang') || 'es'; }catch(e){ return 'es'; } }

  window.__setLang = apply;
  window.__curLang = cur;

  function init(){
    apply(cur());
    var b = document.getElementById('langToggle');
    if(b) b.addEventListener('click', function(){ apply(cur() === 'en' ? 'es' : 'en'); });
    // re-traduce contenido generado dinámicamente (catálogo, carrito, checkout, barra)
    observer = new MutationObserver(function(){ apply(cur()); });
    observer.observe(document.body, {childList:true, subtree:true});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
