import { adaptBackgroundColor, colorByIntensityToStringRGB } from "./glx_functions";
import { normalize3, orientViewX, orientViewY, orientViewZ, rotateOwnAxisX, rotateOwnAxisY, rotateOwnAxisZ } from "./matrix";

function createSlider({ parent, label, id, min, max, step, value, onChange }) {
    parent.insertAdjacentHTML("beforeend", `
        <div style='display: flex; border: 1px solid black;'>
            <label for='${id}' style='width : 200px; font-size:12px;'>${label}</label>
            <input type='range' id='${id}' min='${min}' max='${max}' step='${step}' value='${value}'>
            <span id='${id}Value' style='width : 24px;'>${value}</span>
        </div>`);

    const input = document.getElementById(id);
    const display = document.getElementById(id + "Value");
    input.addEventListener("input", event => {
        const val = parseFloat(event.target.value);
        display.textContent = val;
        onChange(val);
    });
    return input;
}

function createToggleButton({ parent, id, initialState, onToggle }) {
    parent.insertAdjacentHTML("beforeend", `<button id='${id}'>${initialState ? 'OFF' : '.ON.'}</button>`);
    const button = document.getElementById(id);
    let state = initialState;
    button.addEventListener("click", () => {
        state = !state;
        button.textContent = state ? 'OFF' : '.ON.';
        onToggle(state);
    });
    return button;
}

function createColorDisplay({ parent, id, label, color }) {
    parent.insertAdjacentHTML("beforeend", `
        <div style='display:flex;'>
            <div id='${id}' style='border: 1px solid grey; display: flex; width: 100%; background-color: ${color};'>
                ${label}
            </div>
        </div>`);
    return document.getElementById(id);
}

export class ControlPanel {
    constructor(frame) {
        const self = this;
        this.state = 1;
        this.frame = frame;
        this.familiar_tag = document.getElementById("frame_container" + this.frame.containerTag);
        this.familiar_tag.insertAdjacentHTML("beforebegin", "<div id='tool_bar' style='display:flex; width: 100%; height:20px; border: 1px solid;'></div>")
        this.toolBar = document.getElementById("tool_bar");
        this.toolBar.insertAdjacentHTML("afterbegin", "<button id='hide_button'>hide panel</button>")
        this.familiar_tag.insertAdjacentHTML("beforeend", "<div id='controls_panel' style='background-color: rgb(40,40,40); color: rgb(240,255,240); display:flex; flex-direction : column; width:400px; overflow-y: auto; overflow-x: hidden;'></div>");
        this.htmlElement = document.getElementById("controls_panel");
        this.htmlElement.style.height = this.frame.canvas.canvas.offsetHeight + "px";
        console.log("height", this.frame.canvas.canvas.offsetHeight);
        window.addEventListener('resize', function () {
            self.htmlElement.style.height = self.frame.canvas.canvas.offsetHeight + "px";
        });
        this.hideButton = document.getElementById("hide_button");
        this.hideButton.addEventListener("click", function () {
            if (self.state == 1) {
                self.htmlElement.style.width = '0px';
                self.hideButton.textContent = "show panel";
                self.state = 0;
            } else {
                self.htmlElement.style.width = '300px';
                self.hideButton.textContent = "hide panel";
                self.state = 1;
            }
        });
        this.createConsole();
    }
    createConsole() {
        this.console = new Console(this.frame.frameId, this.toolBar);
    }

}

export class Console {
    constructor(container_id, toolBar) {
        const self = this;
        this.containerTag = container_id;
        this.toolBar = toolBar;
        this.c = "rgb(200,255,200)";
        this.bc = "rgba(127,127,127,0.3)"
        this.fs = "14px";
        this.state = 1;
        this.container = document.getElementById(this.containerTag);
        this.container.insertAdjacentHTML("afterbegin", "<div id='console' style=' position: absolute; background-color:" + this.bc + "; color:" + this.c + "; font-size:" + this.fs + "; width: 100%; height:auto; border: 1px solid gray;'></div>")
        this.console = document.getElementById("console");
        this.toolBar.insertAdjacentHTML("afterbegin", "<button id='console_hide_button' style=' position: relative;'>hide console</button>")
        this.fontSize(this.fs);
        this.color(this.c);
        this.hideButton = document.getElementById("console_hide_button");
        this.hideButton.addEventListener("click", function () {
            if (self.state == 1) {
                self.console.style.display = 'none';
                self.hideButton.textContent = "show console";
                self.state = 0;
            } else {
                self.console.style.display = 'block';
                self.hideButton.textContent = "hide console";
                self.state = 1;
            }
        });
    }
    error(e) {
        this.console.insertAdjacentHTML("afterbegin", "<div id='error' style='display:flex; color:rgb(255,64,64); font-size:20px; background-color:rgb(0,0,0); width: 100%; height:auto;'></div>");
        this.displayError = document.getElementById("error");
        this.displayError.innerText += "Error: " + e.name + "\n" + e.message + e.stack;
        alert("There is an error in the code.\n" + e.name + "\n" + e.message + e.stack);
    }

    fontSize(fs) {
        this.console.style.fontSize = fs;
    }
    color(c) {
        this.console.style.color = c;
    }
}

