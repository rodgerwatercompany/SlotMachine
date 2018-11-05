//import SimpleLayout from "./SimpleLayout";
import SlotLine from "./SlotLine";
//import AudioController from '../audio/AudioController';

const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@menu('control/SlotMachine3x5')
@executeInEditMode
export default class SlotMachine extends cc.Component {

    // 是否使用 Layout 功能，勾選後按 F7 用以下屬性排版
    @property(Boolean: true)
    useEditLayout : boolean = true;

    // 是否每次在進入遊戲時隨機改變拉霸機初始化的圖案
    @property({default: true})
    autoChangeSymbol : boolean = true;

    // 拉霸機圖片滾動速度
    @property({default: 2100})
    speedOfSlot : number = 2100;

    // 設置拉霸機滾動到允許停止的最小間隔(sec)
    @property({default: 0})
    minRollingInterval : number = 0;

    // 啟動拉霸機抬起效果的距離
    @property({default: 0})
    distanceOfLaunch : Number = 0;

    // 拉霸機停止的回彈效果的距離
    @property({default: 50})
    distanceOfRebound : Number = 50;

    // 拉霸機停止是否使用減速效果
    @property({default: true})
    useDeceleration : boolean = true;

    // 減速效果的參數
    @property({default: 1000})
    minSpeedForDeceleration : number = 1000;

    // 拉霸機各行的背景圖案
    @property(cc.SpriteFrame)
    spriteFrameOfSLMBG : null;

    // 拉霸機各行的尺寸，
    @property({default : new cc.Vec2(265,766)})
    sizeOfSLMBG : cc.Vec2 = new cc.Vec2(265,766);

    // 拉霸機各行之間的間隔
    @property({default: 0})
    spaceXOfSLMBG : Number = 0;

    // 拉霸機使用的圖片尺寸
    @property({default : new cc.Vec2(252,250)})
    sizeOfSymbol : cc.Vec2 = new cc.Vec2(252,250);

    // 拉霸機的圖片之間的上下間隔
    @property({default: 0})
    spaceYOfSymbolLine : Number = 0;

    // 第一行不需要出現的圖片
    @property(cc.SpriteFrame)
    excludeFirstReelWild: cc.SpriteFrame = undefined;

    // 拉霸機使用的圖案，當使用自動排版時每次都會隨機塞入
    @property([cc.SpriteFrame])
    spriteFramesOfInit : [cc.SpriteFrame];

    @property([cc.SpriteFrame])
    graySpriteFrames : cc.SpriteFrame[] = [];

    // 滾動音效名稱
    @property({default : ""})
    rollingSound : string = "";

    // 停止音效名稱
    @property({default : ""})
    stopSound : string = "";


    private onAllStopCallback: () => void;

    private slotLines = [];

    private loginParams : {
        IsSpinning : boolean,
        IsStopping : boolean,
        IsFastStop : boolean
    };

    private infos : {
        SlotStopCount : number,
        CountTimeFromSpin : number
    };

    onLoad() {

        if (CC_EDITOR && this.useEditLayout) {
            this._doSlotBGLayut();
            this._doSlotSymbolLayout();
        }


        // 初始化，放在 start 可能會比socketCB還晚執行
        this.loginParams = {
            IsSpinning : false,
            IsStopping : false,
            IsFastStop : false,
        };

        this.infos = {
            SlotStopCount : 0,
            CountTimeFromSpin : 0
        };

        this._initSlotline();
        if (this.excludeFirstReelWild) {
            let index = this.spriteFramesOfInit.length - 1;
            for (; index >= 0; index -= 1) {
                if (this.spriteFramesOfInit[index] === this.excludeFirstReelWild) {
                    break;
                }
            }
            this.slotLines[0].setExcludedOutcome([index])
        }
    }

    update (dt) {

        // 當 Spin 開始後紀錄時間
        if (this.loginParams.IsSpinning) {

            this.infos.CountTimeFromSpin += dt;
        }

        // 當發現太快開始停止時，延長開始停止
        if (this.loginParams.IsStopping) {

            if (this.infos.CountTimeFromSpin >= this.minRollingInterval) {

                this.loginParams.IsStopping = false;

                if (this.loginParams.IsFastStop) {

                    for (let i = 0; i < 5; i++) {

                        this.slotLines[i].startStop();
                    }
                }else
                    this.slotLines[0].startStop();
            }
        }

        for (let i = 0; i < 5; i++) {

            this.slotLines[i].updateSync(dt);
        }
    }

