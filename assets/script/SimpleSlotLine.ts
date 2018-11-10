const {ccclass, property,executeInEditMode} = cc._decorator;

@ccclass
class DesignParams {

    @property(Number)
    public HeightOfSymbol : Number = 0;

    @property(Number)
    public IntervalOfSymbol : Number = 0;
}


@ccclass
@executeInEditMode
export default class SimpleSlotLine extends cc.Component {

    // 是否使用 Layout 功能，勾選後按 F7 用以下屬性排版
    @property(Boolean)
    public useEditLayout : boolean = false;
        
    public designParams : DesignParams = null;

    private symboleNodes : any;

    private infos : any;
    private logicParams : any;
    private slotParams : any;

    private outComes : any;
    private finalOutCome : any;

    public onSlotStopCB : Function;

    onLoad() {
        
        this.infos = {
            Height_Symbol : 150,
            Interval_Symbol : 50,
            ChangeCardPosition : - (4 * 150 + 3.5 * 50 ),
            InitFinalPosition : - (3 * 150 + 2.5 * 50)
        };

        this.symboleNodes = [];

        for (let i = 0; i < 7; i++) {

            this.symboleNodes[i] = cc.find("Symbol_" + (i + 1),this.node).getComponent("SimpleSymbolNode");            
            
        }

        this.logicParams = {

            IsChange456To012 : false,
            IsResetPos : false,
            IsRunning : false,
            IsStartStop : false,
            HaveSetOutcome : false
        };


        if (CC_EDITOR && this.useEditLayout) {
            this.doLayout();
        }
        
    }

    // public start () {
        
    //     this.symboleNodes[1].setLabel("Mobile\n123\nRodger");
    // }

    public syncUpdate (dt) {

        if (this.logicParams.IsRunning) {

            let moveStep = 1000 * dt;
            if (this.logicParams.IsStartStop && this.logicParams.HaveSetOutcome) {

                // 計算減速比例
                let x_1 = 0;
                let x_2 = this.infos.InitFinalPosition;
                let y_1 = 1000;
                let y_2 = 500;
                let ratio = y_1 + (((y_2 - y_1) * (this.node.y - x_1))/ (x_2 - x_1));
                moveStep = ratio * dt;

                if ((this.node.y - moveStep) <= this.infos.InitFinalPosition) {

                    this.node.y = this.infos.InitFinalPosition;
                    this.logicParams.IsRunning = false;
                    
                    if (this.onSlotStopCB)
                        this.onSlotStopCB();

                } else {

                    this.node.y -= moveStep;
                }
            } else { 

                 if (this.logicParams.IsResetPos) {

                    this.logicParams.IsResetPos = false;

                    //console.log(this.node.y - moveStep);                    
                    this.node.y += ((Math.abs(this.infos.ChangeCardPosition)));                    
                    this.node.y += (0.5 * this.infos.Interval_Symbol);
                    this.node.y -= moveStep;
                    //console.log(this.node.y);
                    this.set456();

                } else if ((this.node.y - moveStep) <= (this.infos.ChangeCardPosition)) {

                    this.set012To456();
                    this.logicParams.IsResetPos = true;

                    this.node.y -= moveStep;
                    console.log(this.node.y);
                } else {

                    this.node.y -= moveStep;
                }
            }
        }
    }

    public startSpin () {

        this.logicParams.IsRunning = true;
        this.logicParams.IsStartStop = false;
        this.logicParams.HaveSetOutcome = false;
    }

    public startStop () {

        this.logicParams.IsStartStop = true;
    }

    // 設定可能的結果
    public setOutcomes (outComes) {

        this.outComes = outComes;
    }

    // 最終結果
    public setFinalOutCome (finalOutcome) {

        this.finalOutCome = finalOutcome;
    }

    private doLayout () {        

        this.node.y = this.infos.InitFinalPosition;

        for (let i = 0; i < 7; i++) {
            
            this.symboleNodes[i].node.y = (i) * (
                this.infos.Height_Symbol + 
                this.infos.Interval_Symbol
            );
        }

        
    }

    private set012To456 () {

        this.symboleNodes[3].setLabel(this.outComes[
            this.getRandom(0,this.outComes.length)
        ]);

        this.symboleNodes[0].setLabel(this.symboleNodes[4].getLabel());
        this.symboleNodes[1].setLabel(this.symboleNodes[5].getLabel());
        this.symboleNodes[2].setLabel(this.symboleNodes[6].getLabel());
    }

    private set456 () {

        if (this.logicParams.IsStartStop) {

            this.symboleNodes[3].setLabel(this.outComes[this.finalOutCome[0]]);
            this.symboleNodes[4].setLabel(this.outComes[this.finalOutCome[1]]);
            this.symboleNodes[5].setLabel(this.outComes[this.finalOutCome[2]]);
            
            this.symboleNodes[6].setLabel(this.outComes[
                this.getRandom(0,this.outComes.length)
            ]);

            this.logicParams.HaveSetOutcome = true;
        } else {

            this.symboleNodes[4].setLabel(this.outComes[
                this.getRandom(0,this.outComes.length)
            ]);

            this.symboleNodes[5].setLabel(this.outComes[
                this.getRandom(0,this.outComes.length)
            ]);
            
            this.symboleNodes[6].setLabel(this.outComes[
                this.getRandom(0,this.outComes.length)
            ]);
        }
    }

    // return [start,end)
    private getRandom (start,end) {
        return Math.floor(Math.random() * (end - start) ) + start;
    }
    
}
