/* 
 * MIT License
 * 
 * Copyright (c) 2021 Nolonar
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//=============================================================================
// Metadata
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Start game in fullscreen
 * @author Nolonar
 * @url https://github.com/Nolonar/RM_Plugins
 * 
 * @param textExit
 * @text "Exit" text
 * @desc The text to display for the "Exit" command on the title screen.
 * @type string
 * @default Exit
 * 
 * @param textToDesktop
 * @text "To Desktop" text
 * @desc The text to display for the "To Desktop" command on the Game End screen.
 * @type string
 * @default To Desktop
 * 
 * 
 * @help Version 1.2.3
 * 
 * This plugin does not provide plugin commands.
 * 
 * Note:
 * This plugin does not work in browsers.
 */

(() => {
    const PLUGIN_NAME = "N_StartFullscreen";

    const parameters = PluginManager.parameters(PLUGIN_NAME);
    parameters.textExit = parameters.textExit || "Exit";
    parameters.textToDesktop = parameters.textToDesktop || "To Desktop";

    // Backport Array.remove() from MZ to MV
    if (!Array.prototype.remove) {
        Array.prototype.remove = function (element) {
            for (; ;) {
                const index = this.indexOf(element);
                if (index >= 0) {
                    this.splice(index, 1);
                } else {
                    return this;
                }
            }
        };
    };

    const Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        Scene_Boot_start.call(this);
        Graphics._requestFullScreen();
    };

    // Add "Exit" command to Window_TitleCommand and Window_GameEnd.
    const symbol = "exit";
    const makeCommandList_old = {};
    for (const window of [Window_TitleCommand, Window_GameEnd]) {
        makeCommandList_old[window.name] = window.prototype.makeCommandList;
        window.prototype.makeCommandList = function () {
            makeCommandList_old[this.constructor.name].call(this);

            const exitText = {
                [Window_TitleCommand.name]: parameters.textExit,
                [Window_GameEnd.name]: parameters.textToDesktop
            }[this.constructor.name];
            this.addCommand(exitText, symbol);
            if (this instanceof Window_GameEnd) {
                // Move "Cancel" option to bottom.
                const command = this._list.find(cmd => cmd.symbol === "cancel");
                this._list.remove(command);
                this._list.push(command);
            }
        };
    }
    // Must set command handlers separately for Scene_Title and Scene_GameEnd.
    const createCommandWindow_old = {};
    const commandWindowRect_old = {};
    for (const scene of [Scene_Title, Scene_GameEnd]) {
        const key = scene.name;
        createCommandWindow_old[key] = scene.prototype.createCommandWindow;
        scene.prototype.createCommandWindow = function () {
            createCommandWindow_old[this.constructor.name].call(this);

            this._commandWindow.setHandler(symbol, exitGame);
            // Reset command window.
            this._windowLayer.removeChild(this._commandWindow);
            this.addWindow(this._commandWindow);
        };
        commandWindowRect_old[key] = scene.prototype.commandWindowRect;
        scene.prototype.commandWindowRect = function () {
            const rect = commandWindowRect_old[this.constructor.name].call(this);
            // Adding the equivalent of 1 additional line of height.
            // We compute (3 lines - 2 lines) just in case the first
            // and last line have a different height.
            rect.height += this.calcWindowHeight(3, true) - this.calcWindowHeight(2, true);
            return rect;
        };
    }

    function exitGame() {
        nw.App.quit();
    }
})();