export class Display {
    constructor(name) {
        this.name = name;
        this.familiar_tag = document.getElementById("console");
        this.familiar_tag.insertAdjacentHTML("beforeEnd", "<pre id='" + this.name + "DisplayDiv' style='display:flex; z-index:20; position: relative; width: 100%; height:auto;'></pre>")
        this.display = document.getElementById(this.name + "DisplayDiv");
        this.numberOfColumns = 1;
        this.fixed = 3;
        this.color(this.familiar_tag.style.color.valueOf());
        //console.log(window.getComputedStyle(this.familiar_tag).fontSize);
        this.fontSize(window.getComputedStyle(this.familiar_tag).fontSize);
    }
    log(value) {
        if (value instanceof Float32Array) {
            if (this.numberOfColumns == 0) {
                this.display.textContent = this.name + ": Float32Array(" + value.length + "): " + value;
            } else {
                this.display.textContent = this.name + ": Float32Array(" + value.length + "): ";
                for (let i = 0; i < value.length;) {
                    this.display.innerHTML += "<br>&nbsp;&nbsp;&nbsp;";
                    for (let j = 0; j < this.numberOfColumns; j++) {
                        const val = Number(value[i + j]).toFixed(this.fixed);
                        this.display.innerHTML += "[" + (i + j) + "]: " + val + " &nbsp;&nbsp;&nbsp; ";
                    }
                    i = i + this.numberOfColumns;
                }
            }

        } else if (value instanceof Uint16Array) {
            if (this.numberOfColumns == 0) {
                this.display.textContent = this.name + ": Uint16Array(" + value.length + "): " + value;
            } else {
                this.display.textContent = this.name + ": Uint16Array(" + value.length + "): ";
                for (let i = 0; i < value.length;) {
                    this.display.innerHTML += "<br>&nbsp;&nbsp;&nbsp;";
                    for (let j = 0; j < this.numberOfColumns; j++) {
                        const val = Number(value[i + j]);//.toFixed(this.fixed);
                        this.display.innerHTML += "[" + (i + j) + "]: " + val + " &nbsp;&nbsp;&nbsp; ";
                    }
                    i = i + this.numberOfColumns;
                }
            }

        }
        else if (Array.isArray(value)) {
            if (this.numberOfColumns == 0) {
                this.display.textContent = this.name + ": Array(" + value.length + "): " + value;
            } else {
                this.display.textContent = this.name + ": Array(" + value.length + "): ";
                for (let i = 0; i < value.length;) {
                    this.display.innerHTML += "<br>&nbsp;&nbsp;&nbsp;";
                    for (let j = 0; j < this.numberOfColumns; j++) {
                        const val = value[i + j];//).toFixed(this.fixed);
                        this.display.innerHTML += "[" + (i + j) + "]: " + val + " &nbsp;&nbsp;&nbsp; ";
                    }
                    i = i + this.numberOfColumns;
                }
            }
        } else {
            this.display.textContent = this.name + " : " + value;
        }
    }
    logComma(value) {
        let comma = ",&nbsp;";
        if (value instanceof Float32Array) {
            if (this.numberOfColumns == 0) {
                this.display.textContent = this.name + ": Float32Array(" + value.length + "): " + value;
            } else {
                this.display.textContent = this.name + ": Float32Array(" + value.length + "): ";
                for (let i = 0; i < value.length;) {
                    this.display.innerHTML += "<br>&nbsp;&nbsp;&nbsp;";
                    for (let j = 0; j < this.numberOfColumns; j++) {
                        const val = Number(value[i + j]).toFixed(this.fixed);
                        if (i + j == value.length - 1) {
                            comma = "";
                        }
                        this.display.innerHTML += val + comma;
                    }
                    i = i + this.numberOfColumns;
                }
            }

        } else if (value instanceof Uint16Array) {
            if (this.numberOfColumns == 0) {
                this.display.textContent = this.name + ": Uint16Array(" + value.length + "): " + value;
            } else {
                this.display.textContent = this.name + ": Uint16Array(" + value.length + "): ";
                for (let i = 0; i < value.length;) {
                    this.display.innerHTML += "<br>&nbsp;&nbsp;&nbsp;";
                    for (let j = 0; j < this.numberOfColumns; j++) {
                        const val = Number(value[i + j]);//.toFixed(this.fixed);
                        if (i + j == value.length - 1) {
                            comma = "";
                        }
                        this.display.innerHTML += val + comma;
                    }
                    i = i + this.numberOfColumns;
                }
            }

        }
        else if (Array.isArray(value)) {
            if (this.numberOfColumns == 0) {
                this.display.textContent = this.name + ": Array(" + value.length + "): " + value;
            } else {
                this.display.textContent = this.name + ": Array(" + value.length + "): ";
                for (let i = 0; i < value.length;) {
                    this.display.innerHTML += "<br>&nbsp;&nbsp;&nbsp;";
                    for (let j = 0; j < this.numberOfColumns; j++) {
                        const val = value[i + j];//).toFixed(this.fixed);
                        if (i + j == value.length - 1) {
                            comma = "";
                        }
                        this.display.innerHTML += val + comma;
                    }
                    i = i + this.numberOfColumns;
                }
            }
        } else {
            this.display.textContent = this.name + " : " + value;
        }
    }
    fontSize(fs) {
        this.display.style.fontSize = fs;
    }
    color(c) {
        this.display.style.color = c;
    }
}

export class AmbientLightControls {
    constructor(o) {
        this.o = o;
    }

    create() {
        const self = this.o;
        this.o.panel_id = "ambientLightPanel";
        this.o.familiar_tag = document.getElementById('controls_panel');

        this.o.familiar_tag.insertAdjacentHTML("beforeend", `
            <div id='${this.o.panel_id}' style='display:flex; flex-direction: column; width:100%;'></div>`);

        this.o.panel = document.getElementById(this.o.panel_id);

        // Display color
        this.o.ambientColorDisplay = createColorDisplay({
            parent: this.o.panel,
            id: "ambientColorDisplay",
            label: "ambient color",
            color: colorByIntensityToStringRGB(this.o.color, this.o.intensity)
        });

        // On/off toggle
        createToggleButton({
            parent: this.o.panel,
            id: "onoff_ambient",
            initialState: this.o.state,
            onToggle: (state) => {
                self.state = state;
            }
        });

        // Color sliders (R, G, B)
        ["Red", "Green", "Blue"].forEach((channel, i) => {
            createSlider({
                parent: this.o.panel,
                label: `ambient${channel}`,
                id: `ambient${channel}`,
                min: 0.0,
                max: 1.0,
                step: 0.01,
                value: self.color[i],
                onChange: (val) => {
                    self.color[i] = val;
                    self.ambientColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.color, self.intensity);
                    adaptBackgroundColor(self.ambientColorDisplay, self.color, self.intensity);
                }
            });
        });

