/*
***************************
*	Firephone icin yazildi
*	Huseyin Atasoy
*	www.atasoyweb.net
*	Eylul 2016
***************************
*/

var anaPen;
var karsiTaraf;

$(document).ready(function(){
	var v=$('.videodis');
	v.resizable({aspectRatio:true,handles:{'se':'#boyutlandirici'},minHeight:50,minWidth:50,containment:'#dis'});
	v.draggable({containment:'window'});
	
	$(window).bind("beforeunload", function() {
		anaPen.sifirla();
		baglantiyiKopar(true);
	});
		
	anaPen=window.opener;
	var ek='';
	if(anaPen.arananKisi!=null) {
		ek='<br>aranıyor';
		$('#bagla').hide();
		$('#reddet').html('Kapat');
		$('#reddet').css('width','100%');
		karsiTaraf=anaPen.arananKisi;
		baglantiBekle(); // Tanımlayıcıyı hazırlayıp bağlantı bekleyeceğiz
	}
	else if(anaPen.arayanKisi!=null) {
		ek='<br>arıyor';
		karsiTaraf=anaPen.arayanKisi;
		//baglan(anaPen.arayanTanimlayici);
	}
	var ind=$.inArray(karsiTaraf,anaPen.arkadaslar_kimlik);
	var ismi=anaPen.arkadaslar_isim[ind];
	$('#bilgi').html(ismi+ek);
});

function kabulEt() {
	baglan(anaPen.arayanTanimlayici);
}
function reddet() {
	window.close();
}
function sGosterGizle() {
	$('#yanit').toggle();
}
function kapatmaDugmeleriniHazirla() {
	$('#yukleniyor').hide();
	$('#yanit').hide();
	$('#bagla').hide();
	$('#reddet').html('Görüşmeyi sonlandır');
	$('#reddet').css('width','100%');
}

function tanimlayicimBelliOlunca(tanimlayicim) {
	if(anaPen.arananKisi!=null)
		anaPen.firebase.database().ref('/kullanicilar/'+karsiTaraf+'/aramalar').push({
			kimlik: anaPen.kimligim,
			cevaplandi: true,
			tanimlayici: tanimlayicim,
			zaman: anaPen.firebase.database.ServerValue.TIMESTAMP
		});
}

function yanitimBelliOlunca(yanit) {
	anaPen.firebase.database().ref('/kullanicilar/'+karsiTaraf+'/aramalar').push({
		kimlik: anaPen.kimligim,
		cevaplandi: true,
		tanimlayici: yanit,
		zaman: anaPen.firebase.database.ServerValue.TIMESTAMP
	});
}

