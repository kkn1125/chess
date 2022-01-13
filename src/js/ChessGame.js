(function(){

    function Controller () {
        let models = null;

        this.init = function (model) {
            models = model;

            this.startGame();
            window.addEventListener('click', this.selectPiece);
            window.addEventListener('click', this.moveToPath);
            window.addEventListener('click', this.backward);
        }

        this.startGame = function () {
            models.startGame();
        }

        this.backward = function (ev) {
            const target = ev.target;
            if(target.id != 'backward') return;

            models.backword(target);
        }

        this.selectPiece = function (ev) {
            const target = ev.target;
            if(target.tagName !== 'SPAN') return;
            models.selectPiece(target);
        }

        this.moveToPath = function (ev) {
            const target = ev.target;
            if(!target.classList.contains('move')) return;
            models.moveToPath(target);
        }
    }

    function Model () {
        const blockCount = 8;
        const rank = Array.from(new Array(blockCount), ()=>[]); // rows
        const files = Array.from(new Array(blockCount), () => 0); // columns
        const type = {
            "1": 'pawn',
            "2": 'knight',
            "3": 'bishop',
            "4": 'rook',
            "5": 'queen',
            "6": 'king',
        };
        const history = [];

        const player = {
            black: [],
            white: []
        };
        const dx = [0, 0, 1, -1];
        const dy = [-1, 1, 0, 0];

        const move = {
            pawn(p){
                if(p.master=='black')
                return getMovePath(p, dx[0], dy[0])
                else
                return getMovePath(p, dx[1], dy[1])
            },
            bishop(p){
                const bottomLeft = getMovePath(p, dx[3], dy[3]);
                const bottomRight = getMovePath(p, dx[2], dy[2]);
                const topLeft = getMovePath(p, dx[1], dy[1]);
                const topRight = getMovePath(p, dx[0], dy[0]);
                return [].concat(topLeft, bottomLeft, topRight, bottomRight);
            },
            knight(p){
                const bottomLeft = getMovePath(p, dx[3], dy[3]);
                const bottomRight = getMovePath(p, dx[2], dy[2]);
                const topLeft = getMovePath(p, dx[1], dy[1]);
                const topRight = getMovePath(p, dx[0], dy[0]);
                return [].concat(topLeft, bottomLeft, topRight, bottomRight);
            },
            rook(p){
                const bottomLeft = getMovePath(p, dx[3], dy[3]);
                const bottomRight = getMovePath(p, dx[2], dy[2]);
                const topLeft = getMovePath(p, dx[1], dy[1]);
                const topRight = getMovePath(p, dx[0], dy[0]);
                return [].concat(topLeft, bottomLeft, topRight, bottomRight);
            },
            queen(p){
                const bottomLeft = getMovePath(p, dx[3], dy[3]);
                const bottomRight = getMovePath(p, dx[2], dy[2]);
                const topLeft = getMovePath(p, dx[1], dy[1]);
                const topRight = getMovePath(p, dx[0], dy[0]);
                return [].concat(topLeft, bottomLeft, topRight, bottomRight);
            },
            king(p){
                const bottomLeft = getMovePath(p, dx[3], dy[3]);
                const bottomRight = getMovePath(p, dx[2], dy[2]);
                const topLeft = getMovePath(p, dx[1], dy[1]);
                const topRight = getMovePath(p, dx[0], dy[0]);
                return [].concat(topLeft, bottomLeft, topRight, bottomRight);
            }
        }
        let get = [];

        let views = null;
        let parts = null;
        let turn = false;
        let isNear = [];
        let blocked = false;

        Model.id = 1;
        Model.board = null;
        Model.pick = null;
        Model.firstBoard = null;

        this.init = function (view) {
            views = view;

            parts = views.getParts();
            this.initGame();
            this.setPieces();
        }

        const getMovePath = function (p, ax, ay) {
            const isStart = p.start?1:0;
            if(p.name=='pawn'){
                if(isNear.length>0){
                    return new Array(isStart+1).fill(0).map((target, i)=>{
                        return {
                            x: blocked?-1:p.x + ay + isStart*i*ay,
                            y: blocked?-1:p.y,
                        }
                    }).concat(isNear.map((x,i)=>{
                        return {
                            x: x.x,
                            y: x.y
                        }
                    })).filter(x=>x.x>-1&&x.y>-1);
                } else {
                    return new Array(isStart+1).fill(0).map((target, i)=>{
                        return {
                            x: p.x + ay + isStart*i*ay,
                            y: p.y,
                        }
                    }).filter(x=>x.x>-1&&x.y>-1);
                }
            } else if(p.name=='bishop'){
                return new Array(7).fill(0).map((x,i)=>{
                    if(p.y + (i+1)>-1){
                        if(ax!=0)
                        return {
                            x: p.x + (i+1),
                            y: p.y + (i+1)*ax,
                        }
                        else return {
                            x: p.x - (i+1),
                            y: p.y + (i+1)*ay,
                        }
                    }
                }).filter(x=>x.x>-1&&x.y>-1);
            } else if(p.name=='rook'){
                return new Array(7).fill(0).map((x,i)=>{
                    if(p.y + (i+1)>-1){
                        if(ax!=0)
                        return {
                            x: p.x,
                            y: p.y + (i+1)*ax,
                        }
                        else return {
                            x: p.x + (i+1)*ay,
                            y: p.y,
                        }
                    }
                }).filter(x=>x.x>-1&&x.y>-1);
            } else if(p.name=='knight'){
                return new Array(2).fill(0).map((x,i)=>{
                    if(p.y + (i+1)>-1){
                        let direct = 1;
                        if(i==0){
                            direct = 0.5;
                        }
                        if(ax!=0)
                        return { // 하단 좌,우
                            x: p.x + 2*direct,
                            y: p.y + ax*(1/direct),
                        }
                        else return { // 상단 좌, 우
                            x: p.x - 2*direct,
                            y: p.y + ay*(1/direct),
                        }
                    }
                }).filter(x=>x.x>-1&&x.y>-1);
            } else if(p.name=='queen'){
                return new Array(14).fill(0).map((x,i)=>{
                    if(p.y + (i+1)>-1){
                        if(parseInt(i/7)==0){
                            if(ax!=0)
                            return {
                                x: p.x,
                                y: p.y + (i+1)*ax,
                            }
                            else return {
                                x: p.x + (i+1)*ay,
                                y: p.y,
                            }
                        } else {
                            if(ax!=0)
                            return {
                                x: p.x + (i-7+1),
                                y: p.y + (i-7+1)*ax,
                            }
                            else return {
                                x: p.x - (i-7+1),
                                y: p.y + (i-7+1)*ay,
                            }
                        }
                    }
                    
                }).filter(x=>x.x>-1&&x.y>-1);
            } else if(p.name=='king'){
                return new Array(2).fill(0).map((x,i)=>{
                    if(p.y + (i+1)>-1){
                        if(i==0){
                            if(ax!=0)
                            return {
                                x: p.x,
                                y: p.y + ax,
                            }
                            else return {
                                x: p.x + ay,
                                y: p.y,
                            }
                        } else {
                            if(ax!=0)
                            return {
                                x: p.x + 1,
                                y: p.y + i*ax,
                            }
                            else return {
                                x: p.x - 1,
                                y: p.y + i*ay,
                            }
                        }
                    }
                }).filter(x=>x.x>-1&&x.y>-1);
            }
        }

        this.initGame = function () {
            Model.board = rank.map(r=> {
                r.push(...files);
                return r;
            });
        }

        this.getName = function (i) {
            switch(i){
                case 0: case 7:
                    return type[4];
                case 1: case 6:
                    return type[2];
                case 2: case 5:
                    return type[3];
                case 3:
                    return type[5];
                default:
                    return type[6];
            }
        }

        this.getUnicode = function (piece) {
            if(piece.master == 'white'){
                switch(piece.name){
                    case 'king':
                        return '&#9812;';
                    case 'queen':
                        return '&#9813;';
                    case 'rook':
                        return '&#9814;';
                    case 'bishop':
                        return '&#9815;';
                    case 'knight':
                        return '&#9816;';
                    case 'pawn':
                        return '&#9817;';
                }
            } else {
                switch(piece.name){
                    case 'king':
                        return '&#9818;';
                    case 'queen':
                        return '&#9819;';
                    case 'rook':
                        return '&#9820;';
                    case 'bishop':
                        return '&#9821;';
                    case 'knight':
                        return '&#9822;';
                    case 'pawn':
                        return '&#9823;';
                }
            }
        }

        this.setPieces = function () {
            Model.board = Model.board.map((row, idx)=>{
                if(idx == 1 || idx == 6){
                    return row.map((p, i)=>{
                        const obj = {
                            id: Model.id++,
                            name: type[1],
                            start: true,
                            x: idx,
                            y: i,
                            move: move[type[1]],
                            master: idx>3?'black':'white',
                            board: Model.board,
                            isSelect: false,
                            isDrop: false
                        }
                        obj.unicode = this.getUnicode(obj);
                        obj.board[obj.x][obj.y] = obj;
                        return obj;
                    })
                }
                else if (idx == 0 || idx == 7){
                    return row.map((p, i)=>{
                        const obj = {
                            id: Model.id++,
                            name: this.getName(i),
                            x: idx,
                            y: i,
                            move: move[this.getName(i)],
                            master: idx>3?'black':'white',
                            board: Model.board,
                            isSelect: false,
                            isDrop: false
                        }
                        obj.unicode = this.getUnicode(obj);
                        obj.board[obj.x][obj.y] = obj;
                        return obj;
                    })
                } else {
                    return row.map((p, i)=>{
                        const obj = {
                            name: '',
                            unicode: '',
                            x: idx,
                            y: i,
                            board: Model.board
                        };
                        return obj;
                    })
                }
            });

            Model.board.forEach(col=>col.forEach(r=>r.name!=''?player[r.master].push(r):null));
            if(!Model.firstBoard) Model.firstBoard = [...Model.board];
        }

        this.selectPiece = function (target) {
            const {id, x, y, name, unicode, master} = target.parentNode.dataset;
            const piece = this.findPieceById({id, x, y, name, unicode, master});
            const who = turn?'white':'black';
            
            this.initSelect();
            
            // console.log('선택')
            if(piece.name=='pawn'){
                piece.move(piece).forEach(col=>{
                    const add = turn?-1:1;
                    
                    const a = Model.board[col.x][col.y+1];
                    const b = Model.board[col.x][col.y-1];
                    const c = Model.board[col.x][col.y];
                    console.log(isNear)
                    if(piece.x+1<a.x || piece.x+1<b.x){

                    } else {
                        if(a.name!='' && a.master!=piece.master){
                            isNear.push(a);
                            blocked = false;
                        }
                        if(b.name!='' && b.master!=piece.master) {
                            isNear.push(b);
                            blocked = false;
                        }
                        if(c.name != ''){
                            if(Model.pick?.name == 'pawn')
                            blocked = true;
                        }
                    }
                })
            } else {
                blocked = false;
            }
            
            if(Model.pick == piece) {
                Model.pick.isSelect = false;
                Model.pick = null;
                isNear = [];
                // console.log('동일')
            } else {
                if(Model.pick){
                    const range = Model.pick.move(Model.pick);
                    if(Model.pick.master == piece.master) {
                        Model.pick = piece;
                    } else {
                        if(!this.isBlocked(Model.pick, piece)){
                            isNear = [];
                            return;
                        }
                        for(let {x:vx,y:vy} of range){
                            if(vx == x && vy == y && Model.pick.master != master && !blocked){
                                turn = !turn;
                                console.log('공격')
                                isNear = [];
                                piece.isDrop = true;
                                const temp = Model.board[Model.pick.x][Model.pick.y];
                                Model.board[Model.pick.x][Model.pick.y] = {
                                    name: '',
                                    unicode: '',
                                    x: parseInt(Model.pick.x),
                                    y: parseInt(Model.pick.y),
                                    board: Model.board
                                };
                                Model.board[piece.x][piece.y] = temp;
                                temp.x = piece.x;
                                temp.y = piece.y;
                                temp.isSelect = false;
                                Model.pick = null;
                            }
                        }
                        isNear = [];
                        Model.pick = null;
                        this.renderGame();
                        return;
                    }
                } else {
                    Model.pick = piece;
                    piece.isSelect = true;
                }
                // console.log('다름')
            }
            this.renderGame();
        }
        
        this.moveToPath = function (target) {
            const who = turn?'white':'black';
            const origin = target.dataset;
            const piece = this.findPieceByOrigin(origin);
            const {id, x, y, name, unicode, master} = piece;
            if(piece.master != who) return;
            if(this.isBlocked(Model.pick, origin)){
                turn = !turn;
                console.log('열림');
                isNear = [];
            } else {
                Model.pick.isSelect = false;
                Model.pick = null;
                this.renderGame();
                return;
            }

            const temp = Model.board[piece.x][piece.y];

            Model.board[piece.x][piece.y] = {
                name: '',
                unicode: '',
                x: parseInt(piece.x),
                y: parseInt(piece.y),
                board: Model.board
            };

            temp.x = parseInt(origin.x);
            temp.y = parseInt(origin.y);
            temp.name=='pawn'?temp.start=false:null;
            temp.isSelect = false;

            Model.pick = null;
            Model.board[origin.x][origin.y] = temp;

            this.renderGame();
        }

        this.backword = function () {
            if(history.length>=1){
                const back = history.splice(-1, 1).pop();
                Model.board = [];
                Model.board = [...back];
                player.black = [];
                player.white = [];
                Model.board.forEach(col=>col.forEach(r=>{
                    return r.name!=''?player[r.master].push(r):null
                }));
            }
            console.log(player)
            views.renderGame(Model.board, Model.pick);
        }
        
        this.isBlocked = function (piece, origin) {
            const around = piece.move(piece);
            
            for(let block of around){
                if(block.x>-1 && block.y>-1 && block.x<8 && block.y<8){
                    const p = Model.board[block.x][block.y];
                    if(p.master) {
                        if(p.y > origin.y && p.x > origin.x && p.y < piece.y && p.x < piece.x){ // 피스의 좌상 x 수직, y 수평
                            console.log('좌상 막힘', p);
                            return false;
                        } else if(p.y < origin.y && p.x > origin.x && p.y > piece.y && p.x < piece.x) { // 피스의 우상
                            console.log('우상 막힘', p);
                            return false;
                        } else if(p.y > origin.y && p.x < origin.x && p.y < piece.y && p.x > piece.x) { // 피스의 좌하
                            console.log('좌하 막힘', p);
                            return false;
                        } else if(p.y < origin.y && p.x < origin.x && p.y > piece.y && p.x > piece.x) { // 피스의 우하
                            console.log('우하 막힘', p);
                            return false;
                        } else if(p.y == origin.y && p.x > origin.x && p.y == piece.y && p.x < piece.x) { // 피스 상
                            console.log('상 막힘', p);
                            return false;
                        } else if(p.y == origin.y && p.x < origin.x && p.y == piece.y && p.x > piece.x) { // 피스 하
                            console.log('하 막힘', p);
                            return false;
                        } else if(p.y > origin.y && p.x == origin.x && p.y < piece.y && p.x == piece.x) { // 피스 좌
                            console.log('좌 막힘', p);
                            return false;
                        } else if(p.y < origin.y && p.x == origin.x && p.y > piece.y && p.x == piece.x) { // 피스 우
                            console.log('우 막힘', p);
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        this.findPieceById = function (info){
            for(let p of player[info.master]){
                if(p.id == info.id){
                    return p;
                }
            }
        }

        this.findPieceByOrigin = function (info){
            for(let col of Model.board){
                for(let p of col){
                    if(p.id == info.origin){
                        return p;
                    }
                }
            }
        }

        this.initSelect = function () {
            history.push(Model.board.map(col=>{
                return col.map(p=>{
                    if(p.name == ''){
                        return {
                            name: p.name,
                            x: p.x,
                            y: p.y,
                        };
                    } else {
                        return {
                            id: p.id,
                            name: p.name,
                            unicode: p.unicode,
                            board: p.board,
                            start: p.start,
                            x: p.x,
                            y: p.y,
                            move: move[p.name],
                            isDrop: p.isDrop,
                            isSelect: p.isSelect,
                            master: p.master,
                        };
                    }
                })
            }))
            for(let side in player){
                player[side].forEach(piece=>{
                    piece.isSelect = false;
                })
            }
        }

        this.renderGame = function () {
            views.renderGame(Model.board, Model.pick);
        }

        this.startGame = function () {
            views.startGame(Model.board);
        }
    }

    function View () {
        let parts = null;
        let app = null;

        this.init = function (part) {
            parts = part;

            app = document.querySelector('#app');
        }

        this.startGame = function (board) {
            app.insertAdjacentHTML('beforeend', parts.board.render(board));
        }

        this.renderGame = function (board, pick) {
            app.innerHTML = '';
            app.insertAdjacentHTML('beforeend', parts.board.render(board));
            if(pick){
                pick.move(pick).forEach(({x, y})=>{
                    const target = app.querySelector(`[data-x="${x>-1?x:pick.x}"][data-y="${y>-1?y:pick.y}"]`);
                    if(target) {
                        target.classList.add('move');
                        target.dataset.origin = pick.id;
                    };
                })
            }
        }

        this.getParts = function () {
            return parts;
        }
    }

    return {
        init () {
            const parts = {
                piece: {
                    render({name, x, y}){
                        return `
                            ${name}
                        `;
                    }
                },
                board: {
                    render(board){
                        const body = [...board].map(row=>{
                            const tr = row.map(p=>{
                                if(p.name!='')
                                return `
                                <td
                                ${p.isDrop?'':`data-id="${p.id}"`}
                                ${p.isDrop?'':`data-master="${p.master}"`}
                                data-x="${p.x}"
                                data-y="${p.y}"
                                data-name="${p.name}"
                                data-unicode="${p.unicode}"
                                >${p.isDrop?'':`
                                    <span
                                    ${p.isSelect?'class="selected"':''}
                                    >${p.unicode}</span>`
                                }
                                </td>
                                `;
                                else return `<td
                                data-x="${p.x}"
                                data-y="${p.y}"
                                data-name="${p.name}"
                                ></td>`;
                            }).join('');
                            return `<tr>${tr}</tr>`;
                        }).join('');
                        return `
                            <table>
                                <thead>
                                    <tr>
                                        <th colspan="9">Chess Games</th>
                                    </tr>
                                    <tr>
                                        <th colspan="9">
                                            <button id="backward">1회 무르기</button>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colspan="5">
                                            <span>score</span>
                                            <span>0</span>
                                        </th>
                                        <th colspan="4">
                                            <span>time</span>
                                            <span>0</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${body}
                                </tbody>
                            </table>
                        `;
                    }
                }
            }

            const view = new View();
            const model = new Model();
            const controller = new Controller();

            view.init(parts);
            model.init(view);
            controller.init(model);
        }
    }

})().init();