        // Intensity slider
        createSlider({
            parent: this.o.panel,
            label: "ambientIntensity",
            id: "ambientIntensity",
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.intensity,
            onChange: (val) => {
                self.intensity = val;
                self.ambientColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.color, self.intensity);
                adaptBackgroundColor(self.ambientColorDisplay, self.color, self.intensity);
            }
        });
    }
}

export class DirectionalLightControls {
    constructor(o) {
        this.o = o;
    }

    create() {
        const self = this.o;
        self.panel_id = "directionalLightPanel";
        self.familiar_tag = document.getElementById('controls_panel');
        self.familiar_tag.insertAdjacentHTML("beforeend", `
            <div id='${self.panel_id}' style='display:flex; flex-direction: column; width:100%;'></div>`);
        self.panel = document.getElementById(self.panel_id);

        // Color display
        self.directionalColorDisplay = createColorDisplay({
            parent: self.panel,
            id: "directionalColorDisplay",
            label: "directional color",
            color: colorByIntensityToStringRGB(self.color, self.intensity)
        });

        // Toggle button
        createToggleButton({
            parent: self.panel,
            id: "onoff_directional",
            initialState: self.state,
            onToggle: (state) => { self.state = state; }
        });

        // RGB sliders
        ["Red", "Green", "Blue"].forEach((channel, i) => {
            createSlider({
                parent: self.panel,
                label: `directional${channel}`,
                id: `directional${channel}`,
                min: 0.0,
                max: 1.0,
                step: 0.01,
                value: self.color[i],
                onChange: (val) => {
                    self.color[i] = val;
                    self.directionalColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.color, self.intensity);
                    adaptBackgroundColor(self.directionalColorDisplay, self.color, self.intensity);
                }
            });
        });

        // Intensity slider
        createSlider({
            parent: self.panel,
            label: "directionalIntensity",
            id: "directionalIntensity",
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.intensity,
            onChange: (val) => {
                self.intensity = val;
                self.directionalColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.color, self.intensity);
                adaptBackgroundColor(self.directionalColorDisplay, self.color, self.intensity);
            }
        });

        // Dirección XYZ sliders
        ["X", "Y", "Z"].forEach((axis, i) => {
            createSlider({
                parent: self.panel,
                label: `directional_${axis}`,
                id: `directional_${axis}`,
                min: -1.0,
                max: 1.0,
                step: 0.01,
                value: self.noNormalizedDirection[i],
                onChange: (val) => {
                    self.noNormalizedDirection[i] = val;
                    const [x, y, z] = normalize3(self.noNormalizedDirection);
                    self.direction = [x, y, z];
                    self.normalized_directional_vectorDisplay.textContent =
                        `normalized directional vector: [${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)}]`;
                }
            });
        });

        // Display del vector normalizado
        self.panel.insertAdjacentHTML("beforeend", `
            <div id='normalized_directional_vector' style='border: 1px solid grey;'></div>`);
        self.normalized_directional_vectorDisplay = document.getElementById('normalized_directional_vector');
        self.normalized_directional_vectorDisplay.textContent =
            `normalized directional vector: [${self.direction[0].toFixed(3)}, ${self.direction[1].toFixed(3)}, ${self.direction[2].toFixed(3)}]`;
    }
}

export class PointLightControls {
    constructor(o) {
        this.o = o;
    }

    create(indexPoint) {
        const self = this.o;
        const idPrefix = `point${indexPoint}`;
        self.panel_id = `pointLightPanel_${indexPoint}`;
        self.familiar_tag = document.getElementById('controls_panel');

        self.familiar_tag.insertAdjacentHTML("beforeend", `
            <div id='${self.panel_id}' style='display:flex; flex-direction: column; width:100%;'></div>`);
        self.panel = document.getElementById(self.panel_id);

        // Display de color
        self.pointColorDisplay = createColorDisplay({
            parent: self.panel,
            id: `pointColorDisplay${indexPoint}`,
            label: `point ${indexPoint} color`,
            color: colorByIntensityToStringRGB(self.color, self.intensity)
        });

        // Botón ON/OFF
        createToggleButton({
            parent: self.panel,
            id: `onoff${indexPoint}`,
            initialState: self.state,
            onToggle: (state) => {
                self.state = state;
            }
        });

        // Sliders RGB
        ["Red", "Green", "Blue"].forEach((channel, i) => {
            createSlider({
                parent: self.panel,
                label: `point${channel}_${indexPoint}`,
                id: `${idPrefix}${channel}`,
                min: 0.0,
                max: 1.0,
                step: 0.01,
                value: self.color[i],
                onChange: (val) => {
                    self.color[i] = val;
                    self.pointColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.color, self.intensity);
                    adaptBackgroundColor(self.pointColorDisplay, self.color, self.intensity);
                }
            });
        });

        // Intensidad
        createSlider({
            parent: self.panel,
            label: `pointIntensity_${indexPoint}`,
            id: `${idPrefix}Intensity`,
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.intensity,
            onChange: (val) => {
                self.intensity = val;
                self.pointColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.color, self.intensity);
                adaptBackgroundColor(self.pointColorDisplay, self.color, self.intensity);
            }
        });

        // Posición XYZ
        ["X", "Y", "Z"].forEach((axis, i) => {
            createSlider({
                parent: self.panel,
                label: `point_pos_${axis}_${indexPoint}`,
                id: `${idPrefix}_pos_${axis}`,
                min: -10.0,
                max: 10.0,
                step: 0.01,
                value: self.position[i],
                onChange: (val) => {
                    self.position[i] = val;
                }
            });
        });

        // Scope
        createSlider({
            parent: self.panel,
            label: `scope${indexPoint}`,
            id: `${idPrefix}Scope`,
            min: 0.0,
            max: 24.0,
            step: 0.01,
            value: self.scope,
            onChange: (val) => {
                self.scope = val;
            }
        });
    }
}