    startSpin () {

        this.infos.SlotStopCount = 0;

        this.infos.CountTimeFromSpin = 0;
        this.loginParams.IsSpinning = true;
        this.loginParams.IsStopping = false;

        for (let i = 0; i < 5; i++) {

            this.slotLines[i].startRun();
        }

        if (this.rollingSound !== "")
            AudioController.getInstance().play(this.rollingSound);
    }

    // 普通模式，逐行停止
    startStop (callback? : ()=>void) {

        this.loginParams.IsFastStop = false;

        if (this.infos.CountTimeFromSpin >= this.minRollingInterval)
            this.slotLines[0].startStop();
        else
            this.loginParams.IsStopping = true;

        if (callback) {

            this.onAllStopCallback = callback;
        }
    }

    // 自動模式使用
    startFastStop (callback? : ()=> void) {

        this.loginParams.IsFastStop = true;

        if (this.infos.CountTimeFromSpin >= this.minRollingInterval)
            this.fastStop(callback);
        else {

            this.loginParams.IsStopping = true;

            if (callback) {

                this.onAllStopCallback = callback;
            }
        }
    }

    // 停止按鈕使用
    fastStop (callback? : ()=>void) {

        this.loginParams.IsFastStop = true;

        this.loginParams.IsStopping = false;

        for (let i = 0; i < 5; i++) {

            this.slotLines[i].startStop();
        }

        if (callback) {

            this.onAllStopCallback = callback;
        }
    }

    setStopCallback (callback : ()=>void) {
        this.onAllStopCallback = callback;
    }

    setSlotOutCome (data : string[]) {
        for (let i = 0; i < 5; i++) {
            this.slotLines[i].setOutcome([
                this.spriteFramesOfInit[parseInt(data[(i * 3)]) - 1],
                this.spriteFramesOfInit[parseInt(data[(i * 3) + 1]) - 1],
                this.spriteFramesOfInit[parseInt(data[(i * 3) + 2]) - 1]
            ]);
        }
    }

    // *** 更改拉霸機背景圖片 ***
    setSlotLineBackGround (spriteFrame) {

        // 取得拉霸機背景節點
        var nodeOfBG = cc.find("SLM_BG",this.node);

        // 設置拉霸機背景圖示
        nodeOfBG.children.forEach(function (child) {

            var sp = child.getComponent(cc.Sprite);
            (sp as cc.Sprite).spriteFrame = spriteFrame;
        }.bind(this));

    }

    setGridOutComeImmediate (grid:string[], card:string[]) {
        let grids = grid.map(Number);
        for (let i = 0; i < grids.length; i += 1) {
            let column = Math.floor((grids[i] - 1) / 3);
            let row = (grids[i] - 1) % 3;
            this.slotLines[column].setOutcomeImmediate(2 - row, this.spriteFramesOfInit[parseInt(card[column*3 + row])-1]);
        }
    }

    setInitialSlotSymbol (cards : string[]) {

        for (let i = 0; i < 5; i++) {

            this.slotLines[i].setInitialSymbol(
                [
                    cards[(i * 3)],
                    cards[(i * 3) + 1],
                    cards[(i * 3) + 2]
                ]
            );
        }
    }

    private _setSlotOutComeImmediate (spriteFrameSource:cc.SpriteFrame[], card:string[]) {
        for (let i = 0; i < 5; i++) {
            this.slotLines[i].setOutcomeImmediate(0, spriteFrameSource[parseInt(card[(i * 3)+2])-1]);
            this.slotLines[i].setOutcomeImmediate(1, spriteFrameSource[parseInt(card[(i * 3)+1])-1]);
            this.slotLines[i].setOutcomeImmediate(2, spriteFrameSource[parseInt(card[(i * 3)])-1]);
        }
    }

    setSlotOutComeImmediate (card:string[]) {
        this._setSlotOutComeImmediate(this.spriteFramesOfInit, card);
    }

    setGraySlotOutComeImmediate (card:string[]) {
        this._setSlotOutComeImmediate(this.graySpriteFrames, card);
    }

    // excludeOutComes 為對應 spriteFramesOfInit 索引的陣列
    setExcludedOutcome (idx : number,excludeOutComes : [number]) {
        this.slotLines[idx].setExcludedOutcome(excludeOutComes);
    }

    // *** 拉霸機背景排版 ***
    _doSlotBGLayut () {

        // 取得拉霸機背景節點
        var nodeOfBG = cc.find("SLM_BG",this.node);

        nodeOfBG.width = (this.sizeOfSLMBG.x * 5) + (this.spaceXOfSLMBG * 4);

        // 設置拉霸機背景圖示
        nodeOfBG.children.forEach(function (child) {

            var sp = child.getComponent(cc.Sprite);
            (sp as cc.Sprite).spriteFrame = this.spriteFrameOfSLMBG;
            sp.node.height = this.sizeOfSLMBG.y;
        }.bind(this));

        var layout = nodeOfBG.getComponent(cc.Layout);
        layout.type = cc.Layout.Type.HORIZONTAL;
        layout.resizeMode = cc.Layout.ResizeMode.CHILDREN;
        layout.spacingX = this.spaceXOfSLMBG;
    }

