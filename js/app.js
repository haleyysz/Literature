/*============================================================================================================
                                            Dom Functions
 ============================================================================================================*/
$(document).ready( function() {
    $('.progress').delay(1000).fadeOut('slow');
    $('.indeterminate').delay(1000).fadeOut();
    $('select').formSelect();
    $('.modal').modal();
    InitGame();
    InitSelect();
} );
/*============================================================================================================
                                               Classes
 ============================================================================================================*/
const LOWER_SUIT = [3,4,5,6,7,8];
const UPPER_SUIT = [9,10,11,12,13,14];

const Card = {
    SUIT_TYPE:  ["clubs","spades","hearts","diamonds"],

    newCard: function (name, img, num) {
        return {
            name: name,
            img: img,
            num: num
        }
    },

    getCardById: function (id) {
        let card = new this.newCard(this.SUIT_TYPE[(id - 1) % 4], id + ".png", 14 - parseInt((id - 1) / 4));
        return card;
    },

    getAllCards: function () {
        let array = [];
        for(let i = 1; i <= 52; i++){
            array.push(i);
        }
        array.splice(48, 4);
        return array.sort(function(a, b){return 0.5 - Math.random()});
    }
}

const Team = {
    newTeam: function (id, score) {
        return {
            id: id,
            score: score
        }
    }
}

const Player = {
    newPlayer: function (id, team, cards){
        return {
            id: id,
            team: team,
            cards: cards
        }
    },

    getPlayerById: function (id) {
        let player = new this.newCard(id, team, cards);
        return player;
    }
}
/*============================================================================================================
                                           Basic Functions
 ============================================================================================================*/
var state = {
    team : [],
    players : [],
    currentPlayer: null,
    opponent: null,
    currentCards: 48,
    suit: 0,
    round: 1,
    scoreA: 0,
    scoreB: 0
}

function InitGame() {
    var id = 1;
    var pokers = Card.getAllCards();
    //set team
    for(var i = 0; i < pokers.length; i += 8){
        var cards = [];
        for(var j = i; j < i + 8; j++){
            cards.push(pokers[j]);
        }
        let player = Player.newPlayer(id++, 0, cards);
        state.players.push(player);
    }
    var team = chunkArray(state.players, 3);
    state.team.push(team[0]);
    state.team.push(team[1]);
    for(let i = 0; i < 2; i ++){
        for(let j = 0; j < state.team[i].length; j++){
            state.team[i][j].team = i + 1;
        }
    }
    //set current player
    state.currentPlayer = state.players[parseInt(6 * Math.random())];
    setDesk();
}

function submit() {
    let player = $('#player-list option:selected').val();
    let poker = $('#poker-list option:selected').val();
    player = parseInt(player);
    poker = parseInt(poker);

    let selectedPoker = Card.getCardById(poker);
    selectedPoker.num = convert(selectedPoker.num);
    state.opponent = state.players[player - 1];

    let index = state.opponent.cards.indexOf(poker);
    if( index != -1){
        alert("found poker: " + selectedPoker.num + " of " + selectedPoker.name);
        state.currentPlayer.cards.push(poker);
        state.opponent.cards.splice(index, 1);
    }else{
        state.currentPlayer = state.players[player - 1];
        alert("Cannot found poker: " + selectedPoker.num + " of " + selectedPoker.name + "\n\nNow turn to player " + state.currentPlayer.id + "'s round");
    }
    state.round++;
    setDesk();
    InitSelect();
    whetherWin();
    appendScore();
}

function whetherWin() {
    if(state.currentCards == 0 && (state.scoreA > state.scoreB) ){
        alert("Team A win");
    }else if (state.currentCards == 0 && (state.scoreA < state.scoreB) ){
        alert("Team B win");
    }else{
        let convertedCards = [];
        for(let i = 0; i < state.currentPlayer.cards.length; i ++){
            let temp = Card.getCardById(state.currentPlayer.cards[i]);
            convertedCards.push(temp);
        }

        let foo = [];
        for(let i = 0; i < convertedCards.length; i++){
            foo.push(convertedCards[i].num);
        }

        let isLower = arrayContainsArray(foo, LOWER_SUIT);
        let isUpper = arrayContainsArray(foo, UPPER_SUIT);
        if(isLower){
            cal(foo, convertedCards, LOWER_SUIT);

        }else if(isUpper){
            cal(foo, convertedCards, UPPER_SUIT);

        }else{
            console.log('No such mapping');
        }
    }
}

function setDesk() {
    appendCards();
    appendScore();
    appendPlayerList();
    appendPokerList();
    appendResult();
}

