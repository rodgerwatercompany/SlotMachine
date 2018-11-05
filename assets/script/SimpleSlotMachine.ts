
import SlotLine from "./SlotLine";
const {ccclass, property} = cc._decorator;

@ccclass
export default class SimpleSlotMachine extends cc.Component {

    // @property({
    //     type: [SlotLine]
    // })
    // slotLines : SlotLine[] = null;

    private slotLines : any;

    onLoad() {
        
        this.slotLines = [];
        
        
    }
}
