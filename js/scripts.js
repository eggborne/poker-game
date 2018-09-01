function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
  this.cardHTML = `<div class="playing-card protruding" id="`+this.rank+`-of-`+this.suit+`"></div>`;
  this.dimensions = {
    width: 225,
    height: 315
  }
  var card = this;
  this.getValue = function(){
    return table.ranks.slice().reverse().indexOf(this.rank);
  }
  this.animateFlipUp = function() {
    var self = this;
    var pos = {};
    pos.left = table.ranks.indexOf(self.rank) * self.dimensions.width;
    pos.top = table.suits.indexOf(self.suit) * self.dimensions.height;
    setTimeout(function(){
      self.div.css({
        'transform':'scaleX(0)'
      });
    },300);
    setTimeout(function(){
      self.div.css({
        'background-image': 'url(img/cardsheet.png)',
        'background-size': (self.dimensions.width*13)+'px '+(self.dimensions.height*4)+'px',
        'background-position': '-' + pos.left + 'px -' + pos.top + 'px'
      });
      self.div.css({
        'transform':'scaleX(1)'
      });
    },480);
  }
  this.place = function (targetElement,resize,faceDown,stayFlipped) {
    targetElement.html(this.cardHTML);
    this.div = $('#'+this.rank+`-of-`+this.suit);
    if (resize) {
      this.dimensions.width = targetElement.width();
      this.dimensions.height = targetElement.height();
    }
    var pos = {};
    pos.left = table.ranks.indexOf(this.rank) * this.dimensions.width;
    pos.top = table.suits.indexOf(this.suit) * this.dimensions.height;
    this.div.css({
      'background-image': 'url(img/cardsheet.png)',
      'background-size': (this.dimensions.width*13)+'px '+(this.dimensions.height*4)+'px',
      'background-position': '-' + pos.left + 'px -' + pos.top + 'px',
      'background-repeat': 'no-repeat',
      'width': this.dimensions.width + 'px',
      'height': this.dimensions.height + 'px'
    });
    this.div.animate({
      'opacity': '1'
    },200);
    this.div.delay(500).removeClass('protruding')
    this.div.click(function(){
      $(this).css({
        'transform':'scaleX(0)'
      });
      var self = this
      setTimeout(function(){
        if ($(self).css("background-image").includes("cardsheet")) {
          $(self).css({
            'background-image': 'url(img/cardback.png)',
            'background-size': (card.dimensions.width)+'px '+(card.dimensions.height)+'px',
            'background-position': '0 0'
          });
        } else {
          var pos = {};
          pos.left = table.ranks.indexOf(card.rank) * targetElement.width();
          pos.top = table.suits.indexOf(card.suit) * targetElement.height();
          $(self).css({
            'background-image': 'url(img/cardsheet.png)',
            'background-size': (card.dimensions.width*13)+'px '+(card.dimensions.height*4)+'px',
            'background-position': '-' + pos.left + 'px -' + pos.top + 'px'
          });
        }
      },90);
      setTimeout(function(){
        $(self).css({
          'transform':'scaleX(1)'
        });
      },180);
    });
    if (faceDown) {
      this.toggleFlip();
      var self = this;
      if (!stayFlipped) {
        self.animateFlipUp()
      }
    }
    table.dealtCards.push(this);
  }
  this.toggleFlip = function() {
    if (this.div.css("background-image").includes("cardsheet")) {
      this.div.css({
        'background-image': 'url(img/cardback.png)',
        'background-size': (this.dimensions.width)+'px '+(this.dimensions.height)+'px',
        'background-position': '0',
      });
    } else {
      var pos = {};
      pos.left = table.ranks.indexOf(this.rank) * this.dimensions.width;
      pos.top = table.suits.indexOf(this.suit) * this.dimensions.height;
      this.div.css({
        'background-image': 'url(img/cardsheet.png)',
        'background-size': (this.dimensions.width*13)+'px '+(this.dimensions.height*4)+'px',
        'background-position': '-' + pos.left + 'px -' + pos.top + 'px'
      });
    }
  }
  this.value = this.getValue();
}
function Hand(arr) {
  this.cards = arr;
  this.instances = this.getInstances(this.cards);
  this.handValue = table.evaluateHand(this);
}
Hand.prototype.sortByValue = function(cardArr=this.cards) {
  cardArr.sort(function(card1, card2){
    return card1.value - card2.value;
  })
  return cardArr;
}
Hand.prototype.getInstances = function() {
  var cardArray = this.cards
  var instancesArr = [1, 1, 1, 1, 1];
  for (var i = 0; i <= 4; i++) {
    for (var j = 1; j <= 4; j++) {
      if (cardArray[0].rank === cardArray[j].rank) {
        instancesArr[i] = instancesArr[i] + 1;
      }
    }
    cardArray.push(cardArray.splice(0,1)[0]);
  }
  instancesArr = instancesArr.sort(function(a, b) {
    return b - a;
  });
  return instancesArr;
}
function getInstances(cardArray) {
  var instancesArr = [1, 1, 1, 1, 1];
  for (var i = 0; i <= 4; i++) {
    for (var j = 1; j <= 4; j++) {
      if (cardArray[0].rank === cardArray[j].rank) {
        instancesArr[i] = instancesArr[i] + 1;
      }
    }
    cardArray.push(cardArray.splice(0,1)[0]);
  }
  instancesArr = instancesArr.sort(function(a, b) {
    return b - a;
  });
  return instancesArr;
}
function Player(human, name, bank) {
  this.human = human;
  this.name = name;
  this.bank = bank;
  this.holeCards = [];
  this.hand = undefined;
  this.blind;
  this.currentBet;
  if (!table.players.length) {
    this.slots = [
      $('#holeOne>.holeCard:first-child'),
      $('#holeOne>.holeCard:nth-child(2)'),
    ];
    this.hole = $('#holeOne')
  } else {
    this.slots = [
      $('#holeTwo>.holeCard:first-child'),
      $('#holeTwo>.holeCard:nth-child(2)'),
    ];
    this.hole = $('#holeTwo')
  }
  table.players.push(this);
  this.div = $('#player' + table.players.length);
  this.statusLabel = $('#dealer-' + table.players.length)
}
Player.prototype.addToPot = function(amount) {
  this.changeBankAmountBy(-amount);
  table.pot += amount;
}
Player.prototype.amountLeft = function (action, amount) {
  var amountLeft = 0;
  if ((action === "check") || (action === "call")) {
    amountLeft = this.bank;
  } else if ((action === "bet") || (action === "raise")) {
    amountLeft = this.bank - amount;
  } else if (action === "allIn") {
    amountLeft = 0;
  }
  return amountLeft;
}
Player.prototype.changeBankAmountBy = function (amount) {
  console.log("adding " + amount)
  this.bank += amount;
}