function appendCards() {
    $('#player').empty();
    $('#desk').empty();
    $('#player').text('player ' + state.currentPlayer.id);
    $('#cards').text('cards remain: ' + state.currentCards);
    $('#suit').text('suit: ' + state.suit);
    $('#round').text('round: ' + state.round);
    for(let i = 0; i < state.currentPlayer.cards.length; i++){
        $('#desk').append(`<img src=img/cards/${state.currentPlayer.cards[i] + '.png'} class='hoverable' style="margin:10px;"/>`);
    }
}

function appendScore() {
    $('#scoreA').text('score: ' + state.scoreA);
    $('#scoreB').text('score: ' + state.scoreB);
    $('#cards').text('cards remain: ' + state.currentCards);
    $('#suit').text('suit: ' + state.suit);
}

function appendPlayerList() {
    //append player list
    $('#player-list').empty();
    $('#player-list').prepend('<option value="0" disabled selected>Choose opponent</option>');
    if(state.currentPlayer.team == 1){
        for(let i = 4; i < 7; i++){
            $('#player-list').append(`<option value=${i}>Player ${i}</option>`);
        }
    }else if(state.currentPlayer.team == 2){
        for(let i = 1; i < 4; i++){
            $('#player-list').append(`<option value=${i}>Player ${i}</option>`);
        }
    }else{
        console.log("No such current player");
    }
    $('#player-list').formSelect();
}

function appendPokerList() {
    //append poker list
    $('#poker-list').empty();
    $('#poker-list').prepend('<option value="" disabled selected>Choose poker</option>');
    for(let i = 1; i < Card.getAllCards().length + 1; i++){
        let card = Card.getCardById(i);
        let name = convert(card.num);
        $('#poker-list').append(`<option value=${i} data-icon=img/cards/${i + '.png'}> ${name} of ${card.name} </option>`);
    }
    $('#poker-list').formSelect();

    //highlight current player
    for(let i = 1; i < 7; i++){
        $(`#player-chip${i}`).removeClass('myYellow');
    }
    $('#player-chip').addClass('myYellow');
    $(`#player-chip${state.currentPlayer.id}`).addClass('myYellow');
}

function appendResult() {
    for(let i = 0; i < state.players.length; i++){
        $(`#modal-content${i+1}`).empty();
        $('#modal').append(`<div id=modal${i+1} class="modal">
                                    <div class="modal-content" id=modal-content${i+1}>
                                    </div>
                                    <div class="modal-footer">
                                        <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
                                    </div>
                              </div>`);
        for(let j = 0; j < state.players[i].cards.length; j++){
            $(`#modal-content${i+1}`).append(`<img src=img/cards/${state.players[i].cards[j] + '.png'} class='hoverable' style="margin:10px;"/>`);
        }
    }
    $('.modal').modal();
}
/*============================================================================================================
                                         Additional Functions
 ============================================================================================================*/
function chunkArray(myArray, chunk_size){
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index+chunk_size);
        tempArray.push(myChunk);
    }
    return tempArray;
}

function convert(num){
    let name = "";
    switch (num){
        case 14: {
            name = "A";
            break;
        }
        case 13: {
            name = "K";
            break;
        }
        case 12: {
            name = "Q";
            break;
        }
        case 11: {
            name = "J";
            break;
        }
        default:{
            name = num;
            break;
        }
    }
    return name;
}

function arrayContainsArray (superset, subset) {
    if (0 === subset.length) {
        return false;
    }
    return subset.every(function (value) {
        return (superset.indexOf(value) >= 0);
    });
}

function InitSelect(){
    $('#select').addClass('disabled');
    $('select')
        .change( function () {
            $('select').each(function() {
                let player = $('#player-list option:selected').val();
                let poker = $('#poker-list option:selected').val();
                if (player != 0 && poker != null && poker != "") {
                    $('#select').removeClass('disabled');
                }
            });
        })
        .trigger("change");

    $('#player-list')
        .change( function () {
            $('#player-list').each(function () {
                let player = $('#player-list option:selected').val();
                for(let i = 1; i < 7; i++){
                    $(`#player-chip${i}`).removeClass('myRed');
                }
                $(`#player-chip${player}`).addClass('myRed');
            });
        })
        .trigger("change");
}

function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}

function cal(foo, cards, suit) {
    let temp = [];
    for(let i = 0; i < foo.length; i++){
        let index = foo.indexOf(suit[i]);
        if( index != -1 ){
            foo.splice(index, 1);
            cards.splice(index, 1);
        }
    }
    for(let i = 0; i < cards.length; i++){
        temp.push(parseInt(cards[i].img.slice(0,-4)));
    }
    state.currentPlayer.cards = temp;
    appendCards();
    appendResult();

    if(state.currentPlayer.team == 1){
        state.scoreA ++;
        alert("Team A got 1 score\n");
    }else if(state.currentPlayer.team == 2){
        state.scoreB ++;
        alert("Team B got 1 score\n");
    }
    state.currentCards -= 6;
    state.suit ++;
}