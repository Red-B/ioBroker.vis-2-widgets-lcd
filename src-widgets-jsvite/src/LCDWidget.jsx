import React from 'react';

class LCDWidget extends window.visRxWidget {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }
    static getWidgetInfo() {
        return {
            id: 'tplLCDWidget',
            visSet: 'vis-2-widgets-lcd',
            visSetIcon: 'widgets/vis-2-widgets-lcd/img/vis-2-widgets-lcd.svg',
            visSetLabel: 'vis_2_widgets_lcd', // Widget set translated label (should be defined only in one widget of a set)
            visSetColor: '#00cf00', // Color of a widget set. it is enough to set color only in one widget of a set
            visName: 'LCDWidget', // Name of widget
            visAttrs: [
                {
                    name: 'common', // group name
                    fields: [
                        {
                            name: 'type', // name in data structure
                            label: 'type', // translated field label
                            type: 'select',
                            options: ['all', 'current', 'days'],
                            default: 'all',
                        },
                    ],
                },
                {
                    name: 'private', // group name
                    label: 'private', // translated group label
                    fields: [
                        {
                            name: 'oid', // name in data structure
                            type: 'id',
                            label: 'oid', // translated field label
                        },
                    ],
                },
                // check here all possible types https://github.com/ioBroker/ioBroker.vis/blob/react/src/src/Attributes/Widget/SCHEMA.md
            ],
            visPrev: 'widgets/vis-2-widgets-lcd/img/vis-widget-lcd.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    propertiesUpdate() {
        // The widget has 3 important states
        // 1. this.state.values - contains all state values, that are used in widget (automatically collected from widget info).
        //                        So you can use `this.state.values[this.state.rxData.oid + '.val']` to get the value of state with id this.state.rxData.oid
        // 2. this.state.rxData - contains all widget data with replaced bindings. E.g. if this.state.data.type is `{system.adapter.admin.0.alive}`,
        //                        then this.state.rxData.type will have state value of `system.adapter.admin.0.alive`
        // 3. this.state.rxStyle - contains all widget styles with replaced bindings. E.g. if this.state.styles.width is `{javascript.0.width}px`,
        //                        then this.state.rxData.type will have state value of `javascript.0.width` + 'px
        const canvasEle = this.canvasRef.current;
        if (!canvasEle) return;
        
        canvasEle.width = 240;
        canvasEle.height = 128;
        const context = canvasEle.getContext('2d');
        
        // Clear canvas
        context.clearRect(0, 0, canvasEle.width, canvasEle.height);

        let array = [];
        try {
            const stateValue = this.state.values[`${this.state.rxData.oid}.val`];
            if (stateValue) {
                array = Object.values(JSON.parse(stateValue));
            }
        } catch (error) {
            console.warn('Error parsing LCD data:', error);
        }

        // Set default background to white
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvasEle.width, canvasEle.height);

        // Only render if we have data
        if (array.length > 0) {
            for (let i = 0; i < 128 && i < array.length / 30; i++) {
                for (let j = 0; j < 30; j++) {
                    const byte = array[i * 30 + j];
                    if (byte !== undefined) {
                        for (let k = 0; k < 8; k++) {
                            // eslint-disable-next-line no-bitwise
                            const pixel = (byte >> (7 - k)) & 1;
                            const xpos = (j * 8 + k);
                            const ypos = i;
                            if (pixel) {
                                context.fillStyle = 'black';
                                context.fillRect(xpos, ypos, 1, 1);
                            }
                        }
                    }
                }
            }
        }
    }

    componentDidMount() {
        super.componentDidMount();

        // Update data
        this.propertiesUpdate();
    }

    componentDidUpdate() {
        super.componentDidUpdate();

        // Update data when component updates
        this.propertiesUpdate();
    }

    // Do not delete this method. It is used by vis to read the widget configuration.
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return LCDWidget.getWidgetInfo();
    }
    // If the "prefix" attribute in translations.ts is true or string, you must implement this function.
    // If true, the adapter name + _ is used.
    // If string, then this function must return exactly that string
    static getI18nPrefix() {
        return `${LCDWidget.adapter}_`;
    }
    // This function is called every time when rxData is changed
    onRxDataChanged() {
        this.propertiesUpdate();
    }

    // This function is called every time when rxStyle is changed
    // eslint-disable-next-line class-methods-use-this
    onRxStyleChanged() {}

    // This function is called every time when some Object State updated, but all changes lands into this.state.values too
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    onStateUpdated(id, state) {}

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <canvas
            ref={this.canvasRef}
            width={240}
            height={128}
            style={{
                border: '1px solid #ccc',
                imageRendering: 'pixelated',
                maxWidth: '100%',
                height: 'auto',
            }}
        ></canvas>;
    }
}

export default LCDWidget;