$(document).ready(function() {
  $("#enterName").submit(function(event) {
    event.preventDefault();
    $(".sign-in").hide();
    $("#table").show();
    var names = [($("#name1").val() || "Player 1" ), ( $("#name2").val() || "Player 2" )];
    table.initiateGame(names);
  });
  $('#call-check').click(function(){
    console.log("min bet " + table.minimumBet)
    var player = table.atBat;
    var amountToAdd = 0;
    table.calledOrChecked.push(player);
    if (table.minimumBet) {
      // call
      amountToAdd = table.minimumBet - player.currentBet;
      player.currentBet += amountToAdd;
      table.minimumBet = player.currentBet;
      player.addToPot(amountToAdd);
      table.advanceRound();
    } else {
      // check
      table.advanceTurn();
      if (table.calledOrChecked.length === table.players.length) {
        table.advanceRound();
      }
    }
    table.updateFigures();
  });
  $('#bet-raise').click(function() {
    var player = table.atBat;
    var raiseAmount = parseInt($('#funds').val());
    var matchAmount = table.minimumBet-player.currentBet
    var amountToAdd = matchAmount+raiseAmount
    player.currentBet += amountToAdd;
    table.minimumBet = player.currentBet;
    player.addToPot(amountToAdd);
    $('#call-check').text("Call " + table.minimumBet)
    table.calledOrChecked = [];
    table.updateFigures();
    table.advanceTurn();
  });
  $('#allIn').click(function(){
    var player = table.atBat;
    var raiseAmount = table.minimumBet = player.bank;
    player.currentBet += raiseAmount;
    player.addToPot(raiseAmount);
    $('#call-check').text("Call " + table.minimumBet)
    table.calledOrChecked = [];
    table.updateFigures();
    table.advanceTurn();
  });
  $('#fold').click(function(){
    var player = table.atBat;
    if (table.players[0]===table.atBat) {
      var winner = table.players[1]
    } else {
      var winner = table.players[0]
    }
    winner.bank += table.pot;
    player.holeCards[0].div.addClass('retracted');
    player.holeCards[1].div.addClass('retracted');
    setTimeout(function(){
      table.startNewHand();
    },1200);
  });
});
window.addEventListener("resize", function() {
  table.dealtCards.forEach(function(card,i){
    card.dimensions.width = $('.commCard').width();
    card.dimensions.height = $('.commCard').height();
    if (card.div.css("background-image").includes("cardsheet")) {
      var pos = {};
      pos.left = table.ranks.indexOf(card.rank) * card.dimensions.width;
      pos.top = table.suits.indexOf(card.suit) * card.dimensions.height;
      card.div.css({
        'background-size': (card.dimensions.width*13)+'px '+(card.dimensions.height*4)+'px',
        'background-position': '-' + pos.left + 'px -' + pos.top + 'px',
        'width': card.dimensions.width + 'px',
        'height': card.dimensions.height + 'px',
      });
    } else {
      card.div.css({
        'background-size': (card.dimensions.width)+'px '+(card.dimensions.height)+'px',
        'background-position': '0',
        'width': card.dimensions.width + 'px',
        'height': card.dimensions.height + 'px',
      });
    }
  });
});
document.onkeydown = function(event) {
  event.preventDefault();
  if (event.keyCode == 32 && $('#space-for-next').css('display') !== 'none') {
    table.startNewHand()
    console.log($('#space-for-next').css('opacity'))
  }
  // arrow keys for swipe actions?
};
window.addEventListener("input",function(event){
  if (event.target.id === "funds") {
    if ($('#bet-raise').text() === "Bet") {
      $('#bet-raise').text("Bet " + $('#funds').val());
    } else {
      $('#bet-raise').text("Raise " + $('#funds').val());
    }
    
  }
});