export class LightingControls {
    constructor(o) {
        this.o = o;
    }
    create() {
        const self = this.o;
        this.o.panel_id = "generalLighting";
        this.o.familiar_tag = document.getElementById('controls_panel');
        this.o.familiar_tag.insertAdjacentHTML("beforeend", "<div id='" + this.o.panel_id + "' style='display:flex; flex-direction: column; width:100%;'></div>");
        this.o.panel = document.getElementById(this.o.panel_id);
        ///////////////////////////////////////////////////////////add point red color control
        this.o.panel.insertAdjacentHTML("beforeend", "<div style='display: flex;'><div id='lighting' style='border: 1px solid grey; background-color: white; color: black; display: flex; width: 100%;'>General Lighting</div></div>");
        this.o.panel.insertAdjacentHTML("beforeend", "<div style='display: flex;'><label for='generalIntensity' style='width : 110px;'>general intensity</label>\
        <input type='range' name='generalIntensity' id='generalIntensity' min='0.0' max='1.0' step='0.01' value="+ this.o.intensity + ">\
        <span id='generalIntensityValue' style='width : 24px;'></span></div>");
        this.o.inputgeneralIntensity = document.getElementById('generalIntensity');
        this.o.displaygeneralIntensityValue = document.getElementById('generalIntensityValue');
        this.o.displaygeneralIntensityValue.textContent = this.o.intensity;
        this.o.inputgeneralIntensity.addEventListener('input', function (event) {
            self.intensity = event.target.value;
            self.displaygeneralIntensityValue.textContent = event.target.value;
        });
        this.o.panel.insertAdjacentHTML("beforeend", "<div style='display: flex;'><label for='generalIntensity' style='width : 110px;'>bias</label>\
        <input type='range' name='bias' id='bias' min='0.0' max='1.0' step='0.0001' value="+ this.o.bias + ">\
        <span id='biasValue' style='width : 24px;'></span></div>");
        this.o.inputBias = document.getElementById('bias');
        this.o.displayBiasValue = document.getElementById('biasValue');
        this.o.displayBiasValue.textContent = this.o.bias;
        this.o.inputBias.addEventListener('input', function (event) {
            self.bias = event.target.value;
            self.displayBiasValue.textContent = event.target.value;
        });
    }
}

export class DiffuseObjectControls {
    constructor(o) {
        this.o = o;
    }

    create(name) {
        const self = this.o;
        self.panel_id = name;
        self.familiar_tag = document.getElementById('controls_panel');
        self.minScale = 0.001;
        self.maxScale = 4.0;

        self.familiar_tag.insertAdjacentHTML("beforeend", `
            <div id='${self.panel_id}' style='display:flex; flex-direction: column; width:100%;'></div>`);
        self.panel = document.getElementById(self.panel_id);

        // Display color
        self.diffuseObjectColorDisplay = createColorDisplay({
            parent: self.panel,
            id: `${name}ColorDisplay`,
            label: `${name} color`,
            color: colorByIntensityToStringRGB(self.diffuseColor, 1.0)
        });
        adaptBackgroundColor(self.diffuseObjectColorDisplay, self.diffuseColor, 1.0);

        // Toggle ON/OFF
        createToggleButton({
            parent: self.panel,
            id: `onoff${name}`,
            initialState: self.state,
            onToggle: (state) => self.state = state
        });

        // RGBA sliders
        ["Red", "Green", "Blue"].forEach((channel, i) => {
            createSlider({
                parent: self.panel,
                label: `${name}diffuse${channel}`,
                id: `${name}diffuse${channel}`,
                min: 0.0,
                max: 1.0,
                step: 0.01,
                value: self.diffuseColor[i],
                onChange: (val) => {
                    self.diffuseColor[i] = val;
                    self.diffuseObjectColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, 1.0);
                    adaptBackgroundColor(self.diffuseObjectColorDisplay, self.diffuseColor, 1.0);
                }
            });
        });

