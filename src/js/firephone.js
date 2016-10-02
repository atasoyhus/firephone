/*
***************************
*	Firephone icin yazildi
*	Huseyin Atasoy
*	www.atasoyweb.net
*	Eylul 2016
***************************
*/

//if (navigator.serviceWorker) {
//	navigator.serviceWorker.register('arkaplanservis.js', {scope: './'}).then(function(r) {
//		console.log('kaydedildi');
//	}).catch(function(e) {
//		console.log('hata');
//		console.error(e);
//	});
//} else {
//	console.log('Tarayýcýnýz arkaplan servislerini desteklenmiyor!')
//}

var katmanlar=[];
var seciliMenuler=[];

function sonE(dizi) {
	if(dizi.length==0) return '';
	return dizi[dizi.length-1];
}
function katmanaGec(katman) {
	var katid=katman.attr('id');

	if(katmanlar.length>0) {
		var son=katmanlar[katmanlar.length-1];
		if(son=='#anadis' || son=='#yukdis') {
			katmanlar.pop();
			seciliMenuler.pop();
		}
		var s=$(son);
		katmanDegisiyor();
		s.stop();
		s.hide();
	}

	// Anaekranlar seçiliyken geri gitme geçmiþini sýfýrlayalým.
	if(katman.hasClass('geriyok')) {
		while(katmanlar.length>0) katmanlar.pop();
		while(seciliMenuler.length>0) seciliMenuler.pop();
	}

	katman.addClass('sbgizli');
	katman.slideDown(function(){katman.removeClass('sbgizli')});

	katmanlar.push('#'+katid);

	// Burada katmanlar için menüleri seçelim:
	if(katid=='anadis') {
		menuleriAktifEt('#mgiris');
	}
	else if(katid=='arklardis' || katid=='davetlerdis') {
		menuleriAktifEt('#mcikis,#markadaslar,#mdavetler')
		altMenuleriAktifEt('#msenkronizeet'+(katid=='arklardis'?',#myeniarkadas':''));
	}
	else if(katid=='arkadasekle')
		altMenuleriAktifEt('#mgeri');
	
	var m=$('.kosemenu .menu:visible');
	if(m.length>0)
		seciliMenuler.push(m.map(function() {
			return '#'+this.id;
		}).get().join(','));
	else
		seciliMenuler.push('');
}

function katmanDegisiyor() {
	var son=sonE(katmanlar);
	if(son=='#arkadasekle') { // Otomatik tamamlamayý kapatalým
		//$('#arkadasekle input').eq(1).autocomplete().off();
	}
}

function geriGit() {
	if(katmanlar.length<2) return;

	katmanDegisiyor();

	$(katmanlar.pop()).hide();
	seciliMenuler.pop(); // Bunlar çöpe
	menuleriAktifEt(seciliMenuler.pop());
	katmanaGec($(katmanlar.pop())); // Çekip bir daha eklemiþ olacaðýz ama olsun.
}

function bekletmeEkrani(neDiyeyim) {
	if(neDiyeyim!=null) $('#animasyonlu').html(neDiyeyim);
	katmanaGec($('#yukdis'));
}

function menuleriAktifEt(istenenler) {
	$('.kosemenu .menu').hide();
	if(istenenler!=null && istenenler!='')
		$(istenenler).show();
}
function altMenuleriAktifEt(istenenler) {
	$('#sagmenu .menu').hide();
	if(istenenler!=null)
		$(istenenler).show();
}

function mTiklandi(gonderen) {
	tKapat();

	setTimeout(function() {	
		var g=$(gonderen);
		var kimicin=g.data('kim-icin');
		var mid=g.attr('id');
		//katmanaGec($('#yukdis'));
		//setTimeout(function(){	katmanaGec($('#'+kimicin));},1000);
		if(kimicin=='anadis') {
			if(mid=='mcikis')
				cikisYap();
			katmanaGec($('#anadis'));
		} else if(kimicin=='arklardis')
			kisileriYukle();
		else if(kimicin=='davetlerdis')
			davetleriYukle();
		
		if(mid=='muyeler')
			uyeleriGoster();
		else if(mid=='mgeri')
			geriGit();
		else if(mid=='myeniarkadas') {
			$('#arkadasekle input').val('');
			katmanaGec($('#arkadasekle'));
		} else if(mid=='msenkronizeet') {
			// Kimi senkronize edeceðiz?
			if(sonE(katmanlar)=='#arklardis')
				kisileriYukle(true);
			else if(sonE(katmanlar)=='#davetlerdis')
				davetleriYukle(true);
		}
	},600); /* Önce menü kapansýn diye. orada transition için 0.5 sn vermiþtik. */

	return false;
}

function mAcKapat(no,ac) {
	if(ac)
		$('#devortu').show();
	else
		$('#devortu').hide();

	var m=(no==1?'#solmenu':'#sagmenu');
	//JQuery ile (gerek yok ama):
	//var u=(ac==1?'+=250':'-=250');
	//$(m).animate({'width':u});
	var u=(ac==1?'250px':'0');
	$(m).css('width',u);
}
function tKapat() {
	mAcKapat(1,0);
	mAcKapat(2,0);
}

var sonZamanlayici=null;
function sureKontrol(cagiran) {
	var c=$(cagiran);
	clearTimeout(sonZamanlayici);
	sonZamanlayici=setTimeout(function(){
		sonZamanlayici=null;
		c.toggleClass('lsecili');
		c.find('.sagbuton').toggleClass('gizli');
		//alert('uzun');
	},500)
}
function iptal() {
	if(sonZamanlayici!=-1) {
		clearTimeout(sonZamanlayici);
		//alert('kýsa')
	}
}

function listeyeHazirla(isim,durum,kimlik,sagbutonlar) {
	return '<div class="leleman" onmousedown="sureKontrol(this)" onmouseup="iptal()" data-kimlik="'+kimlik+'"><div class="minikutu">'+isim.substr(0,1).toUpperCase()+'</div><div class="isim">'+isim+'</div>'+sagbutonlar+'<div class="durum">'+durum+'&nbsp;</div></div>';
}
