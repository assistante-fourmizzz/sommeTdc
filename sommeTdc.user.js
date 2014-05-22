// ==UserScript==
// @name			sommeTdc
// @include			http://*fourmizzz.fr/*
// @author			GammaNu
// @version			1.5
// @namespace		http://l-assistante.fr
// @updateURL		https://github.com/assistante-fourmizzz/sommeTdc/raw/master/sommeTdc.user.js
// @downloadURL		https://github.com/assistante-fourmizzz/sommeTdc/raw/master/sommeTdc.user.js
// @icon			http://l-assistante.fr/static/img/assistanteSquareI.png
// @description		Totalise les floods affichés dans la page courante.
// ==/UserScript==

setInterval(actualiserSommeTdc,1000);
function actualiserSommeTdc(){
	var donnéesAParser = document.body.innerHTML;
	var listeTextArea = document.getElementsByTagName('textarea');
	for(var clef=0; clef<listeTextArea.length;clef++) donnéesAParser += listeTextArea[clef].value;
	var floodList = text2json(html2text(donnéesAParser));
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
	var cible = singletonHtml('sommeTdc',
		{'style':'position:fixed;bottom:0;right:0;text-align:right;background:rgba(100%,100%,100%,.8);'}
	);

	if(afficherSommeTdc.tdcGagné != tdcGagné
		|| afficherSommeTdc.tdcPerdu != tdcPerdu
		|| afficherSommeTdc.bilanTdc != bilanTdc
		){
		if (tdcGagné || tdcPerdu || bilanTdc){
			cible.innerHTML = 'Tdc Gagné : <span style="color:'+couleur(tdcGagné)+'">'+entierFormaté(tdcGagné)+'</span> cm²<br>'
				+'Tdc Perdu : <span style="color:'+couleur(-tdcPerdu)+'">'+entierFormaté(tdcPerdu)+'</span> cm²<br>'
				+'<strong>Bilan : <span style="color:'+couleur(bilanTdc)+'">'+entierFormaté(bilanTdc,true)+'</span> cm²</strong>';
			var textArea = document.getElementById('message');
			if(textArea){
				textArea.setAttribute('data-totaux',"\n\n"
					+'Tdc Gagné : [color='+couleur(tdcGagné)+']'+entierFormaté(tdcGagné)+'[/color] cm²'+"\n"
					+'Tdc Perdu : [color='+couleur(-tdcPerdu)+']'+entierFormaté(tdcPerdu)+'[/color] cm²'+"\n"
					+'[b]Bilan : [color='+couleur(bilanTdc)+']'+entierFormaté(bilanTdc,true)+'[/color] cm²[/b]');
				ajouterBoutonBilanFlood();
			}
		}
		else cible.innerHTML = '';
	}
	afficherSommeTdc.tdcGagné = tdcGagné;
	afficherSommeTdc.tdcPerdu = tdcPerdu;
	afficherSommeTdc.bilanTdc = bilanTdc;
}
function html2text(htmlBrut){
	return htmlBrut.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ');
}
function text2json(textBrut){
	var listFlood = [];
	textBrut.replace(/([^\s]+)\s*vous\s+a\s+pris([ 0-9]+)cm2/g,function(osef,pseudoFloodeur,tdc){
		listFlood.push({
			'perdu': true,
			'floodeur': pseudoFloodeur,
			'tdc': parseInt(tdc.replace(/\s/g,''))
		});
		return '';
	});
	textBrut.replace(/([ 0-9]+)cm2\s+lors\s+de\s+leur\s+dernière\s+bataille.\s+Ces\s+terres\s+appartenaient\s+à\s*([^\s]+)\s*.\s*/g,function(osef,tdc,pseudoFloodé){
		listFlood.push({
			'perdu': false,
			'floodé': pseudoFloodé,
			'tdc': parseInt(tdc.replace(/\s/g,''))
		});
		return '';
	});
	return listFlood;
}
function singletonHtml(id,attributes,balise,idInsertion){
	var singleton = document.getElementById(id);
	if (!singleton){
		if(!balise) balise = 'div';
		singleton = document.createElement(balise);
		singleton.setAttribute('id',id);
		for(var nomAttribut in attributes) singleton.setAttribute(nomAttribut,attributes[nomAttribut]);
		if(idInsertion) {
			var balisePrécédente = document.getElementById(idInsertion);
			balisePrécédente.parentNode.insertBefore(singleton, balisePrécédente.nextSibling);
		}
		else document.body.appendChild(singleton);
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
function entierFormaté(int, signeExplicite){
	var nombreFormatté = decoupeLeNombreParSerieDe_N_Chiffre(int).join(' ');
	if(signeExplicite && nombreFormatté[0]!= '-') nombreFormatté = '+'+nombreFormatté;
	return nombreFormatté;
}
function couleur(nombre){
	if(nombre>0) return '#09750c';
	if(nombre<0) return '#c5130f';
	if(nombre===0) return '#242424';
}
function ajouterBoutonBilanFlood(){
	singletonHtml('totauxFlood',{
		'value':'Totaux flood',
		'type':'button',
		'onclick':'var textArea = document.getElementById("message"); textArea.value += textArea.getAttribute("data-totaux");return false;'
	},'input','message');
}