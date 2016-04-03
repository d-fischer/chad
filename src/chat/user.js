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
    constructor(userData) {
        this._data = userData;
    }
    
    get name() {
        return this._data.username;
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

    get isBroadcaster() {
        return this._data['user-id'] && (this._data['room-id'] === this._data['user-id']);
    }

    get isStaff() {
        return this._data['user-type'] === 'staff';
    }

    get isAdmin() {
        return this._data['user-type'] === 'admin';
    }

    get isGlobalMod() {
        return this._data['user-type'] === 'global_mod';
    }

    get isModerator() {
        return this._data.mod;
    }

    get isTurbo() {
        return this._data.turbo;
    }
}

module.exports = ChatUser;