        createSlider({
            parent: self.panel,
            label: `${name}diffuseAlpha`,
            id: `${name}diffuseAlpha`,
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.alpha,
            onChange: (val) => {
                self.alpha = val;
                self.diffuseObjectColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, val);
                adaptBackgroundColor(self.diffuseObjectColorDisplay, self.diffuseColor, 1.0);
            }
        });

        // Posición X, Y, Z
        ["X", "Y", "Z"].forEach((axis, i) => {
            const matrixIndex = 12 + i;
            createSlider({
                parent: self.panel,
                label: `${name} pos ${axis}`,
                id: `position_${axis}${name}`,
                min: -10.0,
                max: 10.0,
                step: 0.01,
                value: self.positionMatrix[matrixIndex],
                onChange: (val) => self.positionMatrix[matrixIndex] = val
            });
        });

        // Escala X, Y, Z
        [["X", 0], ["Y", 5], ["Z", 10]].forEach(([axis, index]) => {
            createSlider({
                parent: self.panel,
                label: `${name} sca ${axis}`,
                id: `scalar_${axis}${name}`,
                min: self.minScale,
                max: self.maxScale,
                step: 0.001,
                value: self.scalarMatrix[index],
                onChange: (val) => self.scalarMatrix[index] = val
            });
        });

        // Botones de escala total
        self.panel.insertAdjacentHTML("beforeend", `
            <div style='display:flex;'>
                <button id='enlarge${name}'>enlarge</button>
                <button id='shrink${name}'>shrink</button>
                <button id='resetScale${name}'>reset scale</button>
            </div>`);

        document.getElementById(`enlarge${name}`).addEventListener("click", () => {
            [0, 5, 10].forEach(i => {
                if (self.scalarMatrix[i] * 1.05 <= self.maxScale) self.scalarMatrix[i] *= 1.05;
            });
            self.inputControlScalarX.value = self.scalarMatrix[0];
            self.inputControlScalarY.value = self.scalarMatrix[5];
            self.inputControlScalarZ.value = self.scalarMatrix[10];
        });

        document.getElementById(`shrink${name}`).addEventListener("click", () => {
            [0, 5, 10].forEach(i => {
                if (self.scalarMatrix[i] / 1.05 >= self.minScale) self.scalarMatrix[i] /= 1.05;
            });
            self.inputControlScalarX.value = self.scalarMatrix[0];
            self.inputControlScalarY.value = self.scalarMatrix[5];
            self.inputControlScalarZ.value = self.scalarMatrix[10];
        });

        document.getElementById(`resetScale${name}`).addEventListener("click", () => {
            [0, 5, 10].forEach(i => self.scalarMatrix[i] = 1.0);
            self.inputControlScalarX.value = 1.0;
            self.inputControlScalarY.value = 1.0;
            self.inputControlScalarZ.value = 1.0;

        });

        // Rotaciones del mundo
        [["X", "angleX", orientViewX], ["Y", "angleY", orientViewY], ["Z", "angleZ", orientViewZ]].forEach(([axis, prop, orientFn]) => {
            createSlider({
                parent: self.panel,
                label: `${name} world ang ${axis}`,
                id: `ang_${axis}${name}`,
                min: -2,
                max: 2,
                step: 0.01,
                value: self[prop],
                onChange: (val) => orientFn(self, val)
            });
        });

        // Rotaciones propias
        [["X", "ownAngleX", rotateOwnAxisX], ["Y", "ownAngleY", rotateOwnAxisY], ["Z", "ownAngleZ", rotateOwnAxisZ]].forEach(([axis, prop, rotateFn]) => {
            createSlider({
                parent: self.panel,
                label: `${name} own ang ${axis}`,
                id: `ownang_${axis}${name}`,
                min: -2,
                max: 2,
                step: 0.01,
                value: self[prop],
                onChange: (val) => rotateFn(self, val)
            });
        });
    }

    refresh() {
        const self = this.o;

        // Colores RGBA
        document.getElementById(`${this.name}diffuseRed`).value = self.diffuseColor[0];
        document.getElementById(`${this.name}diffuseRedValue`).textContent = self.diffuseColor[0];

        document.getElementById(`${this.name}diffuseGreen`).value = self.diffuseColor[1];
        document.getElementById(`${this.name}diffuseGreenValue`).textContent = self.diffuseColor[1];

        document.getElementById(`${this.name}diffuseBlue`).value = self.diffuseColor[2];
        document.getElementById(`${this.name}diffuseBlueValue`).textContent = self.diffuseColor[2];

        document.getElementById(`${this.name}diffuseAlpha`).value = self.alpha;
        document.getElementById(`${this.name}diffuseAlphaValue`).textContent = self.alpha;

        // Actualizar color del display
        self.diffuseObjectColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, self.alpha);
        adaptBackgroundColor(self.diffuseObjectColorDisplay, self.diffuseColor, 1.0);

        // Posición
        ["X", "Y", "Z"].forEach((axis, i) => {
            const val = self.positionMatrix[12 + i];
            const el = document.getElementById(`position_${axis}${this.name}`);
            const disp = document.getElementById(`position_${axis}${this.name}Value`);
            el.value = val;
            disp.textContent = val;
        });

        // Escala
        [["X", 0], ["Y", 5], ["Z", 10]].forEach(([axis, index]) => {
            const val = self.scalarMatrix[index];
            document.getElementById(`scalar_${axis}${this.name}`).value = val;
            document.getElementById(`scalar_${axis}${this.name}Value`).textContent = val;
        });

        // Ángulos mundo
        [["X", "angleX"], ["Y", "angleY"], ["Z", "angleZ"]].forEach(([axis, prop]) => {
            const val = self[prop];
            document.getElementById(`ang_${axis}${this.name}`).value = val;
            document.getElementById(`ang_${axis}${this.name}Value`).textContent = val;
        });

        // Ángulos propios
        [["X", "ownAngleX"], ["Y", "ownAngleY"], ["Z", "ownAngleZ"]].forEach(([axis, prop]) => {
            const val = self[prop];
            document.getElementById(`ownang_${axis}${this.name}`).value = val;
            document.getElementById(`ownang_${axis}${this.name}Value`).textContent = val;
        });
    }

}

export class SunControls {
    constructor(o) {
        this.o = o;
    }

    create(name) {
        this.name = name;
        const self = this.o;

        self.panel_id = name;
        self.familiar_tag = document.getElementById('controls_panel');
        self.minScale = 0.001;
        self.maxScale = 4.0;

        self.familiar_tag.insertAdjacentHTML("beforeend", "<div id='" + self.panel_id + "' style='display:flex; flex-direction: column; width:100%;'></div>");
        self.panel = document.getElementById(self.panel_id);

        // Color display and switch button
        self.sunColorDisplay = createColorDisplay({
            parent: self.panel,
            id: name + "ColorDisplay",
            label: name + " color",
            color: colorByIntensityToStringRGB(self.diffuseColor, 1.0)
        });
        adaptBackgroundColor(self.sunColorDisplay, self.diffuseColor, 1);

        self.onOffButton = createToggleButton({
            parent: self.panel,
            id: "onoff" + name,
            initialState: self.state,
            onToggle: (state) => {
                self.state = state;
            }
        });

        // Diffuse red color control
        self.inputControlRed = createSlider({
            parent: self.panel,
            label: name + "diffuseRed",
            id: name + "diffuseRed",
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.diffuseColor[0],
            onChange: (val) => {
                self.diffuseColor[0] = val;
                self.sunColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, 1.0);
                adaptBackgroundColor(self.sunColorDisplay, self.diffuseColor, 1);
            }
        });

