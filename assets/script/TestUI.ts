
const {ccclass, property} = cc._decorator;

@ccclass
export default class TestUI extends cc.Component {

    @property(cc.Button)
    btn_start : cc.Button = null;

    @property(cc.Button)
    btn_stop : cc.Button = null;

    private slotMachine : any;

    onLoad () {

        this.slotMachine = cc.find("Canvas/SlotMachine").getComponent("SimpleSlotMachine");
        this.slotMachine.onSlotStopCB = () => { this.onSlotStop(); };

        let outOutcomes1 = [
            "技術研發處\n多媒體",
            "技術研發處\n123\n新媒體",
            "技術研發處\nRd1",
            "技術研發處\n123\nRd2",
            "技術研發處\nRd5",
        ];

        let outOutcomes2 = [
            "Mobile",
            "電風扇\n123\nRodger2",
            "硬碟\n123\nRodger3",
            "光碟片\n123\nRodger4",
            "Mobile\n123\nRodger5",
        ];
        let outOutcomes3 = [
            "超級\n123\n鹹蛋超人",
            "特級\n123\n蜘蛛人",
            "高級\n123\n莓果隊長",
            "優級\n123\n煎餅俠",
            "初級\n123\n楊過",
        ];

        this.slotMachine.setOutcomes(outOutcomes1,outOutcomes2,outOutcomes3);

        this.slotMachine.setFinalOutcome([
            0,1,2,
            0,0,0,
            0,0,0
        ])
        this.btn_stop.interactable = false;
    }

    onStartClick () {

        this.btn_start.interactable = false;
        this.btn_stop.interactable = true;

        this.slotMachine.startSpin();
    }

    onStopClick () {

        this.btn_stop.interactable = false;

        this.slotMachine.startStop();
    }

    onSlotStop () {

        this.btn_start.interactable = true;
    }
}
