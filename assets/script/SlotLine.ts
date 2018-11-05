const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@menu('control/SlotLine3x5')
@executeInEditMode
export default class SlotLine extends cc.Component {

    private nodeOfSymbols : cc.Node[];
    private spriteFrameOfSymbols : cc.Sprite[];

    private slotParams : {
        SpeedOfSlot : number,
        MinSpeedForDeceleration : number,
        PositionOfSlotStart : number,
        PositionOfSlotEnd : number,
        PositionOfStop : number,
        DistanceOfRebound : number,
        DistanceOfLaunch : number,
        SpriteFramesOfAll : cc.SpriteFrame[],
        SpriteFramesOfSample : cc.SpriteFrame[],
        SlotOutcome : cc.SpriteFrame[]
    };

    private logicParams : {
        IsRunning : boolean,
        IsMiddleChecked : boolean,
        HaveLastTimeReseted : boolean,
        IsStoping : boolean,
        IsLastTimeStop : boolean,
        IsDecelerate : boolean,
        HaveOutcomeSet : boolean,
        StateOfRebound : number,
        UseRebound : boolean,
        UseDeceleration : boolean
    };

    init () {

        this.nodeOfSymbols = [];
        this.spriteFrameOfSymbols = [];

        let nodeName = this.node.name;
        let idx = nodeName[nodeName.length - 1];

        for (let i = 0 ; i < 7; i++) {

            this.nodeOfSymbols[i] = cc.find("SYMBOL_" + idx + "_" + (i + 1),this.node);
            let sp = this.nodeOfSymbols[i].getComponent(cc.Sprite);
            this.spriteFrameOfSymbols[i] = (sp as cc.Sprite);
        }

        // for (let i = 0; i < this.node.children.length; i++) {
        //
        //     this.nodeOfSymbols[i] = this.node.children[i];
        //     let sp = this.node.children[i].getComponent(cc.Sprite);
        //     this.spriteFrameOfSymbols[i] = (sp as cc.Sprite);
        // }
    }

    setSlotInfo (info) {
        this.slotParams = {
            SpeedOfSlot : info.SpeedOfSlot,
            MinSpeedForDeceleration : info.MinSpeedForDeceleration,
            PositionOfSlotStart : (this.nodeOfSymbols[0].height + info.SpaceYOfSymbolLine) * 2,
            PositionOfSlotEnd : - ((this.nodeOfSymbols[0].height + info.SpaceYOfSymbolLine) * 2),
            PositionOfStop : - (this.nodeOfSymbols[0].height + info.SpaceYOfSymbolLine),
            DistanceOfRebound : info.DistanceOfRebound,
            DistanceOfLaunch : info.DistanceOfLaunch,
            SpriteFramesOfAll : info.SpriteFramesOfAll,
            SpriteFramesOfSample : info.SpriteFramesOfSample,
            SlotOutcome  : null
        };
        this.logicParams = {
            IsRunning : false,
            IsMiddleChecked : false,
            HaveLastTimeReseted : false,
            IsStoping : false,
            IsLastTimeStop : false,
            IsDecelerate : false,
            HaveOutcomeSet : false,
            StateOfRebound : 0,
            UseRebound : info.UseRebound,
            UseDeceleration : info.UseDeceleration
        };

    }

    updateSync (dt) {

        if (this.logicParams.IsRunning) {

            this._doRunning(dt);
        }
    }

    setExcludedOutcome (excludeOutcomes) {

        this.slotParams.SpriteFramesOfSample = [];

        let len = this.slotParams.SpriteFramesOfAll.length;
        for (let i = 0; i < len; i++) {
            if (excludeOutcomes.indexOf(i) < 0) {

                this.slotParams.SpriteFramesOfSample.push(this.slotParams.SpriteFramesOfAll[i]);
            }
        }

    }

    registerOnSlotStop (callBack) {

        if (this.onSlotStopCB !== null)
            this.onSlotStopCB = callBack;
    }

    startRun () {

        // 運作前，先初始化參數
        //this.logicParams.IsRunning = true;
        this.logicParams.IsMiddleChecked = false;
        this.logicParams.HaveLastTimeReseted = false;
        this.logicParams.IsStoping = false;
        this.logicParams.IsLastTimeStop = false;
        this.logicParams.IsDecelerate = false;
        this.logicParams.HaveOutcomeSet = false;
        this.logicParams.StateOfRebound = 0;

        if (this.slotParams.DistanceOfLaunch != 0) {
            this.node.runAction(cc.sequence(
                cc.moveBy(0.1, 0, this.slotParams.DistanceOfLaunch).easing(cc.easeQuarticActionOut()),
                cc.moveBy(0.1, 0, -this.slotParams.DistanceOfLaunch).easing(cc.easeQuarticActionIn()),
                cc.callFunc(()=>{ this.logicParams.IsRunning = true; })
            ));
        } else {
            this.logicParams.IsRunning = true;
        }

    }

    // 隨機改變拉霸機初始化的圖案
    randomChangeInitSymbol () {

        // return [start,end)
        let getRandom = function (start,end) {

            return Math.floor(Math.random() * (end - start) ) + start;
        };

        let len = this.slotParams.SpriteFramesOfSample.length;
        let rand = getRandom(0, len);
        this.spriteFrameOfSymbols[0].spriteFrame = this.slotParams.SpriteFramesOfSample[rand]; rand = getRandom(0, len);
        this.spriteFrameOfSymbols[1].spriteFrame = this.slotParams.SpriteFramesOfSample[rand]; rand = getRandom(0, len);
        this.spriteFrameOfSymbols[2].spriteFrame = this.slotParams.SpriteFramesOfSample[rand];
    }

