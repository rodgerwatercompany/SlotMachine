
import SlotLine from "./SimpleSlotLine";
const {ccclass, property} = cc._decorator;

@ccclass
export default class SimpleSlotMachine extends cc.Component {


    private slotLines : SlotLine[];

    private infos : any;

    public onSlotStopCB : Function;

    public onLoad () {
        
        this.infos = {

            IdxOfSlotStop : 1,
            LengthOfSlotLines : 3
        };

        this.slotLines = [];
        
        for (let i = 1; i <= 3; i++) {
            
            this.slotLines[i] = cc.find("SlotLine_" + i,this.node).getComponent(SlotLine);
            this.slotLines[i].onSlotStopCB = () => { this.onSlotLineStop(); }
        }
        
    }

    public update (dt) {

        for (let i = 1; i <= 3; i++) {
            
            this.slotLines[i].syncUpdate(dt);
        }
    }

    public startSpin () {
        
        for (let i = 1; i <= 3; i++) {
            
            this.slotLines[i].startSpin();
        }
    }

    public setOutcomes (outcomes1,outcomes2,outcomes3) {

        this.slotLines[1].setOutcomes(outcomes1);
        this.slotLines[2].setOutcomes(outcomes2);
        this.slotLines[3].setOutcomes(outcomes3);
    }

    public setFinalOutcome (finalOutcome) {

        for (let i = 0; i < 3; i++) {

            this.slotLines[i + 1].setFinalOutCome([
                parseInt(finalOutcome[i * 3]),
                parseInt(finalOutcome[(i * 3) + 1]),
                parseInt(finalOutcome[(i * 3) + 2]),
            ]);
        }
    }

    public startStop () {

        this.infos.IdxOfSlotStop = 1;
        this.slotLines[1].startStop();
    }

    onSlotLineStop () {

        if (++this.infos.IdxOfSlotStop > this.infos.LengthOfSlotLines) {

            if (this.onSlotStopCB)
                this.onSlotStopCB();
        } else {

            this.slotLines[this.infos.IdxOfSlotStop].startStop();
        }
    }
}
