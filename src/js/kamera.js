/*
***************************
*	Firephone icin yazildi
*	Huseyin Atasoy
*	www.atasoyweb.net
*	Eylul 2016
***************************
*/

var hataCikarsa=function(error) { alert('Hata: '+error.name); };
var videoAlani;
var baglaninca;
var aktifAkis;
var karsiAkis;

function akisiBagla(videoAlani,akis) {
	karsiAkis=akis;

	if(navigator.getUserMedia || navigator.mozGetUserMedia)
		videoAlani.src=window.URL.createObjectURL(akis);
	else if(navigator.webkitGetUserMedia)
		videoAlani.src=window.webkitURL.createObjectURL(akis);
	
	videoAlani.play();
}

function kamerayiBaslat() {
	if(document.getElementById("sesKaynak")) {
		localStorage.setItem('sesk',document.getElementById("sesKaynak").value);
		localStorage.setItem('vidk',document.getElementById("vidKaynak").value);
	}

	var kisitlar={
		audio: {
			optional: [{sourceId:localStorage.getItem('sesk')},{chromeRenderToAssociatedSink: true}]
		},
		video: {
			mandatory: {
				maxWidth: 320,
				maxHeight: 320,
				maxFrameRate:15
			},
			optional: [{sourceId:localStorage.getItem('vidk')}]
		}
	};

	if(navigator.getUserMedia) {
		navigator.getUserMedia(kisitlar, function(akis) {
			videoAlani.src=window.URL.createObjectURL(akis);
			aktifAkis=akis;
			videoAlani.play();
			baglaninca(akis);
		}, hataCikarsa);
	} else if(navigator.webkitGetUserMedia) {
		navigator.webkitGetUserMedia(kisitlar, function(akis){
			videoAlani.src=window.webkitURL.createObjectURL(akis);
			aktifAkis=akis;
			videoAlani.play();
			baglaninca(akis);
		}, hataCikarsa);
	} else if(navigator.mozGetUserMedia) {
		navigator.mozGetUserMedia(kisitlar, function(akis){
			videoAlani.src=window.URL.createObjectURL(akis);
			aktifAkis=akis;
			videoAlani.play();
			baglaninca(akis);
		}, hataCikarsa);
	}
	//tamEkranaGec();
}

function tamEkranaGec() {
	var tumGovde=document.getElementsByTagName('body')[0];
	if(tumGovde.requestFullscreen)
		tumGovde.requestFullscreen();
	else if(tumGovde.webkitRequestFullscreen)
		tumGovde.webkitRequestFullscreen();
	else if(tumGovde.mozRequestFullScreen)
		tumGovde.mozRequestFullScreen();
	else if(tumGovde.msRequestFullscreen)
		tumGovde.msRequestFullscreen();
}

function tamEkrandanCik() {
	var tumGovde=document.getElementsByTagName('body')[0];
	if(tumGovde.requestFullscreen)
		tumGovde.requestFullscreen();
	else if(tumGovde.webkitRequestFullscreen)
		tumGovde.webkitRequestFullscreen();
	else if(tumGovde.mozRequestFullScreen)
		tumGovde.mozRequestFullScreen();
	else if(tumGovde.msRequestFullscreen)
		tumGovde.msRequestFullscreen();
}

function kaynaklarGelince(kaynakBilgileri) {
	var vKaynak=document.getElementById("vidKaynak");
	var sKaynak=document.getElementById("sesKaynak");
	vKaynak.style.display='block';
	sKaynak.style.display='block';
	for (var i=0; i<kaynakBilgileri.length; i++) {		
		var siradaki=kaynakBilgileri[i];
		console.log(siradaki.kind)
		if (siradaki.kind==='video') {
			var yeniSecenek=document.createElement('option');
			yeniSecenek.value=siradaki.id;
			yeniSecenek.text=siradaki.label || 'Kamera ' + (vKaynak.length + 1);
			vKaynak.insertBefore(yeniSecenek,vKaynak.childNodes[0]);
		} else if (siradaki.kind==='audio') {
			var yeniSecenek=document.createElement('option');
			yeniSecenek.value=siradaki.id;
			yeniSecenek.text=siradaki.label || 'Mikrofon ' + (sKaynak.length + 1);
			sKaynak.insertBefore(yeniSecenek,sKaynak.childNodes[0]);
		}
	}
	kamerayiBaslat();
}

function kamerayaBaglan(videoA,baglaninca_) {
	videoAlani=videoA;
	baglaninca=baglaninca_;
	kamerayiBaslat();
}

function kamerayiKapat() {
	var i,j;
	var akislar=[karsiAkis,aktifAkis];

	for(j=0; j<2; j++)
		if(akislar[j]!=null) {
			var parcalar=akislar[j].getTracks();
			for(i=0; i<parcalar.length; i++)
				parcalar[i].stop();
		}
	karsiAkis=null;
	aktifAkis=null;
}