    setInitialSymbol (cards) {

        this.spriteFrameOfSymbols[2].spriteFrame = this.slotParams.SpriteFramesOfSample[cards[0] - 1];
        this.spriteFrameOfSymbols[1].spriteFrame = this.slotParams.SpriteFramesOfSample[cards[1] - 1];
        this.spriteFrameOfSymbols[0].spriteFrame = this.slotParams.SpriteFramesOfSample[cards[2] - 1];
    }

    startStop () {

        this.logicParams.IsStoping = true;
    }

    setOutcome (info) {

        //cc.log("setSlotOutcome " + JSON.stringify(info));
        this.slotParams.SlotOutcome = info;
    }

    setOutcomeImmediate (row:number, spriteFrame:cc.SpriteFrame) {
        this.spriteFrameOfSymbols[row+3].spriteFrame = spriteFrame;
    }

    _doRunning (dt) {


        // return [start,end)
        let getRandom = function (start,end) {

            return Math.floor(Math.random() * (end - start) ) + start;
        };


        let moveStep = this.slotParams.SpeedOfSlot * dt;

        // 如果有減速且需要減速時，則進行減速
        if (this.logicParams.UseDeceleration && this.logicParams.IsDecelerate) {

            let x_1 = this.slotParams.PositionOfSlotStart;
            let x_2 = this.slotParams.PositionOfStop;
            let y_1 = this.slotParams.SpeedOfSlot;
            let y_2 = this.slotParams.MinSpeedForDeceleration;

            let speed = y_1 + (((y_2 - y_1) * (this.node.y - x_1))/ (x_2 - x_1));

            //cc.log(this.name + " " + speed + "(" + x_1 + "," + y_1 + ");(" + x_2 + "," + y_2 + ")");
            moveStep = speed * dt;
        }

        let nextY = this.node.y - moveStep;

        // 掉頭後一偵
        if (this.logicParams.HaveLastTimeReseted) {

            this.logicParams.HaveLastTimeReseted = false;

            // 換圖 456
            // if isStoping 將
            if (this.logicParams.IsStoping) {

                this.spriteFrameOfSymbols[4].spriteFrame = this.slotParams.SlotOutcome[1];
                this.spriteFrameOfSymbols[5].spriteFrame = this.slotParams.SlotOutcome[0];
            }
            // 否則換圖 456
            else {

                let len = this.slotParams.SpriteFramesOfSample.length;
                let rand = getRandom(0, len);
                this.spriteFrameOfSymbols[4].spriteFrame = this.slotParams.SpriteFramesOfSample[rand]; rand = getRandom(0, len);
                this.spriteFrameOfSymbols[5].spriteFrame = this.slotParams.SpriteFramesOfSample[rand]; rand = getRandom(0, len);
                this.spriteFrameOfSymbols[6].spriteFrame = this.slotParams.SpriteFramesOfSample[rand];
            }
        }
        // 掉頭
        else if (nextY < this.slotParams.PositionOfSlotEnd) {

            // 標示下一偵為掉頭後
            this.logicParams.HaveLastTimeReseted = true;

            nextY = this.slotParams.PositionOfSlotStart - moveStep;


            let len = this.slotParams.SpriteFramesOfSample.length;
            let rand = getRandom(0, len);
            // 換圖 0123
            this.spriteFrameOfSymbols[0].spriteFrame = this.spriteFrameOfSymbols[4].spriteFrame;
            this.spriteFrameOfSymbols[1].spriteFrame = this.spriteFrameOfSymbols[5].spriteFrame;
            this.spriteFrameOfSymbols[2].spriteFrame = this.spriteFrameOfSymbols[6].spriteFrame;

            // if isStoping 需將3設定為結果之一
            if (this.logicParams.IsStoping) {

                this.logicParams.IsDecelerate = true;
                this.logicParams.HaveOutcomeSet = true;
                this.spriteFrameOfSymbols[3].spriteFrame = this.slotParams.SlotOutcome[2];
            }else {

                this.spriteFrameOfSymbols[3].spriteFrame = this.slotParams.SpriteFramesOfSample[rand];
            }

        }
        // isStoping 已經設定了結果
        else if (this.logicParams.HaveOutcomeSet) {

            if (nextY < this.slotParams.PositionOfStop) {

                this.logicParams.IsRunning = false;
                nextY = this.slotParams.PositionOfStop;
                if (this.logicParams.UseRebound) {
                    this.node.runAction(cc.sequence(
                        cc.moveBy(0.1, 0, -this.slotParams.DistanceOfRebound).easing(cc.easeQuarticActionOut()),
                        cc.moveBy(0.1, 0, this.slotParams.DistanceOfRebound).easing(cc.easeQuarticActionIn()),
                        cc.callFunc(()=>{ this._onReboundFinish() })
                    ));
                } else if (this.onSlotStopCB !== null){
                    this.onSlotStopCB();
                }
            }
        }

        this.node.y = nextY;
    }

    _onReboundFinish () {
        if (this.onSlotStopCB !== null)
            this.onSlotStopCB();
    }

}