// Function just for testing purposes, will shuffle the deck, create a five card hand object.
// function fiveCardHand() {
//   var newDeck = table.shuffle();
//   var cards = [];
//   for (i = 0; i <= 4; i++) {
//     cards.push(newDeck.pop());
//   }
//   var hand = new Hand(cards);
//   return hand;
// }
// Pre-built common hands for testing purposes.

// card1 = new Card("diamonds", "ace");
// card2 = new Card("diamonds", "king");
// card3 = new Card("diamonds", "queen");
// card4 = new Card("diamonds", "jack");
// card5 = new Card("diamonds", "ten");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// royalFlush = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "two");
// card2 = new Card("diamonds", "seven");
// card3 = new Card("diamonds", "nine");
// card4 = new Card("diamonds", "four");
// card5 = new Card("diamonds", "queen");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// flush = new Hand(reallyGoodCards);

// card1 = new Card("clubs", "five");
// card2 = new Card("diamonds", "six");
// card3 = new Card("spades", "seven");
// card4 = new Card("diamonds", "eight");
// card5 = new Card("hearts", "nine");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// straight = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "three");
// card2 = new Card("clubs", "three");
// card3 = new Card("spades", "three");
// card4 = new Card("diamonds", "eight");
// card5 = new Card("spades", "eight");
// reallyGoodCards = [card4, card3, card1, card2, card5];
// fullHouse = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "five");
// card2 = new Card("clubs", "five");
// card3 = new Card("hearts", "five");
// card4 = new Card("spades", "five");
// card5 = new Card("diamonds", "king");
// reallyGoodCards = [card1, card2, card5, card3, card4];
// fourOfAKind = new Hand(reallyGoodCards);
//
// card1 = new Card("diamonds", "six");
// card2 = new Card("clubs", "six");
// card3 = new Card("hearts", "six");
// card4 = new Card("spades", "six");
// card5 = new Card("diamonds", "king");
// reallyGoodCards = [card1, card2, card5, card3, card4];
// fourOfAKind2 = new Hand(reallyGoodCards);

// card1 = new Card("diamonds", "five");
// card2 = new Card("diamonds", "six");
// card3 = new Card("diamonds", "seven");
// card4 = new Card("diamonds", "eight");
// card5 = new Card("diamonds", "nine");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// straightFlush = new Hand(reallyGoodCards);
//
// card1 = new Card("diamonds", "five");
// card2 = new Card("diamonds", "six");
// card3 = new Card("diamonds", "seven");
// card4 = new Card("diamonds", "eight");
// card5 = new Card("diamonds", "nine");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// straightFlush = new Hand(reallyGoodCards);
//
// card1 = new Card("diamonds", "five");
// card2 = new Card("clubs", "five");
// card3 = new Card("diamonds", "seven");
// card4 = new Card("spades", "seven");
// card5 = new Card("hearts", "two");
// reallyGoodCards = [card1, card5, card2, card4, card3];
// twoPair = new Hand(reallyGoodCards);
//
// card1 = new Card("diamonds", "ace");
// card2 = new Card("clubs", "jack");
// card3 = new Card("diamonds", "king");
// card4 = new Card("hearts", "ace");
// card5 = new Card("hearts", "three");
// reallyGoodCards = [card1, card2, card3, card4, card5];
// pair = new Hand(reallyGoodCards);
// //
// //
// //
// card6 = new Card("spades", "jack");
// card7 = new Card("diamonds", "four");
// sevenCardArr = [card1, card2, card3, card4, card5, card6, card7]
