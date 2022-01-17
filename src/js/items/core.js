'use strict';

const type = {
    black: {
        king: '&#9818;',
        queen: '&#9819;',
        rook: '&#9820;',
        bishop: '&#9821;',
        knight: '&#9822;',
        pawn: '&#9823;',
    },
    white: {
        king: '&#9812;',
        queen: '&#9813;',
        rook: '&#9814;',
        bishop: '&#9815;',
        knight: '&#9816;',
        pawn: '&#9817;',
    }
}

function valid(team, x, y) {
    try {
        if (!team || x < 0 || y < 0) {
            throw new Error(`인자가 없습니다. at ${[x < 0?'x':'',y < 0?'y':'',!team?'team':''].filter(x=>x!='').join(', ')}`);
        }
    } catch (e) {
        console.error(e.message);
        return false;
    }
}

function autoConnection() {
    Object.keys(this.constructor.prototype.__proto__).forEach(name => {
        Object.defineProperty(this, name, {
            get() {
                return this.constructor.prototype.__proto__[`${name}`];
            },
            set(data) {
                this.constructor.prototype.__proto__[`${name}`] = data;
            }
        })
    })
}

function injection(obj) {
    Piece.prototype.move = function (x, y) {
        console.warn(`[알림] %s이(가) X축 %d에서 %d로, Y축 %d에서 %d로 이동했습니다.`, this.name, this.x, x, this.y, y);
        if(this.name.match(/pawn/gim)){
            if (this.first == true) {
                this.first = false;
                this.attack.pop();
            }
        }

        this.x = x;
        this.y = y;
    }
    Piece.prototype.autoInject = (function () {
        obj.prototype = new Piece();
        obj.prototype.constructor = obj;
    })()
}

function Piece() {}

Piece.id = 0;

function Pawn(team, x = 0, y = 0) {
    valid.call(this, team, x, y);
    this.id = ++Piece.id;
    this.name = this.constructor.name;
    this.x = x;
    this.y = y;
    this.team = team;
    this.first = true;
    this.attack = this.first==true
    ?[[0, this.team=='black'?1:-1],
    [0, this.team=='black'?2:-2]]
    :[[0, this.team=='black'?1:-1]];
    this.unicode = type[this.team][this.name.toLowerCase()];
    this.sideAttck = [0, this.team == 'black' ? 2 : -2];
    this.select = false;
    this.drop = false;
    autoConnection.call(this);
}

function Knight(team, x = 0, y = 0) {
    valid.call(this, team, x, y);
    this.id = ++Piece.id;
    this.name = this.constructor.name;
    this.x = x;
    this.y = y;
    this.team = team;
    this.attack = [
        [-1, 2],
        [-2, 1],
        [-1, -2],
        [-2, -1],
        [1, 2],
        [2, 1],
        [1, -2],
        [2, -1],
        [-1, -2],
        [-2, -1],
        [-1, 2],
        [-2, 1],
        [1, -2],
        [2, -1],
        [1, 2],
        [2, 1],
    ];
    this.unicode = type[this.team][this.name.toLowerCase()];
    this.usualMove = 1;
    this.select = false;
    this.drop = false;
    autoConnection.call(this);
}

function Bishop(team, x = 0, y = 0) {
    valid.call(this, team, x, y);
    this.id = ++Piece.id;
    this.name = this.constructor.name;
    this.x = x;
    this.y = y;
    this.team = team;
    this.attack = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
    ];
    this.unicode = type[this.team][this.name.toLowerCase()];
    this.usualMove = 1;
    this.select = false;
    this.drop = false;
    autoConnection.call(this);
}

function Rook(team, x = 0, y = 0) {
    valid.call(this, team, x, y);
    this.id = ++Piece.id;
    this.name = this.constructor.name;
    this.x = x;
    this.y = y;
    this.team = team;
    this.attack = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
    ];
    this.unicode = type[this.team][this.name.toLowerCase()];
    this.usualMove = 1;
    this.select = false;
    this.drop = false;
    autoConnection.call(this);
}

function Queen(team, x = 0, y = 0) {
    valid.call(this, team, x, y);
    this.id = ++Piece.id;
    this.name = this.constructor.name;
    this.x = x;
    this.y = y;
    this.team = team;
    this.attack = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
        [0, -1],
        [-1, 0],
        [1, 0],
        [0, 1],
    ];
    this.unicode = type[this.team][this.name.toLowerCase()];
    this.usualMove = 1;
    this.select = false;
    this.drop = false;
    autoConnection.call(this);
}

function King(team, x = 0, y = 0) {
    valid.call(this, team, x, y);
    this.id = ++Piece.id;
    this.name = this.constructor.name;
    this.x = x;
    this.y = y;
    this.team = team;
    this.attack = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
        [0, -1],
        [-1, 0],
        [1, 0],
        [0, 1],
    ];
    this.castlable = true;
    this.castling = [
        [-1, 0],
        [1, 0],
    ]
    this.unicode = type[this.team][this.name.toLowerCase()];
    this.usualMove = 1;
    this.select = false;
    this.drop = false;
    autoConnection.call(this);
}

export {
    valid,
    autoConnection,
    injection,
    Piece,
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
};