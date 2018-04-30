/*============================================================================================================
                                            Dom Functions
 ============================================================================================================*/
$(document).ready( function() {
    $('.progress').delay(1000).fadeOut('slow');
    $('.indeterminate').delay(1000).fadeOut();
    $('select').formSelect();

    InitGame();
    InitSelect();

} );
/*============================================================================================================
                                               Classes
 ============================================================================================================*/
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
    currentCards: null,
    opponent: null,
    round: 1
}

function InitGame() {
    var id = 1;
    var pokers = Card.getAllCards();
    pokers.splice(48);
    state.currentCards = 48;

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
    console.log(state);
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
}

function whetherWin() {
}

function setDesk() {
    appendCards();
    appendPlayerList();
    appendPokerList();
}

function appendCards() {
    $('#player').empty();
    $('#desk').empty();
    $('#player').text('player ' + state.currentPlayer.id);
    $('#cards').text('cards remain: ' + state.currentCards);
    $('#round').text('round: ' + state.round);
    for(let i = 0; i < state.currentPlayer.cards.length; i++){
        $('#desk').append(`<img src=img/cards/${state.currentPlayer.cards[i] + '.png'} class='hoverable waves-effect' style="margin:10px;"/>`)
    }
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