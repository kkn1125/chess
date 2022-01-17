'use strict';

/** 글로벌 주입 방식
 *  (function(global){
 *  return global.test = {
 *  ops: 'test'
 *      };
 *  })(window)
 */

import {
    injection,
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King
} from './items/core.js';

(function () {
    function Controller() {
        let models = null;

        this.init = function (model) {
            models = model;

            window.addEventListener('click', this.selectPiece);
            window.addEventListener('click', this.backforward);
        }

        this.selectPiece = function (ev) {
            const target = ev.target;
            if(target.tagName != 'TD') return;
            models.selectPiece(target);
        }

        this.backforward = function (ev) {
            const target = ev.target;
            if(!target.classList.contains('back')) return;
            models.backforward(target);
        }
    }

    function Model() {
        let views = null;
        let parts = null;
        let history = [];
        let master = {
            black: [],
            white: [],
        }
        let piece;
        let turn = true;
        let timeLimit = 1*60;
        let checks = [];

        this.init = function (view) {
            views = view;

            parts = views.getParts();
            this.setPieces();
            this.renderPieces();
            this.watchTurn();
            this.saveHistory();
        }

        this.backforward = function () {
            if(history.length>1){
                master = history.pop();
                turn = !turn;
            }
            this.renderPieces();
        }

        this.isCheck = function (key) {
            if(key.name == 'Bishop' || key.name == 'Rook' || key.name == 'Queen'){
                for(let [x, y] of key.attack){
                    for(let i=1; i<8; i++){
                        let checking = document.querySelector(`[data-x="${key.x + (x*i)}"][data-y="${key.y + (y*i)}"]`);
                        if(checking){
                            if(checking.dataset.id && checking.dataset.name != 'King'){
                                break;
                            } else if(checking.dataset.id && checking.dataset.name == 'King'){
                                if(this.findById(checking.dataset.id).team != key.team){
                                    console.log('check');
                                    checks.push(key);
                                    break;
                                }
                            }
                        }
                    }
                }
            } else if (key.name) {
                for(let [x, y] of key.attack){
                    let ax = key.x+x;
                    let ay = key.y+y;
                    let checking = document.querySelector(`[data-x="${ax}"][data-y="${ay}"]`);
                    if(checking) {
                        if(checking.dataset.id && checking.dataset.name != 'King'){
                            continue;
                        } else if(checking.dataset.id && checking.dataset.name == 'King'){
                            if(this.findById(checking.dataset.id).team != key.team){
                                console.log('check');
                                checks.push(key);
                                break;
                            }
                        }
                    }
                }
            }
        }

        this.isBlockCheck = function (key) {
            for(let c of checks){
                if(c.name == 'Bishop' || c.name == 'Rook' || c.name == 'Queen'){
                    for(let [x, y] of c.attack){
                        for(let i=1; i<8; i++){
                            let checking = document.querySelector(`[data-x="${c.x + (x*i)}"][data-y="${c.y + (y*i)}"]`);
                            if(checking){
                                if(checking.dataset.id && checking.dataset.name != 'King'){
                                    break;
                                } else if(key.x == parseInt(checking.dataset.x) && key.y == parseInt(checking.dataset.y)){
                                    console.log('blocked!');
                                    checks.splice(checks.indexOf(c), 1);
                                    return true;
                                } else if(checking.dataset.id && checking.dataset.name == 'King'){
                                    return false;
                                }
                            }
                        }
                    }
                } else if(c.name == 'Knight') {
                    for(let [x, y] of c.attack){
                        let ax = c.x+x;
                        let ay = c.y+y;
                        let checking = document.querySelector(`[data-x="${ax}"][data-y="${ay}"]`);
                        if(checking) {
                            if(checking.dataset.id && checking.dataset.name != 'King'){
                                continue;
                            } else if(checking.dataset.id && checking.dataset.name == 'King'){
                                return false;
                            }
                        }
                    }
                }
            }
            for(let c of checks){
                if(c.drop) {
                    console.log('blocked!');
                    checks.splice(checks.indexOf(c), 1);
                }
            }
            return true;
        }

        this.watchTurn = function () {
            const time = document.querySelector('.time');
            const turnEl = document.querySelector('.turn');
            let tempTurn = turn;
            let prev = 0;
            function countTime() {
                let current = new Date().getSeconds();
                let min = parseInt(timeLimit/60);
                let sec = parseInt(timeLimit%60);
                turnEl.className = 'turn'+(turn?' black':' white');
                if(current>prev){
                    time.textContent = `${min.toString().padStart(2, 0)}:${sec.toString().padStart(2, 0)}`;
                    timeLimit -= 1;
                    if(timeLimit == -1){
                        timeLimit = 1*60;
                        turn = !turn;
                    }
                }
                prev = current;
                requestAnimationFrame(countTime);
                if(tempTurn != turn){
                    tempTurn = turn;
                    timeLimit = 1*60;
                    turnEl.textContent = turn?'black':'white';
                    turnEl.classList.add(turn?'black':'white');
                    requestAnimationFrame(countTime);
                }
            }
            requestAnimationFrame(countTime);
        }

        this.setPieces = function () {
            master.black.push(...new Array(16).fill(0).map((x, i) => {
                if (i < 8) {
                    return new Pawn('black', i, 1);
                } else {
                    if (i - 8 == 0 || i - 8 == 7) {
                        return new Rook('black', i - 8, 0);
                    } else if (i - 8 == 1 || i - 8 == 6) {
                        return new Knight('black', i - 8, 0);
                    } else if (i - 8 == 2 || i - 8 == 5) {
                        return new Bishop('black', i - 8, 0);
                    } else if (i - 8 == 3) {
                        return new Queen('black', i - 8, 0);
                    } else if (i - 8 == 4) {
                        return new King('black', i - 8, 0);
                    }
                }
            }));

            master.white.push(...new Array(16).fill(0).map((x, i) => {
                if (i < 8) {
                    return new Pawn('white', i, 6);
                } else {
                    if (i - 8 == 0 || i - 8 == 7) {
                        return new Rook('white', i - 8, 7);
                    } else if (i - 8 == 1 || i - 8 == 6) {
                        return new Knight('white', i - 8, 7);
                    } else if (i - 8 == 2 || i - 8 == 5) {
                        return new Bishop('white', i - 8, 7);
                    } else if (i - 8 == 3) {
                        return new Queen('white', i - 8, 7);
                    } else if (i - 8 == 4) {
                        return new King('white', i - 8, 7);
                    }
                }
            }));
        }

        this.selectPiece = function (target) {
            this.initSelect();
            if(!target.dataset.id){
                if(!target.classList.contains('path')){
                    if(history.length>1) history.pop();
                }
                if(target.classList.contains('castle')){
                    this.castling(target);
                } else {
                    this.move(target);
                }
            } else {
                if(target.classList.contains('attack')){
                    this.attack(target);
                } else {
                    this.pick(target);
                }
            }
            this.renderPieces();
        }

        this.saveHistory = function () {
            let hist = {
                black: [],
                white: [],
            }

            hist['black'] = [...master['black']].map(x=>{
                let news = new parts.obj[x.name](x.team, x.x, x.y);
                return news;
            })
            hist['white'] = [...master['white']].map(x=>{
                let news = new parts.obj[x.name](x.team, x.x, x.y);
                return news;
            })

            history.push(hist);
        }

        this.castling = function (target) {
            const {x, y} = target.dataset;
            const tempX = piece.x;
            const tempY = piece.y;

            piece.x = parseInt(x);
            piece.y = parseInt(y);
            piece.move(parseInt(x), parseInt(y));

            if(x<tempX){
                let rook = this.findById(target.previousElementSibling.dataset.id);
                rook.move(parseInt(piece.x+1), parseInt(tempY));
                master[piece.team].map(x=>{
                    if(x.id==rook.id){
                        x = rook;
                    }
                });
            } else {
                let rook = this.findById(target.nextElementSibling.dataset.id);
                rook.move(parseInt(piece.x-1), parseInt(tempY));
                master[piece.team].map(x=>{
                    if(x.id==rook.id){
                        x = rook;
                    }
                });
            }
            master[piece.team].map(x=>{
                if(x.id==piece.id){
                    x = piece;
                }
            });
            piece.castlable = false;
            piece = null;
            turn = !turn;
        }

        this.initSelect = function () {
            for(let side in master){
                master[side].map(x=>{
                    x.select = false;
                    return x;
                })
            }
        }

        this.move = function (target) {
            if(!target.classList.contains('path')) {
                piece = null;
                return;
            }
            const {x, y} = target.dataset;
            const backupX = piece.x;
            const backupY = piece.y;
            let backupFirst = null;
            if(piece.name == 'Pawn' && piece.first == true){
                backupFirst = true;
            }

            piece.x = parseInt(x);
            piece.y = parseInt(y);
            piece.move(parseInt(x), parseInt(y));
            
            if(!this.isBlockCheck(piece)) {
                checks = checks.filter(x=>!x.drop);
                if(checks.length>0){
                    piece.x = backupX;
                    piece.y = backupY;
                    piece.move(backupX, backupY);
                    if(piece.name == 'Pawn' && backupFirst == true){
                        piece.first = true;
                    }
                    piece = null;
                    return;
                }
            }

            master[piece.team].map(x=>{
                if(x.id==piece.id){
                    x = piece;
                }
            });

            this.isCheck(piece);


            piece = null;
            turn = !turn;
        }

        this.pick = function (target) {
            let temp = this.findById(target.dataset.id);
            if(turn){
                if(temp.team !== 'black') return;
            } else {
                if(temp.team !== 'white') return;
            }
            if(temp == piece) {
                piece = null;
                return;
            }
            piece = temp;
            piece.select = true;
            this.saveHistory();
        }

        this.attack = function (target) {
            let temp = this.findById(target.dataset.id);
            if(temp.drop){
                piece = null;
                return;
            }
            if(piece && target.classList.contains('attack')){
                if(piece.team != temp.team){
                    temp.drop = true;
                    piece.move(temp.x, temp.y);
                    master[piece.team].map(x=>{
                        if(x.id==piece.id){
                            x = piece;
                        }
                    });
                    this.isCheck(piece);
                } else {
                    return;
                }
                piece = null;
            }
            turn = !turn;
        }

        this.findById = function (id) {
            for(let side in master){
                for(let x of master[side]){
                    if(x.id == id){
                        return x;
                    }
                }
            }
        }

        this.renderPieces = function () {
            views.renderPieces(master);
        }
    }

    function View() {
        let parts;
        let app;
        let board;

        this.init = function (part) {
            parts = part;

            app = document.querySelector('#app');
            this.baseRender();
        }

        this.getParts = function () {
            return parts;
        }

        this.baseRender = function () {
            board = app.insertAdjacentElement('beforeend', this.parseToElement(parts.board.render()));
            board.tHead.insertAdjacentHTML('beforeend', parts.title);
            board.tBodies[0].insertAdjacentHTML('beforeend', parts.body.render());
            app.insertAdjacentHTML('afterbegin', `
                <div class="current">
                    <div class="list">
                        <span class="b">Time</span>
                        <span class="time"></span>
                    </div>
                    <div class="list">
                        <span class="b">Turn</span>
                        <span class="turn">black</span>
                    </div>
                    <div>
                        <button class="back">무르기</button>
                    </div>
                </div>
            `);
            app.insertAdjacentHTML('beforeend', `
                <div class="options">
                    <div>
                        <div class="b">Droped</div>
                        <div>
                            <div>Black <span class="bcount"></span></div>
                            <ul class="blackdrop">
                                
                            </ul>
                        </div>
                        <div>
                            <div>White <span class="wcount"></span></div>
                            <ul class="whitedrop">

                            </ul>
                        </div>
                    </div>
                </div>
            `);
        }

        this.parseToElement = function (str) {
            return new DOMParser().parseFromString(str, 'text/html').body.children[0];
        }

        this.renderPieces = function (masters) {
            const bdrop = document.querySelector('.blackdrop');
            const wdrop = document.querySelector('.whitedrop');
            const bcount = document.querySelector('.bcount');
            const wcount = document.querySelector('.wcount');
            bdrop.innerHTML = '';
            wdrop.innerHTML = '';
            bcount.innerHTML = '';
            wcount.innerHTML = '';
            let limitx = 0;
            let limity = 0;

            for(let el of document.querySelectorAll('td')){
                el.classList.remove('select');
                el.classList.remove('path');
                el.classList.remove('attack');
                el.classList.remove('castle');
                el.innerHTML = '';
                el.removeAttribute('data-id')
            }

            for (let side in masters) {
                masters[side].forEach(key => {
                    let piece = document.querySelector(`[data-x="${key.x}"][data-y="${key.y}"]`);
                    if(!key.drop){
                        piece.innerHTML = key.unicode;
                        piece.dataset.id = key.id;
                        piece.dataset.name = key.name;
                        piece.dataset.team = key.team;
                    }
                })
                let filtered = masters[side].filter(x=>x.drop);
                if(side=='black'){
                    bcount.textContent = filtered.length;
                    bdrop.insertAdjacentHTML('beforeend', filtered.map(x=>`<li><span class="zoom">${x.unicode}</span>: ${x.id}</li>`).join(''));
                } else {
                    wcount.textContent = filtered.length;
                    wdrop.insertAdjacentHTML('beforeend', filtered.map(x=>`<li><span class="zoom">${x.unicode}</span>: ${x.id}</li>`).join(''));
                }
            }
            
            for (let side in masters) {
                masters[side].forEach(key => {
                    let piece = document.querySelector(`[data-x="${key.x}"][data-y="${key.y}"]`);
                    if(key.select) {
                        piece.classList.add('select');
                        if(key.name == 'Bishop' || key.name == 'Rook' || key.name == 'Queen'){
                            for(let [x, y] of key.attack){
                                for(let i=1; i<8; i++){
                                    let path = document.querySelector(`[data-x="${key.x + (x*i)}"][data-y="${key.y + (y*i)}"]`);
                                    if(path){
                                        if(path.dataset.id) {
                                            if(path.dataset.team != key.team) path.classList.add('attack');
                                            break;
                                        }
                                        if(!path.dataset.id){
                                            path.classList.add('path');
                                        }
                                    }
                                }
                            }
                        } else if(key.name == 'King') {
                            for(let [x, y] of key.attack){
                                for(let i=1; i<2; i++){
                                    let path = document.querySelector(`[data-x="${key.x + (x*i)}"][data-y="${key.y + (y*i)}"]`);
                                    if(path){
                                        if(path.dataset.id) {
                                            if(path.dataset.team != key.team) path.classList.add('attack');
                                            path.classList.add('attack');
                                            break;
                                        }
                                        if(!path.dataset.id){
                                            path.classList.add('path');
                                        }
                                        if(key.castlable){
                                            let prev = null;
                                            for(let [cx, cy] of key.castling){
                                                for(let q=1; q<5; q++){
                                                    let castle = document.querySelector(`[data-x="${key.x + (cx*q)}"][data-y="${key.y + (cy*q)}"]`);
                                                    if(castle.dataset.name=='Rook'){
                                                        prev.classList.add('castle');
                                                        break;
                                                    }
                                                    prev = castle;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else if(key.name == 'Pawn') {
                            for(let [x, y] of key.attack){
                                let ax = key.x+x;
                                let ay = key.y+y;
                                let path = document.querySelector(`[data-x="${ax}"][data-y="${ay}"]`);
                                if(path) {
                                    path.classList.add('path');
                                    limitx = ax;
                                    limity = ay;
                                }
                            }
                            let findLeft = document.querySelector(`[data-x="${key.x-1}"][data-y="${key.y+(key.team=='black'?1:-1)}"]`);
                            let findRight = document.querySelector(`[data-x="${key.x+1}"][data-y="${key.y+(key.team=='black'?1:-1)}"]`);
                            if(findLeft && findLeft.dataset.id){
                                if(findLeft.dataset.team != key.team) findLeft.classList.add('attack');
                            }
                            if (findRight && findRight.dataset.id){
                                if(findRight.dataset.team != key.team) findRight.classList.add('attack');
                            }
                        } else {
                            for(let [x, y] of key.attack){
                                let ax = key.x+x;
                                let ay = key.y+y;
                                let path = document.querySelector(`[data-x="${ax}"][data-y="${ay}"]`);
                                if(path) {
                                    if(path.dataset.id){
                                        if(path.dataset.team != key.team) path.classList.add('attack');
                                    } else {
                                        path.classList.add('path');
                                    }
                                    limitx = ax;
                                    limity = ay;
                                }
                            }
                        }
                    }
                })
            }
        }
    }

    return {
        init() {
            const parts = {
                obj: {
                    Pawn,
                    Knight,
                    Bishop,
                    Rook,
                    Queen,
                    King,
                },
                module: [
                    Pawn,
                    Knight,
                    Bishop,
                    Rook,
                    Queen,
                    King,
                ],
                board: {
                    render() {
                        return `
                            <table>
                                <thead></thead>
                                <tbody></tbody>
                            </table>
                        `
                    }
                },
                title: `<tr><th colspan="8">체스 게임</th></tr>`,
                body: {
                    render() {
                        return Array.from(new Array(8), (a, row) => `<tr>${new Array(8).fill(0).map((x, col)=> `<td data-x=${col} data-y=${row}></td>`).join('')}</tr>`).join('')
                    }
                }
            }

            parts.module.forEach(module => {
                injection(module);
            });

            const view = new View();
            const model = new Model();
            const controller = new Controller();

            view.init(parts);
            model.init(view);
            controller.init(model);
        }
    }
})().init();