        // Diffuse green color control
        self.inputControlGreen = createSlider({
            parent: self.panel,
            label: name + "diffuseGreen",
            id: name + "diffuseGreen",
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.diffuseColor[1],
            onChange: (val) => {
                self.diffuseColor[1] = val;
                self.sunColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, 1.0);
                adaptBackgroundColor(self.sunColorDisplay, self.diffuseColor, 1);
            }
        });

        // Diffuse blue color control
        self.inputControlBlue = createSlider({
            parent: self.panel,
            label: name + "diffuseBlue",
            id: name + "diffuseBlue",
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.diffuseColor[2],
            onChange: (val) => {
                self.diffuseColor[2] = val;
                self.sunColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, 1.0);
                adaptBackgroundColor(self.sunColorDisplay, self.diffuseColor, 1);
            }
        });

        // Diffuse alpha color control
        self.inputControlAlpha = createSlider({
            parent: self.panel,
            label: name + "diffuseAlpha",
            id: name + "diffuseAlpha",
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.alpha,
            onChange: (val) => {
                self.alpha = val;
                self.sunColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, val);
                adaptBackgroundColor(self.sunColorDisplay, self.diffuseColor, 1);
            }
        });

        // Position X control
        self.panel.insertAdjacentHTML("beforeend", "<div style='display: flex;'><label for='position_X" + name + "' style='width : 110px;'>" + name + " pos X</label>\
        <span id='position_X" + name + "Value' style='width : 24px;'></span></div>");
        self.displayPositionXValue = document.getElementById('position_X' + name + 'Value');
        self.displayPositionXValue.textContent = self.positionMatrix[12];

        // Position Y control
        self.panel.insertAdjacentHTML("beforeend", "<div style='display: flex;'><label for='position_Y" + name + "' style='width : 110px;'>" + name + " pos Y</label>\
        <span id='position_Y" + name + "Value' style='width : 24px;'></span></div>");
        self.displayPositionYValue = document.getElementById('position_Y' + name + 'Value');
        self.displayPositionYValue.textContent = self.positionMatrix[13];

        // Position Z control
        self.panel.insertAdjacentHTML("beforeend", "<div style='display: flex;'><label for='position_Z" + name + "' style='width : 110px;'>" + name + " pos Z</label>\
        <span id='position_Z" + name + "Value' style='width : 24px;'></span></div>");
        self.displayPositionZValue = document.getElementById('position_Z' + name + 'Value');
        self.displayPositionZValue.textContent = self.positionMatrix[14];

        // Ángulo desde eje Y
        self.panel.insertAdjacentHTML("beforeend", `
    <div style='display: flex;'>
        <label for='angleFromY${name}' style='width : 110px;'>${name} angleFromY</label>
        <input type='range' name='angleFromY${name}' id='angleFromY${name}' min='-6.29' max='6.29' step='0.01' value='${self.angleFromY}'>
        <span id='angleFromY${name}Value' style='width : 24px;'></span>
    </div>
`);
        self.inputControlAngleFromY = document.getElementById(`angleFromY${name}`);
        self.displayAngleFromYValue = document.getElementById(`angleFromY${name}Value`);
        self.displayAngleFromYValue.textContent = self.angleFromY;
        self.inputControlAngleFromY.addEventListener('input', (event) => {
            self.positionAngleWithYAxis(parseFloat(event.target.value));
            self.displayAngleFromYValue.textContent = event.target.value;
            self.displayPositionXValue.textContent = self.positionMatrix[12];
            self.displayPositionYValue.textContent = self.positionMatrix[13];
            self.displayPositionZValue.textContent = self.positionMatrix[14];
        });

        // Ángulo desde eje Z
        self.panel.insertAdjacentHTML("beforeend", `
    <div style='display: flex;'>
        <label for='angleFromZ${name}' style='width : 110px;'>${name} angleFromZ</label>
        <input type='range' name='angleFromZ${name}' id='angleFromZ${name}' min='-6.29' max='6.29' step='0.01' value='${self.angleFromZ}'>
        <span id='angleFromZ${name}Value' style='width : 24px;'></span>
    </div>
`);
        self.inputControlAngleFromZ = document.getElementById(`angleFromZ${name}`);
        self.displayAngleFromZValue = document.getElementById(`angleFromZ${name}Value`);
        self.displayAngleFromZValue.textContent = self.angleFromZ;
        self.inputControlAngleFromZ.addEventListener('input', (event) => {
            self.positionAngleWithZAxis(parseFloat(event.target.value));
            self.displayAngleFromZValue.textContent = event.target.value;
            self.displayPositionXValue.textContent = self.positionMatrix[12];
            self.displayPositionYValue.textContent = self.positionMatrix[13];
            self.displayPositionZValue.textContent = self.positionMatrix[14];
        });


        // Scale sliders X, Y, Z
        ["X", "Y", "Z"].forEach((axis, i) => {
            createSlider({
                parent: self.panel,
                label: `${name} sca ${axis}`,
                id: `scalar_${axis}${name}`,
                min: self.minScale,
                max: self.maxScale,
                step: 0.001,
                value: self.scalarMatrix[i * 5],
                onChange: (val) => {
                    self.scalarMatrix[i * 5] = val;
                }
            });
        });

        // Buttons for scale control
        self.panel.insertAdjacentHTML("beforeend", `
            <div style='display:flex;'>
                <button id='enlarge${name}'>enlarge</button>
                <button id='shrink${name}'>shrink</button>
                <button id='resetScale${name}'>reset scale</button>
            </div>`);

        document.getElementById(`enlarge${name}`).addEventListener("click", () => {
            ["X", "Y", "Z"].forEach((axis, i) => {
                const idx = i * 5;
                if (self.scalarMatrix[idx] * 1.05 <= self.maxScale) self.scalarMatrix[idx] *= 1.05;
            });
            // refresh sliders values after enlarge
            ["X", "Y", "Z"].forEach((axis) => {
                document.getElementById(`scalar_${axis}${name}`).value = self.scalarMatrix[["X", "Y", "Z"].indexOf(axis) * 5];
            });
        });

        document.getElementById(`shrink${name}`).addEventListener("click", () => {
            ["X", "Y", "Z"].forEach((axis, i) => {
                const idx = i * 5;
                if (self.scalarMatrix[idx] / 1.05 >= self.minScale) self.scalarMatrix[idx] /= 1.05;
            });
            // refresh sliders values after shrink
            ["X", "Y", "Z"].forEach((axis) => {
                document.getElementById(`scalar_${axis}${name}`).value = self.scalarMatrix[["X", "Y", "Z"].indexOf(axis) * 5];
            });
        });

        document.getElementById(`resetScale${name}`).addEventListener("click", () => {
            ["X", "Y", "Z"].forEach((axis, i) => {
                self.scalarMatrix[i * 5] = 1.0;
                document.getElementById(`scalar_${axis}${name}`).value = 1.0;
            });
        });

        // Rotation sliders (world angles)
        [["X", "angleX", orientViewX], ["Y", "angleY", orientViewY], ["Z", "angleZ", orientViewZ]].forEach(([axis, prop, fn]) => {
            createSlider({
                parent: self.panel,
                label: `${name} world ang ${axis}`,
                id: `ang_${axis}${name}`,
                min: -2,
                max: 2,
                step: 0.01,
                value: self[prop],
                onChange: (val) => fn(self, val)
            });
        });

        // Rotation sliders (own angles)
        [["X", "ownAngleX", rotateOwnAxisX], ["Y", "ownAngleY", rotateOwnAxisY], ["Z", "ownAngleZ", rotateOwnAxisZ]].forEach(([axis, prop, fn]) => {
            createSlider({
                parent: self.panel,
                label: `${name} own ang ${axis}`,
                id: `ownang_${axis}${name}`,
                min: -2,
                max: 2,
                step: 0.01,
                value: self[prop],
                onChange: (val) => fn(self, val)
            });
        });
    }

    refresh() {
        const self = this.o;

        // Sync colors
        ["Red", "Green", "Blue"].forEach((channel, i) => {
            const id = `${this.name}diffuse${channel}`;
            document.getElementById(id).value = self.diffuseColor[i];
            document.getElementById(id + "Value").textContent = self.diffuseColor[i];
        });

        const alphaId = `${this.name}diffuseAlpha`;
        document.getElementById(alphaId).value = self.alpha;
        document.getElementById(alphaId + "Value").textContent = self.alpha;

        self.sunColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, self.alpha);
        adaptBackgroundColor(self.sunColorDisplay, self.diffuseColor, 1);

        // Sync position values
        ["X", "Y", "Z"].forEach((axis, i) => {
            const val = self.positionMatrix[12 + i];
            const disp = document.getElementById(`position_${axis}${this.name}Value`);
            if (disp) disp.textContent = val;
        });

        // Sync scalar sliders
        ["X", "Y", "Z"].forEach((axis, i) => {
            const val = self.scalarMatrix[i * 5];
            const slider = document.getElementById(`scalar_${axis}${this.name}`);
            if (slider) slider.value = val;
        });
        // Sincronizar valores angleFromY y angleFromZ
        if (this.inputControlAngleFromY && this.displayAngleFromYValue) {
            this.inputControlAngleFromY.value = self.angleFromY;
            this.displayAngleFromYValue.textContent = self.angleFromY;
        }
        if (this.inputControlAngleFromZ && this.displayAngleFromZValue) {
            this.inputControlAngleFromZ.value = self.angleFromZ;
            this.displayAngleFromZValue.textContent = self.angleFromZ;
        }


        // Sync rotation sliders world angles
        [["X", "angleX"], ["Y", "angleY"], ["Z", "angleZ"]].forEach(([axis, prop]) => {
            const val = self[prop];
            const slider = document.getElementById(`ang_${axis}${this.name}`);
            const disp = document.getElementById(`ang_${axis}${this.name}Value`);
            if (slider) slider.value = val;
            if (disp) disp.textContent = val;
        });

        // Sync rotation sliders own angles
        [["X", "ownAngleX"], ["Y", "ownAngleY"], ["Z", "ownAngleZ"]].forEach(([axis, prop]) => {
            const val = self[prop];
            const slider = document.getElementById(`ownang_${axis}${this.name}`);
            const disp = document.getElementById(`ownang_${axis}${this.name}Value`);
            if (slider) slider.value = val;
            if (disp) disp.textContent = val;
        });
    }
}

