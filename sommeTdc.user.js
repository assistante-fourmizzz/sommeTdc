// ==UserScript==
// @name          sommeTdc
// @include       http://*fourmizzz.fr/*
// @author        GammaNu
// @version       1.1
// @namespace     http://l-assistante.fr
// @description   totalise les floods affichés dans la page courante.
// ==/UserScript==

setInterval(actualiserSommeTdc,1000);
function actualiserSommeTdc(){
	var floodList = text2json(html2text(document.body.innerHTML));
	var tdcGagné = 0;
	var tdcPerdu = 0;

	floodList.forEach(function(flood){
		if(flood.perdu) tdcPerdu += flood.tdc;
		else tdcGagné += flood.tdc
	});
	var bilanTdc = tdcGagné - tdcPerdu;
	afficherSommeTdc(tdcGagné,tdcPerdu,bilanTdc);
}
function afficherSommeTdc(tdcGagné,tdcPerdu,bilanTdc){
	var cible = singletonHtml('sommeTdc');
	if (tdcGagné || tdcPerdu || bilanTdc)
		cible.innerHTML = 'Tdc Gagné : '+entierFormaté(tdcGagné)+'cm²<br>'
			+'Tdc Perdu : '+entierFormaté(tdcPerdu)+'cm²<br>'
			+'Bilan : '+entierFormaté(bilanTdc)+'cm²';
	else cible.innerHTML = '';
}
function html2text(htmlBrut){
	return htmlBrut.replace(/<[^>]+>/g,'');
}
function text2json(textBrut){
	var listFlood = [];
	textBrut.replace(/([^\s]+) vous a pris([ 0-9]+)cm2/g,function(osef,pseudoFloodeur,tdc){
		listFlood.push({
			'perdu': true,
			'floodeur': pseudoFloodeur,
			'tdc': parseInt(tdc.replace(/\s/g,''))
		});
		return '';
	});
	textBrut.replace(/([ 0-9]+)cm2 lors de leur dernière bataille. Ces terres appartenaient à ([^\s]+)./g,function(osef,tdc,pseudoFloodé){
		listFlood.push({
			'perdu': false,
			'floodé': pseudoFloodé,
			'tdc': parseInt(tdc.replace(/\s/g,''))
		});
		return '';
	});
	return listFlood;
}
function singletonHtml(id){
	var singleton = document.getElementById(id);
	if (!singleton){
		singleton = document.createElement('div');
		singleton.setAttribute('id','sommeTdc');
		singleton.setAttribute('style','position:fixed;bottom:0;right:0;text-align:right;background:rgba(100%,100%,100%,.8);');
		document.body.appendChild(singleton);
	}
	return singleton;
}
function decoupeLeNombreParSerieDe_N_Chiffre(nombre, n){
	if(!n) n=3;
	var texteADecouper = nombre.toString();
	var debut = -2*n; //DeLaFenetreDeDecoupe
	var fin = -n; //DeLaFenetreDeDecoupe
	var tableauResultat = [];
	var extrait = texteADecouper.slice(-n);
	tableauResultat.unshift(extrait);
	while(1){
		extrait = texteADecouper.slice(debut, fin);
		if (extrait==='') break;
		tableauResultat.unshift(extrait);
		debut-=n;
		fin-=n;
	}
	return tableauResultat;
}
function entierFormaté(int){
	return decoupeLeNombreParSerieDe_N_Chiffre(int).join(' ');
}