    // *** 拉霸機排版 ***
    _doSlotSymbolLayout () {

        // return [start,end)
        var getRandom = function (start,end) {
            return Math.floor(Math.random() * (end - start) ) + start;
        }

        // 取得控制 Symbol 的節點
        let nodeOfMask = cc.find("SLM_MASK",this.node);
        nodeOfMask.width = (this.sizeOfSLMBG.x * 5) + (this.spaceXOfSLMBG * 4);
        nodeOfMask.height = (this.sizeOfSymbol.y * 3) + (this.spaceYOfSymbolLine * 2);

        let layoutOfSlotLine = nodeOfMask.getComponent(SimpleLayout);
        (layoutOfSlotLine as SimpleLayout).moveWidth = this.sizeOfSLMBG.x;

        (layoutOfSlotLine as SimpleLayout).distanceOfOverlay = this.spaceXOfSLMBG;

        nodeOfMask.children.forEach(function (child) {
            child.width = this.sizeOfSymbol.x;
            child.height = (this.sizeOfSymbol.y * 7) + (this.spaceYOfSymbolLine * 6);
            //child.y = ((this.sizeOfSymbol.y + this.spaceYOfSymbolLine) * 2);
            child.y = - (this.sizeOfSymbol.y + this.spaceYOfSymbolLine);
            let layout = child.getComponent(cc.Layout);
            layout.type = cc.Layout.Type.VERTICAL;
            layout.resizeMode = cc.Layout.ResizeMode.CHILDREN;

            layout.spacingY = this.spaceYOfSymbolLine;

            // 設置 Symbol 圖示
            child.children.forEach(function (child_1) {

                let sp = child_1.getComponent(cc.Sprite);
                let rand = getRandom(0,this.spriteFramesOfInit.length);
                sp.spriteFrame = this.spriteFramesOfInit[rand];
                sp.node.width = this.sizeOfSymbol.x;
                sp.node.height = this.sizeOfSymbol.y;
            }.bind(this));
        }.bind(this));
    }

    _initSlotline () {

        this.slotLines = [];
        var nodeOfMask = cc.find("SLM_MASK",this.node);

        for (let i = 0; i < 5; i++) {

            this.slotLines[i] = nodeOfMask.children[i].getComponent(SlotLine);
            this.slotLines[i].init();
            this.slotLines[i].setSlotInfo({
                SpeedOfSlot : this.speedOfSlot,
                SpriteFramesOfAll : this.spriteFramesOfInit,
                SpriteFramesOfSample : this.spriteFramesOfInit,
                UseRebound : this.distanceOfRebound != 0,
                UseDeceleration : this.useDeceleration,
                MinSpeedForDeceleration : this.minSpeedForDeceleration,
                DistanceOfRebound : this.distanceOfRebound,
                DistanceOfLaunch : this.distanceOfLaunch,
                SpaceYOfSymbolLine : this.spaceYOfSymbolLine
            });
            this.slotLines[i].registerOnSlotStop(function () {
                this._onSlotLineStop();

                if (this["_onSlotLineStop" + (i + 1)])
                    this["_onSlotLineStop" + (i + 1)]();
            }.bind(this));

            // 隨機改變拉霸機初始化的圖案
            if (this.autoChangeSymbol)
                this.slotLines[i].randomChangeInitSymbol();

        }
    }

    _onSlotLineStop () {

        this.infos.SlotStopCount++;

        // 避免同時播放停止音效
        if (!this.loginParams.IsFastStop && this.stopSound !== "")
            AudioController.getInstance().play(this.stopSound);

        if (this.infos.SlotStopCount < 5) {

            this.slotLines[this.infos.SlotStopCount].startStop();
        }else if (this.onAllStopCallback) {

            // 當快速停止時僅播放一次停止音效
            if (this.loginParams.IsFastStop && this.stopSound !== "")
                AudioController.getInstance().play(this.stopSound);

            if (this.rollingSound !== "")
                AudioController.getInstance().stop(this.rollingSound);

            this.loginParams.IsSpinning = false;
            this.onAllStopCallback();
        }
    }
}

window.slotGame = window.slotGame || {};
window.slotGame.SlotMachine = SlotMachine;