export class TerrainControls {
    constructor(o) {
        this.o = o;
    }

    create(name) {
        this.name = name;
        const self = this.o;

        self.panel_id = name;
        self.familiar_tag = document.getElementById("controls_panel");
        self.familiar_tag.insertAdjacentHTML("beforeend", `
            <div id='${self.panel_id}' style='display:flex; flex-direction: column; width:100%;'></div>`);
        self.panel = document.getElementById(self.panel_id);

        self.minScale = 0;
        self.maxScale = 4.0;
        self.scale = 1.0;

        // Color display + ON/OFF button
        self.panel.insertAdjacentHTML("beforeend", `
            <div style='display:flex;'>
                <button id='onoff${name}'>OFF</button>
                <div id='${name}ColorDisplay' style='border: 1px solid grey; display: flex; width: 100%;'>
                    ${name} color
                </div>
            </div>`);
        self.diffuseObjectColorDisplay = document.getElementById(name + "ColorDisplay");
        self.diffuseObjectColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, 1.0);
        adaptBackgroundColor(self.diffuseObjectColorDisplay, self.diffuseColor, 1);

        self.onOffButton = document.getElementById("onoff" + name);
        self.onOffButton.addEventListener("click", () => {
            self.state = self.state ? 0 : 1;
            self.onOffButton.textContent = self.state ? "OFF" : ".ON.";
        });

