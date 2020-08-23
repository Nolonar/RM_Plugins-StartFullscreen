//==============================================================================
// N_StartFullscreen
//==============================================================================
/*:
 * @target MZ
 * @plugindesc Start game in fullscreen
 * @author Nolonar
 * @url https://github.com/Nolonar/RM_Plugins-StartFullscreen
 * 
 * 
 * @help This plugin does not provide plugin commands.
 * 
 * Note:
 * This plugin does not work in browsers.
 */

(() => {
    let Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        Scene_Boot_start.call(this);
        Graphics._requestFullScreen();
    };
})();
