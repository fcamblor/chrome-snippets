(function () {

  function loadLib(globalLongName, globalShortName, libUrl) {
    if ( !window[globalLongName] ) {
      var shortNamenUse = !!window[globalShortName];
      var s = document.createElement('script');
      s.setAttribute('src', libUrl);
      s.addEventListener('load', function(){
        console.info(globalLongName+' loaded!');

        if(shortNamenUse && window[globalLongName]) {
          if(window[globalLongName].noConflict) {
            window[globalLongName].noConflict();
          }
          console.info('`'+globalShortName+'` already in use; use `'+globalLongName+'`');
        }
      });

      document.body.appendChild(s);
    } else {
      console.log(globalLongName+" skipped as already there !");
    }
  }

  loadLib('lodash', '_', '//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js');
  loadLib('jQuery', '$', '//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js');
  loadLib('Q', 'Q', '//cdnjs.cloudflare.com/ajax/libs/q.js/1.4.1/q.js');
})();