        // RGB sliders
        ["Red", "Green", "Blue"].forEach((channel, i) => {
            createSlider({
                parent: self.panel,
                label: `${name}diffuse${channel}`,
                id: `${name}diffuse${channel}`,
                min: 0.0,
                max: 1.0,
                step: 0.01,
                value: self.diffuseColor[i],
                onChange: val => {
                    self.diffuseColor[i] = val;
                    self.diffuseObjectColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, 1.0);
                    adaptBackgroundColor(self.diffuseObjectColorDisplay, self.diffuseColor, 1);
                }
            });
        });

        // Alpha
        createSlider({
            parent: self.panel,
            label: `${name}diffuseAlpha`,
            id: `${name}diffuseAlpha`,
            min: 0.0,
            max: 1.0,
            step: 0.01,
            value: self.alpha,
            onChange: val => {
                self.alpha = val;
                self.diffuseObjectColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, val);
                adaptBackgroundColor(self.diffuseObjectColorDisplay, self.diffuseColor, 1);
            }
        });

        // Position X, Y, Z
        ["X", "Y", "Z"].forEach((axis, i) => {
            createSlider({
                parent: self.panel,
                label: `${name} pos ${axis}`,
                id: `position_${axis}${name}`,
                min: -4.0,
                max: 4.0,
                step: 0.01,
                value: self.positionMatrix[12 + i],
                onChange: val => {
                    self.positionMatrix[12 + i] = val;
                    self.transformVertexArray();
                }
            });
        });

        // Scalar X, Y, Z
        [["X", 0], ["Y", 5], ["Z", 10]].forEach(([axis, index]) => {
            createSlider({
                parent: self.panel,
                label: `${name} sca ${axis}`,
                id: `scalar_${axis}${name}`,
                min: self.minScale,
                max: self.maxScale,
                step: 0.001,
                value: self.scalarMatrix[index],
                onChange: val => {
                    self.scalarMatrix[index] = val;
                    self.transformVertexArray();
                }
            });
        });

        // Botones enlarge/shrink/reset scale
        self.panel.insertAdjacentHTML("beforeend", `
            <div style='display:flex;'>
                <button id='enlarge${name}'>enlarge</button>
                <button id='shrink${name}'>shrink</button>
                <button id='resetScale${name}'>reset scale</button>
            </div>`);

        document.getElementById(`enlarge${name}`).addEventListener("click", () => {
            if (
                self.maxScale > self.scalarMatrix[0] * 1.05 &&
                self.maxScale > self.scalarMatrix[5] * 1.05 &&
                self.maxScale > self.scalarMatrix[10] * 1.05
            ) {
                self.scalarMatrix[0] *= 1.05;
                self.scalarMatrix[5] *= 1.05;
                self.scalarMatrix[10] *= 1.05;
                self.transformVertexArray();
                ["X", "Y", "Z"].forEach((axis, i) => {
                    document.getElementById(`scalar_${axis}${name}`).value = self.scalarMatrix[i * 5];
                    document.getElementById(`scalar_${axis}${name}Value`).textContent = self.scalarMatrix[i * 5];
                });
            }
        });

        document.getElementById(`shrink${name}`).addEventListener("click", () => {
            if (
                self.minScale < self.scalarMatrix[0] / 1.05 &&
                self.minScale < self.scalarMatrix[5] / 1.05 &&
                self.minScale < self.scalarMatrix[10] / 1.05
            ) {
                self.scalarMatrix[0] /= 1.05;
                self.scalarMatrix[5] /= 1.05;
                self.scalarMatrix[10] /= 1.05;
                self.transformVertexArray();
                ["X", "Y", "Z"].forEach((axis, i) => {
                    document.getElementById(`scalar_${axis}${name}`).value = self.scalarMatrix[i * 5];
                    document.getElementById(`scalar_${axis}${name}Value`).textContent = self.scalarMatrix[i * 5];
                });
            }
        });

        document.getElementById(`resetScale${name}`).addEventListener("click", () => {
            self.scalarMatrix[0] = 1.0;
            self.scalarMatrix[5] = 1.0;
            self.scalarMatrix[10] = 1.0;
            self.transformVertexArray();
            ["X", "Y", "Z"].forEach((axis, i) => {
                document.getElementById(`scalar_${axis}${name}`).value = 1.0;
                document.getElementById(`scalar_${axis}${name}Value`).textContent = 1.0;
            });
        });

        // Ángulos globales
        [["X", "angleX", orientViewX], ["Y", "angleY", orientViewY], ["Z", "angleZ", orientViewZ]].forEach(([axis, prop, fn]) => {
            createSlider({
                parent: self.panel,
                label: `${name} world ang ${axis}`,
                id: `ang_${axis}${name}`,
                min: -2,
                max: 2,
                step: 0.01,
                value: self[prop],
                onChange: val => {
                    fn(self, val);
                }
            });
        });

        // Ángulos propios
        [["X", "ownAngleX", rotateOwnAxisX], ["Y", "ownAngleY", rotateOwnAxisY], ["Z", "ownAngleZ", rotateOwnAxisZ]].forEach(([axis, prop, fn]) => {
            createSlider({
                parent: self.panel,
                label: `${name} own ang ${axis}`,
                id: `ownang_${axis}${name}`,
                min: -2,
                max: 2,
                step: 0.01,
                value: self[prop],
                onChange: val => {
                    fn(self, val);
                }
            });
        });
    }

    refresh() {
        const self = this.o;

        // Sliders RGB y Alpha
        ["Red", "Green", "Blue"].forEach((channel, i) => {
            const id = `${this.name}diffuse${channel}`;
            document.getElementById(id).value = self.diffuseColor[i];
            document.getElementById(id + "Value").textContent = self.diffuseColor[i];
        });
        const alphaId = `${this.name}diffuseAlpha`;
        document.getElementById(alphaId).value = self.alpha;
        document.getElementById(alphaId + "Value").textContent = self.alpha;

        // Actualizar color display
        self.diffuseObjectColorDisplay.style.backgroundColor = colorByIntensityToStringRGB(self.diffuseColor, self.alpha);
        adaptBackgroundColor(self.diffuseObjectColorDisplay, self.diffuseColor, 1);

        // Posición
        ["X", "Y", "Z"].forEach((axis, i) => {
            const val = self.positionMatrix[12 + i];
            const id = `position_${axis}${this.name}`;
            document.getElementById(id).value = val;
            document.getElementById(id + "Value").textContent = val;
        });

        // Escala
        [["X", 0], ["Y", 5], ["Z", 10]].forEach(([axis, idx]) => {
            const val = self.scalarMatrix[idx];
            const id = `scalar_${axis}${this.name}`;
            document.getElementById(id).value = val;
            document.getElementById(id + "Value").textContent = val;
        });

        // Rotación global
        [["X", "angleX"], ["Y", "angleY"], ["Z", "angleZ"]].forEach(([axis, prop]) => {
            const val = self[prop];
            const id = `ang_${axis}${this.name}`;
            document.getElementById(id).value = val;
            document.getElementById(id + "Value").textContent = val;
        });

        // Rotación propia
        [["X", "ownAngleX"], ["Y", "ownAngleY"], ["Z", "ownAngleZ"]].forEach(([axis, prop]) => {
            const val = self[prop];
            const id = `ownang_${axis}${this.name}`;
            document.getElementById(id).value = val;
            document.getElementById(id + "Value").textContent = val;
        });
    }
}