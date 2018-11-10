
const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class SimpleSymbolNode extends cc.Component {

    private label : cc.Label;
    
    public onLoad () {

        this.label = cc.find("LABEL",this.node).getComponent(cc.Label);        
    }

    setLabel (str) {

        this.label.string = str;
    }

    getLabel () {

        return this.label.string;
    }
}
