/*
var chars='qwertyuiopèùàòlkjhgfdsazxcvbnm';
chars+='QWERTYUIOPÈÙÀÒLKJHGFDSAZXCVBNM';
chars+='123456789';
chars+=',.-!"£$%&/()=?^|\@#][';
*/

var chars='qwertyuioplkjhgfdsazxcvbnm';
chars+='QWERTYUIOPLKJHGFDSAZXCVBNM';
chars+='123456789';
chars+=',.-!"£$%&/()=?^|\@#][';


String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}
chars= chars.shuffle();
//console.log(chars);

function game(){
	this.start = function(columns, rows){
		this.selectedCard='';
		this.foundsCardsCount=0;
		this.foundsCards=new Array;
		this.attempts=0;
		this.failures=0;
		this.succeses=0;
		this.tooktime=0;
		this.waiting=false;
		this.rows=rows;
		this.columns=columns;
		this.cardsNumber= rows * columns;
		this.uniqueCardsNumber= this.cardsNumber/2;
		this.cards=new Array;
		this.uniqueCards=new Array;
		this.startedon= new Date().getTime();
		this.endedon= '';
		this.generateCardSet();
		this.generateHtml();
		this.updateStats();
		this.updateTimer();
	}
	this.generateCardSet= function(){
		//generate the unique cards
		for (var i=0; i<this.cardsNumber;i++){
			this.uniqueCards[i]=2;
		}
		for (var i=0; i < this.rows; i++){
			this.cards[i]=[];
			for (var h=0; h < this.columns; h++){
				this.cards[i][h]= this.assignCarId();
			}
		}
	}
	this.assignCarId = function(){
		var searchingCard=true;
		while (searchingCard) {
			var testCard=Math.floor((Math.random() * this.uniqueCardsNumber) + 1);
			if(this.uniqueCards[testCard]>=1){
				this.uniqueCards[testCard]=this.uniqueCards[testCard]-1;
				searchingCard=false;
				return testCard; 
			}else{
				searchingCard=true;
			}
		}
		return;
	}
	this.generateHtml = function(){
		this.html =''
		for (var i=0; i < this.rows; i++){
			this.html +="\n"+'<ul>'
			for (var h=0; h < this.columns; h++){
				var id='card_'+i+'_'+h+'_'+this.cards[i][h];
				this.html +="\n\t"+'<li><a class="hidden" id="'+id+'" href="javascript:testgame.clickCard(\''+id+'\')">'
				this.html +=''+chars[this.cards[i][h]]+'';
				this.html +='</a></li>'
			}
			this.html +="\n"+'</ul>'
		}
		var canvas=document.getElementById('cardcontainer');
		canvas.innerHTML = this.html;
	}
	this.getCardDataFromString= function(cardId){
		var cardString = cardId.split("_");
		return {
			row: cardString[1],
			column: cardString[2],
			type: cardString[3],
			id: cardId
		}
	}
	this.clickCard=function(cardId){
		var card = this.getCardDataFromString(cardId);
		//console.log('testing card', cardId);
		//if the card has already be found do nothing (...and wait for another selection)
		if(this.foundsCards.indexOf(card.id) > -1){
			return;
		}
		//if we are waiting for some other action to finisch
		if(this.waiting){
			return;
		}
		this.attempts=this.attempts+1;
		//if this is the first selected card... show and remember the selection
		if(this.selectedCard==''){
			this.selectedCard = card;
			document.getElementById(card.id).classList.remove("hidden");
			document.getElementById(card.id).classList.add("visible");
		}else{
			//this is the second card selected and it is the same type of the first selection (but is not the first selection)
			if(this.selectedCard.type == card.type && this.selectedCard.id != card.id){
				document.getElementById(card.id).classList.remove("hidden");
				document.getElementById(card.id).classList.add("found");
				document.getElementById(this.selectedCard.id).classList.add("found");
				//console.log('Matched',card.type);
				this.foundsCardsCount=this.foundsCardsCount+2;
				this.foundsCards.push(card.id);
				this.foundsCards.push(this.selectedCard.id);
				this.selectedCard='';
				this.succeses=this.succeses+1;
			}else{
				//console.log('NOT matched',this.selectedCard.type,card.type);
				document.getElementById(card.id).classList.add("visible");
				document.getElementById(card.id).classList.remove("hidden");
				this.waiting=true;
				this.failures=this.failures+1;
				var self=this;
				setTimeout(function(){ 
					document.getElementById(self.selectedCard.id).classList.remove("visible");
					document.getElementById(self.selectedCard.id).classList.add("hidden");
					document.getElementById(card.id).classList.remove("visible");
					document.getElementById(card.id).classList.add("hidden");
					self.selectedCard='';
					self.waiting=false;
				}, 600);
			}
		}
		this.updateStats();
		if(this.foundsCardsCount == this.cardsNumber){
			this.endedon= new Date().getTime();
			this.tooktime = this.endedon-this.startedon;
			
			alert("You WIN\nYou needed "+Math.round(this.tooktime/1000)+" seconds \n% of failed attempts: "+this.getFails()+'%');
			this.start(this.columns, this.rows);
		}
	};
	this.updateStats=function(){
		var curTime =  new Date().getTime();
		this.tooktime = curTime-this.startedon;
		var stats = document.getElementById('stats');

		stats.innerHTML ='\nFails: <span>'+this.getFails()+'%</span>';
		stats.innerHTML +='\nCards couples found: <span>'+this.foundsCardsCount/2+' / '+ this.cardsNumber/2+'</span>';
	};
	this.updateTimer=function(){
		var curTime =  new Date().getTime();
		this.tooktime = curTime-this.startedon;
		var timer = document.getElementById('timer');
		timer.innerHTML ='Time: <span>'+Math.round(this.tooktime/1000)+'</span>';
		self=this;
		setTimeout(function(){ 
			self.updateTimer();
		}, 500);
	};
	this.save=function(){
		var canvas=document.getElementById('cardcontainer');
		this.html= canvas.innerHTML;
		setCookie('savedGame',JSON.stringify(this))
	}
	this.load=function(){
		var savedGame = JSON.parse(getCookie('savedGame'));
		//console.log(savedGame);
		//merge the old(saved)object into the new objcet
		for (var attrname in savedGame) { this[attrname] = savedGame[attrname]; }
		var canvas=document.getElementById('cardcontainer');
		canvas.innerHTML= this.html;
		this.updateStats();
	}
	this.getFails=function(){
		var fails = Math.round(this.failures*100/(this.succeses+this.failures));
		if (isNaN(fails)){fails=0;}
		return fails;
	}
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}
