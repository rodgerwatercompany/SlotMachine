const {ccclass, property,executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class SimpleSlotLine extends cc.Component {

    // 是否使用 Layout 功能，勾選後按 F7 用以下屬性排版
    @property(Boolean: true)
    useEditLayout : boolean = true;
    
    private symboleNodes : any;

    private infos : any;

    onLoad() {
        
        this.infos = {
            Height_Symbol : 150,
            Interval_Symbol : 5
        };

        this.symboleNodes = [];

        for (let i = 1; i <= 7; i++) {

            this.symboleNodes[i] = cc.find("Symbol_" + i,this.node);
            
            this.symboleNodes[i].y = (i - 1) * (
                this.infos.Height_Symbol + 
                this.infos.Interval_Symbol
            );
        }
        
    }

    doLayout () {

    }
}