var rtcAyarlar={'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
//var rtcAyarlar={'iceServers': []};
var srtpicin={'optional': [{'DtlsSrtpKeyAgreement': true}]};

var sdpKisitlari={
	optional: [],
	mandatory: {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true
	}
};

var OturumTanimlayici;
if (navigator.mozGetUserMedia) { // Firefox
	RTCPb=mozRTCPeerConnection;
	OturumTanimlayici=mozRTCSessionDescription;
} else {// if(navigator.webkitGetUserMedia) { // Chrome ve diğerleri...
	RTCPb=webkitRTCPeerConnection;
	OturumTanimlayici=RTCSessionDescription;
}

var bilg1=new RTCPb(rtcAyarlar,srtpicin);
var bilg2=new RTCPb(rtcAyarlar,srtpicin);


var bgDegistir=true;
bgSes=25;
bgVideo=100;
function bantGenisligi(sdp) {
	sdp=sdp.replace( /b=AS([^\r\n]+\r\n)/g ,''); // varsa sil
    sdp=sdp.replace(/a=mid:audio\r\n/g,'a=mid:audio\r\nb=AS:'+bgSes+'\r\n');
    sdp=sdp.replace(/a=mid:video\r\n/g,'a=mid:video\r\nb=AS:' +bgVideo+'\r\n');
    return sdp;
}

var aktifKanal=null;
function baglantiBekle() {
	kamerayaBaglan(document.getElementById('video1'), function(akis) {
		bilg1.addStream(akis);

		try {
			aktifKanal=bilg1.createDataChannel('kanal', {reliable: true});
			//aktifKanal.onopen=function(e) { console.log('kanal bağlandı') }
			aktifKanal.onmessage=mesajYorumla;
		}catch(e) { console.log('Hata!') }

		bilg1.createOffer(
			function(yerelT) {
				if(bgDegistir) yerelT.sdp=bantGenisligi(yerelT.sdp);
				bilg1.setLocalDescription(yerelT);
			},
			function(e) { console.log('Olmadı!') },
			sdpKisitlari
		);
	});
}

function baglantiyaYenitGeldi(gelen) {
	$('#bilgi').text('bağlanılıyor');
	bilg1.setRemoteDescription(new OturumTanimlayici(JSON.parse(gelen)));
}

function baglan(tanimlayici) {
	kamerayaBaglan(document.getElementById('video1'), function(akis) {
		bilg2.addStream(akis);
		bilg2.setRemoteDescription(new OturumTanimlayici(JSON.parse(tanimlayici)));
		bilg2.createAnswer(
			function(yanitT) {
				if(bgDegistir) yanitT.sdp=bantGenisligi(yanitT.sdp);
				bilg2.setLocalDescription(yanitT);
			},
			function(e) { console.log('Olmadı!') },
			sdpKisitlari
		);
		
	});
}

function baglantiyiKopar(mGonder) {
	if(mGonder)
		mesajGonder(0,'sonlandir');

	kamerayiKapat();

	if(bilg1.signalingState!='closed') bilg1.close();
	if(bilg2.signalingState!='closed') bilg2.close();
	window.close();
}

bilg1.onicecandidate=function(e) {
	if (e.candidate==null) { // Bittiler
		var tanimlayici=JSON.stringify(bilg1.localDescription);
		tanimlayicimBelliOlunca(tanimlayici);
	}
};

bilg2.onicecandidate=function(e) {
	if (e.candidate==null) { // Bittiler
		var yanit=JSON.stringify(bilg2.localDescription);
		yanitimBelliOlunca(yanit); // bilg2'yi hep yanıt için kullanıyoruz
	}
};

bilg1.oniceconnectionstatechange=function oniceconnectionstatechange(durum) {
	if(bilg1.iceConnectionState=='disconnected')
		baglantiyiKopar(false);
	else if(bilg1.iceConnectionState=='failed') {
		alert('Bağlantı hatası!');
		baglantiyiKopar(false);
	}
}

bilg2.oniceconnectionstatechange=function oniceconnectionstatechange(durum) {
	if(bilg2.iceConnectionState=='disconnected')
		baglantiyiKopar(false);
	else if(bilg2.iceConnectionState=='failed') {
		alert('Bağlantı hatası!');
		baglantiyiKopar(false);
	}
}


function akisBaglaninca(e) {
	kapatmaDugmeleriniHazirla();
	akisiBagla(document.getElementById('video2'),e.stream);
}
bilg1.onaddstream=akisBaglaninca;
bilg2.onaddstream=akisBaglaninca;

function mesajGonder(tip,mesaj) {
	if(aktifKanal!=null)
		aktifKanal.send(JSON.stringify({tip:tip,icerik:mesaj}));
}

function mesajYorumla(e) {
	var mesaj=JSON.parse(e.data);
	if(mesaj.tip==0) { // 0 sistem mesajları olsun.
		if(mesaj.icerik=='sonlandir')
			baglantiyiKopar(false);
	}
}

bilg2.ondatachannel=function(e) {
	aktifKanal=e.channel || e; // firefox kanalı direkt yolladığı için
	//aktifKanal.onopen=function(e) { console.log('kanal bağlandı') }
	aktifKanal.onmessage=mesajYorumla;
};

//bilg1.onconnection=function(e){ };
//bilg2.onconnection=function(e){ };

//bilg1.onicegatheringstatechange=function(e){ };
//bilg2.onicegatheringstatechange=function(e){ };

//bilg1.onsignalingstatechange=function(e){ };
//bilg2.onsignalingstatechange=function(e){ };

//bilg1.onclose=function(e){ };
//bilg2.onclose=function(e){ };

//bilg1.onremovestream=function(e){ };
//bilg2.onremovestream=function(e){ };
