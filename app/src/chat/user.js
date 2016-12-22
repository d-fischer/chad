'use strict';

const defaultColors = [
    ["Red", "#FF0000"],
    ["Blue", "#0000FF"],
    ["Green", "#00FF00"],
    ["FireBrick", "#B22222"],
    ["Coral", "#FF7F50"],
    ["YellowGreen", "#9ACD32"],
    ["OrangeRed", "#FF4500"],
    ["SeaGreen", "#2E8B57"],
    ["GoldenRod", "#DAA520"],
    ["Chocolate", "#D2691E"],
    ["CadetBlue", "#5F9EA0"],
    ["DodgerBlue", "#1E90FF"],
    ["HotPink", "#FF69B4"],
    ["BlueViolet", "#8A2BE2"],
    ["SpringGreen", "#00FF7F"]
];

class ChatUser {
    constructor(userData, channel) {
        this._data = userData;
        this._channel = channel;
    }
    
    get name() {
        return this._data.login;
    }

    get displayName() {
        return this._data['display-name'] || this.name;
    }
    
    get color() {
        if (this._data.color) {
            return this._data.color;
        } else {
            let name = this.name;
            let n = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
            return defaultColors[n % defaultColors.length][1]
        }
    }

    _is(type) {
        return this._data.badges && this._data.badges[type];
    }

    get isBroadcaster() {
        return this._is('broadcaster');
    }

    get isStaff() {
        return this._is('staff');
    }

    get isAdmin() {
        return this._is('admin');
    }

    get isGlobalMod() {
        return this._is('global_mod');
    }

    get isModerator() {
        return this._is('moderator');
    }

    get isPrime() {
        return this._is('premium');
    }

    get isTurbo() {
        return this._is('turbo');
    }

    get subLevel() {
        return this._is('subscriber');
    }

    get cheerLevel() {
        return this._is('bits');
    }
}

module.exports = ChatUser;