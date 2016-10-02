/*
***************************
*	Firephone icin yazildi
*	Huseyin Atasoy
*	www.atasoyweb.net
*	Eylul 2016
***************************
*/

var kimligim='';
var ismim='';
var emailim='';
var emailim_='';
var saatFarki=0;
var sonGiris=null;

var arkadaslar_kimlik=[];
var arkadaslar_isim=[];

function kaydet(neolarak,neyi) {
	localStorage.setItem(neolarak,JSON.stringify(neyi));
}
function yerelden(neyi) {
	var a=localStorage.getItem(neyi);
	if(a)
		return JSON.parse(a);
	else
		return null;
}

$(document).ready(function(){
	menuleriAktifEt(null); // Tüm menüleri gizleyelim
	bekletmeEkrani('hazırlanıyor');

	var d=new Date();
	saatFarki=d.getTimezoneOffset();

	var bilgiler={
		apiKey: "--",
		authDomain: "--.firebaseapp.com",
		databaseURL: "https://--.firebaseio.com"
	};

	setTimeout(function() {
		try { // Zaten yüklü olabilir...
			firebase.initializeApp(bilgiler);
		} catch(e){ }

		firebase.auth().onAuthStateChanged(function(kullanici) {
			if (kullanici)
				girisBasarili();
			else {
				katmanaGec($('#anadis'));
			}
		});
	},1000);
});

var girisYapilsin=false;
function girisYap() {
	girisYapilsin=true;
	bekletmeEkrani('giriş bekleniyor');

	var provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope('https://www.googleapis.com/auth/plus.login');
	firebase.auth().signInWithPopup(provider).then(function(sonuc) {
		var k=sonuc.user;
		firebase.database().ref('/kullanicilar/'+k.uid+'/bilgiler').set({email:k.email,isim:k.displayName,zaman:firebase.database.ServerValue.TIMESTAMP});
	}).catch(function(e) {
		console.log(e)
		alert('Hata! Giriş yapılamadı.');
		katmanaGec($('#anadis'));
	});
	return false;
}

function cikisYap() {
	girisYapilsin=false;
	firebase.auth().signOut().then(function() {
	},function(e) {
		alert('Hata! Çıkış yapılamadı!');
		katmanaGec($('#arklardis'));
	});
}

function girisBasarili() {
	kimligim=firebase.auth().currentUser.uid;
	ismim=firebase.auth().currentUser.displayName;
	emailim=firebase.auth().currentUser.email;
	emailim_=emailim.replace('@gmail.com','').replace('.','%2E');
	firebase.database().ref('/kullanicilar/'+kimligim+'/bilgiler/zaman').set(firebase.database.ServerValue.TIMESTAMP);
	firebase.database().ref('/kullanicilar/'+kimligim+'/bilgiler/zaman').once('value',function(gelen){
		sonGiris=gelen.val();
		kisileriYukle(false);
		aramaDinlemeyeGec();
	});
}

function arkadasiSil(gonderen) {
	bekletmeEkrani('siliniyor');
	var kimlik=$(gonderen).parent().data('kimlik');
	firebase.database().ref('/kullanicilar/'+kimlik+'/arkadaslar/'+kimligim).remove(function() {
		firebase.database().ref('/kullanicilar/'+kimligim+'/arkadaslar/'+kimlik).remove(function() {
			kisileriYukle(true);
		});
	});
}

var kalip=new RegExp("^[a-z0-9\-\_\'\.]{3,30}$");
function davetGonder() {
	var g=$('#arkadasekle input');
	var kullanici=g.eq(0).val();
	if(!kalip.test(kullanici)) {
		alert('Kullanıcı adı geçerli değil. Lütfen eklemek istediğiniz kullanıcının adresini @gmail.com uzantısı olmadan yazın.')
		return;
	}
	kullanici=kullanici.replace('.','%2E');

	bekletmeEkrani('istek gönderiliyor');

	var fbVT=firebase.database();
	firebase.database().ref('/davetler/'+kullanici+'/'+kimligim).set({isim:ismim,email:emailim}).then(function(){
		kisileriYukle(false);
	}).catch(function(e) {
		alert('Hata!');
		kisileriYukle(false);
	});
}

function sifirla() {
	$('.ara').show();
	arayanKisi=null;
	arananKisi=null;
	gorusmePen=null;
}

