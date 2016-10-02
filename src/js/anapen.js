/*
***************************
*	Firephone icin yazildi
*	Huseyin Atasoy
*	www.atasoyweb.net
*	Eylul 2016
***************************
*/

function yeniPen() {
	if(!window.open("firephone.html", "FirePhone", "width=455,height=550,top=10,left=10,toolbar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0"))
		alert('Pencere açýlamadý. Açýlýr pencerelerin engellenmediðinden emin olunuz.');
	return false;
}