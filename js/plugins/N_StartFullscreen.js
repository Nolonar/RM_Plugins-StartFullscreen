/* 
 * MIT License
 * 
 * Copyright (c) 2020 Nolonar
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
// N_StartFullscreen
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Start game in fullscreen
 * @author Nolonar
 * @url https://github.com/Nolonar/RM_Plugins-StartFullscreen
 * 
 * 
 * @help Version 1.1.0
 * 
 * This plugin does not provide plugin commands.
 * 
 * Note:
 * This plugin does not work in browsers.
 */

(() => {
    //=========================================================================
    // To localize
    //=========================================================================
    const TEXT_EXIT = {
        [Window_TitleCommand.name]: "Exit",
        [Window_GameEnd.name]: "To Desktop"
    };

    let Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        Scene_Boot_start.call(this);
        Graphics._requestFullScreen();
    };

    // Add "Exit" command to Window_TitleCommand and Window_GameEnd.
    const symbol = "exit";
    let makeCommandList_old = {};
    for (const window of [Window_TitleCommand, Window_GameEnd]) {
        makeCommandList_old[window.name] = window.prototype.makeCommandList;
        window.prototype.makeCommandList = function () {
            makeCommandList_old[this.constructor.name].call(this);
            this.addCommand(TEXT_EXIT[this.constructor.name], symbol);
            if (this instanceof Window_GameEnd) {
                // Move "Cancel" option to bottom.
                const i = this._list.findIndex(cmd => cmd.symbol === "cancel");
                const cmd = this._list[i];
                this._list = this._list.slice(0, i).concat(this._list.slice(i + 1));
                this._list.push(cmd);
            }
        };
    }
    // Must set command handlers separately for Scene_Title and Scene_GameEnd.
    let createCommandWindow_old = {};
    let commandWindowRect_old = {};
    for (const scene of [Scene_Title, Scene_GameEnd]) {
        const key = scene.name;
        createCommandWindow_old[key] = scene.prototype.createCommandWindow;
        scene.prototype.createCommandWindow = function () {
            createCommandWindow_old[this.constructor.name].call(this);

            this._commandWindow.setHandler(symbol, () => SceneManager.exit());
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
})();