var arayanKisi=null;
var arayanTanimlayici=null;
function aramaDinlemeyeGec() {
	firebase.database().ref('/kullanicilar/'+kimligim+'/aramalar').orderByChild("zaman").startAt(sonGiris+1).on('child_added', function(gelen) {
		var g=gelen.val();
		arayanKisi=g.kimlik;
		var tanimlayici=g.tanimlayici;
		if(arananKisi!=null && tanimlayici.indexOf('answer')>0)
			gorusmePen.window.baglantiyaYenitGeldi(tanimlayici);
		else if(tanimlayici.indexOf('offer')>0) {
			arayanTanimlayici=tanimlayici;
			gorusmePenAc();
		}
	});
}

function gorusmePenAc() {
	gorusmePen=window.open("arama.html", "FirePhone_arama"+Math.random(), "width=455,height=550,top=10,left=10,toolbar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0");
	if(!gorusmePen)
		alert('Pencere açılamadı!');
	else
		$('.ara').hide();
	return gorusmePen;
}

var arananKisi=null;
var gorusmePen=null;
function gorusmeBaslat(cagiran) {
	arananKisi=$(cagiran).parent().data('kimlik');
	if(!gorusmePenAc())
		arananKisi=null;
}

function kisileriYukle(senkronizeEt) {
	bekletmeEkrani('kişiler yükleniyor');

	if(senkronizeEt || yerelden('arklar_sonSenkZ')==null) {
		bekletmeEkrani('senkronize ediliyor');
		firebase.database().ref('/kullanicilar/'+kimligim+'/arkadaslar').once('value', function(gelen) {
			//kaydet('arklar_sonSenkZ',Date.now());
			//kaydet('arklar',l);
			if (gelen.val()==null) {
				$('#arklaricerik').html('<div class="leleman lbos">Arkadaş listeniz boş.</div>');
				katmanaGec($('#arklardis'));
				return;
			}

			$('#arklaricerik').html('');
			katmanaGec($('#arklardis'));

			var ark=gelen.val();
			var l='';
			arkadaslar_kimlik=[];
			arkadaslar_isim=[];
			gelen.forEach(function(siradaki){
				var kimlik=siradaki.key;
				firebase.database().ref('/kullanicilar/'+kimlik+'/bilgiler').once('value',function(gelen) {
					var d=gelen.val();
					var isim=d.isim;
					arkadaslar_kimlik.push(kimlik);
					arkadaslar_isim.push(isim);
					$('#arklaricerik').prepend(listeyeHazirla(isim,d.email,kimlik,'<span class="sagbuton olumsuz gizli" onclick="arkadasiSil(this)">&#10006;</span><span class="sagbuton olumlu ara" onclick="gorusmeBaslat(this)">&#9742;</span>'));
				});
			});
		});
	}
	else {
		$('#arklaricerik').html(yerelden('arklar'));
		katmanaGec($('#arklardis'));
	}
}

function davetiSil(arkadask) {
	firebase.database().ref('/davetler/'+emailim_+'/'+arkadask).remove();
}

function davetKabul(cagiran) {
	bekletmeEkrani('arkadaş ekleniyor');
	
	//Arkadaşı ekleme (onunkine kendimi ve kendiminkine onunkini yazabilirim sadece ve eğer davet yollamışsa):
	var arkadask=$(cagiran).parent().data('kimlik');
	var fb=firebase.database();
	fb.ref('/kullanicilar/'+arkadask+'/arkadaslar/'+kimligim).set(true,function() {
		fb.ref('/kullanicilar/'+kimligim+'/arkadaslar/'+arkadask).set(true,function(){
			davetiSil(arkadask);
			davetleriYukle(true);
		});
	});
}

function davetRet(cagiran) {
	davetiSil($(cagiran).parent().data('kimlik'));
	davetleriYukle(true);
}

function davetleriYukle(senkronizeEt) {
	bekletmeEkrani('davetler yükleniyor');

	if(senkronizeEt || yerelden('davetler_sonSenkZ')==null) {
		bekletmeEkrani('senkronize ediliyor');
		firebase.database().ref('/davetler/'+emailim_).once('value', function(gelen) {
			var ark=gelen.val();
			var l='';
			gelen.forEach(function(siradaki) {
				var kimlik=siradaki.key;
				var d=siradaki.val();
				l+=listeyeHazirla(d.isim,d.email,kimlik,'<span class="sagbuton olumlu" onclick="davetKabul(this)">&#10004;</span><span class="sagbuton olumsuz" onclick="davetRet(this)">&#10006;</span>');
			});
			if(l=='') l='<div class="leleman lbos">Davet bulunmuyor.</div>';
			$('#davetler').html(l);
			//kaydet('davetler_sonSenkZ',Date.now());
			//kaydet('arklar',l);
			katmanaGec($('#davetlerdis'));
		});
	}
	else {
		$('#arklaricerik').html(yerelden('arklar'));
		katmanaGec($('#arklardis'));
	}
}